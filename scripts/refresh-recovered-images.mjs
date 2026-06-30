/**
 * Set Product.image (+ seed ProductImage gallery) from CURRENT WooCommerce data
 * for ACTIVE in-scope storefront products that have an empty image — used after
 * recovery/reactivation, where the old DB image was stale/deleted. Then run
 * migrate-images-to-blob.mjs to move the fresh wp-content URLs to Blob.
 *
 *   node scripts/refresh-recovered-images.mjs            # dry run
 *   node scripts/refresh-recovered-images.mjs --execute
 */
import { Client } from "pg";
const EXECUTE = process.argv.includes("--execute");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124";
const WC = "https://mohawkmedibles.ca/wp-json/wc/store/v1/products";
const EXCLUDED = new Set(["nicotine","sexual enhancement","enhancement pills","mushrooms","hookah","ijoy","geek bar","flavour beast","flying horse","lip rippers","euphoria psychedelics","her highness from the 6ix"]);
const OFF = /(nicotine|\bkraze\b)/i;
const strip = (s) => (s || "").replace(/<[^>]*>/g, "").trim();

async function fetchAllWc() {
  const out = [];
  for (let p = 1; p <= 30; p++) {
    const r = await fetch(`${WC}?per_page=100&page=${p}`, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (!r.ok) break; const a = await r.json(); if (!a.length) break; out.push(...a); if (a.length < 100) break;
  }
  return out;
}

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const excl = [...EXCLUDED].map((_, i) => `$${i + 1}`).join(",");
  const rows = (await c.query(
    `select p.id, p."wcId", p.name, p.category, (select count(*)::int from "ProductImage" pi where pi."productId"=p.id) imgcount
       from "Product" p
      where p.status='ACTIVE' and lower(p.category) not in (${excl}) and (p.image is null or p.image='')`,
    [...EXCLUDED])).rows;
  const targets = rows.filter((r) => !OFF.test(r.name));
  console.log(`empty-image storefront products: ${targets.length}`);

  const wc = await fetchAllWc();
  const byId = new Map(wc.map((p) => [p.id, p]));
  // fallback: also index by normalized name for products whose wcId didn't match
  const byName = new Map(wc.map((p) => [strip(p.name).toLowerCase(), p]));

  let set = 0; const noImg = [];
  for (const r of targets) {
    const wp = byId.get(r.wcId) || byName.get((r.name || "").toLowerCase());
    const img = wp?.images?.[0]?.src;
    if (!img) { noImg.push(`${r.name}  (wc ${wp ? "found-noimg" : "not-found"})`); continue; }
    if (EXECUTE) {
      await c.query(`update "Product" set image=$1, "updatedAt"=now() where id=$2`, [img, r.id]);
      if (r.imgcount === 0) {
        const imgs = (wp.images || []).slice(0, 8);
        for (let i = 0; i < imgs.length; i++)
          await c.query(`insert into "ProductImage" ("productId","url","altText","position") values ($1,$2,$3,$4)`,
            [r.id, imgs[i].src, imgs[i].alt || strip(r.name), i]);
      }
    }
    set++;
  }
  console.log(JSON.stringify({ would_set: set, still_no_wc_image: noImg.length, executed: EXECUTE }, null, 1));
  if (noImg.length) console.log("\n--- still no image (WC has none) ---\n" + noImg.join("\n"));
  await c.end();
}
main().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
