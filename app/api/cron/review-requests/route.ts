/**
 * Review Request Cron — Sends post-purchase review solicitation emails
 * Ported from Ian's .cc: /api/cron/review-requests/
 *
 * Schedule: Daily (configured in vercel.json)
 * Flow: Find delivered orders (3-7 days old) → send review request emails
 */
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/server/trpc/trpc";
import { sendReviewRequestEmail } from "@/lib/email";
import { log } from "@/lib/logger";

function verifyCronAuth(authHeader: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  if (!authHeader) return false;
  const token = authHeader.replace("Bearer ", "");
  if (token.length !== cronSecret.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(cronSecret));
}

export async function GET(req: NextRequest) {
  // Verify cron secret (timing-safe)
  if (!verifyCronAuth(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find orders delivered 3-7 days ago that haven't been sent review requests
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const deliveredOrders = await prisma.order.findMany({
      where: {
        status: { in: ["DELIVERED", "COMPLETED"] },
        deliveredAt: { gte: sevenDaysAgo, lte: threeDaysAgo },
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: { select: { productId: true, name: true } },
      },
      take: 50,
    });

    let requestsSent = 0;

    for (const order of deliveredOrders) {
      if (!order.user?.email) continue;

      for (const item of order.items) {
        // Check if review request already sent
        const existing = await prisma.reviewRequest.findFirst({
          where: {
            userId: order.userId,
            orderId: order.id,
            productId: item.productId,
          },
        });

        if (existing) continue;

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findFirst({
          where: {
            userId: order.userId,
            productId: item.productId,
          },
        });

        if (existingReview) continue;

        // Create review request
        await prisma.reviewRequest.create({
          data: {
            userId: order.userId,
            orderId: order.id,
            productId: item.productId,
            status: "sent",
            sentAt: new Date(),
          },
        });

        // Send review request email
        const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { slug: true } });
        sendReviewRequestEmail(order.user.email, {
          customerName: order.user.name,
          productName: item.name,
          productSlug: product?.slug || "",
          orderNumber: order.orderNumber,
        }).catch((err) => log.wc.error("Review request email failed", { error: err instanceof Error ? err.message : "Unknown" }));
        requestsSent++;
      }
    }

    return NextResponse.json({
      ordersProcessed: deliveredOrders.length,
      requestsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.wc.error("Review request cron failed", { error: error instanceof Error ? error.message : "Unknown" });
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
