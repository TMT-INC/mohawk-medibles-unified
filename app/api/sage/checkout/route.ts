/**
 * MedAgent Checkout API — /api/sage/checkout
 * ═══════════════════════════════════════════
 * UCP-compatible checkout endpoint.
 * Creates Stripe sessions + Google Pay payment requests
 * from MedAgent session carts.
 *
 * POST: Create checkout from session cart
 * GET:  Check current cart status
 */

import { NextRequest, NextResponse } from "next/server";
import { getCart, createCheckoutIntent } from "@/lib/sage/commerce";
import { createCheckoutSession, type CheckoutItem } from "@/lib/stripe";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { log } from "@/lib/logger";

// ─── POST /api/sage/checkout ────────────────────────────────

export async function POST(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    try {
        const body = await req.json();
        const { sessionId, paymentMethod = "auto", email } = body as {
            sessionId: string;
            paymentMethod?: "stripe" | "google_pay" | "auto";
            email?: string;
        };

        if (!sessionId || typeof sessionId !== "string") {
            return NextResponse.json(
                { error: "Session ID is required" },
                { status: 400 }
            );
        }

        // Validate payment method
        const VALID_PAYMENT_METHODS = new Set(["stripe", "google_pay", "auto"]);
        const safePaymentMethod = VALID_PAYMENT_METHODS.has(paymentMethod) ? paymentMethod : "auto";

        // Validate email if provided
        if (email && (typeof email !== "string" || email.length > 254)) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        const cart = getCart(sessionId);

        if (cart.items.length === 0) {
            return NextResponse.json(
                { error: "Cart is empty", cart },
                { status: 400 }
            );
        }

        // Build checkout intent (includes Google Pay request)
        const intent = createCheckoutIntent(sessionId, safePaymentMethod as "stripe" | "google_pay" | "auto");

        // Create Stripe session for redirect-based checkout
        const stripeItems: CheckoutItem[] = cart.items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            productId: String(item.productId),
        }));

        const stripeSession = await createCheckoutSession(stripeItems, email);

        return NextResponse.json({
            success: true,
            checkout: {
                stripeSessionId: stripeSession.id,
                stripeUrl: stripeSession.url,
                googlePayRequest: intent.googlePayRequest,
                cart: intent.cart,
            },
            ucp: {
                protocol: "google-ucp-v1",
                action: "CHECKOUT",
                merchantOfRecord: "Mohawk Medibles",
                currency: "CAD",
                countryCode: "CA",
            },
        });
    } catch (error) {
        log.sage.error("Checkout error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            { error: "Checkout failed. Please try again or contact support." },
            { status: 500 }
        );
    }
}

// ─── GET /api/sage/checkout?sessionId=xxx ───────────────────

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get("sessionId");

    if (!sessionId) {
        return NextResponse.json(
            { error: "sessionId query parameter is required" },
            { status: 400 }
        );
    }

    const cart = getCart(sessionId);

    return NextResponse.json({
        sessionId,
        cart,
        canCheckout: cart.items.length > 0,
        supportedPaymentMethods: ["stripe", "google_pay"],
    });
}
