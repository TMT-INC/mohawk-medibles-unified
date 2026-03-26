/**
 * Product Suggestions API — Returns smart combo suggestions for cart
 * Uses the tRPC products router logic via direct Prisma queries.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const FREE_SHIPPING_THRESHOLD = 149;

const COMPLEMENTARY_MAP: Record<string, string[]> = {
  flower: ["accessories", "rolling-papers", "grinders", "lighters", "pre-rolls"],
  buds: ["accessories", "rolling-papers", "grinders", "lighters", "pre-rolls"],
  "dried-flower": ["accessories", "rolling-papers", "grinders", "lighters", "pre-rolls"],
  indica: ["accessories", "rolling-papers", "grinders", "edibles"],
  sativa: ["accessories", "rolling-papers", "grinders", "edibles"],
  hybrid: ["accessories", "rolling-papers", "grinders", "edibles"],
  edibles: ["drinks", "beverages", "gummies", "chocolates", "edibles"],
  gummies: ["chocolates", "drinks", "edibles", "beverages"],
  chocolates: ["gummies", "drinks", "edibles", "beverages"],
  vape: ["vape-cartridges", "batteries", "vape-pens", "vape"],
  "vape-cartridges": ["batteries", "vape-pens", "vape"],
  "vape-pens": ["vape-cartridges", "batteries", "vape"],
  concentrates: ["dab-tools", "rigs", "accessories", "concentrates"],
  shatter: ["dab-tools", "rigs", "accessories", "concentrates"],
  wax: ["dab-tools", "rigs", "accessories", "concentrates"],
  resin: ["dab-tools", "rigs", "accessories", "concentrates"],
  rosin: ["dab-tools", "rigs", "accessories", "concentrates"],
  "pre-rolls": ["lighters", "accessories", "flower", "edibles"],
  accessories: ["flower", "edibles", "pre-rolls"],
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const categorySlugs: string[] = JSON.parse(url.searchParams.get("categorySlugs") || "[]");
    const cartProductIds: number[] = JSON.parse(url.searchParams.get("cartProductIds") || "[]");
    const cartTotal = parseFloat(url.searchParams.get("cartTotal") || "0");

    // Build complementary + same category sets
    const complementaryCategories = new Set<string>();
    const sameCategories = new Set<string>();

    for (const slug of categorySlugs) {
      const normalized = slug.toLowerCase().trim();
      sameCategories.add(normalized);
      const complements = COMPLEMENTARY_MAP[normalized];
      if (complements) {
        for (const c of complements) complementaryCategories.add(c);
      }
    }
    for (const cat of sameCategories) {
      complementaryCategories.delete(cat);
    }

    const excludeIds = cartProductIds.length > 0 ? cartProductIds : [-1];
    const suggestions: (Record<string, unknown> & { reason: string })[] = [];

    // Priority 1: Products close to free shipping threshold
    if (cartTotal < FREE_SHIPPING_THRESHOLD) {
      const remaining = FREE_SHIPPING_THRESHOLD - cartTotal;
      const thresholdProducts = await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          id: { notIn: excludeIds },
          price: { gte: remaining * 0.5, lte: remaining * 2 },
        },
        orderBy: { price: "asc" },
        take: 3,
        select: { id: true, name: true, slug: true, price: true, salePrice: true, image: true, category: true },
      });
      for (const p of thresholdProducts) {
        suggestions.push({ ...p, reason: "freeShipping" });
      }
    }

    // Priority 2: Complementary categories
    if (suggestions.length < 3 && complementaryCategories.size > 0) {
      const complementary = await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          id: { notIn: [...excludeIds, ...suggestions.map((s) => s.id as number)] },
          category: { in: Array.from(complementaryCategories), mode: "insensitive" },
        },
        orderBy: { featured: "desc" },
        take: 3 - suggestions.length,
        select: { id: true, name: true, slug: true, price: true, salePrice: true, image: true, category: true },
      });
      for (const p of complementary) {
        suggestions.push({ ...p, reason: "complementary" });
      }
    }

    // Priority 3: Same category
    if (suggestions.length < 3 && sameCategories.size > 0) {
      const sameCat = await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          id: { notIn: [...excludeIds, ...suggestions.map((s) => s.id as number)] },
          category: { in: Array.from(sameCategories), mode: "insensitive" },
        },
        orderBy: { featured: "desc" },
        take: 3 - suggestions.length,
        select: { id: true, name: true, slug: true, price: true, salePrice: true, image: true, category: true },
      });
      for (const p of sameCat) {
        suggestions.push({ ...p, reason: "sameCategory" });
      }
    }

    // Priority 4: Featured fallback
    if (suggestions.length < 3) {
      const featured = await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          featured: true,
          id: { notIn: [...excludeIds, ...suggestions.map((s) => s.id as number)] },
        },
        take: 3 - suggestions.length,
        select: { id: true, name: true, slug: true, price: true, salePrice: true, image: true, category: true },
      });
      for (const p of featured) {
        suggestions.push({ ...p, reason: "popular" });
      }
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0, 3),
      freeShippingRemaining:
        cartTotal < FREE_SHIPPING_THRESHOLD
          ? +(FREE_SHIPPING_THRESHOLD - cartTotal).toFixed(2)
          : 0,
    });
  } catch (error) {
    console.error("Product suggestions error:", error);
    return NextResponse.json({ suggestions: [], freeShippingRemaining: 0 });
  }
}
