/**
 * Gift Card Redemption API — Apply gift card to order
 */
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { prisma } from "@/server/trpc/trpc";
import { verifyCsrf } from "@/lib/csrf";
import { getSessionUser } from "@/lib/session";

const GIFT_CARDS_ENABLED = process.env.GIFT_CARDS_ENABLED === "true";

export async function POST(req: NextRequest) {
  // CSRF protection
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  if (!GIFT_CARDS_ENABLED) {
    return NextResponse.json({ error: "Gift cards are temporarily unavailable." }, { status: 503 });
  }

  // Identity from the verified session — never trust the caller for who they are.
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { code, amount, orderId } = body;

    if (!code || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Code and amount required" }, { status: 400 });
    }

    const giftCard = await prisma.giftCard.findUnique({
      where: { code: String(code).toUpperCase().trim() },
    });

    // Ownership: only the purchaser or the named recipient may redeem a card.
    // Same 404 for "no such card" and "not yours" to avoid a code-probing oracle.
    const ownsCard =
      !!giftCard &&
      (giftCard.purchasedByUserId === session.userId ||
        (!!giftCard.recipientEmail &&
          giftCard.recipientEmail.toLowerCase() === session.email.toLowerCase()));
    if (!giftCard || !ownsCard) {
      return NextResponse.json({ error: "Invalid gift card code" }, { status: 404 });
    }

    if (giftCard.status !== "active") {
      return NextResponse.json({ error: `Gift card is ${giftCard.status}` }, { status: 400 });
    }

    if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
      await prisma.giftCard.update({
        where: { id: giftCard.id },
        data: { status: "expired" },
      });
      return NextResponse.json({ error: "Gift card has expired" }, { status: 400 });
    }

    // If an order is supplied it must be a real order owned by the caller.
    if (orderId) {
      const ownedOrder = await prisma.order.findFirst({
        where: { id: String(orderId), userId: session.userId },
        select: { id: true },
      });
      if (!ownedOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
    }

    // Atomic debit — the conditional updateMany prevents the read-then-write race
    // (concurrent redeems) and over-redeeming past the available balance.
    const claim = await prisma.giftCard.updateMany({
      where: { id: giftCard.id, status: "active", currentBalance: { gte: amount } },
      data: { currentBalance: { decrement: amount } },
    });
    if (claim.count !== 1) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: $${giftCard.currentBalance.toFixed(2)}` },
        { status: 409 }
      );
    }

    const updated = await prisma.giftCard.findUnique({ where: { id: giftCard.id } });
    const newBalance = updated?.currentBalance ?? 0;

    await prisma.$transaction([
      prisma.giftCard.update({
        where: { id: giftCard.id },
        data: { status: newBalance === 0 ? "used" : "active" },
      }),
      prisma.giftCardTransaction.create({
        data: {
          giftCardId: giftCard.id,
          orderId: orderId ? String(orderId) : null,
          amount: -amount,
          balanceAfter: newBalance,
          type: "redemption",
          description: orderId ? `Applied to order ${orderId}` : "Redeemed",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      amountApplied: amount,
      remainingBalance: newBalance,
    });
  } catch (error) {
    log.checkout.error("Gift card redeem error", { error: error instanceof Error ? error.message : "Unknown" });
    return NextResponse.json({ error: "Redemption failed" }, { status: 500 });
  }
}
