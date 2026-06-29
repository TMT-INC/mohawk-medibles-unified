/**
 * Port curated SEO copy from the static lib/productData.ts (363 hand/AI-tuned
 * products with -canada SEO slugs) INTO the matching live Neon DB rows, so that
 * when USE_DB_PRODUCTS flips to true the storefront keeps its SEO copy while
 * gaining the DB's fresh prices/stock and already-migrated Blob images.
 *
 * Ports ONLY text fields that are empty on the DB row:
 *   metaDescription, shortDescription, longDescription, altText, + ProductSpec
 *   (thc/cbd/type/weight/terpenes/lineage/eeatNarrative).
 * NEVER touches price, salePrice, image, images, status, slug, wcId, inventory —
 * those stay authoritative on the DB.
 *
 * Match priority per productData row:
 *   1. exact slug == DB.slug
 *   2. slug with -canada stripped == DB.slug
 *   3. normalized name == DB normalized name (unique only)
 *
 * Usage (from repo root):
 *   node --env-file=.mm-prod.tmp.env scripts/port-seo-content.mjs            # DRY RUN (default)
 *   node --env-file=.mm-prod.tmp.env scripts/port-seo-content.mjs --execute  # writes
 * Safe to run pre-flip: writes are inert until USE_DB_PRODUCTS=true (storefront
 * reads productData today). Re-runnable: only fills still-empty fields.
 */
import { Client } from "pg";
import { readFileSync } from "fs";

const EXECUTE = process.argv.includes("--execute");

function loadProductData() {
  const src = readFileSync(new URL("../lib/productData.ts", import.meta.url), "utf8");
  const marker = "const _RAW_PRODUCTS";
  const mi = src.indexOf(marker);
  if (mi < 0) throw new Error("could not find _RAW_PRODUCTS in productData.ts");
  // start after the '=' so we don't land on the '[' in the "Product[]" type annotation
  const eq = src.indexOf("=", mi);
  const arrStart = src.indexOf("[", eq);
  let depth = 0, inStr = false, esc = false, end = -1;
  for (let i = arrStart; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '"') inStr = true;
    else if (ch === "[") depth++;
    else if (ch === "]") { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end < 0) throw new Error("could not find end of _RAW_PRODUCTS array");
  return JSON.parse(src.slice(arrStart, end));
}

const norm = (s) => (s || "").toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]+/g, "");
const stripCanada = (s) => (s || "").replace(/-canada$/, "");
const empty = (v) => v === null || v === undefined || String(v).trim() === "";

async function main() {
  const pd = loadProductData();
  console.log(`productData rows: ${pd.length}`);

  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const db = (await c.query(
    `select p.id, p.slug, p.name, p.status, p.sku,
            p."metaDescription", p."shortDescription", p."longDescription", p."altText",
            s.thc, s.cbd, s.type, s.weight, s.terpenes, s.lineage, s."eeatNarrative",
            (s."productId" is not null) as has_spec
       from "Product" p left join "ProductSpec" s on s."productId" = p.id`
  )).rows;

  const bySlug = new Map();
  const byName = new Map();      // norm(name) -> [rows]
  for (const r of db) {
    bySlug.set(r.slug, r);
    const k = norm(r.name);
    (byName.get(k) || byName.set(k, []).get(k)).push(r);
  }

  const stat = { exact: 0, stripped: 0, name: 0, unmatched: 0 };
  const wouldSet = { meta: 0, short: 0, long: 0, alt: 0, spec: 0 };
  const wouldSetActive = { meta: 0, short: 0, long: 0, spec: 0 };
  const unmatched = [];
  let writes = 0;

  for (const p of pd) {
    let row = bySlug.get(p.slug) || null;
    let how = "exact";
    if (!row) { row = bySlug.get(stripCanada(p.slug)) || null; how = "stripped"; }
    if (!row) {
      const cand = byName.get(norm(p.name)) || [];
      if (cand.length === 1) { row = cand[0]; how = "name"; }
    }
    if (!row) { stat.unmatched++; unmatched.push(p.slug); continue; }
    stat[how]++;
    const active = row.status === "ACTIVE";

    const sets = {};
    if (empty(row.metaDescription) && !empty(p.metaDescription)) { sets.metaDescription = p.metaDescription; wouldSet.meta++; if (active) wouldSetActive.meta++; }
    if (empty(row.shortDescription) && !empty(p.shortDescription)) { sets.shortDescription = p.shortDescription; wouldSet.short++; if (active) wouldSetActive.short++; }
    if (empty(row.longDescription) && !empty(p.descriptionHTML)) { sets.longDescription = p.descriptionHTML; wouldSet.long++; if (active) wouldSetActive.long++; }
    // Only replace altText if DB's is empty or the generic auto-generated placeholder
    if ((empty(row.altText) || /^[^|]+ - Mohawk Medibles$/.test(row.altText)) && !empty(p.altText)) { sets.altText = p.altText; wouldSet.alt++; }

    // ProductSpec: fill missing fields
    const sp = p.specs || {};
    const specSets = {};
    const specMap = {
      thc: sp.thc, cbd: sp.cbd, type: sp.type, weight: sp.weight,
      terpenes: Array.isArray(sp.terpenes) ? JSON.stringify(sp.terpenes) : sp.terpenes,
      lineage: sp.lineage, eeatNarrative: p.eeatNarrative,
    };
    for (const [k, v] of Object.entries(specMap)) {
      const cur = row[k === "eeatNarrative" ? "eeatNarrative" : k];
      const isPlaceholder = k === "thc" || k === "cbd" ? (cur === "TBD") : false;
      if ((empty(cur) || isPlaceholder) && !empty(v) && v !== "TBD") specSets[k] = v;
    }
    const willSpec = Object.keys(specSets).length > 0;
    if (willSpec) { wouldSet.spec++; if (active) wouldSetActive.spec++; }

    if (EXECUTE) {
      if (Object.keys(sets).length) {
        const cols = Object.keys(sets);
        const vals = cols.map((k) => sets[k]);
        await c.query(
          `update "Product" set ${cols.map((k, i) => `"${k}"=$${i + 1}`).join(", ")} where id=$${cols.length + 1}`,
          [...vals, row.id]
        );
        writes++;
      }
      if (willSpec) {
        if (row.has_spec) {
          const cols = Object.keys(specSets);
          const vals = cols.map((k) => specSets[k]);
          await c.query(
            `update "ProductSpec" set ${cols.map((k, i) => `"${k}"=$${i + 1}`).join(", ")} where "productId"=$${cols.length + 1}`,
            [...vals, row.id]
          );
        } else {
          const cols = Object.keys(specSets);
          const vals = cols.map((k) => specSets[k]);
          await c.query(
            `insert into "ProductSpec" ("productId", ${cols.map((k) => `"${k}"`).join(", ")}) values ($1, ${cols.map((_, i) => `$${i + 2}`).join(", ")})`,
            [row.id, ...vals]
          );
        }
      }
    }
  }

  // How many ACTIVE storefront DB rows remain WITHOUT meta after the port?
  const EXCLUDED = new Set(["nicotine","sexual enhancement","enhancement pills","mushrooms","hookah","ijoy","geek bar","flavour beast","flying horse","lip rippers","euphoria psychedelics","her highness from the 6ix"]);
  const portedSlugs = new Set(pd.map((p) => p.slug).concat(pd.map((p) => stripCanada(p.slug))));
  const activeRows = db.filter((r) => r.status === "ACTIVE");
  const activeStorefront = activeRows.filter((r) => !EXCLUDED.has((r.name && "") || "") ); // category not in row here; approx via separate query below

  console.log(JSON.stringify({
    match: stat,
    wouldSet_all_statuses: wouldSet,
    wouldSet_ACTIVE_only: wouldSetActive,
    db_active_total: activeRows.length,
    unmatched_productData_sample: unmatched.slice(0, 25),
    unmatched_productData_count: unmatched.length,
    executed: EXECUTE,
    writes,
  }, null, 1));

  await c.end();
}
main().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
