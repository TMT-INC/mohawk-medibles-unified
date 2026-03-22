/**
 * Gift Card Redemption API — Apply gift card to order
 */
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { prisma } from "@/server/trpc/trpc";
import { verifyCsrf } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  // CSRF protection
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();
    const { code, amount, orderId } = body;

    if (!code || !amount || amount <= 0) {
      return NextResponse.json({ error: "Code and amount required" }, { status: 400 });
    }

    const giftCard = await prisma.giftCard.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!giftCard) {
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

    if (giftCard.currentBalance < amount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: $${giftCard.currentBalance.toFixed(2)}` },
        { status: 400 }
      );
    }

    const newBalance = giftCard.currentBalance - amount;

    // Update balance and record transaction
    await prisma.$transaction([
      prisma.giftCard.update({
        where: { id: giftCard.id },
        data: {
          currentBalance: newBalance,
          status: newBalance === 0 ? "used" : "active",
        },
      }),
      prisma.giftCardTransaction.create({
        data: {
          giftCardId: giftCard.id,
          orderId,
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
