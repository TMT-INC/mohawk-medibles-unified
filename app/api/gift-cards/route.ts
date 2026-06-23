/**
 * Gift Cards API — Purchase and redeem gift cards
 * Ported from Ian's .cc gift card system
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/trpc/trpc";
import { randomBytes } from "crypto";
import { verifyCsrf } from "@/lib/csrf";
import { getSessionUser } from "@/lib/session";
import { log } from "@/lib/logger";

// Gift cards are disabled until they are wired into the paid-checkout flow
// (a card must be funded by a real payment before it can be spent). Set
// GIFT_CARDS_ENABLED=true only once that fast-follow ships.
const GIFT_CARDS_ENABLED = process.env.GIFT_CARDS_ENABLED === "true";

// GET — List gift cards for the authenticated user (identity from the session, not headers)
export async function GET(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const cards = await prisma.giftCard.findMany({
    where: { purchasedByUserId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { transactions: true },
  });

  return NextResponse.json({ cards });
}

// POST — Purchase a new gift card.
// Requires an authenticated session and is gated off until gift cards are funded
// through paid checkout. Cards are minted UNFUNDED (currentBalance 0, status
// "pending") and must be activated by a payment before they can be spent.
export async function POST(req: NextRequest) {
  // CSRF protection
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  if (!GIFT_CARDS_ENABLED) {
    return NextResponse.json(
      { error: "Gift card purchases are temporarily unavailable." },
      { status: 503 }
    );
  }

  // Identity from the verified session — never from a client-supplied header.
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      amount,
      recipientEmail,
      recipientName,
      senderName,
      personalMessage,
      design,
    } = body;

    if (!amount || typeof amount !== "number" || amount < 10 || amount > 500) {
      return NextResponse.json(
        { error: "Amount must be between $10 and $500" },
        { status: 400 }
      );
    }

    // Generate unique gift card code (64-bit)
    const code = `MM-${randomBytes(4).toString("hex").toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`;

    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        initialBalance: amount,
        currentBalance: 0, // unfunded until paid for
        purchasedByUserId: session.userId,
        recipientEmail,
        recipientName,
        senderName,
        personalMessage,
        design: design || "classic",
        status: "pending", // not spendable until a payment activates it
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    // NOTE: no live code is emailed and no "purchase" ledger row is written until
    // the card is funded by a completed payment (fast-follow checkout integration).
    return NextResponse.json({ giftCard }, { status: 201 });
  } catch (error) {
    log.checkout.error("Gift card creation failed", { error: error instanceof Error ? error.message : "Unknown" });
    return NextResponse.json({ error: "Failed to create gift card" }, { status: 500 });
  }
}
