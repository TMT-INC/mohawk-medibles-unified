/**
 * Admin Referral Analytics API
 * GET /api/admin/referral-analytics?days=30
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";
import { log } from "@/lib/logger";

export async function GET(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const days = Number(req.nextUrl.searchParams.get("days") || "30");
        const since = new Date(Date.now() - days * 86400000);

        const referrals = await prisma.referral.findMany({
            where: { createdAt: { gte: since } },
            include: { referrer: { select: { name: true, email: true } } },
            orderBy: { createdAt: "asc" },
        });

        // Funnel
        const shares = referrals.length;
        const signups = referrals.filter((r: any) => r.status === "signed_up" || r.status === "completed").length;
        const purchases = referrals.filter((r: any) => r.status === "completed").length;
        const conversionRate = shares > 0 ? Math.round((purchases / shares) * 100) : 0;

        // Summary
        const totalPointsAwarded = referrals.reduce(
            (sum: number, r: any) => sum + (r.referrerPointsAwarded || 0) + (r.refereePointsAwarded || 0), 0
        );
        const pendingReferrals = referrals.filter((r: any) => r.status === "pending" || r.status === "signed_up").length;

        // Average conversion time
        const completedRefs = referrals.filter((r: any) => r.completedAt);
        let avgTimeToConvert = "N/A";
        if (completedRefs.length > 0) {
            const avgMs = completedRefs.reduce((sum: number, r: any) =>
                sum + (new Date(r.completedAt).getTime() - new Date(r.createdAt).getTime()), 0
            ) / completedRefs.length;
            const avgDays = Math.round(avgMs / 86400000);
            avgTimeToConvert = avgDays <= 1 ? "< 1 day" : `${avgDays} days`;
        }

        // Timeline (group by date)
        const timelineMap: Record<string, { shares: number; signups: number; purchases: number; points: number }> = {};
        for (let d = new Date(since); d <= new Date(); d.setDate(d.getDate() + 1)) {
            const key = d.toISOString().slice(0, 10);
            timelineMap[key] = { shares: 0, signups: 0, purchases: 0, points: 0 };
        }
        for (const r of referrals) {
            const key = new Date(r.createdAt).toISOString().slice(0, 10);
            if (timelineMap[key]) {
                timelineMap[key].shares++;
                if (r.status === "signed_up" || r.status === "completed") timelineMap[key].signups++;
                if (r.status === "completed") timelineMap[key].purchases++;
                timelineMap[key].points += (r.referrerPointsAwarded || 0) + (r.refereePointsAwarded || 0);
            }
        }
        const timeline = Object.entries(timelineMap).map(([date, data]) => ({ date, ...data }));

        // Top performers
        const performerMap: Record<string, { name: string; email: string; userId: string; totalShares: number; completedPurchases: number; pointsEarned: number }> = {};
        for (const r of referrals) {
            const uid = r.referrerId;
            if (!performerMap[uid]) {
                performerMap[uid] = {
                    name: (r as any).referrer?.name || "Unknown",
                    email: (r as any).referrer?.email || "",
                    userId: uid,
                    totalShares: 0,
                    completedPurchases: 0,
                    pointsEarned: 0,
                };
            }
            performerMap[uid].totalShares++;
            if (r.status === "completed") performerMap[uid].completedPurchases++;
            performerMap[uid].pointsEarned += r.referrerPointsAwarded || 0;
        }
        const topPerformers = Object.values(performerMap)
            .map(p => ({ ...p, conversionRate: p.totalShares > 0 ? Math.round((p.completedPurchases / p.totalShares) * 100) : 0 }))
            .sort((a, b) => b.completedPurchases - a.completedPurchases || b.conversionRate - a.conversionRate)
            .slice(0, 10);

        return NextResponse.json({
            funnel: { shares, signups, purchases, conversionRate },
            timeline,
            topPerformers,
            summary: { totalPointsAwarded, avgTimeToConvert, pendingReferrals },
        });
    } catch (error) {
        log.admin.error("Referral analytics error", { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({
            funnel: { shares: 0, signups: 0, purchases: 0, conversionRate: 0 },
            timeline: [],
            topPerformers: [],
            summary: { totalPointsAwarded: 0, avgTimeToConvert: "N/A", pendingReferrals: 0 },
        });
    }
}
