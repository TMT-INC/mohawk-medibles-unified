/**
 * Bulk Pricing Logic
 * Calculates weight-based pricing tiers for cannabis products.
 * If product has variants with different weights, use those prices.
 * Otherwise, estimate bulk tiers from single price using standard discount curves.
 */

export interface BulkPricingTier {
    weight: string;      // e.g. "1g", "3.5g", "7g", "14g", "28g"
    grams: number;
    totalPrice: number;
    pricePerGram: number;
    savingsPercent: number;  // vs smallest tier
    isDefault?: boolean;
}

// Standard cannabis discount curve (off per-gram price)
const DISCOUNT_CURVE: Record<number, number> = {
    1: 0,       // base price (no discount)
    3.5: 0,     // 3.5g = base price per gram (eighth)
    7: 0.10,    // 10% off per gram
    14: 0.20,   // 20% off per gram
    28: 0.30,   // 30% off per gram
};

// Weight tiers to generate
const WEIGHT_TIERS = [1, 3.5, 7, 14, 28];

/**
 * Parses weight string to grams.
 * e.g. "3.5g" => 3.5, "1 oz" => 28, "14 grams" => 14
 */
function parseWeightToGrams(weight: string): number | null {
    if (!weight) return null;
    const cleaned = weight.toLowerCase().trim();

    // Check for oz
    if (cleaned.includes("oz")) {
        const num = parseFloat(cleaned);
        if (!isNaN(num)) return num * 28;
        if (cleaned.includes("half")) return 14;
        if (cleaned.includes("quarter")) return 7;
        return 28; // default 1oz
    }

    // Extract numeric value (handles "3.5g", "14 grams", "28g", etc.)
    const match = cleaned.match(/([\d.]+)\s*(g|gram|grams)?/);
    if (match) {
        return parseFloat(match[1]);
    }

    return null;
}

interface ProductForPricing {
    price: number;
    category?: string;
    specs?: {
        weight?: string;
    };
    variants?: Array<{
        name: string;
        price: number;
        salePrice?: number | null;
        attributes?: Record<string, string> | null;
        isActive?: boolean;
    }>;
}

/**
 * Check if a product category is eligible for bulk/weight pricing.
 * Only flower, hash, concentrates, etc. are sold by gram.
 */
const WEIGHT_CATEGORIES = [
    "flower", "indica", "sativa", "hybrid",
    "hash", "concentrates", "shatter", "wax",
    "live resin", "rosin", "budder", "diamonds",
    "kief", "moon rocks",
];

export function isWeightBasedProduct(product: ProductForPricing): boolean {
    const cat = (product.category || "").toLowerCase();
    return WEIGHT_CATEGORIES.some(c => cat.includes(c));
}

/**
 * Get bulk pricing tiers for a product.
 * Priority:
 * 1. Use real variant prices if available
 * 2. Calculate estimated tiers from base price using discount curve
 */
export function getBulkPricingTiers(product: ProductForPricing): BulkPricingTier[] {
    // Only applicable to weight-based products
    if (!isWeightBasedProduct(product)) return [];
    if (product.price <= 0) return [];

    // Try to extract tiers from existing variants
    if (product.variants && product.variants.length > 1) {
        const variantTiers = extractVariantTiers(product.variants);
        if (variantTiers.length > 1) return variantTiers;
    }

    // Estimate tiers from single price
    return estimateTiersFromPrice(product.price, product.specs?.weight);
}

/**
 * Extract pricing tiers from product variants that have weight attributes.
 */
function extractVariantTiers(variants: NonNullable<ProductForPricing["variants"]>): BulkPricingTier[] {
    const tiers: BulkPricingTier[] = [];

    for (const variant of variants) {
        if (!variant.isActive && variant.isActive !== undefined) continue;

        const price = variant.salePrice ?? variant.price;
        if (price <= 0) continue;

        // Try to parse weight from variant name or attributes
        let grams: number | null = null;

        // Check attributes
        if (variant.attributes) {
            const attrs = variant.attributes;
            for (const key of Object.keys(attrs)) {
                if (key.toLowerCase().includes("weight") || key.toLowerCase().includes("size")) {
                    grams = parseWeightToGrams(attrs[key]);
                    if (grams) break;
                }
            }
        }

        // Fallback: parse from variant name
        if (!grams) {
            grams = parseWeightToGrams(variant.name);
        }

        if (grams && grams > 0) {
            tiers.push({
                weight: formatWeight(grams),
                grams,
                totalPrice: +price.toFixed(2),
                pricePerGram: +(price / grams).toFixed(2),
                savingsPercent: 0, // calculated after
            });
        }
    }

    // Sort by grams
    tiers.sort((a, b) => a.grams - b.grams);

    // Calculate savings vs smallest tier
    if (tiers.length > 0) {
        const basePricePerGram = tiers[0].pricePerGram;
        for (const tier of tiers) {
            if (basePricePerGram > 0) {
                tier.savingsPercent = Math.round(((basePricePerGram - tier.pricePerGram) / basePricePerGram) * 100);
            }
        }
        tiers[0].isDefault = true;
    }

    return tiers;
}

/**
 * Estimate bulk pricing tiers from a single product price.
 */
function estimateTiersFromPrice(basePrice: number, weightStr?: string): BulkPricingTier[] {
    // Determine the base weight and price-per-gram
    const baseWeight = weightStr ? parseWeightToGrams(weightStr) : null;

    let basePricePerGram: number;
    let defaultGrams: number;

    if (baseWeight && baseWeight > 0) {
        basePricePerGram = basePrice / baseWeight;
        defaultGrams = baseWeight;
    } else {
        // Assume the listed price is for 1g if under $30, or 3.5g if $30-60, etc.
        if (basePrice <= 20) {
            basePricePerGram = basePrice;
            defaultGrams = 1;
        } else if (basePrice <= 60) {
            basePricePerGram = basePrice / 3.5;
            defaultGrams = 3.5;
        } else if (basePrice <= 120) {
            basePricePerGram = basePrice / 7;
            defaultGrams = 7;
        } else if (basePrice <= 200) {
            basePricePerGram = basePrice / 14;
            defaultGrams = 14;
        } else {
            basePricePerGram = basePrice / 28;
            defaultGrams = 28;
        }
    }

    const tiers: BulkPricingTier[] = [];

    for (const grams of WEIGHT_TIERS) {
        const discount = DISCOUNT_CURVE[grams] || 0;
        const discountedPPG = basePricePerGram * (1 - discount);
        const totalPrice = +(discountedPPG * grams).toFixed(2);

        tiers.push({
            weight: formatWeight(grams),
            grams,
            totalPrice,
            pricePerGram: +discountedPPG.toFixed(2),
            savingsPercent: Math.round(discount * 100),
            isDefault: grams === defaultGrams || (defaultGrams <= 1 && grams === 1),
        });
    }

    // Ensure at least one is default
    if (!tiers.some(t => t.isDefault) && tiers.length > 0) {
        tiers[0].isDefault = true;
    }

    return tiers;
}

function formatWeight(grams: number): string {
    if (grams === 28) return "28g (1oz)";
    if (grams === 14) return "14g (½oz)";
    if (grams >= 1 && grams === Math.floor(grams)) return `${grams}g`;
    return `${grams}g`;
}

/**
 * Get the lowest price-per-gram for a product (for shop card display).
 * Falls back to parsing product name for pricing patterns like "$5/Gram", "$40/oz".
 */
export function getLowestPricePerGram(product: ProductForPricing & { name?: string }): number | null {
    const tiers = getBulkPricingTiers(product);
    if (tiers.length > 0) return Math.min(...tiers.map(t => t.pricePerGram));

    // Fallback: parse per-gram price from product name
    if (product.name) {
        const name = product.name;

        // Match "$X/Gram" or "$X/g"
        const perGramMatch = name.match(/\$(\d+(?:\.\d+)?)\s*\/\s*(?:gram|g)\b/i);
        if (perGramMatch) return parseFloat(perGramMatch[1]);

        // Match "$X/oz" — divide by 28 to get per-gram
        const perOzMatch = name.match(/\$(\d+(?:\.\d+)?)\s*\/\s*oz\b/i);
        if (perOzMatch) return parseFloat(perOzMatch[1]) / 28;

        // Match "$X/OZ" in product names like "Pink Moon $40/oz"
        const ozPriceMatch = name.match(/\$(\d+)\s*\/\s*oz/i);
        if (ozPriceMatch) return parseFloat(ozPriceMatch[1]) / 28;
    }

    // Fallback: if it's flower category and we know the price, estimate per-gram
    // Assume single-gram products if price <= $15 for flower
    if (product.category?.toLowerCase() === 'flower' && product.price > 0 && product.price <= 15) {
        return product.price;
    }

    return null;
}
