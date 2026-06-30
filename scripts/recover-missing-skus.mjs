/**
 * Surgical recovery of in-scope SKUs that are in-stock on the live WP store but
 * missing from the unified DB storefront. INSERT-ONLY: never updates an existing
 * row, so it can't clobber the curated/Grok copy we already ported.
 *
 * In-scope = cannabis / CBD / cannabis-accessories. Off-strategy
 * (nicotine / vape-hardware / tobacco / sexual-enhancement / nicotine-vape brands)
 * is SKIPPED — those belong on borealvapes.com / spiritfiretobacco.com and get
 * cross-site redirects later, not a Mohawk row.
 *
 * Recovered rows are inserted with EMPTY meta/short/long so the compliant Grok
 * generator fills them; images come in as wp-content and are then moved to Blob
 * by scripts/migrate-images-to-blob.mjs.
 *
 *   node scripts/recover-missing-skus.mjs            # DRY RUN
 *   node scripts/recover-missing-skus.mjs --execute  # insert, then run migrate-images + grok copy
 */
import { Client } from "pg";

const EXECUTE = process.argv.includes("--execute");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const WC = "https://mohawkmedibles.ca/wp-json/wc/store/v1/products";

// Off-strategy: nicotine, vape-hardware, tobacco, sexual-enhancement, and the
// nicotine-vape BRANDS (mirrors EXCLUDED_CATEGORIES + a few brand names).
const OFF_STRATEGY = /(nicotine|\bnic\b|pouch|elf-?bar|geek-?bar|geek-?prime|flying-?horse|flavou?r-?beast|lip-?rippers|ijoy|stlth|oxbar|hustler|brisk-?bar|drip-?n|dripn|fungara|killa|white-?fox|\bzolt\b|\bvelo\b|nicozy|clew|starbuzz|tyson-?2|z-?pods|z-?colors|kraze|hookah|shisha|adalya|\bcigar|backwoods|\b510\b|battery|\bsexual\b|sensual|enhancement|rhino|panther|spanish-fly|royal-honey|ginseng.*pill|magnum-xxl|stiff-rox)/i;

const strip = (s) => (s || "").replace(/<[^>]*>/g, "").trim();

function mapCategory(p) {
  const c = (p.categories?.[0]?.name || "").trim();
  const n = (p.name || "").toLowerCase();
  if (/papers|cones/i.test(c)) return "Accessories";
  if (/baked goods|^c&(amp;)?d$/i.test(c)) return "Edibles";
  if (/knock ?out/i.test(c)) return "Pre-Rolls";
  if (c === "Brands" || /\$|oz|gram|lb deal|special|\d+oz/i.test(c)) {
    if (/gumm|caramel|brownie|chocolate|edible|cookie|candy bar/.test(n)) return "Edibles";
    if (/hash|shatter|resin|rosin|distillate|diamond|sauce|concentrate/.test(n)) return "Concentrates";
    if (/vape|cart|disposable| pen/.test(n)) return "THC Vapes";
    if (/pre.?roll|joint|blunt|moonrock/.test(n)) return "Pre-Rolls";
    return "Flower";
  }
  return c || "Uncategorized";
}

const priceOf = (p) => Number(p.prices?.price || 0) / Math.pow(10, p.prices?.currency_minor_unit ?? 2);

async function fetchAllWc() {
  const out = [];
  for (let page = 1; page <= 30; page++) {
    const res = await fetch(`${WC}?per_page=100&page=${page}`, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (!res.ok) { if (page === 1) throw new Error(`WC ${res.status}`); break; }
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) break;
    out.push(...arr);
    if (arr.length < 100) break;
  }
  return out;
}

async function insertProduct(c, p) {
  const cat = mapCategory(p);
  const price = priceOf(p);
  const img = p.images?.[0]?.src || "";
  const alt = p.images?.[0]?.alt || strip(p.name);
  // Insert-only: ON CONFLICT (slug / wcId) DO NOTHING.
  const r = await c.query(
    `insert into "Product"
      ("wcId","slug","name","category","price","sku","canonicalUrl","path","image","altText",
       "metaDescription","shortDescription","longDescription","featured","status","createdAt","updatedAt")
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'','',null,false,'ACTIVE',now(),now())
     on conflict ("slug") do nothing
     returning id`,
    [p.id || null, p.slug, strip(p.name), cat, price, p.sku || null, p.permalink || `/product/${p.slug}/`,
     `/product/${p.slug}/`, img, alt]
  );
  if (r.rowCount === 0) return null; // already existed
  const id = r.rows[0].id;
  await c.query(`insert into "Inventory" ("productId","quantity","backorder","updatedAt") values ($1,$2,false,now()) on conflict ("productId") do nothing`,
    [id, p.is_in_stock ? 100 : 0]);
  const imgs = (p.images || []).slice(0, 8);
  for (let i = 0; i < imgs.length; i++) {
    await c.query(`insert into "ProductImage" ("productId","url","altText","position") values ($1,$2,$3,$4)`,
      [id, imgs[i].src, imgs[i].alt || strip(p.name), i]);
  }
  return id;
}

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const dbRows = (await c.query(`select id, "wcId", slug, status, image, (select count(*)::int from "ProductImage" pi where pi."productId"="Product".id) as imgcount from "Product"`)).rows;
  const dbActiveSlug = new Set(dbRows.filter((r) => r.status === "ACTIVE").map((r) => r.slug));
  const allSlugs = new Set(dbRows.map((r) => r.slug));
  const byWcId = new Map(dbRows.filter((r) => r.wcId != null).map((r) => [r.wcId, r]));

  const wc = await fetchAllWc();
  const missing = wc.filter((p) => p.is_in_stock && !dbActiveSlug.has(p.slug));
  const inScope = missing.filter((p) => {
    const cats = (p.categories || []).map((x) => (x.name || "").toLowerCase()).join(" ");
    return !OFF_STRATEGY.test(p.slug) && !OFF_STRATEGY.test(p.name) && !OFF_STRATEGY.test(cats);
  });

  console.log(JSON.stringify({
    wc_total: wc.length, missing_from_active: missing.length, in_scope_recoverable: inScope.length, executed: EXECUTE,
  }, null, 1));

  let inserted = 0, reactivated = 0, renamed = 0, conflicts = 0;
  for (const p of inScope) {
    const existing = byWcId.get(p.id); // same WC product already in DB (maybe DISCONTINUED / junk slug)
    if (existing) {
      // Reactivate + align slug to the WP-indexed slug (unless that slug is taken by a different row).
      const canRename = p.slug !== existing.slug && !allSlugs.has(p.slug);
      const wcImg = p.images?.[0]?.src || "";
      const needsImg = (!existing.image || existing.image.trim() === "") && wcImg;
      const tag = `${existing.status === "ACTIVE" ? "rename" : "reactivate"} ${existing.slug} -> ${canRename ? p.slug : existing.slug}${needsImg ? " +img" : ""}`;
      if (EXECUTE) {
        try {
          const newSlug = canRename ? p.slug : existing.slug;
          await c.query(
            `update "Product" set slug=$1, status='ACTIVE', image=coalesce(nullif(image,''),$2), "updatedAt"=now() where id=$3`,
            [newSlug, wcImg, existing.id]
          );
          if (canRename) { allSlugs.delete(existing.slug); allSlugs.add(p.slug); renamed++; }
          else if (p.slug !== existing.slug) conflicts++;
          // Seed the gallery if the product has no ProductImage rows yet.
          if (existing.imgcount === 0) {
            const imgs = (p.images || []).slice(0, 8);
            for (let i = 0; i < imgs.length; i++) {
              await c.query(`insert into "ProductImage" ("productId","url","altText","position") values ($1,$2,$3,$4)`,
                [existing.id, imgs[i].src, imgs[i].alt || strip(p.name), i]);
            }
          }
          if (existing.status !== "ACTIVE") reactivated++;
          console.log(`  ↻ ${tag}`);
        } catch (e) { console.log(`  ✗ ${p.slug}: ${e.message}`); }
      } else {
        console.log(`  would ${tag}`);
      }
      continue;
    }
    // Genuinely new product.
    if (EXECUTE) {
      try {
        const id = await insertProduct(c, p);
        if (id) { inserted++; allSlugs.add(p.slug); console.log(`  + [${mapCategory(p)}] ${strip(p.name).slice(0,50)} ($${priceOf(p).toFixed(2)})`); }
      } catch (e) { console.log(`  ✗ ${p.slug}: ${e.message}`); }
    } else {
      console.log(`  would insert NEW: [${mapCategory(p)}] ${strip(p.name).slice(0,50)} (${p.slug})`);
    }
  }
  console.log(`\n${EXECUTE ? "DONE" : "DRY-RUN"}: inserted=${inserted} reactivated=${reactivated} renamed=${renamed} slug_conflicts=${conflicts}`);
  if (EXECUTE) console.log("NEXT: run migrate-images-to-blob.mjs then generate-thin-seo.mjs --execute");
  await c.end();
}
main().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
