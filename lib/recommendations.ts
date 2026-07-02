/**
 * AI Product Recommendations Engine
 * ══════════════════════════════════
 * Terpene + effect-scored recommendations replacing simple same-category matching.
 * All scoring from in-memory PRODUCTS array (no DB required).
 */

import { getAllProducts, type Product } from "@/lib/products";
import type { VisitorProfile } from "@/lib/visitorStore";

// ─── Scoring Helpers ──────────────────────────────────────────

/** Jaccard similarity: |A ∩ B| / |A ∪ B| */
function jaccard(a: string[], b: string[]): number {
    if (a.length === 0 && b.length === 0) return 0;
    const setA = new Set(a.map((s) => s.toLowerCase()));
    const setB = new Set(b.map((s) => s.toLowerCase()));
    let intersection = 0;
    for (const item of setA) {
        if (setB.has(item)) intersection++;
    }
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : intersection / union;
}

/** Price proximity: 1 = identical, 0 = very different */
function priceProximity(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    const diff = Math.abs(a - b);
    const avg = (a + b) / 2;
    return Math.max(0, 1 - diff / avg);
}

// ─── Smart Related Products ──────────────────────────────────

/**
 * Weighted scoring: 40% terpene overlap, 25% effect overlap,
 * 20% category match, 15% price proximity.
 */
export async function getSmartRelatedProducts(product: Product, limit: number = 6): Promise<Product[]> {
    const PRODUCTS = await getAllProducts();
    const scored = PRODUCTS
        .filter((p) => p.id !== product.id)
        .map((p) => {
            const terpeneScore = jaccard(product.specs.terpenes, p.specs.terpenes);
            const effectScore = jaccard(product.effects, p.effects);
            const categoryScore = p.category === product.category ? 1 : 0;
            const priceScore = priceProximity(product.price, p.price);

            const total =
                terpeneScore * 0.40 +
                effectScore * 0.25 +
                categoryScore * 0.20 +
                priceScore * 0.15;

            return { product: p, score: total };
        })
        .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((s) => s.product);
}

// ─── Frequently Bought Together ──────────────────────────────

/** Category pairing heuristics (covers static-era and DB catalog names) */
const CATEGORY_PAIRS: Record<string, string[]> = {
    "Flower": ["Hash", "Pre-Rolls", "Accessories"],
    "Pre-Rolls": ["Flower", "Hash"],
    "Infused Pre-Rolls": ["Flower", "Pre-Rolls"],
    "Hash": ["Flower", "Pre-Rolls"],
    "Edibles": ["CBD", "Beverages"],
    "CBD": ["Edibles", "Topicals"],
    "Concentrates": ["Flower", "Accessories"],
    "Vapes": ["Concentrates", "Flower"],
    "Disposables": ["Concentrates", "Flower"],
    "Cartridges": ["Concentrates", "Flower"],
    "Burn": ["Concentrates", "Flower"],
    "Topicals": ["CBD", "Edibles"],
    "Beverages": ["Edibles", "CBD"],
    "Accessories": ["Flower", "Concentrates", "Vapes"],
};

export async function getFrequentlyBoughtTogether(product: Product, limit: number = 4): Promise<Product[]> {
    const PRODUCTS = await getAllProducts();
    const pairedCategories = CATEGORY_PAIRS[product.category] || [];

    const scoreProduct = (p: Product) =>
        jaccard(product.specs.terpenes, p.specs.terpenes) + (p.featured ? 0.1 : 0);

    // Products from paired categories, scored by terpene overlap.
    // The DB catalog files some pair targets (Hash, Topicals) as
    // subcategories, so match against both fields.
    let candidates = PRODUCTS
        .filter(
            (p) =>
                p.id !== product.id &&
                (pairedCategories.includes(p.category) ||
                    (p.subcategory ? pairedCategories.includes(p.subcategory) : false))
        )
        .map((p) => ({ product: p, score: scoreProduct(p) }))
        .sort((a, b) => b.score - a.score);

    // No pairing rule or no products in the paired categories (brand-named or
    // "Uncategorized" DB categories) — fall back to cross-category picks so
    // the section doesn't silently disappear from those product pages.
    if (candidates.length === 0) {
        candidates = PRODUCTS
            .filter((p) => p.id !== product.id && p.category !== product.category)
            .map((p) => ({ product: p, score: scoreProduct(p) }))
            .sort((a, b) => b.score - a.score);
    }

    return candidates.slice(0, limit).map((c) => c.product);
}

// ─── Personalized Recommendations ────────────────────────────

export async function getPersonalizedRecommendations(
    profile: VisitorProfile | null,
    limit: number = 8
): Promise<Product[]> {
    const PRODUCTS = await getAllProducts();
    if (!profile || profile.totalEvents < 2) {
        // Fallback: featured products, topped up with picks from popular
        // categories — the DB catalog flags only a couple of products as
        // featured, which would leave the rail nearly empty for new visitors.
        const featured = PRODUCTS.filter((p) => p.featured);
        if (featured.length >= limit) return featured.slice(0, limit);
        const popularCategories = new Set(["flower", "edibles", "concentrates", "disposables", "pre-rolls", "vapes"]);
        const fill = PRODUCTS
            .filter((p) => !p.featured)
            .map((p) => ({
                product: p,
                score:
                    (popularCategories.has(p.category.toLowerCase()) ? 0.5 : 0) +
                    (p.specs.terpenes.length >= 2 ? 0.25 : 0),
            }))
            .sort((a, b) => b.score - a.score)
            .map((s) => s.product);
        return [...featured, ...fill].slice(0, limit);
    }

    // Rank categories by interest
    const topCategories = Object.entries(profile.categoryInterests)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);

    // Get slugs already viewed (avoid re-recommending)
    const viewedSlugs = new Set(profile.productsViewed);

    // Score products based on visitor profile
    const scored = PRODUCTS
        .filter((p) => !viewedSlugs.has(p.slug))
        .map((p) => {
            let score = 0;

            // Category interest alignment
            const catIndex = topCategories.indexOf(p.category);
            if (catIndex !== -1) score += (3 - catIndex) * 0.3; // 0.9, 0.6, 0.3

            // Boost featured
            if (p.featured) score += 0.15;

            // Boost products with rich terpene profiles (higher quality data)
            if (p.specs.terpenes.length >= 2) score += 0.1;

            return { product: p, score };
        })
        .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((s) => s.product);
}
