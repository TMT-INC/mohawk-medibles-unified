/**
 * Checkout Verify API — Retrieves order info from a Stripe session ID.
 * GET /api/checkout/verify?session_id=cs_xxx
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

    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
        return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    try {
        // Find order that was created by the Stripe webhook
        // The webhook stores "Stripe session: cs_xxx" in the notes field
        const order = await prisma.order.findFirst({
            where: {
                notes: { contains: sessionId },
            },
            select: {
                orderNumber: true,
                total: true,
                status: true,
                paymentMethod: true,
                createdAt: true,
                items: {
                    select: { name: true, quantity: true, price: true },
                },
            },
        });

        if (!order) {
            // Webhook may not have fired yet — return gracefully
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
            itemCount: order.items.length,
        });
    } catch (e) {
        log.checkout.error("Verify error", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
