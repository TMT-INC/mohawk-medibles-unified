/**
 * Products Router — Smart product suggestions for cart/checkout
 */
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

// Category → complementary product categories mapping
const COMPLEMENTARY_MAP: Record<string, string[]> = {
  // Flower/buds → accessories
  flower: ["accessories", "rolling-papers", "grinders", "lighters", "pre-rolls"],
  buds: ["accessories", "rolling-papers", "grinders", "lighters", "pre-rolls"],
  "dried-flower": ["accessories", "rolling-papers", "grinders", "lighters", "pre-rolls"],
  indica: ["accessories", "rolling-papers", "grinders", "edibles"],
  sativa: ["accessories", "rolling-papers", "grinders", "edibles"],
  hybrid: ["accessories", "rolling-papers", "grinders", "edibles"],

  // Edibles → more edibles + drinks
  edibles: ["drinks", "beverages", "gummies", "chocolates", "edibles"],
  gummies: ["chocolates", "drinks", "edibles", "beverages"],
  chocolates: ["gummies", "drinks", "edibles", "beverages"],

  // Vape → cartridges + batteries
  vape: ["vape-cartridges", "batteries", "vape-pens", "vape"],
  "vape-cartridges": ["batteries", "vape-pens", "vape"],
  "vape-pens": ["vape-cartridges", "batteries", "vape"],

  // Concentrates → dab tools
  concentrates: ["dab-tools", "rigs", "accessories", "concentrates"],
  shatter: ["dab-tools", "rigs", "accessories", "concentrates"],
  wax: ["dab-tools", "rigs", "accessories", "concentrates"],
  resin: ["dab-tools", "rigs", "accessories", "concentrates"],
  rosin: ["dab-tools", "rigs", "accessories", "concentrates"],

  // Pre-rolls
  "pre-rolls": ["lighters", "accessories", "flower", "edibles"],

  // Accessories
  accessories: ["flower", "edibles", "pre-rolls"],
};

const FREE_SHIPPING_THRESHOLD = 149;

export const productsRouter = router({
  getSuggestions: publicProcedure
    .input(
      z.object({
        categorySlugs: z.array(z.string()),
        cartProductIds: z.array(z.number()),
        cartTotal: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { categorySlugs, cartProductIds, cartTotal } = input;

      // Build set of complementary categories
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

      // Remove categories already in cart from complementary set
      for (const cat of sameCategories) {
        complementaryCategories.delete(cat);
      }

      const suggestions = [];

      // Priority 1: Products that would push cart over $149 (free shipping threshold)
      if (cartTotal < FREE_SHIPPING_THRESHOLD) {
        const remaining = FREE_SHIPPING_THRESHOLD - cartTotal;
        const thresholdProducts = await ctx.prisma.product.findMany({
          where: {
            status: "ACTIVE",
            id: { notIn: cartProductIds.length > 0 ? cartProductIds : [-1] },
            price: { gte: remaining * 0.5, lte: remaining * 2 },
          },
          orderBy: { price: "asc" },
          take: 3,
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            image: true,
            category: true,
          },
        });

        for (const p of thresholdProducts) {
          suggestions.push({ ...p, reason: "freeShipping" as const });
        }
      }

      // Priority 2: Complementary category products
      if (suggestions.length < 3 && complementaryCategories.size > 0) {
        const complementaryProducts = await ctx.prisma.product.findMany({
          where: {
            status: "ACTIVE",
            id: { notIn: [...cartProductIds, ...suggestions.map((s) => s.id)] },
            category: { in: Array.from(complementaryCategories), mode: "insensitive" },
          },
          orderBy: { featured: "desc" },
          take: 3 - suggestions.length,
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            image: true,
            category: true,
          },
        });

        for (const p of complementaryProducts) {
          suggestions.push({ ...p, reason: "complementary" as const });
        }
      }

      // Priority 3: Popular items from same category
      if (suggestions.length < 3 && sameCategories.size > 0) {
        const sameCategoryProducts = await ctx.prisma.product.findMany({
          where: {
            status: "ACTIVE",
            id: { notIn: [...cartProductIds, ...suggestions.map((s) => s.id)] },
            category: { in: Array.from(sameCategories), mode: "insensitive" },
          },
          orderBy: { featured: "desc" },
          take: 3 - suggestions.length,
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            image: true,
            category: true,
          },
        });

        for (const p of sameCategoryProducts) {
          suggestions.push({ ...p, reason: "sameCategory" as const });
        }
      }

      // Priority 4: Popular/featured fallback
      if (suggestions.length < 3) {
        const fallbackProducts = await ctx.prisma.product.findMany({
          where: {
            status: "ACTIVE",
            featured: true,
            id: { notIn: [...cartProductIds, ...suggestions.map((s) => s.id)] },
          },
          take: 3 - suggestions.length,
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            image: true,
            category: true,
          },
        });

        for (const p of fallbackProducts) {
          suggestions.push({ ...p, reason: "popular" as const });
        }
      }

      return {
        suggestions: suggestions.slice(0, 3),
        freeShippingRemaining:
          cartTotal < FREE_SHIPPING_THRESHOLD
            ? +(FREE_SHIPPING_THRESHOLD - cartTotal).toFixed(2)
            : 0,
      };
    }),
});
