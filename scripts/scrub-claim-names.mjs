/**
 * Cannabis Act s.17 compliance: strip therapeutic/health-claim words from
 * storefront product NAMES (which render in titles, breadcrumbs, meta, schema).
 * Display name + altText only — slugs/URLs unchanged. Also blanks metaDescription/
 * shortDescription on any renamed row so the compliant Grok generator regenerates
 * copy that matches the cleaned name.
 *
 *   node scripts/scrub-claim-names.mjs            # dry run
 *   node scripts/scrub-claim-names.mjs --execute
 */
import { Client } from "pg";
const EXECUTE = process.argv.includes("--execute");
const EXCLUDED = new Set(["nicotine","sexual enhancement","enhancement pills","mushrooms","hookah","ijoy","geek bar","flavour beast","flying horse","lip rippers","euphoria psychedelics","her highness from the 6ix"]);
const OFF = /(nicotine|\bkraze\b)/i;

// Claim words/phrases to remove from a product NAME.
const CLAIM = /\b(pain[\s-]*relief|pain[\s-]*reliever|relief|relieve|relieving|healing|heals?|therapeutic|medicinal|medical|cures?|treatment|anti[\s-]*inflammatory|anxiety|insomnia|arthritis|migraine)\b/gi;

function scrub(name) {
  let s = name.replace(CLAIM, "");
  s = s.replace(/\s{2,}/g, " ")          // collapse spaces
       .replace(/\s+([-–—])\s*$/g, "")   // trailing dangling dash
       .replace(/^\s*[-–—]\s+/g, "")      // leading dangling dash
       .replace(/\(\s*\)/g, "")           // empty parens
       .replace(/\s+-\s+-\s+/g, " - ")
       .replace(/\s{2,}/g, " ")
       .trim();
  return s;
}

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const excl = [...EXCLUDED].map((_, i) => `$${i + 1}`).join(",");
  const rows = (await c.query(
    `select id, slug, name, "altText" from "Product"
      where status='ACTIVE' and lower(category) not in (${excl})`, [...EXCLUDED])).rows;
  const hits = rows.filter((r) => !OFF.test(r.name) && CLAIM.test(r.name)).map((r) => {
    CLAIM.lastIndex = 0; // reset global regex state
    return { ...r, newName: scrub(r.name) };
  });
  console.log(`claim-name products: ${hits.length}`);
  for (const h of hits) console.log(`  "${h.name}"\n   -> "${h.newName}"`);

  if (EXECUTE) {
    let n = 0;
    for (const h of hits) {
      if (!h.newName || h.newName === h.name) continue;
      const newAlt = (h.altText || "").replace(CLAIM, "").replace(/\s{2,}/g, " ").trim();
      CLAIM.lastIndex = 0;
      await c.query(
        `update "Product" set name=$1, "altText"=$2, "metaDescription"='', "shortDescription"='', "updatedAt"=now() where id=$3`,
        [h.newName, newAlt, h.id]
      );
      n++;
    }
    console.log(`\nRENAMED=${n} (meta blanked → re-run generate-thin-seo.mjs --execute)`);
  }
  await c.end();
}
main().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
