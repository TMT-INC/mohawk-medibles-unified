/**
 * Mohawk Medibles — Fraud Detection Engine
 * Scores orders 0-100 and flags suspicious activity.
 *
 * Thresholds:
 *   0-30  → CLEAN
 *   31-60 → SUSPICIOUS (flagged for review)
 *   61+   → BLOCKED (order held, requires admin approval)
 */
import { prisma } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────

export interface FraudFlag {
  reason: string;
  points: number;
}

export interface FraudResult {
  score: number;
  flags: FraudFlag[];
  status: "CLEAN" | "SUSPICIOUS" | "BLOCKED";
}

interface FraudOrderInput {
  orderId: string;
  userId: string;
  userEmail: string;
  total: number;
  ipAddress?: string | null;
  billingData?: string | null;
  shippingData?: string | null;
  userCreatedAt?: Date;
}

// ─── Disposable Email Domains ─────────────────────────────────

const DISPOSABLE_DOMAINS = new Set([
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "tempmail.com",
  "temp-mail.org",
  "throwaway.email",
  "throwaway.com",
  "mailinator.com",
  "yopmail.com",
  "sharklasers.com",
  "guerrillamailblock.com",
  "grr.la",
  "dispostable.com",
  "maildrop.cc",
  "mailnesia.com",
  "tempail.com",
  "tempmailaddress.com",
  "trashmail.com",
  "trashmail.me",
  "trashmail.net",
  "10minutemail.com",
  "10minutemail.net",
  "fakeinbox.com",
  "mailforspam.com",
  "getairmail.com",
  "mintemail.com",
  "mytemp.email",
  "harakirimail.com",
  "mohmal.com",
  "getnada.com",
  "emailondeck.com",
  "tempinbox.com",
  "burnermail.io",
]);

// ─── Scoring Engine ───────────────────────────────────────────

export async function calculateFraudScore(
  input: FraudOrderInput
): Promise<FraudResult> {
  const flags: FraudFlag[] = [];

  // 1. First-time customer + order > $500
  const userOrderCount = await prisma.order.count({
    where: { userId: input.userId, id: { not: input.orderId } },
  });

  if (userOrderCount === 0 && input.total > 500) {
    flags.push({
      reason: "High value first order",
      points: 25,
    });
  }

  // 2. Multiple orders from same IP in 1 hour
  if (input.ipAddress) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentIpOrders = await prisma.order.count({
      where: {
        ipAddress: input.ipAddress,
        createdAt: { gte: oneHourAgo },
        id: { not: input.orderId },
      },
    });

    if (recentIpOrders >= 2) {
      flags.push({
        reason: "Rapid ordering",
        points: 20,
      });
    }
  }

  // 3. Shipping address different from billing
  if (input.billingData && input.shippingData) {
    try {
      const billing = JSON.parse(input.billingData);
      const shipping = JSON.parse(input.shippingData);

      const billingAddr = `${billing.address_1 || ""}${billing.city || ""}${billing.postcode || ""}`.toLowerCase().replace(/\s/g, "");
      const shippingAddr = `${shipping.address_1 || ""}${shipping.city || ""}${shipping.postcode || ""}`.toLowerCase().replace(/\s/g, "");

      if (billingAddr && shippingAddr && billingAddr !== shippingAddr) {
        flags.push({
          reason: "Address mismatch",
          points: 10,
        });
      }
    } catch {
      // JSON parse failed — skip this check
    }
  }

  // 4. Order total > $1000
  if (input.total > 1000) {
    flags.push({
      reason: "Very high order value",
      points: 15,
    });
  }

  // 5. Disposable email domain
  const emailDomain = input.userEmail.split("@")[1]?.toLowerCase();
  if (emailDomain && DISPOSABLE_DOMAINS.has(emailDomain)) {
    flags.push({
      reason: "Disposable email",
      points: 20,
    });
  }

  // 6. Multiple failed payment attempts (check recent failed orders from same user)
  const recentFailedOrders = await prisma.order.count({
    where: {
      userId: input.userId,
      paymentStatus: "FAILED",
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });

  if (recentFailedOrders >= 2) {
    flags.push({
      reason: "Multiple payment failures",
      points: 15,
    });
  }

  // 7. New account (< 24 hours) + order > $300
  if (input.userCreatedAt) {
    const accountAge = Date.now() - input.userCreatedAt.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (accountAge < twentyFourHours && input.total > 300) {
      flags.push({
        reason: "New account high value",
        points: 20,
      });
    }
  }

  // 8. Possible duplicate order — same customer has another recent UNPAID order
  // with the same total. The exact-cart idempotency guard at checkout already
  // collapses identical re-submissions; this catches the NEAR-duplicate the guard
  // can't (same total, slightly different items — e.g. the customer re-ordered
  // after their first attempt looked like it failed and a flavor had sold out,
  // the real "card then e-Transfer" double-pay pattern). Flag for review so staff
  // can void the duplicate before both get paid and shipped.
  const recentDuplicateTotal = await prisma.order.count({
    where: {
      userId: input.userId,
      id: { not: input.orderId },
      total: input.total,
      paymentStatus: "PENDING",
      createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
    },
  });
  if (recentDuplicateTotal >= 1) {
    flags.push({
      reason: "Possible duplicate order",
      points: 35,
    });
  }

  // ── Calculate final score ──────────────────────────────────
  const score = Math.min(100, flags.reduce((sum, f) => sum + f.points, 0));

  let status: FraudResult["status"] = "CLEAN";
  if (score >= 61) {
    status = "BLOCKED";
  } else if (score >= 31) {
    status = "SUSPICIOUS";
  }

  return { score, flags, status };
}

// ─── Run Fraud Check & Store Result ───────────────────────────

export async function runFraudCheck(input: FraudOrderInput) {
  const result = await calculateFraudScore(input);

  // Store the fraud check record
  const fraudCheck = await prisma.fraudCheck.create({
    data: {
      orderId: input.orderId,
      score: result.score,
      flags: result.flags.map((f) => f.reason),
      status: result.status,
    },
  });

  // If score >= 61, move order to PENDING_REVIEW
  if (result.status === "BLOCKED") {
    await prisma.order.update({
      where: { id: input.orderId },
      data: { status: "PENDING_REVIEW" },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: input.orderId,
        status: "PENDING_REVIEW",
        note: `Fraud detection: Score ${result.score}/100. Flags: ${result.flags.map((f) => f.reason).join(", ")}`,
      },
    });
  }

  return { fraudCheck, result };
}
