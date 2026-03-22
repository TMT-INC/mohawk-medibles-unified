/**
 * Customer Analytics API — RFM, CLV, Churn
 * GET /api/admin/analytics/customer?type=rfm|clv|churn
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { log } from "@/lib/logger";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    const type = req.nextUrl.searchParams.get("type") || "rfm";
    const validTypes = ["rfm", "clv", "churn"];
    if (!validTypes.includes(type)) {
        return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` }, { status: 400 });
    }

    try {
        const { prisma } = await import("@/lib/db");

        if (type === "rfm") {
            return NextResponse.json(await getRFMSegmentation(prisma));
        } else if (type === "clv") {
            return NextResponse.json(await getCLVAnalytics(prisma));
        } else {
            return NextResponse.json(await getChurnPrediction(prisma));
        }
    } catch (error) {
        log.admin.error("Customer analytics error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ─── Helpers ───────────────────────────────────────────────

function assignScore(value: number, quintiles: number[]): number {
    if (value <= quintiles[0]) return 5;
    if (value <= quintiles[1]) return 4;
    if (value <= quintiles[2]) return 3;
    if (value <= quintiles[3]) return 2;
    return 1;
}

function assignReverseScore(value: number, quintiles: number[]): number {
    if (value >= quintiles[3]) return 5;
    if (value >= quintiles[2]) return 4;
    if (value >= quintiles[1]) return 3;
    if (value >= quintiles[0]) return 2;
    return 1;
}

function getSegment(r: number, f: number, m: number): string {
    if (r >= 4 && f >= 4 && m >= 4) return "Champions";
    if (f >= 4 && m >= 3) return "Loyal Customers";
    if (r >= 4 && f >= 2 && f <= 3) return "Potential Loyalists";
    if (r >= 4 && f <= 1) return "Recent Customers";
    if (r >= 3 && f >= 2 && m >= 2) return "Promising";
    if (r >= 2 && r <= 3 && f >= 2 && f <= 3) return "Need Attention";
    if (r === 2 && f <= 2) return "About to Sleep";
    if (r <= 2 && f >= 3) return "At Risk";
    if (r <= 1 && f >= 4) return "Can't Lose Them";
    if (r <= 2 && f <= 2 && m <= 2) return "Hibernating";
    if (r <= 1 && f <= 1) return "Lost";
    return "Other";
}

function getQuintiles(arr: number[]) {
    const len = arr.length;
    return [
        arr[Math.floor(len * 0.2)] || 0,
        arr[Math.floor(len * 0.4)] || 0,
        arr[Math.floor(len * 0.6)] || 0,
        arr[Math.floor(len * 0.8)] || 0,
    ];
}

// ─── RFM Segmentation ─────────────────────────────────────

async function getRFMSegmentation(prisma: any) {
    const customerData = await prisma.$queryRaw`
        SELECT
            o."userId",
            u.email,
            u.name,
            MAX(o."createdAt") as "lastOrder",
            COUNT(*)::int as "orderCount",
            COALESCE(SUM(o.total), 0)::float as "totalSpent"
        FROM "Order" o
        INNER JOIN "User" u ON o."userId" = u.id
        WHERE o."userId" IS NOT NULL AND o.status = 'DELIVERED'
        GROUP BY o."userId", u.email, u.name
    `;

    if (!customerData || (customerData as any[]).length === 0) {
        return { customers: [], segments: {}, summary: { totalCustomers: 0, avgRecency: 0, avgFrequency: 0, avgMonetary: 0 } };
    }

    const now = Date.now();
    const rawData = (customerData as any[]).map(c => ({
        ...c,
        recency: c.lastOrder ? Math.floor((now - new Date(c.lastOrder).getTime()) / (1000 * 60 * 60 * 24)) : 999,
        frequency: Number(c.orderCount),
        monetary: Number(c.totalSpent),
    }));

    const recencies = rawData.map(d => d.recency).sort((a, b) => a - b);
    const frequencies = rawData.map(d => d.frequency).sort((a, b) => a - b);
    const monetaries = rawData.map(d => d.monetary).sort((a, b) => a - b);

    const rQ = getQuintiles(recencies);
    const fQ = getQuintiles(frequencies);
    const mQ = getQuintiles(monetaries);

    const customers = rawData.map(d => {
        const rScore = assignScore(d.recency, rQ);
        const fScore = assignReverseScore(d.frequency, fQ);
        const mScore = assignReverseScore(d.monetary, mQ);
        return {
            userId: d.userId,
            email: d.email,
            name: d.name,
            recency: d.recency,
            frequency: d.frequency,
            monetary: d.monetary,
            rScore,
            fScore,
            mScore,
            segment: getSegment(rScore, fScore, mScore),
            totalOrders: d.frequency,
            totalSpent: d.monetary,
            lastOrderDate: d.lastOrder,
        };
    });

    const segments: Record<string, { count: number; avgSpend: number; avgOrders: number }> = {};
    customers.forEach(c => {
        if (!segments[c.segment]) segments[c.segment] = { count: 0, avgSpend: 0, avgOrders: 0 };
        segments[c.segment].count++;
        segments[c.segment].avgSpend += c.monetary;
        segments[c.segment].avgOrders += c.frequency;
    });
    Object.values(segments).forEach(s => {
        s.avgSpend = Math.round((s.avgSpend / s.count) * 100) / 100;
        s.avgOrders = Math.round((s.avgOrders / s.count) * 100) / 100;
    });

    const total = customers.length;
    return {
        customers,
        segments,
        summary: {
            totalCustomers: total,
            avgRecency: Math.round(customers.reduce((s, c) => s + c.recency, 0) / total),
            avgFrequency: Math.round((customers.reduce((s, c) => s + c.frequency, 0) / total) * 100) / 100,
            avgMonetary: Math.round((customers.reduce((s, c) => s + c.monetary, 0) / total) * 100) / 100,
        },
    };
}

// ─── CLV Analytics ─────────────────────────────────────────

async function getCLVAnalytics(prisma: any) {
    const customerData = await prisma.$queryRaw`
        SELECT
            o."userId",
            u.email,
            u.name,
            COALESCE(SUM(o.total), 0)::float as "totalSpent",
            COUNT(*)::int as "totalOrders",
            COALESCE(AVG(o.total), 0)::float as "avgOrderValue",
            MIN(o."createdAt") as "firstOrder",
            MAX(o."createdAt") as "lastOrder"
        FROM "Order" o
        INNER JOIN "User" u ON o."userId" = u.id
        WHERE o."userId" IS NOT NULL AND o.status = 'DELIVERED'
        GROUP BY o."userId", u.email, u.name
    `;

    const now = Date.now();
    const customers = (customerData as any[]).map(c => {
        const customerAge = c.firstOrder ? Math.max(1, Math.floor((now - new Date(c.firstOrder).getTime()) / (1000 * 60 * 60 * 24))) : 1;
        const monthsActive = Math.max(1, customerAge / 30);
        const purchaseFrequency = Number(c.totalOrders) / monthsActive;
        const avgOV = Number(c.avgOrderValue);
        const predictedCLV = Math.round(purchaseFrequency * avgOV * 12 * 100) / 100;

        return {
            userId: c.userId,
            email: c.email,
            name: c.name,
            totalSpent: Number(c.totalSpent),
            totalOrders: Number(c.totalOrders),
            avgOrderValue: Math.round(avgOV * 100) / 100,
            firstOrderDate: c.firstOrder,
            lastOrderDate: c.lastOrder,
            customerAge,
            purchaseFrequency: Math.round(purchaseFrequency * 100) / 100,
            predictedCLV,
            clvTier: predictedCLV >= 1000 ? "platinum" : predictedCLV >= 500 ? "gold" : predictedCLV >= 200 ? "silver" : "bronze" as string,
        };
    }).sort((a, b) => b.predictedCLV - a.predictedCLV);

    const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
    const avgCLV = customers.length ? Math.round((customers.reduce((s, c) => s + c.predictedCLV, 0) / customers.length) * 100) / 100 : 0;
    const sortedCLVs = customers.map(c => c.predictedCLV).sort((a, b) => a - b);
    const medianCLV = sortedCLVs.length ? sortedCLVs[Math.floor(sortedCLVs.length / 2)] : 0;
    const avgOrderValue = customers.length ? Math.round((customers.reduce((s, c) => s + c.avgOrderValue, 0) / customers.length) * 100) / 100 : 0;

    const tiers: Record<string, { count: number; avgCLV: number; totalRevenue: number }> = {};
    customers.forEach(c => {
        if (!tiers[c.clvTier]) tiers[c.clvTier] = { count: 0, avgCLV: 0, totalRevenue: 0 };
        tiers[c.clvTier].count++;
        tiers[c.clvTier].avgCLV += c.predictedCLV;
        tiers[c.clvTier].totalRevenue += c.totalSpent;
    });
    Object.values(tiers).forEach(t => {
        t.avgCLV = Math.round((t.avgCLV / t.count) * 100) / 100;
        t.totalRevenue = Math.round(t.totalRevenue * 100) / 100;
    });

    return { customers, summary: { avgCLV, medianCLV, totalRevenue, avgOrderValue, tiers } };
}

// ─── Churn Prediction ──────────────────────────────────────

async function getChurnPrediction(prisma: any) {
    const customerData = await prisma.$queryRaw`
        SELECT
            o."userId",
            u.email,
            u.name,
            COUNT(*)::int as "totalOrders",
            COALESCE(SUM(o.total), 0)::float as "totalSpent",
            MIN(o."createdAt") as "firstOrder",
            MAX(o."createdAt") as "lastOrder"
        FROM "Order" o
        INNER JOIN "User" u ON o."userId" = u.id
        WHERE o."userId" IS NOT NULL AND o.status = 'DELIVERED'
        GROUP BY o."userId", u.email, u.name
        HAVING COUNT(*) >= 2
    `;

    const now = Date.now();
    const customers = (customerData as any[]).map(c => {
        const daysSinceLastOrder = c.lastOrder ? Math.floor((now - new Date(c.lastOrder).getTime()) / (1000 * 60 * 60 * 24)) : 999;
        const totalDays = c.firstOrder && c.lastOrder
            ? Math.max(1, Math.floor((new Date(c.lastOrder).getTime() - new Date(c.firstOrder).getTime()) / (1000 * 60 * 60 * 24)))
            : 1;
        const avgDaysBetweenOrders = Math.round(totalDays / Math.max(1, Number(c.totalOrders) - 1));
        const overdueRatio = avgDaysBetweenOrders > 0 ? daysSinceLastOrder / avgDaysBetweenOrders : 1;
        const churnScore = Math.min(100, Math.round(
            Math.min(70, overdueRatio * 25) +
            (daysSinceLastOrder > 90 ? 20 : daysSinceLastOrder > 60 ? 10 : 0) +
            (Number(c.totalOrders) > 10 ? -5 : 0)
        ));
        const riskLevel = churnScore >= 75 ? "critical" : churnScore >= 50 ? "high" : churnScore >= 30 ? "medium" : "low";

        let suggestedAction = "";
        switch (riskLevel) {
            case "critical": suggestedAction = "Send win-back email with 20% discount + personal outreach"; break;
            case "high": suggestedAction = "Send re-engagement email with 15% discount"; break;
            case "medium": suggestedAction = "Send loyalty points reminder or new product alert"; break;
            case "low": suggestedAction = "Continue regular marketing cadence"; break;
        }

        return {
            userId: c.userId,
            email: c.email,
            name: c.name,
            daysSinceLastOrder,
            avgDaysBetweenOrders,
            totalOrders: Number(c.totalOrders),
            totalSpent: Number(c.totalSpent),
            churnScore,
            riskLevel,
            suggestedAction,
        };
    }).sort((a, b) => b.churnScore - a.churnScore);

    const criticalCount = customers.filter(c => c.riskLevel === "critical").length;
    const highCount = customers.filter(c => c.riskLevel === "high").length;
    const mediumCount = customers.filter(c => c.riskLevel === "medium").length;
    const lowCount = customers.filter(c => c.riskLevel === "low").length;
    const potentialRevenueLoss = Math.round(
        customers
            .filter(c => c.riskLevel === "critical" || c.riskLevel === "high")
            .reduce((s, c) => s + (c.totalSpent / Math.max(1, c.totalOrders)) * 3, 0) * 100
    ) / 100;

    return {
        customers,
        summary: {
            totalAtRisk: criticalCount + highCount,
            criticalCount,
            highCount,
            mediumCount,
            lowCount,
            potentialRevenueLoss,
        },
    };
}
