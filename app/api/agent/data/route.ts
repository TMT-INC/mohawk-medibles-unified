/**
 * Agent Data API — Provides real database data to Python agents
 * GET /api/agent/data?type=order&query=MM-XXXX
 * GET /api/agent/data?type=inventory&query=Grand+River+Kush
 * GET /api/agent/data?type=customer&query=email@example.com
 * GET /api/agent/data?type=stats
 * GET /api/agent/data?type=recent-orders&limit=10
 *
 * Internal API — secured by agent gateway secret token.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAllProducts } from "@/lib/products";
import { log } from "@/lib/logger";

import { timingSafeEqual } from "crypto";

function getAgentSecret(): string {
    return process.env.AGENT_API_SECRET || "";
}

function verifyAgentAuth(req: NextRequest): boolean {
    const secret = getAgentSecret();
    if (!secret) return false; // Reject if no secret configured
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return false;
    const token = authHeader.replace("Bearer ", "");
    if (token.length !== secret.length) return false;
    // Timing-safe comparison to prevent timing attacks
    return timingSafeEqual(Buffer.from(token), Buffer.from(secret));
}

export async function GET(req: NextRequest) {
    // Auth check — always require valid agent token
    if (!verifyAgentAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const query = searchParams.get("query") || "";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    try {
        switch (type) {
            // ── Order Lookup ────────────────────────────────────
            case "order": {
                if (!query) {
                    return NextResponse.json({ error: "Query parameter required for order lookup" }, { status: 400 });
                }

                const order = await prisma.order.findUnique({
                    where: { orderNumber: query.toUpperCase() },
                    include: {
                        items: { select: { name: true, quantity: true, price: true, total: true } },
                        user: { select: { name: true, email: true, phone: true } },
                        address: true,
                        statusHistory: { orderBy: { createdAt: "desc" }, take: 5 },
                    },
                });

                if (!order) {
                    return NextResponse.json({ found: false, message: `No order found for ${query}` });
                }

                return NextResponse.json({
                    found: true,
                    order: {
                        orderNumber: order.orderNumber,
                        status: order.status,
                        total: order.total,
                        currency: order.currency,
                        paymentMethod: order.paymentMethod,
                        paymentStatus: order.paymentStatus,
                        trackingNumber: order.trackingNumber,
                        carrier: order.carrier,
                        shippedAt: order.shippedAt,
                        deliveredAt: order.deliveredAt,
                        createdAt: order.createdAt,
                        items: order.items,
                        customer: order.user,
                        shippingAddress: order.address,
                        statusHistory: order.statusHistory.map((h: any) => ({
                            status: h.status,
                            note: h.note,
                            timestamp: h.createdAt,
                        })),
                    },
                });
            }

            // ── Orders by Email ─────────────────────────────────
            case "orders-by-email": {
                if (!query) {
                    return NextResponse.json({ error: "Email query required" }, { status: 400 });
                }

                const orders = await prisma.order.findMany({
                    where: { user: { email: query.toLowerCase() } },
                    include: {
                        items: { select: { name: true, quantity: true, price: true } },
                    },
                    orderBy: { createdAt: "desc" },
                    take: limit,
                });

                return NextResponse.json({
                    count: orders.length,
                    orders: orders.map((o: any) => ({
                        orderNumber: o.orderNumber,
                        status: o.status,
                        total: o.total,
                        trackingNumber: o.trackingNumber,
                        createdAt: o.createdAt,
                        itemCount: o.items.length,
                        items: o.items,
                    })),
                });
            }

            // ── Inventory / Stock ───────────────────────────────
            case "inventory": {
                if (query) {
                    // Search for specific product stock
                    const inventory = await prisma.inventory.findMany({
                        where: {
                            product: {
                                name: { contains: query, mode: "insensitive" },
                            },
                        },
                        include: {
                            product: {
                                select: { name: true, slug: true, price: true, category: true, status: true },
                            },
                        },
                        take: limit,
                    });

                    if (inventory.length === 0) {
                        // Fallback to catalog for products not yet in inventory table
                        const catalog = await getAllProducts();
                        const catalogMatch = catalog.filter(
                            (p) => p.name.toLowerCase().includes(query.toLowerCase())
                        ).slice(0, limit);

                        return NextResponse.json({
                            source: "catalog",
                            count: catalogMatch.length,
                            items: catalogMatch.map((p) => ({
                                name: p.name,
                                category: p.category,
                                price: p.price,
                                inStock: true, // Assumed in stock if in catalog
                                slug: p.slug,
                            })),
                        });
                    }

                    return NextResponse.json({
                        source: "database",
                        count: inventory.length,
                        items: inventory.map((inv: any) => ({
                            name: inv.product.name,
                            category: inv.product.category,
                            price: inv.product.price,
                            quantity: inv.quantity,
                            lowStock: inv.quantity <= inv.lowStockAt,
                            backorder: inv.backorder,
                            status: inv.product.status,
                        })),
                    });
                }

                // No query — return low stock alerts
                const lowStock = await prisma.inventory.findMany({
                    where: { quantity: { lte: 5 } },
                    include: { product: { select: { name: true, category: true, price: true } } },
                    orderBy: { quantity: "asc" },
                    take: 20,
                });

                return NextResponse.json({
                    type: "low-stock-alerts",
                    count: lowStock.length,
                    items: lowStock.map((inv: any) => ({
                        name: inv.product.name,
                        category: inv.product.category,
                        quantity: inv.quantity,
                        lowStockThreshold: inv.lowStockAt,
                    })),
                });
            }

            // ── Customer Lookup ─────────────────────────────────
            case "customer": {
                if (!query) {
                    return NextResponse.json({ error: "Email query required" }, { status: 400 });
                }

                const customer = await prisma.user.findUnique({
                    where: { email: query.toLowerCase() },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        createdAt: true,
                        lastLogin: true,
                        _count: { select: { orders: true, supportTickets: true } },
                    },
                });

                if (!customer) {
                    return NextResponse.json({ found: false, message: `No customer found for ${query}` });
                }

                // Calculate LTV
                const orderAgg = await prisma.order.aggregate({
                    where: { userId: customer.id, paymentStatus: "PAID" },
                    _sum: { total: true },
                    _count: true,
                });

                return NextResponse.json({
                    found: true,
                    customer: {
                        ...customer,
                        totalOrders: orderAgg._count,
                        lifetimeValue: orderAgg._sum.total || 0,
                        orderCount: customer._count.orders,
                        ticketCount: customer._count.supportTickets,
                    },
                });
            }

            // ── Dashboard Stats ─────────────────────────────────
            case "stats": {
                const [totalOrders, revenue, customers, pendingOrders, recentShipped] =
                    await Promise.all([
                        prisma.order.count(),
                        prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
                        prisma.user.count({ where: { role: "CUSTOMER" } }),
                        prisma.order.count({ where: { status: { in: ["PENDING", "PROCESSING", "PAYMENT_CONFIRMED"] } } }),
                        prisma.order.count({ where: { status: "SHIPPED" } }),
                    ]);

                return NextResponse.json({
                    totalOrders,
                    totalRevenue: revenue._sum.total || 0,
                    totalCustomers: customers,
                    pendingOrders,
                    shippedOrders: recentShipped,
                    catalogProducts: (await getAllProducts()).length,
                });
            }

            // ── Recent Orders ───────────────────────────────────
            case "recent-orders": {
                const orders = await prisma.order.findMany({
                    take: Math.min(limit, 50),
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: { select: { name: true, email: true } },
                        items: { select: { name: true, quantity: true } },
                    },
                });

                return NextResponse.json({
                    count: orders.length,
                    orders: orders.map((o: any) => ({
                        orderNumber: o.orderNumber,
                        status: o.status,
                        total: o.total,
                        customer: o.user.name,
                        email: o.user.email,
                        trackingNumber: o.trackingNumber,
                        createdAt: o.createdAt,
                        itemSummary: o.items.map((i: any) => `${i.name} x${i.quantity}`).join(", "),
                    })),
                });
            }

            // ── Support Tickets ─────────────────────────────────
            case "tickets": {
                const status = searchParams.get("status") || undefined;
                const tickets = await prisma.supportTicket.findMany({
                    where: status ? { status: status as any } : undefined,
                    include: {
                        user: { select: { name: true, email: true } },
                        messages: { orderBy: { createdAt: "desc" }, take: 3 },
                    },
                    orderBy: { createdAt: "desc" },
                    take: Math.min(limit, 50),
                });

                return NextResponse.json({
                    count: tickets.length,
                    tickets: tickets.map((t: any) => ({
                        id: t.id,
                        subject: t.subject,
                        status: t.status,
                        priority: t.priority,
                        channel: t.channel,
                        customer: t.user.name,
                        email: t.user.email,
                        createdAt: t.createdAt,
                        lastMessage: t.messages[0]?.content || null,
                    })),
                });
            }

            default:
                return NextResponse.json({
                    error: "Invalid type",
                    validTypes: ["order", "orders-by-email", "inventory", "customer", "stats", "recent-orders", "tickets"],
                }, { status: 400 });
        }
    } catch (e) {
        log.agent.error("Data API error", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json(
            { error: "Database query failed", detail: e instanceof Error ? e.message : "Unknown" },
            { status: 500 }
        );
    }
}
