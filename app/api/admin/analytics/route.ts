/**
 * Admin Analytics API — Revenue, Orders, Trends, Funnels
 * GET /api/admin/analytics?range=7d|30d|90d|1y&metric=revenue|orders|customers|products
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { log } from "@/lib/logger";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    const sp = req.nextUrl.searchParams;
    const range = sp.get("range") || "30d";
    const metric = sp.get("metric") || "overview";

    // Validate query parameters
    const validRanges = ["7d", "30d", "90d", "1y"];
    const validMetrics = ["overview", "revenue", "orders", "customers", "products"];
    if (!validRanges.includes(range)) {
        return NextResponse.json({ error: `Invalid range. Must be one of: ${validRanges.join(", ")}` }, { status: 400 });
    }
    if (!validMetrics.includes(metric)) {
        return NextResponse.json({ error: `Invalid metric. Must be one of: ${validMetrics.join(", ")}` }, { status: 400 });
    }

    // Calculate date range
    const now = new Date();
    const rangeMs: Record<string, number> = {
        "7d": 7 * 86400000,
        "30d": 30 * 86400000,
        "90d": 90 * 86400000,
        "1y": 365 * 86400000,
    };
    const since = new Date(now.getTime() - (rangeMs[range] || rangeMs["30d"]));
    const previousSince = new Date(since.getTime() - (rangeMs[range] || rangeMs["30d"]));

    try {
        const { prisma } = await import("@/lib/db");

        switch (metric) {
            case "revenue": {
                // Daily revenue for the period
                const orders = await prisma.order.findMany({
                    where: {
                        createdAt: { gte: since },
                        status: { notIn: ["CANCELLED", "REFUNDED", "FAILED"] },
                    },
                    select: { total: true, createdAt: true },
                    orderBy: { createdAt: "asc" },
                });

                // Group by day
                const dailyRevenue: Record<string, number> = {};
                orders.forEach((o: { createdAt: Date; total: number }) => {
                    const day = o.createdAt.toISOString().split("T")[0];
                    dailyRevenue[day] = (dailyRevenue[day] || 0) + o.total;
                });

                const chartData = Object.entries(dailyRevenue).map(([date, total]) => ({
                    date,
                    revenue: Math.round(total * 100) / 100,
                }));

                const totalRevenue = orders.reduce((s: number, o: { total: number }) => s + o.total, 0);

                // Previous period for comparison
                const prevOrders = await prisma.order.aggregate({
                    _sum: { total: true },
                    where: {
                        createdAt: { gte: previousSince, lt: since },
                        status: { notIn: ["CANCELLED", "REFUNDED", "FAILED"] },
                    },
                });
                const prevRevenue = prevOrders._sum.total || 0;
                const changePercent = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

                return NextResponse.json({
                    chartData,
                    totalRevenue: Math.round(totalRevenue * 100) / 100,
                    previousRevenue: Math.round(prevRevenue * 100) / 100,
                    changePercent: Math.round(changePercent * 10) / 10,
                    orderCount: orders.length,
                });
            }

            case "products": {
                // Top selling products
                const topProducts = await prisma.orderItem.groupBy({
                    by: ["productId", "name"],
                    _sum: { quantity: true, total: true },
                    _count: { id: true },
                    orderBy: { _sum: { total: "desc" } },
                    take: 20,
                });

                // Category breakdown
                const categoryBreakdown = await prisma.product.groupBy({
                    by: ["category"],
                    _count: { id: true },
                    where: { status: "ACTIVE" },
                    orderBy: { _count: { id: "desc" } },
                });

                return NextResponse.json({
                    topProducts: topProducts.map((p: any) => ({
                        productId: p.productId,
                        name: p.name,
                        totalSold: p._sum.quantity || 0,
                        totalRevenue: Math.round((p._sum.total || 0) * 100) / 100,
                        orderCount: p._count.id,
                    })),
                    categoryBreakdown: categoryBreakdown.map((c: any) => ({
                        category: c.category,
                        count: c._count.id,
                    })),
                });
            }

            case "customers": {
                // New customers over time
                const customers = await prisma.user.findMany({
                    where: {
                        role: "CUSTOMER",
                        createdAt: { gte: since },
                    },
                    select: { createdAt: true },
                    orderBy: { createdAt: "asc" },
                });

                const dailyNew: Record<string, number> = {};
                customers.forEach((c: { createdAt: Date }) => {
                    const day = c.createdAt.toISOString().split("T")[0];
                    dailyNew[day] = (dailyNew[day] || 0) + 1;
                });

                const chartData = Object.entries(dailyNew).map(([date, count]) => ({
                    date,
                    newCustomers: count,
                }));

                const prevCustomers = await prisma.user.count({
                    where: {
                        role: "CUSTOMER",
                        createdAt: { gte: previousSince, lt: since },
                    },
                });
                const changePercent = prevCustomers > 0
                    ? ((customers.length - prevCustomers) / prevCustomers) * 100
                    : 0;

                return NextResponse.json({
                    chartData,
                    totalNew: customers.length,
                    previousNew: prevCustomers,
                    changePercent: Math.round(changePercent * 10) / 10,
                });
            }

            default: {
                // Overview: combined stats
                const [
                    totalRevenue,
                    prevRevenue,
                    totalOrders,
                    prevOrders,
                    totalCustomers,
                    prevCustomers,
                    pendingOrders,
                    averageOrderValue,
                    statusBreakdown,
                ] = await Promise.all([
                    prisma.order.aggregate({
                        _sum: { total: true },
                        where: { createdAt: { gte: since }, status: { notIn: ["CANCELLED", "REFUNDED", "FAILED"] } },
                    }),
                    prisma.order.aggregate({
                        _sum: { total: true },
                        where: { createdAt: { gte: previousSince, lt: since }, status: { notIn: ["CANCELLED", "REFUNDED", "FAILED"] } },
                    }),
                    prisma.order.count({ where: { createdAt: { gte: since } } }),
                    prisma.order.count({ where: { createdAt: { gte: previousSince, lt: since } } }),
                    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: since } } }),
                    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: previousSince, lt: since } } }),
                    prisma.order.count({ where: { status: { in: ["PENDING", "PROCESSING"] } } }),
                    prisma.order.aggregate({
                        _avg: { total: true },
                        where: { createdAt: { gte: since }, status: { notIn: ["CANCELLED", "REFUNDED", "FAILED"] } },
                    }),
                    prisma.order.groupBy({
                        by: ["status"],
                        _count: { id: true },
                        where: { createdAt: { gte: since } },
                    }),
                ]);

                const rev = totalRevenue._sum.total || 0;
                const pRev = prevRevenue._sum.total || 0;

                return NextResponse.json({
                    revenue: {
                        current: Math.round(rev * 100) / 100,
                        previous: Math.round(pRev * 100) / 100,
                        change: pRev > 0 ? Math.round(((rev - pRev) / pRev) * 1000) / 10 : 0,
                    },
                    orders: {
                        current: totalOrders,
                        previous: prevOrders,
                        change: prevOrders > 0 ? Math.round(((totalOrders - prevOrders) / prevOrders) * 1000) / 10 : 0,
                        pending: pendingOrders,
                    },
                    customers: {
                        newCurrent: totalCustomers,
                        newPrevious: prevCustomers,
                        change: prevCustomers > 0 ? Math.round(((totalCustomers - prevCustomers) / prevCustomers) * 1000) / 10 : 0,
                    },
                    averageOrderValue: Math.round((averageOrderValue._avg.total || 0) * 100) / 100,
                    statusBreakdown: statusBreakdown.map((s: any) => ({
                        status: s.status,
                        count: s._count.id,
                    })),
                    range,
                });
            }
        }
    } catch (error) {
        log.admin.error("Analytics GET error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
