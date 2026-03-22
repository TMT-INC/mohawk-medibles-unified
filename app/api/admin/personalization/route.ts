/**
 * Admin Personalization Preview API — /api/admin/personalization
 * GET ?action=profile|recommendations&userId=N&limit=N
 */
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    const { prisma } = await import("@/lib/db");
    const action = req.nextUrl.searchParams.get("action") || "profile";
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    try {
        switch (action) {
            case "profile": {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { id: true, name: true, email: true, ordersCount: true, totalSpent: true },
                });
                if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

                // Get orders with items
                const orders = await prisma.order.findMany({
                    where: { userId },
                    include: {
                        items: {
                            include: {
                                product: { select: { id: true, name: true, category: true } },
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                });

                const totalOrders = orders.length;
                const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
                const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

                // Unique products & categories
                const productSet = new Map<number, string>();
                const categoryCounts: Record<string, number> = {};
                const recentProducts: { name: string }[] = [];

                for (const order of orders) {
                    for (const item of order.items) {
                        if (item.product) {
                            productSet.set(item.product.id, item.product.name);
                            if (recentProducts.length < 10) {
                                recentProducts.push({ name: item.product.name });
                            }
                            // Product.category is a string field
                            const cat = (item.product as any).category;
                            if (cat) {
                                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                            }
                        }
                    }
                }

                const topCategories = Object.entries(categoryCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([name, count]) => ({ name, count }));

                return NextResponse.json({
                    totalOrders,
                    totalSpent,
                    averageOrderValue,
                    uniqueProducts: productSet.size,
                    topCategories,
                    recentProducts: recentProducts.slice(0, 8),
                });
            }

            case "recommendations": {
                const limit = parseInt(req.nextUrl.searchParams.get("limit") || "4");

                // Get user's purchased product IDs
                const orderItems = await prisma.orderItem.findMany({
                    where: { order: { userId } },
                    select: { productId: true },
                });
                const purchasedIds = [...new Set(orderItems.map((i) => i.productId))];

                // Recommend products NOT already purchased, from active catalog
                const recommendations = await prisma.product.findMany({
                    where: {
                        id: { notIn: purchasedIds.length > 0 ? purchasedIds : [0] },
                        status: "ACTIVE",
                    },
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        image: true,
                    },
                });

                return NextResponse.json(
                    recommendations.map((r) => ({
                        ...r,
                        reason: "Popular",
                    }))
                );
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (err: any) {
        log.admin.error("Personalization API error", { error: err instanceof Error ? err.message : "Unknown" });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
