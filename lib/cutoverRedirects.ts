/**
 * Cutover redirect / gone rules for indexed WooCommerce product URLs that no
 * longer exist on the cannabis-only unified storefront.
 *
 * Applied in middleware (runs BEFORE streaming) so these return a REAL status
 * code, instead of the dynamic product route's streamed HTTP-200 "Product Not
 * Found" soft-404. Matched against the product slug in /shop/<slug>/ and
 * /product/<slug>/.
 *
 * Pattern-based (not a hardcoded slug list) so brand/format variations are
 * covered and nothing needs maintaining as individual SKUs churn. The patterns
 * are specific to off-strategy product families — no cannabis SKU matches them.
 */
export type CutoverRule =
  | { test: RegExp; status: 410 }
  | { test: RegExp; status: 301 | 308; to: string };

export const CUTOVER_REDIRECTS: CutoverRule[] = [
  // Sexual-enhancement pills/honey — discontinued, fit neither sister site → 410 Gone.
  {
    test: /(sexual|sensual|enhancement|\brhino\b|panther|spanish-fly|royal-honey|kitty-kat|pink-pussycat|magnum-xxl|stiff-rox|hard-rock|bonbon-seker|7k-sexual|ginseng.*pill)/i,
    status: 410,
  },

  // ── PARKED until the sister sites are 100% ready (Ian, 2026-06-29) ──
  // Nicotine / nicotine-vape → borealvapes.com (cross-site 301). Enable when Boreal
  // has the matching products/categories so these don't redirect into a 404.
  // { test: /(nicotine|\bkraze\b|elf-?bar|geek-?bar|geek-?prime|flavou?r-?beast|flying-?horse|stlth|oxbar|hustler|brisk-?bar|drip-?n|fungara|killa|white-?fox|\bzolt\b|\bvelo\b|nicozy|clew|starbuzz|tyson-?2|z-?pods|z-?colors|ijoy|lip-?rippers|\bpouch)/i, status: 301, to: "https://borealvapes.com/" },
  //
  // Tobacco / cigars / hookah → spiritfiretobacco.com (cross-site 301).
  // { test: /(\bcigar|backwoods|hookah|shisha|adalya)/i, status: 301, to: "https://spiritfiretobacco.com/" },
];

/** Extract the product slug from /shop/<slug>/ or /product/<slug>/, else null. */
export function productSlugFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/(?:shop|product)\/([^/]+)\/?$/);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Returns the matching cutover rule for a pathname's product slug, or null. */
export function matchCutoverRedirect(pathname: string): CutoverRule | null {
  const slug = productSlugFromPath(pathname);
  if (!slug) return null;
  for (const rule of CUTOVER_REDIRECTS) {
    if (rule.test.test(slug)) return rule;
  }
  return null;
}
