/**
 * BTCPay Server webhook receiver — crypto payment lifecycle.
 *
 * Events: InvoiceProcessing (payment seen, awaiting confirmations),
 * InvoiceSettled (payment final → PAYMENT_CONFIRMED + PAID),
 * InvoiceExpired / InvoiceInvalid (paymentStatus FAILED).
 *
 * The BTCPay store is shared with the legacy WordPress site during the
 * transition, so events for invoices we didn't create (WP plugin's) are
 * acknowledged with 200 + ignored — a 4xx would just make BTCPay retry.
 */
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { sendEmail } from "@/lib/email";
import { verifyBTCPayWebhook } from "@/lib/btcpay";
import { parseBilling } from "@/lib/wampum";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "info@mohawkmedibles.ca";

interface BTCPayEvent {
    type?: string;
    invoiceId?: string;
    metadata?: { orderId?: string; orderNumber?: string };
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("btcpay-sig");
    if (!verifyBTCPayWebhook(body, sig)) {
        return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
    }

    let event: BTCPayEvent;
    try {
        event = JSON.parse(body);
    } catch {
        return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const type = event.type ?? "";
    if (!["InvoiceSettled", "InvoiceProcessing", "InvoiceExpired", "InvoiceInvalid"].includes(type)) {
        return NextResponse.json({ ok: true, ignored: type || "no_type" });
    }

    // Our invoices carry our order cuid in metadata.orderId and the invoice
    // id is stored as paymentReference at creation. WP-plugin invoices match
    // neither — acknowledge and skip.
    const order =
        (event.invoiceId
            ? await prisma.order.findFirst({ where: { paymentReference: event.invoiceId } })
            : null) ??
        (event.metadata?.orderId
            ? await prisma.order.findUnique({ where: { id: event.metadata.orderId } }).catch(() => null)
            : null);

    if (!order) {
        log.checkout.info("BTCPay event for unknown order (likely WP-era invoice) — ignored", {
            type,
            invoiceId: event.invoiceId,
        });
        return NextResponse.json({ ok: true, ignored: "order_not_found" });
    }

    if (type === "InvoiceProcessing") {
        if (order.status === "PENDING") {
            await prisma.orderStatusHistory.create({
                data: {
                    orderId: order.id,
                    status: order.status,
                    note: `Crypto payment detected (BTCPay invoice ${event.invoiceId}) — awaiting confirmations`,
                    changedBy: "btcpay",
                },
            });
        }
        return NextResponse.json({ ok: true });
    }

    if (type === "InvoiceExpired" || type === "InvoiceInvalid") {
        if (order.status === "PENDING" && order.paymentStatus === "PENDING") {
            // Unpaid crypto invoice is dead → cancel the order AND restore the
            // inventory it was holding (mirrors the e-Transfer transfer-expired
            // path; otherwise abandoned crypto orders strand stock forever).
            await prisma.$transaction(async (tx) => {
                const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
                for (const it of items) {
                    await tx.inventory.updateMany({
                        where: { productId: it.productId },
                        data: { quantity: { increment: it.quantity } },
                    });
                    await tx.product.updateMany({
                        where: { id: it.productId, status: "OUT_OF_STOCK" },
                        data: { status: "ACTIVE" },
                    });
                }
                await tx.order.update({
                    where: { id: order.id },
                    data: { status: "CANCELLED", paymentStatus: "FAILED" },
                });
                await tx.orderStatusHistory.create({
                    data: {
                        orderId: order.id,
                        status: "CANCELLED",
                        note: `Crypto payment ${type === "InvoiceExpired" ? "expired unpaid" : "marked invalid"} (BTCPay invoice ${event.invoiceId}); inventory restored.`,
                        changedBy: "btcpay",
                    },
                });
            });
        }
        if (type === "InvoiceInvalid") {
            after(() =>
                sendEmail({
                    to: ADMIN_NOTIFY_EMAIL,
                    subject: `⚠️ BTCPay invoice INVALID — Order ${order.orderNumber}`,
                    html: `<p>BTCPay marked invoice ${event.invoiceId} invalid for order ${order.orderNumber} ($${Number(order.total).toFixed(2)}). Possible double-spend or manual marking — review in BTCPay.</p>`,
                }).catch(() => {})
            );
        }
        return NextResponse.json({ ok: true });
    }

    // InvoiceSettled — payment is final.
    if (order.status === "CANCELLED") {
        after(() =>
            sendEmail({
                to: ADMIN_NOTIFY_EMAIL,
                subject: `🚨 Crypto payment settled on CANCELLED order ${order.orderNumber}`,
                html: `<p>BTCPay invoice ${event.invoiceId} settled but the order is cancelled. Manual action required: refund or reinstate.</p>`,
            }).catch(() => {})
        );
        return NextResponse.json({ ok: false, error: "order_cancelled" }, { status: 409 });
    }

    // Atomic claim — redeliveries find 0 rows and skip side effects.
    const claim = await prisma.order.updateMany({
        where: { id: order.id, status: { in: ["PENDING", "ON_HOLD"] } },
        data: {
            status: "PAYMENT_CONFIRMED",
            paymentStatus: "PAID",
            paymentReference: event.invoiceId ?? order.paymentReference,
        },
    });
    if (claim.count === 0) {
        return NextResponse.json({ ok: true, already_processed: true, current_status: order.status });
    }

    await prisma.orderStatusHistory.create({
        data: {
            orderId: order.id,
            status: "PAYMENT_CONFIRMED",
            note: `Crypto payment settled (BTCPay invoice ${event.invoiceId})`,
            changedBy: "btcpay",
        },
    });

    const billing = parseBilling(order);
    // Fire the confirmation + ops emails AFTER the response so they survive the
    // Vercel lambda freeze (un-awaited fetches are dropped when the function
    // freezes right after returning). The order is already persisted PAID above.
    if (billing.email) {
        after(() =>
            sendEmail({
                to: billing.email!,
                subject: `Payment received — Order ${order.orderNumber} | Mohawk Medibles`,
                html: [
                    `<h2 style="color:#2D5016;">Payment Received ✅</h2>`,
                    `<p>Hi ${billing.name || "there"},</p>`,
                    `<p>Your crypto payment of <strong>$${Number(order.total).toFixed(2)} CAD</strong> for order <strong>${order.orderNumber}</strong> has been confirmed.</p>`,
                    `<p>Your order is now being prepared for shipment. We'll email you tracking info as soon as it ships.</p>`,
                ].join("\n"),
            }).catch((err) =>
                log.checkout.error("BTCPay settled: customer email failed", {
                    orderId: order.id,
                    error: err instanceof Error ? err.message : "Unknown",
                })
            )
        );
    }

    after(() =>
        sendEmail({
            to: ADMIN_NOTIFY_EMAIL,
            subject: `₿ Crypto Payment Settled — Order ${order.orderNumber}`,
            html: `<p>Order ${order.orderNumber} — $${Number(order.total).toFixed(2)} CAD settled via BTCPay (invoice ${event.invoiceId}).</p>`,
        }).catch(() => {})
    );

    return NextResponse.json({ ok: true, order_id: order.id });
}
