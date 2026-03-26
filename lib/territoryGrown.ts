/**
 * Territory Grown — Identifies products cultivated on Tyendinaga Mohawk Territory
 * or by Indigenous producers. Used for filtering, badging, and the /territory-grown page.
 */

// Curated slugs — expand via admin panel in the future
export const TERRITORY_GROWN_SLUGS = new Set<string>([
  // Add confirmed territory-grown product slugs here
]);

// Keywords that auto-tag a product as territory-grown
const TERRITORY_KEYWORDS = [
  "mohawk",
  "tyendinaga",
  "indigenous",
  "territory",
  "tyendinaga",
  "first nations",
  "native grown",
  "rez grown",
];

interface ProductLike {
  slug: string;
  name: string;
  shortDescription?: string;
  category?: string;
}

/**
 * Check if a product qualifies as "Territory Grown"
 * Either explicitly listed in TERRITORY_GROWN_SLUGS or matched by keyword
 */
export function isTerritoryGrown(product: ProductLike): boolean {
  // Explicit slug match
  if (TERRITORY_GROWN_SLUGS.has(product.slug)) return true;

  // Keyword match in name or description
  const searchText = `${product.name} ${product.shortDescription ?? ""}`.toLowerCase();
  return TERRITORY_KEYWORDS.some((kw) => searchText.includes(kw));
}

/**
 * Filter an array of products to only territory-grown ones
 */
export function filterTerritoryGrown<T extends ProductLike>(products: T[]): T[] {
  return products.filter(isTerritoryGrown);
}
