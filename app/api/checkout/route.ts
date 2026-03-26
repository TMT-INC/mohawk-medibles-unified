/**
 * Mohawk Medibles — Native Checkout API
 * Creates orders in Neon DB, redirects to Digipay for CC payment.
 * e-Transfer orders are placed on-hold with instructions returned inline.
 *
 * Payment methods:
 *   - credit_card: Redirect to Digipay hosted payment page
 *   - etransfer: On-hold with e-Transfer instructions
 *   - crypto: Redirect to crypto payment (future)
 */
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { getCurrentTenant } from "@/lib/tenant";
import { buildDigipayPaymentUrl } from "@/lib/digipay";
import { runFraudCheck } from "@/lib/fraudDetection";
import { sendOrderConfirmationSMS, sendAndLogSMS } from "@/lib/sms";
import { sendOrderConfirmation } from "@/lib/email";
import { autoEnterPurchaseContests } from "@/lib/contestDrawing";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

// ─── Types ───────────────────────────────────────────────────

interface CheckoutItem {
    productId: number;
    quantity: number;
    name?: string;
}

interface CheckoutRequest {
    items: CheckoutItem[];
    billing: {
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
    payment_method: string;
    customer_note?: string;
    coupon_codes?: string[];
}

// ─── POST Handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
    // ── Rate limit ──────────────────────────────────────────
    const limited = await applyRateLimit(req, RATE_LIMITS.checkout);
    if (limited) return limited;

    try {
        const tenant = await getCurrentTenant();
        const body: CheckoutRequest = await req.json();

        // ── Validation ─────────────────────────────────────
        if (!body.items || body.items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }
        if (!body.billing?.email || !body.billing?.first_name || !body.billing?.last_name) {
            return NextResponse.json({ error: "Billing info required" }, { status: 400 });
        }
        if (!body.billing?.address_1 || !body.billing?.city || !body.billing?.postcode) {
            return NextResponse.json({ error: "Complete address required" }, { status: 400 });
        }
        if (!body.payment_method) {
            return NextResponse.json({ error: "Payment method required" }, { status: 400 });
        }

        // ── Resolve products and calculate total ───────────
        let subtotal = 0;
        const resolvedItems: { productId: number; name: string; quantity: number; price: number }[] = [];

        for (const item of body.items) {
            const product = await prisma.product.findFirst({
                where: {
                    OR: [
                        { id: item.productId },
                        { wcId: item.productId },
                    ],
                    status: "ACTIVE",
                },
            });

            if (!product) {
                return NextResponse.json(
                    { error: `Product not found: ${item.name || item.productId}` },
                    { status: 400 }
                );
            }

            const qty = Math.min(Math.max(item.quantity, 1), 50);
            const lineTotal = product.price * qty;
            subtotal += lineTotal;

            resolvedItems.push({
                productId: product.id,
                name: product.name,
                quantity: qty,
                price: product.price,
            });
        }

        // ── Apply coupon (if any) ──────────────────────────
        let discount = 0;
        let hasFreeShipping = false;

        if (body.coupon_codes?.length) {
            for (const code of body.coupon_codes) {
                const coupon = await prisma.coupon.findFirst({
                    where: { code: code.toUpperCase(), active: true },
                });
                if (coupon) {
                    if (coupon.type === "PERCENTAGE") {
                        discount += subtotal * (coupon.value / 100);
                    } else if (coupon.type === "FIXED_AMOUNT") {
                        discount += coupon.value;
                    } else if (coupon.type === "FREE_SHIPPING") {
                        hasFreeShipping = true;
                    }
                }
            }
        }

        const subtotalAfterDiscount = Math.max(0, subtotal - discount);
        const shipping = hasFreeShipping ? 0 : (subtotal >= 149 ? 0 : 15);
        const tax = 0; // Tax-free — Indigenous sovereignty
        const total = +(subtotalAfterDiscount + shipping + tax).toFixed(2);

        // ── Find or create user ────────────────────────────
        let user = await prisma.user.findUnique({ where: { email: body.billing.email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: body.billing.email,
                    name: `${body.billing.first_name} ${body.billing.last_name}`,
                    phone: body.billing.phone || null,
                    passwordHash: "",
                    role: "CUSTOMER",
                },
            });
        }

        // ── Create order in DB ─────────────────────────────
        const isEtransfer = body.payment_method === "etransfer" || body.payment_method === "digipay_etransfer_manual";
        const orderNumber = `MM-${Date.now().toString(36).toUpperCase()}`;

        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    userId: user.id,
                    status: isEtransfer ? "ON_HOLD" : "PENDING",
                    paymentStatus: "PENDING",
                    subtotal,
                    shippingCost: shipping,
                    tax,
                    discount,
                    total,
                    paymentMethod: body.payment_method,
                    paymentMethodTitle: getPaymentTitle(body.payment_method),
                    sourceTenant: tenant.slug,
                    sourceDomain: tenant.domain || "mohawkmedibles.ca",
                    billingData: JSON.stringify({
                        ...body.billing,
                        country: body.billing.country || "CA",
                    }),
                    shippingData: JSON.stringify({
                        first_name: body.billing.first_name,
                        last_name: body.billing.last_name,
                        address_1: body.billing.address_1,
                        address_2: body.billing.address_2 || "",
                        city: body.billing.city,
                        state: body.billing.state,
                        postcode: body.billing.postcode,
                        country: body.billing.country || "CA",
                    }),
                    customerNote: body.customer_note || null,
                },
            });

            // Save line items
            await tx.orderItem.createMany({
                data: resolvedItems.map((item) => ({
                    orderId: newOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity,
                    name: item.name,
                })),
            });

            // Add status history
            await tx.orderStatusHistory.create({
                data: {
                    orderId: newOrder.id,
                    status: isEtransfer ? "ON_HOLD" : "PENDING",
                    note: `Order created via ${tenant.domain || "mohawkmedibles.ca"}. Payment: ${getPaymentTitle(body.payment_method)}`,
                },
            });

            return newOrder;
        });

        // ── Run fraud detection (non-blocking — don't fail checkout) ──
        try {
            const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
                || req.headers.get("x-real-ip")
                || null;

            await runFraudCheck({
                orderId: order.id,
                userId: user.id,
                userEmail: body.billing.email,
                total,
                ipAddress,
                billingData: order.billingData,
                shippingData: order.shippingData,
                userCreatedAt: user.createdAt,
            });
        } catch (fraudError) {
            // Log but don't block checkout
            log.checkout.error("Fraud check failed", {
                orderId: order.id,
                error: fraudError instanceof Error ? fraudError.message : "Unknown",
            });
        }

        // ── Send SMS order confirmation (non-blocking) ─────
        try {
            const smsOptIn = await prisma.smsOptIn.findUnique({
                where: { userId: user.id },
            });
            const smsPhone = smsOptIn?.optedIn ? smsOptIn.phone : (body.billing.phone || null);
            if (smsPhone && smsOptIn?.optedIn) {
                sendAndLogSMS({
                    phone: smsPhone,
                    message: `Your Mohawk Medibles order #${orderNumber} ($${total.toFixed(2)}) has been received! Track at mohawkmedibles.ca/track-order`,
                    type: "ORDER_CONFIRMATION",
                    orderId: order.id,
                    userId: user.id,
                }).catch(() => {}); // Fire and forget
            }
        } catch (smsError) {
            // Never block checkout for SMS failure
            log.checkout.error("SMS notification failed", {
                orderId: order.id,
                error: smsError instanceof Error ? smsError.message : "Unknown",
            });
        }

        // ── Auto-enter PURCHASE contests (non-blocking) ────
        try {
            autoEnterPurchaseContests(user.id, total).catch(() => {});
        } catch {
            // Never block checkout for contest entry
        }

        // ── Route by payment method ────────────────────────

        if (isEtransfer) {
            // Send e-Transfer confirmation email (non-blocking)
            try {
                const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
                await sendOrderConfirmation(body.billing.email, {
                    orderNumber,
                    customerName: `${body.billing.first_name} ${body.billing.last_name}`,
                    items: items.map((i) => ({
                        name: i.name,
                        qty: i.quantity,
                        price: i.price,
                    })),
                    subtotal,
                    shipping,
                    tax,
                    total,
                    etransferInstructions: "Please send your Interac e-Transfer to orders@mohawkmedibles.ca with your order number as the message. Auto-deposit is enabled — no security question needed.",
                });
            } catch (emailErr) {
                log.checkout.error("e-Transfer confirmation email failed", {
                    orderId: order.id,
                    error: emailErr instanceof Error ? emailErr.message : "Unknown",
                });
            }

            // e-Transfer: return instructions
            return NextResponse.json({
                success: true,
                orderId: order.id,
                orderNumber,
                status: "on-hold",
                paymentMethod: "etransfer",
                total: total.toFixed(2),
                currency: "CAD",
                etransfer: {
                    instructions: "Please send your Interac e-Transfer to orders@mohawkmedibles.ca with your order number as the message. Auto-deposit is enabled — no security question needed.",
                    orderReference: orderNumber,
                    email: "orders@mohawkmedibles.ca",
                },
            });
        }

        if (body.payment_method === "credit_card" || body.payment_method === "paygobillingcc") {
            // Credit Card: redirect to Digipay
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mohawkmedibles.ca";

            const paymentUrl = buildDigipayPaymentUrl({
                orderId: String(order.id),
                amount: total,
                description: `Mohawk Medibles Order ${orderNumber}`,
                billing: {
                    first_name: body.billing.first_name,
                    last_name: body.billing.last_name,
                    email: body.billing.email,
                    address: body.billing.address_1,
                    city: body.billing.city,
                    state: body.billing.state,
                    postcode: body.billing.postcode,
                    country: body.billing.country || "CA",
                },
                postbackUrl: `${siteUrl}/api/webhooks/digipay/`,
                returnUrl: `${siteUrl}/checkout/success/?order=${order.id}&ref=${orderNumber}`,
            });

            return NextResponse.json({
                success: true,
                orderId: order.id,
                orderNumber,
                status: "pending",
                paymentMethod: "credit_card",
                total: total.toFixed(2),
                currency: "CAD",
                payUrl: paymentUrl,
            });
        }

        // Crypto or other — placeholder
        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber,
            status: "pending",
            paymentMethod: body.payment_method,
            total: total.toFixed(2),
            currency: "CAD",
            message: "Payment method processing. You will receive instructions via email.",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Checkout failed";
        log.checkout.error("Checkout error", { error: message });
        return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 500 });
    }
}

function getPaymentTitle(method: string): string {
    const titles: Record<string, string> = {
        credit_card: "Credit Card",
        paygobillingcc: "Credit Card",
        etransfer: "Interac e-Transfer",
        digipay_etransfer_manual: "Interac e-Transfer",
        crypto: "Cryptocurrency",
        wcpg_crypto: "Cryptocurrency",
    };
    return titles[method] || method;
}

// ─── GET: Available payment methods ──────────────────────────

export async function GET() {
    const tenant = await getCurrentTenant();

    const methods = [
        {
            id: "credit_card",
            title: "Credit Card",
            description: "Pay securely with Visa, Mastercard, or Amex. Statement shows AMIGO WELLNESS.",
            icon: "credit-card",
        },
        {
            id: "etransfer",
            title: "Interac e-Transfer",
            description: "Send money via e-Transfer to orders@mohawkmedibles.ca. Auto-deposit enabled.",
            icon: "interac",
        },
    ];

    return NextResponse.json({
        tenant: tenant.slug,
        methods,
        shipping: {
            freeShippingMin: 149,
            flatRate: 15,
            currency: "CAD",
        },
    });
}
