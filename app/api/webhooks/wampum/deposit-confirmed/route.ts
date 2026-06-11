/**
 * Wampum → Mohawk Medibles postback: deposit confirmed by Blacfin.
 * Flips the order ON_HOLD → PAYMENT_CONFIRMED with paymentStatus PAID and
 * records the Interac reference. Idempotent — already-confirmed orders
 * return 200 with already_processed.
 *
 * NOTE: this event's payload is NESTED under `transaction` — unlike the
 * other Wampum postbacks, which are flat.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { sendEmail } from "@/lib/email";
import {
    authenticateWampumRequest,
    findWampumOrder,
    parseBilling,
} from "@/lib/wampum";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "info@mohawkmedibles.ca";

interface DepositPayload {
    transaction?: {
        order_number?: string;
        wc_order_id?: string | number | null;
        reference?: string;
        amount?: string;
        currency?: string;
        sender_name?: string;
        source_bank?: string;
        received_at_inbox?: string;
        blacfin_operator_confirmed?: string;
        wc_customer_email?: string;
        wc_customer_full_name?: string;
    };
}

export async function POST(req: NextRequest) {
    const auth = await authenticateWampumRequest(req, process.env.WAMPUM_HMAC_SECRET);
    if (!auth.ok) return auth.response;

    const payload = auth.payload as DepositPayload;
    const t = payload.transaction ?? {};

    if (!t.order_number && t.wc_order_id == null) {
        return NextResponse.json({ ok: false, error: "no_order_number" }, { status: 400 });
    }

    const order = await findWampumOrder(t.order_number, t.wc_order_id);
    if (!order) {
        return NextResponse.json({ ok: false, error: "order_not_found" }, { status: 404 });
    }

    // A confirmed deposit against a CANCELLED order means the customer's money
    // arrived after we gave up on the order — never swallow that silently.
    if (order.status === "CANCELLED") {
        try {
            await sendEmail({
                to: ADMIN_NOTIFY_EMAIL,
                subject: `🚨 e-Transfer deposited on CANCELLED order ${order.orderNumber}`,
                html: [
                    `<p>Wampum confirmed a deposit but the order is cancelled.</p>`,
                    `<p>Amount: C$${t.amount ?? order.total}<br/>`,
                    `Sender: ${t.sender_name ?? "?"}<br/>`,
                    `Interac ref: ${t.reference ?? "?"}</p>`,
                    `<p>Manual action required: refund or reinstate (Wampum should have called reopen-order first).</p>`,
                ].join("\n"),
            });
        } catch (err) {
            log.checkout.error("Wampum deposit-confirmed: cancelled-order alert failed", {
                orderId: order.id,
                error: err instanceof Error ? err.message : "Unknown",
            });
        }
        return NextResponse.json(
            { ok: false, error: "order_cancelled", wc_order_id: order.id },
            { status: 409 }
        );
    }

    // Idempotent: e-transfer orders sit at ON_HOLD until the deposit lands.
    // Anything past that means a redelivery — acknowledge without mutating.
    if (order.status !== "ON_HOLD" && order.status !== "PENDING") {
        return NextResponse.json({
            ok: true,
            already_processed: true,
            wc_order_id: order.id,
            current_status: order.status,
        });
    }

    // Atomic claim — only the first delivery flips to PAYMENT_CONFIRMED.
    // Concurrent redeliveries find 0 affected rows and skip the side effects
    // (no duplicate email).
    const claim = await prisma.order.updateMany({
        where: { id: order.id, status: { in: ["ON_HOLD", "PENDING"] } },
        data: {
            status: "PAYMENT_CONFIRMED",
            paymentStatus: "PAID",
            paymentReference: t.reference ?? null,
        },
    });
    if (claim.count === 0) {
        return NextResponse.json({
            ok: true,
            already_processed: true,
            wc_order_id: order.id,
            current_status: "PAYMENT_CONFIRMED",
        });
    }

    await prisma.orderStatusHistory.create({
        data: {
            orderId: order.id,
            status: "PAYMENT_CONFIRMED",
            note: `e-Transfer deposit confirmed via Wampum. Amount: C$${t.amount ?? order.total}; sender: ${t.sender_name ?? "?"}; Interac ref: ${t.reference ?? "?"}; confirmed by: ${t.blacfin_operator_confirmed ?? "?"}`,
            changedBy: "wampum",
        },
    });

    const billing = parseBilling(order);
    const customerEmail = t.wc_customer_email || billing.email;

    // Best-effort: tell the customer their payment landed. Never blocks the postback.
    if (customerEmail) {
        try {
            await sendEmail({
                to: customerEmail,
                subject: `Payment received — Order ${order.orderNumber} | Mohawk Medibles`,
                html: [
                    `<h2 style="color:#2D5016;">Payment Received ✅</h2>`,
                    `<p>Hi ${billing.name || "there"},</p>`,
                    `<p>Your Interac e-Transfer of <strong>$${Number(order.total).toFixed(2)} CAD</strong> for order <strong>${order.orderNumber}</strong> has been received and confirmed.</p>`,
                    `<p>Your order is now being prepared for shipment. We'll email you tracking info as soon as it ships.</p>`,
                    `<p>Track anytime: <a href="https://mohawkmedibles.ca/track-order">mohawkmedibles.ca/track-order</a></p>`,
                ].join("\n"),
            });
        } catch (err) {
            log.checkout.error("Wampum deposit-confirmed: customer email failed", {
                orderId: order.id,
                error: err instanceof Error ? err.message : "Unknown",
            });
        }
    }

    // Best-effort: notify ops.
    try {
        await sendEmail({
            to: ADMIN_NOTIFY_EMAIL,
            subject: `✉️ e-Transfer Deposited — Order ${order.orderNumber}`,
            html: [
                `<p>Amount: C$${t.amount ?? order.total}<br/>`,
                `Sender: ${t.sender_name ?? "?"}<br/>`,
                `Bank: ${t.source_bank ?? "?"}<br/>`,
                `Interac ref: ${t.reference ?? "?"}<br/>`,
                `Confirmed by: ${t.blacfin_operator_confirmed ?? "?"}</p>`,
            ].join("\n"),
        });
    } catch (err) {
        log.checkout.error("Wampum deposit-confirmed: owner notification failed", {
            orderId: order.id,
            error: err instanceof Error ? err.message : "Unknown",
        });
    }

    return NextResponse.json({ ok: true, wc_order_id: order.id });
}
