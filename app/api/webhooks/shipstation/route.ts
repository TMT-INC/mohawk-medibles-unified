/**
 * ShipStation Webhook — Hardened with HMAC verification
 * POST /api/webhooks/shipstation
 *
 * Receives SHIP_NOTIFY and ORDER_NOTIFY events.
 * Handles full status lifecycle: SHIPPED → IN_TRANSIT → DELIVERED
 * Sends shipping notification emails on first ship event.
 * Verifies webhook signature using HMAC-SHA256.
 */
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { ShipStationWebhook, validateBody } from "@/lib/validation";
import { sendShippingNotification } from "@/lib/email";
import { log } from "@/lib/logger";

function getWebhookSecret(): string {
    return process.env.SHIPSTATION_WEBHOOK_SECRET || "";
}

export async function POST(req: NextRequest) {
    // ── Rate limit ──────────────────────────────────────────
    const limited = await applyRateLimit(req, RATE_LIMITS.webhook);
    if (limited) return limited;

    const WEBHOOK_SECRET = getWebhookSecret();
    if (!WEBHOOK_SECRET && process.env.NODE_ENV === "production") {
        log.shipstation.error("SHIPSTATION_WEBHOOK_SECRET is not configured");
        return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    }

    // ── HMAC signature verification ─────────────────────────
    if (WEBHOOK_SECRET) {
        const signature = req.headers.get("x-shipstation-hmac-sha256") || "";
        const rawBody = await req.text();

        const expected = createHmac("sha256", WEBHOOK_SECRET)
            .update(rawBody)
            .digest("base64");

        const sigBuf = Buffer.from(signature, "base64");
        const expBuf = Buffer.from(expected, "base64");

        if (
            sigBuf.length !== expBuf.length ||
            !timingSafeEqual(sigBuf, expBuf)
        ) {
            log.shipstation.warn("Invalid webhook signature");
            return NextResponse.json(
                { error: "Invalid webhook signature" },
                { status: 401 }
            );
        }

        // Re-parse the body we consumed
        try {
            const body = JSON.parse(rawBody);
            return await processWebhook(body);
        } catch {
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }
    }

    // ── No secret configured (dev mode) — validate body only ─
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    return await processWebhook(body);
}

async function processWebhook(body: unknown): Promise<NextResponse> {
    const parsed = validateBody(ShipStationWebhook, body);
    if (!parsed.success) return parsed.error;

    const { resource_url, resource_type } = parsed.data;

    try {
        // Fetch the actual shipment/order details from ShipStation
        const apiKey = process.env.SHIPSTATION_API_KEY || "";
        const apiSecret = process.env.SHIPSTATION_API_SECRET || "";
        const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

        const ssRes = await fetch(resource_url, {
            headers: { Authorization: `Basic ${auth}` },
        });

        if (!ssRes.ok) {
            log.shipstation.error("Failed to fetch resource", { status: ssRes.status });
            return NextResponse.json(
                { error: "Failed to fetch ShipStation resource" },
                { status: 502 }
            );
        }

        const ssData = await ssRes.json();
        const { prisma } = await import("@/lib/db");

        if (resource_type === "SHIP_NOTIFY") {
            // Update tracking & status for shipped orders
            // ShipStation sends SHIP_NOTIFY for all shipment status changes
            const shipments = ssData.shipments || [ssData];

            for (const shipment of shipments) {
                const orderNumber = shipment.orderNumber;
                if (!orderNumber) continue;

                // Determine the correct status based on ShipStation's shipment status
                const ssStatus = (shipment.shipmentStatus || shipment.statusCode || "").toLowerCase();
                let newStatus: "SHIPPED" | "IN_TRANSIT" | "DELIVERED" = "SHIPPED";
                let note = "";

                if (ssStatus === "delivered" || ssStatus === "dl") {
                    newStatus = "DELIVERED";
                    note = `Delivered — ${shipment.carrierCode || "carrier"} confirmed delivery`;
                } else if (
                    ssStatus === "in_transit" ||
                    ssStatus === "it" ||
                    ssStatus === "transit" ||
                    ssStatus === "accepted"
                ) {
                    newStatus = "IN_TRANSIT";
                    note = `In transit via ${shipment.carrierCode || "carrier"} — tracking: ${shipment.trackingNumber || "N/A"}`;
                } else {
                    note = `Shipped via ${shipment.carrierCode || "carrier"} — tracking: ${shipment.trackingNumber || "N/A"}`;
                }

                // Build update data
                const updateData: Record<string, unknown> = {
                    trackingNumber: shipment.trackingNumber || undefined,
                    carrier: shipment.carrierCode || undefined,
                    status: newStatus,
                };

                if (newStatus === "SHIPPED" || newStatus === "IN_TRANSIT") {
                    updateData.shippedAt = shipment.shipDate ? new Date(shipment.shipDate) : new Date();
                }
                if (newStatus === "DELIVERED") {
                    updateData.deliveredAt = new Date();
                }

                await prisma.order.updateMany({
                    where: { orderNumber },
                    data: updateData,
                });

                // Record status change in history
                const order = await prisma.order.findUnique({
                    where: { orderNumber },
                    select: {
                        id: true,
                        status: true,
                        user: { select: { name: true, email: true } },
                    },
                });

                if (order) {
                    await prisma.orderStatusHistory.create({
                        data: {
                            orderId: order.id,
                            status: newStatus,
                            note,
                            changedBy: "shipstation_webhook",
                        },
                    });

                    // Send shipping notification email on first SHIPPED event
                    if (newStatus === "SHIPPED" && shipment.trackingNumber && order.user?.email) {
                        try {
                            await sendShippingNotification(order.user.email, {
                                orderNumber,
                                customerName: order.user.name || "Customer",
                                tracking: shipment.trackingNumber,
                                carrier: shipment.carrierCode || "Canada Post",
                            });
                            log.shipstation.info("Shipping email sent", { orderNumber });
                        } catch (emailErr) {
                            log.shipstation.error("Shipping email failed", { orderNumber, error: emailErr instanceof Error ? emailErr.message : "Unknown" });
                        }
                    }
                }

                log.shipstation.info("Order status updated", { orderNumber, status: newStatus });
            }
        }

        if (resource_type === "ORDER_NOTIFY") {
            const orders = ssData.orders || [ssData];

            for (const ssOrder of orders) {
                if (ssOrder.orderNumber) {
                    await prisma.order.updateMany({
                        where: { orderNumber: ssOrder.orderNumber },
                        data: {
                            shipstationId: String(ssOrder.orderId),
                        },
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            type: resource_type,
            processed: true,
        });
    } catch (error) {
        log.shipstation.error("Processing error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
