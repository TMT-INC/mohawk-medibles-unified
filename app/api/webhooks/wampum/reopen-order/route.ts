/**
 * Wampum → Mohawk Medibles sync action: customer's e-transfer arrived after
 * the order auto-cancelled on payment timeout. Wampum's matcher detected the
 * cancelled-but-otherwise-valid case and asks us to flip the order back to
 * ON_HOLD so the deposit flow can complete.
 *
 * Re-decrements the inventory that transfer-expired restocked. If stock has
 * since sold out, the order still reopens (money is already in flight) and a
 * note flags the shortfall for ops.
 *
 * Safety: only acts on CANCELLED orders. Live orders return
 * already_processed=true; anything else returns 409.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateWampumRequest, findWampumOrder } from "@/lib/wampum";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIVE_STATUSES = [
    "ON_HOLD",
    "PENDING",
    "PAYMENT_CONFIRMED",
    "PROCESSING",
    "LABEL_PRINTED",
    "SHIPPED",
    "IN_TRANSIT",
    "DELIVERED",
    "COMPLETED",
] as const;

interface ReopenPayload {
    order_number?: string;
    wc_order_id?: string | number | null;
    sender_name?: string;
    amount?: string;
    reason?: string;
}

export async function POST(req: NextRequest) {
    const auth = await authenticateWampumRequest(req, process.env.WAMPUM_HMAC_SECRET);
    if (!auth.ok) return auth.response;

    const p = auth.payload as ReopenPayload;

    if (!p.order_number && p.wc_order_id == null) {
        return NextResponse.json({ ok: false, error: "no_order_number" }, { status: 400 });
    }

    const order = await findWampumOrder(p.order_number, p.wc_order_id);
    if (!order) {
        return NextResponse.json({ ok: false, error: "order_not_found" }, { status: 404 });
    }

    // Already live or finished — nothing to do, don't clobber.
    if ((LIVE_STATUSES as readonly string[]).includes(order.status)) {
        return NextResponse.json({
            ok: true,
            already_processed: true,
            current_status: order.status,
            wc_order_id: order.id,
        });
    }

    if (order.status !== "CANCELLED") {
        return NextResponse.json(
            { ok: false, error: "unexpected_status", current_status: order.status },
            { status: 409 }
        );
    }

    const noteLine = `Reopened by Wampum — e-transfer received from ${p.sender_name ?? "customer"} for C$${p.amount ?? "?"} after cancellation. Reason: ${p.reason ?? "incoming e-transfer"}`;

    await prisma.$transaction(async (tx) => {
        // Atomic claim — only the first delivery reopens and re-decrements.
        const claim = await tx.order.updateMany({
            where: { id: order.id, status: "CANCELLED" },
            data: { status: "ON_HOLD" },
        });
        if (claim.count === 0) return;

        const shortfalls: string[] = [];

        // Re-take the stock that the auto-cancel restocked.
        const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
        for (const item of items) {
            const inv = await tx.inventory.findUnique({ where: { productId: item.productId } });
            if (!inv) continue;
            if (inv.quantity < item.quantity && !inv.backorder) {
                shortfalls.push(`${item.name} (need ${item.quantity}, have ${inv.quantity})`);
            }
            await tx.inventory.update({
                where: { productId: item.productId },
                data: { quantity: { decrement: item.quantity } },
            });
            await tx.inventoryLog.create({
                data: {
                    productId: item.productId,
                    previousQuantity: inv.quantity,
                    newQuantity: inv.quantity - item.quantity,
                    changeAmount: -item.quantity,
                    reason: "order_reopened",
                    notes: `Order ${order.orderNumber} reopened by Wampum`,
                },
            });
            if (inv.quantity - item.quantity <= 0 && !inv.backorder) {
                await tx.product.updateMany({
                    where: { id: item.productId },
                    data: { status: "OUT_OF_STOCK" },
                });
            }
        }

        const stamp = new Date().toISOString();
        const lines = [`[${stamp}] ${noteLine}`];
        if (shortfalls.length) {
            lines.push(`[${stamp}] ⚠️ Stock shortfall on reopen: ${shortfalls.join("; ")} — verify before fulfilling.`);
        }
        const newNotes = [order.notes, ...lines].filter(Boolean).join("\n");
        await tx.order.update({ where: { id: order.id }, data: { notes: newNotes } });

        await tx.orderStatusHistory.create({
            data: {
                orderId: order.id,
                status: "ON_HOLD",
                note: noteLine,
                changedBy: "wampum",
            },
        });
    });

    return NextResponse.json({
        ok: true,
        wc_order_id: order.id,
        new_status: "ON_HOLD",
    });
}
