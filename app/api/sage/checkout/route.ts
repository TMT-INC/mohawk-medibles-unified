/**
 * MedAgent Checkout API — /api/sage/checkout
 * ============================================
 * UCP-compatible checkout endpoint.
 * Creates WooCommerce orders from MedAgent session carts.
 * Supports: Credit Card (PayGo), Crypto, Interac e-Transfer.
 *
 * POST: Create checkout from session cart
 * GET:  Check current cart status
 */

import { NextRequest, NextResponse } from "next/server";
import { getCart } from "@/lib/sage/commerce";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { log } from "@/lib/logger";

const WC_STORE_URL = process.env.WC_STORE_URL || "https://mohawkmedibles.ca";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY || "";
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || "";

const VALID_PAYMENT_METHODS = new Set(["paygobillingcc", "wcpg_crypto", "digipay_etransfer_manual"]);

function getPaymentMethodTitle(method: string): string {
    const titles: Record<string, string> = {
        paygobillingcc: "Credit Card",
        digipay_etransfer_manual: "Interac e-Transfer (Send Money)",
        wcpg_crypto: "Pay with Crypto",
    };
    return titles[method] || method;
}

// ─── POST /api/sage/checkout ────────────────────────────────

export async function POST(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    try {
        const body = await req.json();
        const {
            sessionId,
            paymentMethod = "paygobillingcc",
            email,
            billing,
        } = body as {
            sessionId: string;
            paymentMethod?: string;
            email?: string;
            billing?: {
                first_name: string;
                last_name: string;
                email: string;
                phone?: string;
                address_1: string;
                address_2?: string;
                city: string;
                state: string;
                postcode: string;
                country?: string;
            };
        };

        if (!sessionId || typeof sessionId !== "string") {
            return NextResponse.json(
                { error: "Session ID is required" },
                { status: 400 }
            );
        }

        // Validate payment method
        const safePaymentMethod = VALID_PAYMENT_METHODS.has(paymentMethod) ? paymentMethod : "paygobillingcc";

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

        // Build billing info (use provided billing or construct from email)
        const billingInfo = billing || {
            first_name: "Guest",
            last_name: "Customer",
            email: email || "",
            address_1: "",
            city: "",
            state: "ON",
            postcode: "",
            country: "CA",
        };

        if (!billingInfo.email && email) {
            billingInfo.email = email;
        }

        if (!billingInfo.email) {
            return NextResponse.json(
                { error: "Email is required for checkout" },
                { status: 400 }
            );
        }

        // Create WooCommerce order
        const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
        const wcBody = {
            payment_method: safePaymentMethod,
            payment_method_title: getPaymentMethodTitle(safePaymentMethod),
            set_paid: false,
            status: safePaymentMethod === "digipay_etransfer_manual" ? "on-hold" : "pending",
            billing: { ...billingInfo, country: billingInfo.country || "CA" },
            shipping: { ...billingInfo, country: billingInfo.country || "CA" },
            line_items: cart.items.map((item) => ({
                product_id: item.productId,
                quantity: item.quantity,
            })),
            meta_data: [
                { key: "_source_site", value: "medagent" },
                { key: "_source_tenant", value: "sage-checkout" },
                { key: "_checkout_origin", value: "ai-agent" },
                { key: "_checkout_timestamp", value: new Date().toISOString() },
            ],
        };

        const wcResponse = await fetch(`${WC_STORE_URL}/wp-json/wc/v3/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify(wcBody),
        });

        if (!wcResponse.ok) {
            const wcError = await wcResponse.json().catch(() => ({}));
            log.sage.error("WC order creation failed", { status: wcResponse.status });
            throw new Error(`WC API error ${wcResponse.status}: ${JSON.stringify(wcError)}`);
        }

        const wcOrder = await wcResponse.json();

        // Build response based on payment method
        if (safePaymentMethod === "digipay_etransfer_manual") {
            return NextResponse.json({
                success: true,
                checkout: {
                    orderId: wcOrder.id,
                    orderNumber: wcOrder.number,
                    orderKey: wcOrder.order_key,
                    status: "on-hold",
                    paymentMethod: "etransfer",
                    total: wcOrder.total,
                    currency: wcOrder.currency,
                    etransfer: {
                        instructions: "Please send your Interac e-Transfer to the email provided in your order confirmation. Use your order number as the reference.",
                        orderReference: `WC-${wcOrder.number}`,
                    },
                    cart: { items: cart.items, subtotal: cart.subtotal, currency: "CAD", itemCount: cart.itemCount },
                },
                ucp: {
                    protocol: "google-ucp-v1",
                    action: "CHECKOUT",
                    merchantOfRecord: "Mohawk Medibles",
                    currency: "CAD",
                    countryCode: "CA",
                },
            });
        }

        // CC or Crypto: redirect to WC pay-for-order page
        const payUrl = `${WC_STORE_URL}/checkout/order-pay/${wcOrder.id}/?pay_for_order=true&key=${wcOrder.order_key}`;

        return NextResponse.json({
            success: true,
            checkout: {
                orderId: wcOrder.id,
                orderNumber: wcOrder.number,
                orderKey: wcOrder.order_key,
                status: "pending",
                paymentMethod: safePaymentMethod,
                total: wcOrder.total,
                currency: wcOrder.currency,
                payUrl,
                cart: { items: cart.items, subtotal: cart.subtotal, currency: "CAD", itemCount: cart.itemCount },
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
        supportedPaymentMethods: ["paygobillingcc", "wcpg_crypto", "digipay_etransfer_manual"],
    });
}
