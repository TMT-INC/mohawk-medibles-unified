/**
 * Admin Stats API — Hardened
 * GET /api/admin/stats
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const { prisma } = await import("@/lib/db");

        const [totalOrders, totalCustomers, totalProducts, recentRevenue] =
            await Promise.all([
                prisma.order.count(),
                prisma.user.count({ where: { role: "CUSTOMER" } }),
                prisma.product.count({ where: { status: "ACTIVE" } }),
                prisma.order.aggregate({
                    _sum: { total: true },
                    where: {
                        createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
                    },
                }),
            ]);

        return NextResponse.json({
            totalOrders,
            totalCustomers,
            totalProducts,
            monthlyRevenue: recentRevenue._sum.total || 0,
            source: "database",
        });
    } catch {
        return NextResponse.json(
            { error: "Database unavailable", source: "error" },
            { status: 503 }
        );
    }
}
