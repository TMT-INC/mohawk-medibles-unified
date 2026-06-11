/**
 * Wampum → Mohawk Medibles postback: no valid e-transfer arrived for the
 * order within the configured window (default 72h). Auto-cancel the order
 * and restock its line items so inventory isn't leaked (checkout decrements
 * stock at order creation).
 *
 * Idempotent — already-cancelled / already-confirmed orders return 200
 * without mutation; the atomic status claim prevents double-restock.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { authenticateWampumRequest, findWampumOrder } from "@/lib/wampum";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ExpiredPayload {
    order_number?: string;
    wc_order_id?: string | number | null;
    amount?: string;
    max_age_hours?: number;
    original_quarantine_reason?: string;
}

export async function POST(req: NextRequest) {
    const auth = await authenticateWampumRequest(req, process.env.WAMPUM_HMAC_SECRET);
    if (!auth.ok) return auth.response;

    const p = auth.payload as ExpiredPayload;

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

    // A late/erroneous expiry event must not cancel an order whose payment
    // already landed.
    if (order.paymentStatus !== "PENDING" && order.paymentStatus !== "FAILED") {
        return NextResponse.json(
            {
                ok: false,
                error: "payment_already_received",
                payment_status: order.paymentStatus,
            },
            { status: 409 }
        );
    }

    const noteLine = `Auto-cancelled: no valid e-transfer received within ${p.max_age_hours ?? 72}h (Wampum quarantine reason: ${p.original_quarantine_reason ?? "expired"}).`;

    const cancelled = await prisma.$transaction(async (tx) => {
        // Atomic claim — only the first delivery cancels and restocks.
        const claim = await tx.order.updateMany({
            where: { id: order.id, status: { in: ["ON_HOLD", "PENDING"] } },
            data: { status: "CANCELLED" },
        });
        if (claim.count === 0) return false;

        const stamp = new Date().toISOString();
        const newNotes = [order.notes, `[${stamp}] ${noteLine}`].filter(Boolean).join("\n");
        await tx.order.update({ where: { id: order.id }, data: { notes: newNotes } });

        await tx.orderStatusHistory.create({
            data: {
                orderId: order.id,
                status: "CANCELLED",
                note: noteLine,
                changedBy: "wampum",
            },
        });

        // Restock — inverse of the checkout decrement.
        const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
        for (const item of items) {
            const inv = await tx.inventory.findUnique({ where: { productId: item.productId } });
            if (!inv) continue;
            await tx.inventory.update({
                where: { productId: item.productId },
                data: { quantity: { increment: item.quantity } },
            });
            await tx.inventoryLog.create({
                data: {
                    productId: item.productId,
                    previousQuantity: inv.quantity,
                    newQuantity: inv.quantity + item.quantity,
                    changeAmount: item.quantity,
                    reason: "order_cancelled",
                    notes: `Order ${order.orderNumber} auto-cancelled (e-transfer expired)`,
                },
            });
            // Bring the product back if the decrement had zeroed it out.
            if (inv.quantity <= 0 && inv.quantity + item.quantity > 0) {
                await tx.product.updateMany({
                    where: { id: item.productId, status: "OUT_OF_STOCK" },
                    data: { status: "ACTIVE" },
                });
            }
        }
        return true;
    });

    if (!cancelled) {
        return NextResponse.json({
            ok: true,
            already_processed: true,
            current_status: "CANCELLED",
        });
    }

    log.checkout.warn("Order auto-cancelled by Wampum transfer-expired", {
        orderId: order.id,
        orderNumber: order.orderNumber,
    });

    return NextResponse.json({ ok: true, wc_order_id: order.id, new_status: "CANCELLED" });
}
