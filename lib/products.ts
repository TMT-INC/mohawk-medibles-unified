/**
 * Mohawk Medibles — Database-Backed Product Service
 *
 * Drop-in replacement for lib/productData.ts.
 * Reads products from PostgreSQL via Prisma instead of a hardcoded array.
 * Controlled by the USE_DB_PRODUCTS env flag — falls back to hardcoded data if disabled or DB fails.
 *
 * Exports the EXACT same interface, types, and function signatures as productData.ts
 * so consumers can switch imports without code changes.
 */

import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { decodeHtmlEntities } from "@/lib/utils";

// Re-export the Product interface (same shape as productData.ts)
export interface Product {
    id: number;
    slug: string;
    name: string;
    category: string;
    subcategory: string | null;
    canonicalUrl: string;
    path: string;
    price: number;
    image: string;
    images: string[];
    altText: string;
    sku: string;
    metaDescription: string;
    shortDescription: string;
    descriptionHTML?: string;
    featured: boolean;
    specs: {
        thc: string;
        cbd: string;
        type: string;
        weight: string;
        terpenes: string[];
        lineage: string;
    };
    effects: string[];
    eeatNarrative: string;
}

// ─── Cache ──────────────────────────────────────────────
// In-memory TTL cache to avoid hitting the DB on every request.
// Products change infrequently, so 5-minute cache is fine.

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cachedProducts: Product[] | null = null;
let cacheTimestamp = 0;

function isCacheValid(): boolean {
    return cachedProducts !== null && Date.now() - cacheTimestamp < CACHE_TTL_MS;
}

/** Force-clear the products cache (call after admin product edits) */
export function invalidateProductCache(): void {
    cachedProducts = null;
    cacheTimestamp = 0;
}

// ─── Feature flag ───────────────────────────────────────

function useDatabase(): boolean {
    return process.env.USE_DB_PRODUCTS === "true";
}

// ─── Hardcoded fallback (lazy import) ───────────────────

let _fallback: typeof import("@/lib/productData") | null = null;

async function getFallback() {
    if (!_fallback) {
        _fallback = await import("@/lib/productData");
    }
    return _fallback;
}

// ─── DB → Product transformer ───────────────────────────

type DBProduct = Awaited<ReturnType<typeof prisma.product.findFirst>> & {
    specs: {
        thc: string | null;
        cbd: string | null;
        type: string | null;
        weight: string | null;
        terpenes: string | null;
        lineage: string | null;
        eeatNarrative: string | null;
    } | null;
    images: { url: string; altText: string | null; position: number }[];
};

function transformProduct(dbProduct: NonNullable<DBProduct>): Product {
    let terpenes: string[] = [];
    if (dbProduct.specs?.terpenes) {
        try {
            terpenes = JSON.parse(dbProduct.specs.terpenes);
        } catch {
            terpenes = dbProduct.specs.terpenes.split(",").map((t: string) => t.trim()).filter(Boolean);
        }
    }

    return {
        id: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        category: dbProduct.category,
        subcategory: dbProduct.subcategory,
        canonicalUrl: dbProduct.canonicalUrl,
        path: dbProduct.path,
        price: dbProduct.price,
        image: dbProduct.image,
        images:
            dbProduct.images.length > 0
                ? dbProduct.images.sort((a: { position: number }, b: { position: number }) => a.position - b.position).map((i: { url: string }) => i.url)
                : [dbProduct.image],
        altText: dbProduct.altText,
        sku: dbProduct.sku || "",
        metaDescription: dbProduct.metaDescription,
        shortDescription: dbProduct.shortDescription,
        descriptionHTML: dbProduct.longDescription || undefined,
        featured: dbProduct.featured,
        specs: {
            thc: dbProduct.specs?.thc || "TBD",
            cbd: dbProduct.specs?.cbd || "TBD",
            type: dbProduct.specs?.type || dbProduct.category,
            weight: dbProduct.specs?.weight || "TBD",
            terpenes,
            lineage: dbProduct.specs?.lineage || "",
        },
        effects: [],
        eeatNarrative:
            dbProduct.specs?.eeatNarrative ||
            `${dbProduct.name} is a premium ${dbProduct.category} product available at Mohawk Medibles.`,
    };
}

/** Categories excluded from the storefront */
const EXCLUDED_CATEGORIES = new Set([
    "nicotine", "sexual enhancement", "enhancement pills",
    "mushrooms", "hookah",
    "ijoy", "geek bar", "flavour beast", "flying horse", "lip rippers",
    "euphoria psychedelics", "her highness from the 6ix",
]);

/**
 * Off-strategy product NAME patterns. The category filter misses items that the
 * WC sync lands under "Uncategorized" (e.g. ~47 Kraze nicotine disposable vapes
 * and Breeze nicotine pouches). This is a cannabis-only storefront, so drop any
 * nicotine product by name regardless of how it was categorized. Deliberately
 * narrow ("nicotine" / the Kraze brand) so legit THC vapes/disposables stay.
 */
const OFF_STRATEGY_NAME = /(nicotine|\bkraze\b)/i;

function isAllowedProduct(p: Product): boolean {
    if (EXCLUDED_CATEGORIES.has(p.category.toLowerCase())) return false;
    if (OFF_STRATEGY_NAME.test(p.name)) return false;
    return true;
}

/** Decode HTML entities in user-facing product text fields */
function cleanProductText(p: Product): Product {
    return {
        ...p,
        name: decodeHtmlEntities(p.name),
        category: decodeHtmlEntities(p.category),
        subcategory: p.subcategory === null ? null : decodeHtmlEntities(p.subcategory),
        altText: decodeHtmlEntities(p.altText),
        metaDescription: decodeHtmlEntities(p.metaDescription),
        shortDescription: decodeHtmlEntities(p.shortDescription),
        eeatNarrative: decodeHtmlEntities(p.eeatNarrative),
        sku: decodeHtmlEntities(p.sku),
    };
}

/**
 * WP housekeeping category labels that must never appear in customer-facing
 * category LISTINGS (chatbot lists, LLM prompt, search suggestions, /api
 * category endpoints). The products themselves stay servable — only the
 * label is hidden from merchandising surfaces.
 */
const HIDDEN_CATEGORY_LABELS = new Set(["uncategorized"]);

export function isCustomerFacingCategory(name: string): boolean {
    return !HIDDEN_CATEGORY_LABELS.has(name.trim().toLowerCase());
}

/**
 * The Product DB table has no effects column, but the static snapshot carries
 * terpene-enrichment effects for the same WC catalog. Inherit them by slug so
 * effects-driven features (shop-by-mood buckets, effect search) keep working
 * when serving from the database.
 */
async function withStaticEffects(products: Product[]): Promise<Product[]> {
    const fb = await getFallback();
    const effectsBySlug = new Map(fb.PRODUCTS.map((p) => [p.slug, p.effects]));
    return products.map((p) => {
        if (p.effects.length > 0) return p;
        const effects = effectsBySlug.get(p.slug);
        return effects && effects.length > 0 ? { ...p, effects } : p;
    });
}

// ─── Core data loader ───────────────────────────────────

async function loadProductsFromDB(): Promise<Product[]> {
    const dbProducts = await prisma.product.findMany({
        where: { status: "ACTIVE" },
        include: {
            specs: true,
            images: { orderBy: { position: "asc" } },
        },
        orderBy: { id: "asc" },
    });

    return dbProducts.map((p: unknown) => transformProduct(p as unknown as NonNullable<DBProduct>));
}

// ─── Public API (matches productData.ts exactly) ────────

/**
 * Get all products. Uses DB if enabled, otherwise falls back to hardcoded.
 * Results are cached in memory for 5 minutes.
 */
export async function getAllProducts(): Promise<Product[]> {
    if (!useDatabase()) {
        const fb = await getFallback();
        return fb.PRODUCTS.map(cleanProductText).filter(isAllowedProduct);
    }

    if (isCacheValid()) {
        return cachedProducts!;
    }

    try {
        const dbProducts = await withStaticEffects(
            (await loadProductsFromDB()).map(cleanProductText).filter(isAllowedProduct)
        );
        // If DB returns 0 products (not synced yet), fall back to hardcoded
        if (dbProducts.length === 0) {
            log.admin.warn("DB returned 0 products, falling back to hardcoded data");
            const fb = await getFallback();
            return fb.PRODUCTS.map(cleanProductText).filter(isAllowedProduct);
        }
        cachedProducts = dbProducts;
        cacheTimestamp = Date.now();
        return cachedProducts;
    } catch (err) {
        log.admin.error("Failed to load products from DB, falling back to hardcoded", {
            error: err instanceof Error ? err.message : "Unknown",
        });
        const fb = await getFallback();
        return fb.PRODUCTS.map(cleanProductText).filter(isAllowedProduct);
    }
}

/**
 * Synchronous access to cached products.
 * IMPORTANT: Only use in contexts where getAllProducts() has been called before.
 * If cache is empty, returns empty array (caller should use getAllProducts() instead).
 */
export function getCachedProducts(): Product[] {
    if (cachedProducts && isCacheValid()) return cachedProducts;
    return [];
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
    const products = await getAllProducts();
    return products.find((p) => p.slug === slug);
}

export async function getRelatedProducts(product: Product, count: number = 4): Promise<Product[]> {
    const products = await getAllProducts();
    return products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, count);
}

export async function getFeaturedProducts(): Promise<Product[]> {
    const products = await getAllProducts();
    return products.filter((p) => p.featured);
}

export function getShortName(product: Product): string {
    return product.name.length > 25 ? product.name.substring(0, 25) + "..." : product.name;
}

export async function getAllCategories(): Promise<string[]> {
    const products = await getAllProducts();
    const categories = new Set(products.map((p) => p.category));
    return Array.from(categories).filter(isCustomerFacingCategory).sort();
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
    const products = await getAllProducts();
    const counts: Record<string, number> = {};
    for (const p of products) {
        if (!isCustomerFacingCategory(p.category)) continue;
        counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
}

export async function getCategoryRepresentativeProducts(
    categories: string[]
): Promise<{ category: string; product: Product; count: number }[]> {
    const products = await getAllProducts();
    const counts: Record<string, number> = {};
    for (const p of products) {
        counts[p.category] = (counts[p.category] || 0) + 1;
    }

    return categories
        .map((cat) => {
            const catProducts = products.filter((p) => p.category === cat);
            const sorted = [...catProducts].sort((a, b) => b.price - a.price);
            const product = sorted.find((p) => p.image && p.image.startsWith("http")) || sorted[0];
            // Hide near-empty categories: a showcase tile advertising a single
            // item (e.g. the DB catalog's "Brands" with 1 product) is noise.
            return product && (counts[cat] || 0) >= 2
                ? { category: cat, product, count: counts[cat] || 0 }
                : null;
        })
        .filter(Boolean) as { category: string; product: Product; count: number }[];
}
