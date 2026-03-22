/**
 * Financial Model API — Mohawk Medibles
 * GET /api/admin/financial?metric=overview|projections|cohorts|aov|strategies
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

    try {
        const metric = req.nextUrl.searchParams.get("metric") || "overview";

        const {
            calculateFinancialMetrics,
            getGrowthScenarios,
            getCohortAnalysis,
            getAOVDistribution,
            generateGrowthStrategies,
        } = await import("@/lib/financial-model");

        if (metric === "overview") {
            const metrics = await calculateFinancialMetrics();
            const scenarios = getGrowthScenarios(metrics.revenuePerMonth, metrics.monthsRemaining);
            const strategies = generateGrowthStrategies(metrics);
            return NextResponse.json({ metrics, scenarios, strategies });
        }

        if (metric === "projections") {
            const metrics = await calculateFinancialMetrics();
            const scenarios = getGrowthScenarios(metrics.revenuePerMonth, metrics.monthsRemaining);
            return NextResponse.json({ currentMonthly: metrics.revenuePerMonth, target: 1_000_000, scenarios });
        }

        if (metric === "cohorts") {
            const cohorts = await getCohortAnalysis();
            return NextResponse.json({ cohorts });
        }

        if (metric === "aov") {
            const distribution = await getAOVDistribution();
            const metrics = await calculateFinancialMetrics();
            return NextResponse.json({
                distribution,
                currentAOV: metrics.averageOrderValue,
                targetAOV: 220,
                potentialLift: Math.round((220 - metrics.averageOrderValue) * metrics.ordersPerMonth),
            });
        }

        if (metric === "strategies") {
            const metrics = await calculateFinancialMetrics();
            const strategies = generateGrowthStrategies(metrics);
            const totalImpact = strategies.reduce((s, st) => s + st.projectedMonthlyImpact, 0);
            return NextResponse.json({
                strategies,
                totalProjectedImpact: totalImpact,
                currentMonthly: metrics.revenuePerMonth,
                withStrategies: Math.round(metrics.revenuePerMonth + totalImpact),
                gapRemaining: Math.max(0, 1_000_000 - metrics.revenuePerMonth - totalImpact),
            });
        }

        return NextResponse.json({ error: "Unknown metric. Use: overview, projections, cohorts, aov, strategies" }, { status: 400 });
    } catch (e) {
        log.financial.error("Financial metrics error", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json({ error: "Failed to calculate financial metrics" }, { status: 500 });
    }
}
