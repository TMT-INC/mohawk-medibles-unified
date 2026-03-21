/**
 * Stripe Webhook — Handles payment events
 * POST /api/webhooks/stripe
 *
 * Creates orders in the database on successful payment,
 * sends confirmation emails, and triggers ShipStation fulfillment.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyStripeWebhook, getCheckoutSession } from "@/lib/stripe";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { prisma } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";
import { processOrderForShipping } from "@/lib/shipstation";
import type { ShipStationAddress, ShipStationItem } from "@/lib/shipstation";
import { getAllProducts } from "@/lib/products";
import { log } from "@/lib/logger";

function getWebhookSecret(): string {
    return process.env.STRIPE_WEBHOOK_SECRET || "";
}

// ─── Order number generator ────────────────────────────────
function generateOrderNumber(): string {
    const prefix = "MM";
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

export async function POST(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.webhook);
    if (limited) return limited;

    const WEBHOOK_SECRET = getWebhookSecret();
    if (!WEBHOOK_SECRET) {
        log.stripe.error("STRIPE_WEBHOOK_SECRET is not configured");
        return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
        return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }

    const payload = await req.text();

    // Verify webhook signature
    const valid = await verifyStripeWebhook(payload, signature, WEBHOOK_SECRET);
    if (!valid) {
        log.stripe.warn("Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                log.stripe.info("Checkout completed", { sessionId: session.id });

                // ── Idempotency: prevent duplicate orders on webhook retry
                const existingOrder = await prisma.order.findFirst({
                    where: { notes: { contains: session.id } },
                    select: { orderNumber: true },
                });
                if (existingOrder) {
                    log.stripe.info("Duplicate webhook, order exists", { orderNumber: existingOrder.orderNumber });
                    return NextResponse.json({ received: true, duplicate: true, orderNumber: existingOrder.orderNumber });
                }

                const email = session.customer_details?.email;
                const customerName = session.customer_details?.name || "Customer";
                const amountTotal = (session.amount_total || 0) / 100; // cents → dollars
                const shippingAddress = session.shipping_details?.address;

                if (!email) {
                    log.stripe.error("No customer email in session");
                    break;
                }

                // ── 1. Fetch line items from Stripe (not included in webhook payload)
                const catalog = await getAllProducts();
                let lineItems: { name: string; quantity: number; price: number; productId: string }[] = [];
                try {
                    const sessionDetails = await getCheckoutSession(session.id + "?expand[]=line_items");
                    const stripeItems = sessionDetails.line_items?.data || [];

                    lineItems = stripeItems.map((item: any) => {
                        const unitAmount = (item.price?.unit_amount || 0) / 100;
                        const quantity = item.quantity || 1;
                        const itemName = item.description || item.price?.product?.name || "Unknown Product";

                        // Try to match back to catalog product by name
                        const catalogMatch = catalog.find(
                            (p) => p.name === itemName || p.name.toLowerCase() === itemName.toLowerCase()
                        );

                        return {
                            name: itemName,
                            quantity,
                            price: unitAmount,
                            productId: catalogMatch ? String(catalogMatch.id) : "0",
                        };
                    });
                } catch (fetchErr) {
                    log.stripe.error("Failed to fetch line items");
                    // Fallback: create order without detailed line items
                }

                // ── 2. Find or create user ──────────────────────
                let user = await prisma.user.findUnique({ where: { email } });

                if (!user) {
                    // Auto-create guest user from Stripe customer data
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: customerName,
                            passwordHash: "", // Guest — no password until they register
                            role: "CUSTOMER",
                            phone: session.customer_details?.phone || null,
                        },
                    });
                    log.stripe.info("Created guest user", { userId: user.id, email });
                }

                // ── 3. Create shipping address if provided ──────
                let addressId: string | null = null;
                if (shippingAddress) {
                    const nameParts = customerName.split(" ");
                    const address = await prisma.address.create({
                        data: {
                            userId: user.id,
                            label: "Shipping",
                            firstName: nameParts[0] || customerName,
                            lastName: nameParts.slice(1).join(" ") || "",
                            street1: shippingAddress.line1 || "",
                            street2: shippingAddress.line2 || null,
                            city: shippingAddress.city || "",
                            province: shippingAddress.state || "",
                            postalCode: shippingAddress.postal_code || "",
                            country: shippingAddress.country || "CA",
                        },
                    });
                    addressId = address.id;
                }

                // ── 4. Calculate order totals ───────────────────
                const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                const shipping = subtotal >= 100 ? 0 : 15;
                const tax = 0; // Tax-free — Indigenous sovereignty (Tyendinaga Mohawk Territory)
                const orderTotal = amountTotal > 0 ? amountTotal : +(subtotal + shipping + tax).toFixed(2);
                const orderNumber = generateOrderNumber();

                // ── 5. Create order + items in a transaction ────
                const order = await prisma.$transaction(async (tx: any) => {
                    const newOrder = await tx.order.create({
                        data: {
                            orderNumber,
                            userId: user!.id,
                            addressId,
                            status: "PAYMENT_CONFIRMED",
                            paymentStatus: "PAID",
                            paymentMethod: session.payment_method_types?.[0] || "card",
                            subtotal,
                            shippingCost: shipping,
                            tax,
                            discount: 0,
                            total: orderTotal,
                            currency: "CAD",
                            notes: `Stripe session: ${session.id}`,
                            ipAddress: null,
                        },
                    });

                    // Create order items
                    if (lineItems.length > 0) {
                        await tx.orderItem.createMany({
                            data: lineItems.map((item) => ({
                                orderId: newOrder.id,
                                productId: parseInt(item.productId) || 1,
                                quantity: item.quantity,
                                price: item.price,
                                total: item.price * item.quantity,
                                name: item.name,
                            })),
                        });
                    }

                    // Record initial status
                    await tx.orderStatusHistory.create({
                        data: {
                            orderId: newOrder.id,
                            status: "PAYMENT_CONFIRMED",
                            note: `Payment confirmed via Stripe (${session.payment_method_types?.[0] || "card"})`,
                            changedBy: "stripe_webhook",
                        },
                    });

                    return newOrder;
                });

                log.stripe.info("Order created", { orderNumber: order.orderNumber, email, total: orderTotal });

                // ── 5b. Decrement inventory for purchased items ──
                try {
                    for (const item of lineItems) {
                        const productId = parseInt(item.productId);
                        if (productId > 0) {
                            await prisma.inventory.updateMany({
                                where: { productId, quantity: { gt: 0 } },
                                data: { quantity: { decrement: item.quantity } },
                            });
                        }
                    }
                } catch (invErr) {
                    // Non-fatal — inventory tracking failure shouldn't block order
                    log.stripe.warn("Inventory decrement failed", {
                        orderNumber: order.orderNumber,
                        error: invErr instanceof Error ? invErr.message : "Unknown",
                    });
                }

                // ── 6. Send order confirmation email ────────────
                try {
                    await sendOrderConfirmation(email, {
                        orderNumber: order.orderNumber,
                        customerName,
                        items: lineItems.map((i) => ({
                            name: i.name,
                            qty: i.quantity,
                            price: i.price,
                        })),
                        subtotal,
                        shipping,
                        tax,
                        total: orderTotal,
                    });
                    log.stripe.info("Confirmation email sent", { email });
                } catch (emailErr) {
                    // Non-fatal — order still created
                    log.stripe.error("Email send failed");
                }

                // ── 7. Send order to ShipStation for fulfillment ──
                try {
                    const ssAddress: ShipStationAddress = {
                        name: customerName,
                        street1: shippingAddress?.line1 || "",
                        street2: shippingAddress?.line2 || undefined,
                        city: shippingAddress?.city || "",
                        state: shippingAddress?.state || "",
                        postalCode: shippingAddress?.postal_code || "",
                        country: shippingAddress?.country || "CA",
                        phone: session.customer_details?.phone || undefined,
                    };

                    const ssItems: ShipStationItem[] = lineItems.map((item, idx) => ({
                        lineItemKey: `item-${idx}`,
                        name: item.name,
                        quantity: item.quantity,
                        unitPrice: item.price,
                    }));

                    const shipResult = await processOrderForShipping({
                        orderNumber: order.orderNumber,
                        customerEmail: email,
                        customerName,
                        shippingAddress: ssAddress,
                        billingAddress: ssAddress, // Same as shipping for now
                        items: ssItems,
                        total: orderTotal,
                        shippingCost: shipping,
                    });

                    // Update order with ShipStation data
                    await prisma.order.update({
                        where: { id: order.id },
                        data: {
                            shipstationId: String(shipResult.shipstationOrderId),
                            trackingNumber: shipResult.trackingNumber || undefined,
                            carrier: shipResult.carrier || undefined,
                            shippingLabel: shipResult.labelPdf || undefined,
                            status: "PROCESSING",
                        },
                    });

                    await prisma.orderStatusHistory.create({
                        data: {
                            orderId: order.id,
                            status: "PROCESSING",
                            note: `Sent to ShipStation (ID: ${shipResult.shipstationOrderId})${shipResult.trackingNumber ? `, tracking: ${shipResult.trackingNumber}` : ""}`,
                            changedBy: "stripe_webhook",
                        },
                    });

                    log.stripe.info("Order sent to ShipStation", {
                        orderNumber: order.orderNumber,
                        shipstationId: shipResult.shipstationOrderId,
                    });
                } catch (shipErr) {
                    // Non-fatal — order exists in DB, admin can manually ship
                    log.stripe.warn("ShipStation fulfillment failed, order saved for manual processing", {
                        orderNumber: order.orderNumber,
                        error: shipErr instanceof Error ? shipErr.message : "Unknown",
                    });
                }

                break;
            }

            case "payment_intent.succeeded": {
                const pi = event.data.object;
                log.stripe.info("Payment succeeded", { paymentIntentId: pi.id });
                // Payment intent confirmation is handled via checkout.session.completed
                break;
            }

            case "charge.refunded": {
                const charge = event.data.object;
                log.stripe.info("Refund processed", { chargeId: charge.id });

                // Find order by Stripe payment intent and update status
                const paymentIntentId = charge.payment_intent;
                if (paymentIntentId) {
                    // Search for order with matching Stripe session reference
                    const orders = await prisma.order.findMany({
                        where: {
                            notes: { contains: paymentIntentId },
                        },
                        take: 1,
                    });

                    if (orders.length > 0) {
                        const order = orders[0];
                        const isFullRefund = charge.amount_refunded >= charge.amount;

                        await prisma.$transaction([
                            prisma.order.update({
                                where: { id: order.id },
                                data: {
                                    status: "REFUNDED",
                                    paymentStatus: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
                                },
                            }),
                            prisma.orderStatusHistory.create({
                                data: {
                                    orderId: order.id,
                                    status: "REFUNDED",
                                    note: `Refund processed: $${(charge.amount_refunded / 100).toFixed(2)} CAD (${isFullRefund ? "full" : "partial"})`,
                                    changedBy: "stripe_webhook",
                                },
                            }),
                        ]);

                        log.stripe.info("Order marked as refunded", { orderNumber: order.orderNumber });
                    }
                }

                break;
            }

            default:
                log.stripe.debug("Unhandled event", { type: event.type });
        }

        return NextResponse.json({ received: true });
    } catch (e) {
        log.stripe.error("Webhook processing error", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
