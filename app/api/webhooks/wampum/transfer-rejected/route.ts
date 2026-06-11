/**
 * Wampum → Mohawk Medibles postback: incoming transfer rejected (typically a
 * forbidden brand keyword in the contact-name field, e.g. customer typed
 * "Mohawk Medibles" in their banking app). Wampum supplies the customer-facing
 * rejection message in `message`; we email it to the customer and append it
 * to the order's notes for ops history.
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

interface RejectedPayload {
    order_number?: string;
    wc_order_id?: string | number | null;
    message?: string;
    contact_name_received?: string;
    amount?: string;
    reason?: string;
    customer_email?: string;
}

export async function POST(req: NextRequest) {
    const auth = await authenticateWampumRequest(req, process.env.WAMPUM_HMAC_SECRET);
    if (!auth.ok) return auth.response;

    const p = auth.payload as RejectedPayload;
    const message = p.message ?? "Your e-transfer was rejected — please contact support.";

    if (!p.order_number && p.wc_order_id == null) {
        return NextResponse.json({ ok: false, error: "no_order_number" }, { status: 400 });
    }

    const order = await findWampumOrder(p.order_number, p.wc_order_id);
    if (!order) {
        return NextResponse.json({ ok: false, error: "order_not_found" }, { status: 404 });
    }

    // Idempotency: a redelivered rejection for the same reason/amount must not
    // re-append the note or re-email the customer. The note line (sans
    // timestamp) doubles as the dedup marker.
    const dedupeKey = `Wampum rejected e-transfer — ${p.reason ?? "unknown"}; contact name: ${p.contact_name_received ?? "?"}; amount: C$${p.amount ?? "?"}`;
    if (order.notes?.includes(dedupeKey)) {
        return NextResponse.json({ ok: true, already_processed: true, wc_order_id: order.id });
    }

    const stamp = new Date().toISOString();
    const newNotes = [order.notes, `[${stamp}] ${dedupeKey}`].filter(Boolean).join("\n");
    await prisma.order.update({ where: { id: order.id }, data: { notes: newNotes } });

    // Best-effort: email the customer the rejection instructions.
    try {
        const billing = parseBilling(order);
        const recipient = p.customer_email || billing.email;
        if (recipient && message) {
            // Escape HTML before applying the limited markdown the message may
            // carry — the field is signed but should not be able to inject markup.
            const escaped = message
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
            await sendEmail({
                to: recipient,
                subject: `Action needed: payment for order ${order.orderNumber}`,
                html: escaped
                    .replace(/\n/g, "<br/>")
                    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
            });
        }
    } catch (err) {
        log.checkout.error("Wampum transfer-rejected: email failed", {
            orderId: order.id,
            error: err instanceof Error ? err.message : "Unknown",
        });
    }

    return NextResponse.json({ ok: true, wc_order_id: order.id });
}
