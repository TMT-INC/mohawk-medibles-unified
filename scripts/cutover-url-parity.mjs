/**
 * Cutover URL parity under the DB-as-source storefront. Diffs the LIVE WP
 * product sitemap against the DB's resolvable storefront slugs (ACTIVE, not in
 * an excluded category, not nicotine) to find which indexed /shop/<slug>/ URLs
 * resolve natively post-flip vs still need a 301/410.
 *
 * A WP /shop/<slug>/ resolves on the unified site (next.config rewrite
 * /shop/:slug -> /product/:slug) iff a Product with slug==<slug> is in the
 * storefront set. Reports the residual, bucketed for redirect authoring.
 *
 * node scripts/cutover-url-parity.mjs   (needs DATABASE_URL)
 */
import { Client } from "pg";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
const EXCLUDED = new Set(["nicotine","sexual enhancement","enhancement pills","mushrooms","hookah","ijoy","geek bar","flavour beast","flying horse","lip rippers","euphoria psychedelics","her highness from the 6ix"]);
const OFF_NAME = /(nicotine|\bkraze\b)/i;

async function fetchSitemapSlugs() {
  const idx = await (await fetch("https://mohawkmedibles.ca/sitemap_index.xml", { headers: { "User-Agent": UA } })).text();
  const subs = [...idx.matchAll(/<loc>([^<]*product-sitemap[^<]*)<\/loc>/g)].map((m) => m[1]);
  if (!subs.length) subs.push("https://mohawkmedibles.ca/product-sitemap.xml");
  const slugs = new Set();
  for (const u of subs) {
    try {
      const xml = await (await fetch(u, { headers: { "User-Agent": UA } })).text();
      for (const m of xml.matchAll(/<loc>https?:\/\/[^<]*\/(?:shop|product)\/([^\/<]+)\/?<\/loc>/g)) slugs.add(m[1]);
    } catch (e) { console.error("sub fetch fail", u, e.message); }
  }
  return [...slugs];
}

function bucket(slug) {
  if (/(nicotine|nic-|pouch|elf-?bar|geek-?bar|geek-?prime|stlth|oxbar|hustler|brisk-?bar|dripn|fungara|killa|white-?fox|zolt|velo|nicozy|clew|starbuzz|tyson-2|z-?pods|z-?colors|kraze|hookah|shisha|adalya)/i.test(slug)) return "nicotine";
  if (/(sexual|sensual|enhancement|rhino|panther|kitty-kat|pink-pussycat|spanish-fly|hard-rock|ginseng.*pill|royal-honey|jack-rabbit|stiff-rox|magnum-xxl|7k|3800|48-hour|vvip-premium)/i.test(slug)) return "sex";
  if (/(rolling-paper|rolling-tray|bong|glass-bowl|battery|grinder|acrylic|510|export-a)/i.test(slug)) return "accessory";
  if (/(5-gram-special|6-gram-special|gram-special|40-oz|100-oz|100oz|140oz|1003oz|100-3oz|1-2-1-lb-deal|lb-deal|40oz)/i.test(slug)) return "promo";
  return "other";
}

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const rows = (await c.query(`select slug, name, category, status from "Product"`)).rows;
  const resolvable = new Set(
    rows.filter((r) => r.status === "ACTIVE" && !EXCLUDED.has((r.category || "").toLowerCase()) && !OFF_NAME.test(r.name)).map((r) => r.slug)
  );
  const anyStatus = new Map(rows.map((r) => [r.slug, r])); // for diagnosing renamed/discontinued
  await c.end();

  const wp = await fetchSitemapSlugs();
  const residual = wp.filter((s) => !resolvable.has(s));
  const buckets = { nicotine: [], sex: [], accessory: [], promo: [], other: [] };
  const otherDiag = [];
  for (const s of residual) {
    const b = bucket(s);
    buckets[b].push(s);
    if (b === "other") {
      const inDb = anyStatus.get(s);
      otherDiag.push(`${s}  =>  ${inDb ? "DB:" + inDb.status + "/" + inDb.category : "NOT IN DB"}`);
    }
  }
  console.log(JSON.stringify({
    wp_product_urls: wp.length,
    resolve_natively: wp.length - residual.length,
    residual_total: residual.length,
    bucket_counts: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])),
  }, null, 1));
  console.log("\n=== OTHER (need manual decision: 301-to-DB-match, or keep) ===");
  console.log(otherDiag.join("\n"));
}
main().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
