import { Prisma } from "@prisma/client";

/**
 * Atomically cancel an unpaid order and restore the inventory it was holding.
 * Mirrors the e-Transfer transfer-expired restock (atomic status claim → only the
 * first delivery cancels + restocks, so concurrent webhook re-deliveries can't
 * double-restock). Writes an InventoryLog per item and only re-activates an
 * OUT_OF_STOCK product when the restock actually brings its count positive.
 *
 * Returns true if THIS call claimed the cancel; false if another delivery already did.
 * Call inside a prisma.$transaction.
 */
export async function cancelOrderAndRestock(
  tx: Prisma.TransactionClient,
  opts: {
    orderId: string;
    fromStatuses: string[]; // statuses eligible to be cancelled (e.g. ["PENDING"])
    note: string;           // OrderStatusHistory note
    changedBy: string;      // "btcpay" | "system" | ...
    logNote: string;        // InventoryLog note
  }
): Promise<boolean> {
  const claim = await tx.order.updateMany({
    where: { id: opts.orderId, status: { in: opts.fromStatuses as never[] }, paymentStatus: "PENDING" },
    data: { status: "CANCELLED", paymentStatus: "FAILED" },
  });
  if (claim.count === 0) return false;

  await tx.orderStatusHistory.create({
    data: { orderId: opts.orderId, status: "CANCELLED", note: opts.note, changedBy: opts.changedBy },
  });

  const items = await tx.orderItem.findMany({ where: { orderId: opts.orderId } });
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
        notes: opts.logNote,
      },
    });
    if (inv.quantity <= 0 && inv.quantity + item.quantity > 0) {
      await tx.product.updateMany({
        where: { id: item.productId, status: "OUT_OF_STOCK" },
        data: { status: "ACTIVE" },
      });
    }
  }
  return true;
}
