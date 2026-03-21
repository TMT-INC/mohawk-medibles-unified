/**
 * Checkout Verify API — Retrieves order info from a WC order ID.
 * GET /api/checkout/verify?order=123&key=wc_order_xxx
 *
 * Called by the success page to display the real order number.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { log } from "@/lib/logger";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    const orderId = req.nextUrl.searchParams.get("order");
    if (!orderId) {
        return NextResponse.json({ error: "Missing order parameter" }, { status: 400 });
    }

    try {
        // Find order by WC order ID
        const wcId = parseInt(orderId);
        const order = await prisma.order.findFirst({
            where: wcId ? { wcOrderId: wcId } : { orderNumber: { contains: orderId } },
            select: {
                orderNumber: true,
                total: true,
                status: true,
                paymentMethod: true,
                shippingCost: true,
                tax: true,
                createdAt: true,
                items: {
                    select: { name: true, quantity: true, price: true },
                },
            },
        });

        if (!order) {
            return NextResponse.json({
                found: false,
                message: "Order is being processed. Check your email for confirmation.",
            });
        }

        return NextResponse.json({
            found: true,
            orderNumber: order.orderNumber,
            total: order.total,
            status: order.status,
            paymentMethod: order.paymentMethod,
            shipping: order.shippingCost,
            tax: order.tax,
            itemCount: order.items.length,
            items: order.items.map((i) => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price,
            })),
        });
    } catch (e) {
        log.checkout.error("Verify error", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
