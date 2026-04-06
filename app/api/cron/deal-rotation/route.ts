/**
 * Deal Rotation Cron — Auto-selects slow-moving products as Deal of the Day
 *
 * Schedule: Daily at 5 AM ET (configured in vercel.json)
 *
 * Logic:
 * 1. Find products with the FEWEST sales in the last 30 days
 * 2. Exclude products already on deal, out of stock, or under $10
 * 3. Pick the top candidate and create a 24-hour deal with 15-30% off
 * 4. Auto-feature it so it shows on the homepage
 * 5. Expire yesterday's deal
 */
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/server/trpc/trpc";
import { log } from "@/lib/logger";

// ─── Config ──────────────────────────────────────────────
const DEAL_DURATION_HOURS = 24;
const MIN_DISCOUNT_PERCENT = 15;
const MAX_DISCOUNT_PERCENT = 30;
const MIN_PRODUCT_PRICE = 10; // Don't deal items under $10
const SALES_LOOKBACK_DAYS = 30;
const EXCLUDE_CATEGORIES = ["Accessories", "Batteries", "Papers"]; // Low-margin items

// ─── Auth ────────────────────────────────────────────────
function verifyCronAuth(authHeader: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // Allow if no secret set (dev mode)
  if (!authHeader) return false;
  const token = authHeader.replace("Bearer ", "");
  if (token.length !== cronSecret.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(cronSecret));
}

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const lookbackDate = new Date(now.getTime() - SALES_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

    // ── Step 1: Expire old deals ─────────────────────────
    const expired = await prisma.dailyDeal.updateMany({
      where: {
        active: true,
        endDate: { lt: now },
      },
      data: { active: false, featured: false },
    });

    // ── Step 2: Check if there's already an active featured deal ──
    const existingDeal = await prisma.dailyDeal.findFirst({
      where: {
        active: true,
        featured: true,
        endDate: { gte: now },
      },
    });

    if (existingDeal) {
      return NextResponse.json({
        message: "Active featured deal still running — skipping rotation",
        deal: existingDeal.title,
        endsAt: existingDeal.endDate.toISOString(),
        expired: expired.count,
      });
    }

    // ── Step 3: Get sales counts per product (last 30 days) ──
    const salesByProduct = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          createdAt: { gte: lookbackDate },
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
      },
      _sum: { quantity: true },
      _count: { id: true },
    });

    const salesMap = new Map<number, number>();
    for (const s of salesByProduct) {
      salesMap.set(s.productId, s._sum.quantity || 0);
    }

    // ── Step 4: Get eligible products ────────────────────
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        price: { gte: MIN_PRODUCT_PRICE },
        category: { notIn: EXCLUDE_CATEGORIES },
      },
      include: {
        inventory: { select: { quantity: true } },
      },
      orderBy: { price: "desc" }, // Prefer higher-priced items for better deal optics
    });

    // Filter: must have stock, not already a recent deal
    const recentDealSlugs = (
      await prisma.dailyDeal.findMany({
        where: { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } },
        select: { productSlug: true },
      })
    ).map((d) => d.productSlug);

    const eligible = products.filter((p) => {
      // Must have stock (or no inventory tracking = unlimited)
      const inStock = !p.inventory || p.inventory.quantity > 0;
      // Not a recent deal
      const notRecentDeal = !recentDealSlugs.includes(p.slug);
      return inStock && notRecentDeal;
    });

    if (eligible.length === 0) {
      return NextResponse.json({
        message: "No eligible products found for deal rotation",
        expired: expired.count,
      });
    }

    // ── Step 5: Score & rank — lowest sales = best candidate ──
    const scored = eligible.map((p) => ({
      product: p,
      salesCount: salesMap.get(p.id) || 0,
      // Score: lower sales + higher price = better deal candidate
      score: (salesMap.get(p.id) || 0) - p.price / 100,
    }));

    // Sort by score ascending (lowest sales first)
    scored.sort((a, b) => a.score - b.score);

    // Pick top candidate
    const winner = scored[0].product;
    const winnerSales = scored[0].salesCount;

    // ── Step 6: Calculate discount ──────────────────────
    // More aggressive discount for items with zero sales
    let discountPercent: number;
    if (winnerSales === 0) {
      discountPercent = MAX_DISCOUNT_PERCENT;
    } else if (winnerSales <= 2) {
      discountPercent = Math.round((MIN_DISCOUNT_PERCENT + MAX_DISCOUNT_PERCENT) / 2);
    } else {
      discountPercent = MIN_DISCOUNT_PERCENT;
    }

    const dealPrice = Math.round(winner.price * (1 - discountPercent / 100) * 100) / 100;

    // ── Step 7: Create the deal ─────────────────────────
    const startDate = now;
    const endDate = new Date(now.getTime() + DEAL_DURATION_HOURS * 60 * 60 * 1000);

    // Un-feature all existing deals first
    await prisma.dailyDeal.updateMany({
      where: { featured: true },
      data: { featured: false },
    });

    const newDeal = await prisma.dailyDeal.create({
      data: {
        productSlug: winner.slug,
        originalPrice: winner.price,
        dealPrice,
        title: `${winner.name} — ${discountPercent}% Off Today Only`,
        description: `This ${winner.category.toLowerCase()} hasn't been getting the love it deserves. Grab it at ${discountPercent}% off before midnight!`,
        startDate,
        endDate,
        featured: true,
        active: true,
      },
    });

    log.admin.info("Deal rotation created", { product: winner.name, price: winner.price, dealPrice, discountPercent });

    return NextResponse.json({
      success: true,
      deal: {
        id: newDeal.id,
        product: winner.name,
        slug: winner.slug,
        category: winner.category,
        originalPrice: winner.price,
        dealPrice,
        discountPercent,
        salesLast30Days: winnerSales,
        reason: winnerSales === 0 ? "zero_sales" : winnerSales <= 2 ? "low_sales" : "below_average",
      },
      candidates: scored.length,
      expired: expired.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[deal-rotation] Cron failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Deal rotation failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
