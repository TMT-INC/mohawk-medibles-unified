/**
 * Digipay Postback Handler
 * Receives payment confirmation from Digipay after customer pays.
 * Updates order status in Neon DB and triggers order confirmation email.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import {
    parseDigipayPostback,
    parseDigipayAmount,
    isDigipayIp,
    isTestSession,
    digipayXmlResponse,
} from "@/lib/digipay";

export async function POST(req: NextRequest) {
    // Set XML content type for response
    const xmlHeaders = { "Content-Type": "application/xml; charset=utf-8" };

    try {
        // ── IP Whitelist ────────────────────────────────────
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        if (!isDigipayIp(ip)) {
            log.webhook.warn("Rejected — unauthorized IP", { ip });
            return new NextResponse(
                digipayXmlResponse("fail", `Request from unauthorized IP ${ip}`, 101),
                { status: 403, headers: xmlHeaders }
            );
        }

        // ── Parse body ──────────────────────────────────────
        // Digipay sends JSON as a POST form key, not as the value
        const formData = await req.text();
        const body: Record<string, string> = {};
        for (const pair of formData.split("&")) {
            const [key, value] = pair.split("=").map(decodeURIComponent);
            body[key] = value || "";
        }

        const data = parseDigipayPostback(body);
        if (!data) {
            // Try parsing the raw body as JSON directly (fallback)
            try {
                const jsonBody = JSON.parse(formData);
                if (jsonBody.session) {
                    Object.assign(body, { session: jsonBody.session, amount: jsonBody.amount });
                }
            } catch {
                // Not JSON either
            }
        }

        const session = data?.session || body.session || "";
        const rawAmount = data?.amount || body.amount || "0_00";

        // ── Test session ────────────────────────────────────
        if (isTestSession(session)) {
            log.webhook.info("Test session — returning OK");
            return new NextResponse(
                digipayXmlResponse("ok", "Test successful", 100, `TEST-${Date.now()}`),
                { headers: xmlHeaders }
            );
        }

        // ── Validate session ────────────────────────────────
        if (!session) {
            return new NextResponse(
                digipayXmlResponse("fail", "Invalid session variable: empty", 102),
                { status: 400, headers: xmlHeaders }
            );
        }

        // ── Find order ──────────────────────────────────────
        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { id: session },
                    { orderNumber: session },
                ],
            },
        });

        if (!order) {
            log.webhook.error("Order not found", { session });
            return new NextResponse(
                digipayXmlResponse("fail", `Invalid session variable: '${session}'`, 102),
                { status: 404, headers: xmlHeaders }
            );
        }

        // ── Already paid? ───────────────────────────────────
        if (order.paymentStatus === "PAID") {
            log.webhook.info("Order already paid", { orderId: order.id });
            return new NextResponse(
                digipayXmlResponse("ok", "Order already processed", 100, String(order.id)),
                { headers: xmlHeaders }
            );
        }

        // ── Mark as paid ────────────────────────────────────
        const amount = parseDigipayAmount(rawAmount);

        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: "PROCESSING",
                paymentStatus: "PAID",
            },
        });

        // Add status history entry
        await prisma.orderStatusHistory.create({
            data: {
                orderId: order.id,
                status: "PROCESSING",
                note: `Digipay payment confirmed. Amount: $${amount.toFixed(2)}`,
            },
        });

        log.webhook.info("Order marked PAID", { orderId: order.id, amount: amount.toFixed(2) });

        // ── Send order confirmation email ───────────────────
        try {
            const { sendOrderConfirmation } = await import("@/lib/email");
            const user = await prisma.user.findUnique({ where: { id: order.userId } });
            const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });

            if (user?.email) {
                await sendOrderConfirmation(user.email, {
                    orderNumber: order.orderNumber,
                    customerName: user.name || "Customer",
                    items: items.map((i) => ({
                        name: i.name,
                        qty: i.quantity,
                        price: i.price,
                    })),
                    subtotal: order.subtotal,
                    shipping: order.shippingCost,
                    tax: order.tax,
                    total: order.total,
                });
            }
        } catch (emailErr) {
            // Don't fail the postback if email fails
            log.webhook.error("Email failed", { error: emailErr instanceof Error ? emailErr.message : "Unknown" });
        }

        return new NextResponse(
            digipayXmlResponse("ok", "Purchase successfully processed", 100, String(order.id)),
            { headers: xmlHeaders }
        );
    } catch (err) {
        log.webhook.error("Postback error", { error: err instanceof Error ? err.message : "Unknown" });
        return new NextResponse(
            digipayXmlResponse("fail", "Unable to process purchase", 104),
            { status: 500, headers: xmlHeaders }
        );
    }
}
