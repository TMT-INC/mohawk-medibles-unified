/**
 * Mohawk Medibles — Customer Segmentation Engine
 * Classifies customers based on purchase history for targeted campaigns.
 */

import { prisma } from "@/lib/db";

// ─── Segment Definitions ────────────────────────────────────

export type SegmentName = "VIP" | "Loyal" | "At-Risk" | "New" | "Dormant" | "High-AOV" | "Prospect";

export interface CustomerProfile {
    userId: string;
    email: string;
    name: string;
    segment: SegmentName;
    totalSpend: number;
    orderCount: number;
    averageOrderValue: number;
    daysSinceLastOrder: number | null;
    firstOrderDate: Date | null;
    lastOrderDate: Date | null;
    topCategories: string[];
    lifetimeValue: number;
}

export interface SegmentStats {
    name: SegmentName;
    description: string;
    customerCount: number;
    totalRevenue: number;
    avgOrderValue: number;
}

// ─── Segment Classification ─────────────────────────────────

export function classifyCustomer(
    totalSpend: number,
    orderCount: number,
    daysSinceLastOrder: number | null
): SegmentName {
    const daysInactive = daysSinceLastOrder ?? 999;

    // VIP: high spenders with frequent orders
    if (totalSpend >= 500 && orderCount >= 3) return "VIP";

    // Dormant: hasn't ordered in 120+ days but has history
    if (orderCount >= 1 && daysInactive >= 120) return "Dormant";

    // At-Risk: active buyer gone quiet (60-119 days)
    if (totalSpend >= 100 && daysInactive >= 60 && daysInactive < 120) return "At-Risk";

    // Loyal: repeat buyer, still active
    if (totalSpend >= 100 && orderCount >= 2 && daysInactive < 90) return "Loyal";

    // High-AOV: big single orders
    if (totalSpend >= 300 && orderCount >= 1) return "High-AOV";

    // New: recent/low spend
    if (orderCount >= 1) return "New";

    // Prospect: registered but never ordered
    return "Prospect";
}

// ─── Query Helpers ──────────────────────────────────────────

/** Get full profile for a single customer */
export async function getCustomerProfile(userId: string): Promise<CustomerProfile | null> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
    });
    if (!user) return null;

    const orders = await prisma.order.findMany({
        where: { userId, status: { notIn: ["CANCELLED", "REFUNDED", "FAILED"] } },
        select: { total: true, createdAt: true, items: { select: { product: { select: { category: true } } } } },
        orderBy: { createdAt: "desc" },
    });

    const totalSpend = orders.reduce((s: number, o: { total: number }) => s + o.total, 0);
    const orderCount = orders.length;
    const lastOrder = orders[0]?.createdAt || null;
    const firstOrder = orders.length > 0 ? orders[orders.length - 1].createdAt : null;
    const daysSinceLastOrder = lastOrder
        ? Math.floor((Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    // Top categories
    const catCounts: Record<string, number> = {};
    for (const o of orders) {
        for (const item of o.items) {
            const cat = item.product.category;
            catCounts[cat] = (catCounts[cat] || 0) + 1;
        }
    }
    const topCategories = Object.entries(catCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);

    return {
        userId: user.id,
        email: user.email,
        name: user.name,
        segment: classifyCustomer(totalSpend, orderCount, daysSinceLastOrder),
        totalSpend,
        orderCount,
        averageOrderValue: orderCount > 0 ? totalSpend / orderCount : 0,
        daysSinceLastOrder,
        firstOrderDate: firstOrder,
        lastOrderDate: lastOrder,
        topCategories,
        lifetimeValue: totalSpend,
    };
}

/** Get all customers matching a specific segment */
export async function getSegmentedCustomers(segment: SegmentName): Promise<{ email: string; name: string; userId: string }[]> {
    // Get all users with their order aggregates
    const users = await prisma.user.findMany({
        where: { role: "CUSTOMER" },
        select: {
            id: true,
            email: true,
            name: true,
            orders: {
                where: { status: { notIn: ["CANCELLED", "REFUNDED", "FAILED"] } },
                select: { total: true, createdAt: true },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    type UserWithOrders = { id: string; email: string; name: string; orders: { total: number; createdAt: Date }[] };
    return users
        .filter((u: UserWithOrders) => {
            const totalSpend = u.orders.reduce((s: number, o: { total: number }) => s + o.total, 0);
            const orderCount = u.orders.length;
            const lastOrder = u.orders[0]?.createdAt;
            const daysSince = lastOrder
                ? Math.floor((Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24))
                : null;
            return classifyCustomer(totalSpend, orderCount, daysSince) === segment;
        })
        .map((u: UserWithOrders) => ({ email: u.email, name: u.name, userId: u.id }));
}

/** Build campaign audience from segment rules JSON */
export async function buildCampaignAudience(
    segmentRules: { segment?: string; minSpend?: number; maxSpend?: number; minOrders?: number; categories?: string[] } | null
): Promise<string[]> {
    if (!segmentRules) {
        // All active subscribers
        const subs = await prisma.subscriber.findMany({
            where: { status: "active" },
            select: { email: true },
        });
        return subs.map((s: { email: string }) => s.email);
    }

    // Get active subscribers
    const subscriberEmails = new Set(
        (await prisma.subscriber.findMany({ where: { status: "active" }, select: { email: true } }))
            .map((s: { email: string }) => s.email)
    );

    // If a named segment is specified
    if (segmentRules.segment) {
        const segmented = await getSegmentedCustomers(segmentRules.segment as SegmentName);
        // Intersect with subscribers (only email people who subscribed)
        const emails = segmented
            .map((c) => c.email)
            .filter((e) => subscriberEmails.has(e));

        // Also include subscribers who match (even if they aren't customers yet)
        if (segmentRules.segment === "Prospect") {
            return [...new Set([...emails, ...subscriberEmails])] as string[];
        }
        return (emails.length > 0 ? emails : [...subscriberEmails]) as string[]; // Fallback to all if segment is empty
    }

    // Custom rules (minSpend, etc.)
    const users = await prisma.user.findMany({
        where: { role: "CUSTOMER" },
        select: {
            email: true,
            orders: {
                where: { status: { notIn: ["CANCELLED", "REFUNDED", "FAILED"] } },
                select: { total: true },
            },
        },
    });

    type UserWithOrderTotals = { email: string; orders: { total: number }[] };
    return users
        .filter((u: UserWithOrderTotals) => {
            const totalSpend = u.orders.reduce((s: number, o: { total: number }) => s + o.total, 0);
            const orderCount = u.orders.length;
            if (segmentRules.minSpend && totalSpend < segmentRules.minSpend) return false;
            if (segmentRules.maxSpend && totalSpend > segmentRules.maxSpend) return false;
            if (segmentRules.minOrders && orderCount < segmentRules.minOrders) return false;
            return subscriberEmails.has(u.email);
        })
        .map((u: UserWithOrderTotals) => u.email);
}

/** Get segment statistics for dashboard */
export async function getSegmentStats(): Promise<SegmentStats[]> {
    const users = await prisma.user.findMany({
        where: { role: "CUSTOMER" },
        select: {
            orders: {
                where: { status: { notIn: ["CANCELLED", "REFUNDED", "FAILED"] } },
                select: { total: true, createdAt: true },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    const segmentData: Record<SegmentName, { count: number; revenue: number; orderValues: number[] }> = {
        VIP: { count: 0, revenue: 0, orderValues: [] },
        Loyal: { count: 0, revenue: 0, orderValues: [] },
        "At-Risk": { count: 0, revenue: 0, orderValues: [] },
        New: { count: 0, revenue: 0, orderValues: [] },
        Dormant: { count: 0, revenue: 0, orderValues: [] },
        "High-AOV": { count: 0, revenue: 0, orderValues: [] },
        Prospect: { count: 0, revenue: 0, orderValues: [] },
    };

    for (const u of users) {
        const totalSpend = u.orders.reduce((s: number, o: { total: number }) => s + o.total, 0);
        const orderCount = u.orders.length;
        const lastOrder = u.orders[0]?.createdAt;
        const daysSince = lastOrder
            ? Math.floor((Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24))
            : null;
        const seg = classifyCustomer(totalSpend, orderCount, daysSince);
        segmentData[seg].count++;
        segmentData[seg].revenue += totalSpend;
        if (orderCount > 0) segmentData[seg].orderValues.push(totalSpend / orderCount);
    }

    const descriptions: Record<SegmentName, string> = {
        VIP: "$500+ spend, 3+ orders — your best customers",
        Loyal: "$100+ spend, 2+ orders, active last 90 days",
        "At-Risk": "Good customers inactive 60-119 days — win them back",
        New: "Recent customers, first or second order",
        Dormant: "No order in 120+ days — need re-engagement",
        "High-AOV": "$300+ total, big basket buyers",
        Prospect: "Registered but never ordered",
    };

    return (Object.entries(segmentData) as [SegmentName, typeof segmentData[SegmentName]][]).map(([name, data]) => ({
        name,
        description: descriptions[name],
        customerCount: data.count,
        totalRevenue: Math.round(data.revenue * 100) / 100,
        avgOrderValue: data.orderValues.length > 0
            ? Math.round((data.orderValues.reduce((a: number, b: number) => a + b, 0) / data.orderValues.length) * 100) / 100
            : 0,
    }));
}
