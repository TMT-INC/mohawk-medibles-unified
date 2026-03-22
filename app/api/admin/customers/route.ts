/**
 * Admin Customers API — List, Search, Detail, Segments
 * GET /api/admin/customers?action=list|detail|segments|search
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

    const sp = req.nextUrl.searchParams;
    const action = sp.get("action") || "list";
    const limit = Math.min(parseInt(sp.get("limit") || "50"), 200);
    const offset = parseInt(sp.get("offset") || "0");
    const search = sp.get("q") || "";

    try {
        const { prisma } = await import("@/lib/db");

        switch (action) {
            case "detail": {
                const id = sp.get("id");
                if (!id) return NextResponse.json({ error: "Customer ID required" }, { status: 400 });

                const customer = await prisma.user.findUnique({
                    where: { id },
                    include: {
                        orders: {
                            orderBy: { createdAt: "desc" },
                            take: 20,
                            include: {
                                items: { select: { name: true, quantity: true, price: true } },
                            },
                        },
                        addresses: true,
                        supportTickets: {
                            orderBy: { createdAt: "desc" },
                            take: 10,
                        },
                    },
                });

                if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

                // Calculate lifetime stats
                const lifetimeSpend = customer.orders.reduce((sum: number, o: { total: number }) => sum + o.total, 0);
                const totalOrders = customer.orders.length;

                return NextResponse.json({
                    ...customer,
                    passwordHash: undefined, // Never expose
                    lifetimeSpend,
                    totalOrders,
                    avgOrderValue: totalOrders > 0 ? lifetimeSpend / totalOrders : 0,
                });
            }

            case "segments": {
                // Customer segmentation stats
                const [totalCustomers, newThisMonth, guestAccounts, repeatBuyers] = await Promise.all([
                    prisma.user.count({ where: { role: "CUSTOMER" } }),
                    prisma.user.count({
                        where: {
                            role: "CUSTOMER",
                            createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
                        },
                    }),
                    prisma.user.count({
                        where: { role: "CUSTOMER", passwordHash: "" },
                    }),
                    prisma.$queryRaw`
                        SELECT COUNT(DISTINCT "userId") as count
                        FROM "Order"
                        GROUP BY "userId"
                        HAVING COUNT(*) > 1
                    `.then((r: unknown) => (r as unknown[]).length).catch(() => 0),
                ]);

                // Top spenders
                const topSpenders = await prisma.order.groupBy({
                    by: ["userId"],
                    _sum: { total: true },
                    _count: { id: true },
                    orderBy: { _sum: { total: "desc" } },
                    take: 10,
                });

                // Get user details for top spenders
                const topSpenderIds = topSpenders.map((s: any) => s.userId);
                const topUsers = await prisma.user.findMany({
                    where: { id: { in: topSpenderIds } },
                    select: { id: true, name: true, email: true, createdAt: true },
                });

                const topSpendersWithDetails = topSpenders.map((s: any) => ({
                    ...topUsers.find((u: any) => u.id === s.userId),
                    totalSpent: s._sum.total || 0,
                    orderCount: s._count.id,
                }));

                return NextResponse.json({
                    totalCustomers,
                    newThisMonth,
                    guestAccounts,
                    repeatBuyers,
                    topSpenders: topSpendersWithDetails,
                });
            }

            default: {
                // List customers with search
                const where: Record<string, unknown> = { role: "CUSTOMER" };
                if (search) {
                    where.OR = [
                        { name: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                    ];
                }

                const [customers, total] = await Promise.all([
                    prisma.user.findMany({
                        where,
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            createdAt: true,
                            lastLogin: true,
                            _count: { select: { orders: true } },
                        },
                        orderBy: { createdAt: "desc" },
                        take: limit,
                        skip: offset,
                    }),
                    prisma.user.count({ where }),
                ]);

                return NextResponse.json({ customers, total, limit, offset });
            }
        }
    } catch (error) {
        log.admin.error("Customers GET error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
