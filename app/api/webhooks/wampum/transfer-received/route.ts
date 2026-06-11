/**
 * Wampum → Mohawk Medibles postback: transfer was received and forwarded to
 * Blacfin for deposit. The order stays ON_HOLD until Blacfin confirms the
 * deposit (deposit-confirmed event), but we record the receipt in the notes
 * so ops doesn't re-prompt the customer to pay, and so transfer-expired can
 * tell "money in hand" apart from "never paid".
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateWampumRequest, findWampumOrder } from "@/lib/wampum";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ReceivedPayload {
    order_number?: string;
    wc_order_id?: string | number | null;
    amount?: string;
    currency?: string;
}

export async function POST(req: NextRequest) {
    const auth = await authenticateWampumRequest(req, process.env.WAMPUM_HMAC_SECRET);
    if (!auth.ok) return auth.response;

    const p = auth.payload as ReceivedPayload;

    if (!p.order_number && p.wc_order_id == null) {
        return NextResponse.json({ ok: false, error: "no_order_number" }, { status: 400 });
    }

    const order = await findWampumOrder(p.order_number, p.wc_order_id);
    if (!order) {
        return NextResponse.json({ ok: false, error: "order_not_found" }, { status: 404 });
    }

    if (order.status !== "ON_HOLD" && order.status !== "PENDING") {
        return NextResponse.json({
            ok: true,
            already_processed: true,
            current_status: order.status,
        });
    }

    // Idempotency via dedup marker in notes — redeliveries don't re-append.
    const dedupeKey = `Wampum: e-transfer received (C$${p.amount ?? "?"}), forwarded for deposit — awaiting confirmation`;
    if (order.notes?.includes(dedupeKey)) {
        return NextResponse.json({ ok: true, already_processed: true, wc_order_id: order.id });
    }

    const stamp = new Date().toISOString();
    const newNotes = [order.notes, `[${stamp}] ${dedupeKey}`].filter(Boolean).join("\n");
    await prisma.order.update({ where: { id: order.id }, data: { notes: newNotes } });

    await prisma.orderStatusHistory.create({
        data: {
            orderId: order.id,
            status: order.status,
            note: dedupeKey,
            changedBy: "wampum",
        },
    });

    return NextResponse.json({ ok: true, wc_order_id: order.id });
}
