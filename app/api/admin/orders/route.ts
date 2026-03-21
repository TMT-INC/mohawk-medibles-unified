/**
 * Admin Orders API — Hardened with rate limiting + validation
 * POST /api/admin/orders (mutations: update-status, ship-order, track)
 * GET  /api/admin/orders?action=list|stats|detail|low-stock
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { AdminOrderAction, AdminOrdersQuery, validateBody, validateQuery } from "@/lib/validation";
import { log } from "@/lib/logger";

export async function GET(req: NextRequest) {
    // ── Rate limit ──────────────────────────────────────────
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    // ── Validate query ──────────────────────────────────────
    const parsed = validateQuery(AdminOrdersQuery, req.nextUrl.searchParams);
    if (!parsed.success) return parsed.error;

    const { action, limit, orderNumber } = parsed.data;

    try {
        const { prisma } = await import("@/lib/db");

        switch (action) {
            case "stats": {
                const [totalOrders, totalCustomers, totalProducts] = await Promise.all([
                    prisma.order.count(),
                    prisma.user.count({ where: { role: "CUSTOMER" } }),
                    prisma.product.count({ where: { status: "ACTIVE" } }),
                ]);
                const recentRevenue = await prisma.order.aggregate({
                    _sum: { total: true },
                    where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
                });
                return NextResponse.json({
                    totalOrders,
                    totalCustomers,
                    totalProducts,
                    monthlyRevenue: recentRevenue._sum.total || 0,
                });
            }

            case "detail": {
                if (!orderNumber) {
                    return NextResponse.json({ error: "orderNumber required" }, { status: 400 });
                }
                const order = await prisma.order.findUnique({
                    where: { orderNumber },
                    include: { items: true, statusHistory: true, user: { select: { name: true, email: true } } },
                });
                if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
                return NextResponse.json(order);
            }

            case "low-stock": {
                const lowStock = await prisma.inventory.findMany({
                    where: { quantity: { lte: 5 } },
                    include: { product: { select: { name: true, slug: true, price: true } } },
                    take: limit,
                });
                return NextResponse.json({ items: lowStock });
            }

            default: {
                const orders = await prisma.order.findMany({
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        items: { select: { name: true, quantity: true, price: true } },
                        user: { select: { name: true, email: true } },
                    },
                });
                return NextResponse.json({ orders });
            }
        }
    } catch (error) {
        log.admin.error("Orders GET error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    // ── Rate limit ──────────────────────────────────────────
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    // ── Parse & validate body ───────────────────────────────
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = validateBody(AdminOrderAction, body);
    if (!parsed.success) return parsed.error;

    const data = parsed.data;

    try {
        const { prisma } = await import("@/lib/db");
        const { processOrderForShipping, getTracking } = await import("@/lib/shipstation");

        switch (data.action) {
            case "update-status": {
                const order = await prisma.order.update({
                    where: { id: data.orderId },
                    data: { status: data.status },
                });
                // Add to status history
                await prisma.orderStatusHistory.create({
                    data: {
                        orderId: data.orderId,
                        status: data.status,
                        note: data.note || `Status updated to ${data.status}`,
                        changedBy: req.headers.get("x-user-id") || "system",
                    },
                });
                return NextResponse.json({ success: true, order });
            }

            case "ship-order": {
                const od = data.orderData;
                const result = await processOrderForShipping({
                    orderNumber: od.orderId,
                    customerEmail: "",
                    customerName: od.recipientName,
                    shippingAddress: {
                        name: od.recipientName,
                        street1: od.street1,
                        street2: od.street2,
                        city: od.city,
                        state: od.province,
                        postalCode: od.postalCode,
                        country: od.country,
                        phone: od.phone,
                    },
                    billingAddress: {
                        name: od.recipientName,
                        street1: od.street1,
                        street2: od.street2,
                        city: od.city,
                        state: od.province,
                        postalCode: od.postalCode,
                        country: od.country,
                        phone: od.phone,
                    },
                    items: od.items.map((item, idx) => ({
                        lineItemKey: `item-${idx}`,
                        name: item.name,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        weight: { value: item.weight || 1, units: "ounces" as const },
                    })),
                    total: od.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
                    shippingCost: 0,
                });
                if (result.shipstationOrderId) {
                    await prisma.order.update({
                        where: { id: od.orderId },
                        data: {
                            shipstationId: String(result.shipstationOrderId),
                            trackingNumber: result.trackingNumber || undefined,
                            carrier: result.carrier || undefined,
                            shippingLabel: result.labelPdf || undefined,
                            status: "LABEL_PRINTED",
                        },
                    });
                }
                return NextResponse.json({ success: true, ...result });
            }

            case "track": {
                const trackingInfo = await getTracking(data.carrier, data.trackingNumber);
                return NextResponse.json(trackingInfo);
            }
        }
    } catch (error) {
        log.admin.error("Orders POST error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
