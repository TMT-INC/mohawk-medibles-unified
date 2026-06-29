/**
 * Generate compliant SEO copy (metaDescription, shortDescription, longDescription)
 * for ACTIVE storefront products that still have no curated copy after the
 * productData port. Uses xAI Grok (grok-4.3). Writes ONLY empty text fields.
 *
 * COMPLIANCE: Canada Cannabis Act s17 prohibits therapeutic/health claims by a
 * recreational licensee. The system prompt forbids medical/therapeutic/health
 * claims; copy stays descriptive (flavour, aroma, potency, lineage, format).
 *
 * Usage (repo root, needs DATABASE_URL + GROK_API_KEY in env):
 *   node scripts/generate-thin-seo.mjs --limit 3          # generate+print 3, NO writes (review)
 *   node scripts/generate-thin-seo.mjs --execute          # generate+write ALL thin products
 *   node scripts/generate-thin-seo.mjs --execute --limit 20
 */
import { Client } from "pg";

const EXECUTE = process.argv.includes("--execute");
const li = process.argv.indexOf("--limit");
const LIMIT = li >= 0 ? parseInt(process.argv[li + 1], 10) : 0;
const CONCURRENCY = 4;
const MODEL = "grok-4.3";
const KEY = process.env.GROK_API_KEY;
const EXCLUDED = ["nicotine","sexual enhancement","enhancement pills","mushrooms","hookah","ijoy","geek bar","flavour beast","flying horse","lip rippers","euphoria psychedelics","her highness from the 6ix"];

const SYSTEM = `You write SEO product copy for Mohawk Medibles, an Indigenous-owned RECREATIONAL cannabis dispensary on Tyendinaga Mohawk Territory shipping Canada-wide.

HARD COMPLIANCE RULES (Canada Cannabis Act s.17 — a recreational licensee MUST NOT make therapeutic/health claims):
- NEVER claim or imply the product treats, relieves, cures, prevents, heals, or helps any symptom, condition, illness, pain, anxiety, insomnia, stress, inflammation, nausea, or "medical"/"therapeutic"/"medicinal"/"wellness benefit".
- NO health, medical, dosing-as-treatment, or "good for X condition" language. NO "relief", "remedy", "healing".
- Do NOT depict appeal to minors, no testimonials, no claims it's safe/healthy.
- Describe ONLY: flavour, aroma, terpene/strain profile, lineage, potency (THC/CBD as listed), format/size, craftsmanship, experience type (e.g. relaxing/uplifting are OK as recreational descriptors of the strain, NOT as treatment), Canada-wide shipping, Indigenous-owned, Tyendinaga.

Return STRICT JSON only, no markdown fences, with keys:
{"metaDescription": "<=158 chars, includes 'online in Canada' and the product name", "shortDescription": "1-2 sentences, <=220 chars", "longDescriptionHTML": "<p>..</p> 120-200 words, may use <p>,<ul>,<li>,<strong>,<h3>; product-descriptive only"}`;

function userPrompt(p) {
  return `Write SEO copy for this product:
Name: ${p.name}
Category: ${p.category}${p.subcategory ? " / " + p.subcategory : ""}
Price: $${p.price} CAD${p.thc && p.thc !== "." ? `\nTHC: ${p.thc}` : ""}${p.type ? `\nType: ${p.type}` : ""}
Return the JSON object only.`;
}

async function callGrok(p) {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userPrompt(p) }],
      temperature: 0.6,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(90000),
  });
  if (!res.ok) throw new Error(`grok ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const txt = data.choices?.[0]?.message?.content || "";
  const clean = txt.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(clean);
}

// crude banned-claim guard (defense-in-depth on top of the prompt)
const BANNED = /\b(cure|cures|cured|treat|treats|treating|treatment|heal|heals|healing|relief|relieve|relieves|relieving|remedy|therapeutic|medicinal|medical|pain|anxiety|insomnia|inflammation|nausea|arthritis|migraine|depression|ptsd)\b/i;
function flagClaims(o) {
  const blob = `${o.metaDescription} ${o.shortDescription} ${o.longDescriptionHTML}`;
  const m = blob.match(BANNED);
  return m ? m[0] : null;
}

async function main() {
  if (!KEY) throw new Error("GROK_API_KEY not set");
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const excl = EXCLUDED.map((_, i) => `$${i + 1}`).join(",");
  let rows = (await c.query(
    `select p.id, p.slug, p.name, p.category, p.subcategory, p.price, s.thc, s.type
       from "Product" p left join "ProductSpec" s on s."productId"=p.id
      where p.status='ACTIVE' and lower(p.category) not in (${excl})
        and (p."metaDescription" is null or p."metaDescription"='')
      order by p.price desc`, EXCLUDED)).rows;
  console.log(`thin active products: ${rows.length}`);
  if (LIMIT > 0) rows = rows.slice(0, LIMIT);

  let done = 0, failed = 0, flagged = 0;
  const samples = [];
  const queue = [...rows];
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const p = queue.shift();
      try {
        const o = await callGrok(p);
        const claim = flagClaims(o);
        if (claim) { flagged++; console.log(`  ⚠ claim "${claim}" in ${p.slug} — skipping write`); }
        if (samples.length < 6) samples.push({ slug: p.slug, name: p.name, ...o, _flag: claim });
        if (EXECUTE && !claim) {
          await c.query(
            `update "Product" set "metaDescription"=$1, "shortDescription"=$2, "longDescription"=coalesce(nullif("longDescription",''),$3) where id=$4`,
            [o.metaDescription, o.shortDescription, o.longDescriptionHTML, p.id]
          );
        }
        done++;
        if (done % 20 === 0) console.log(`  progress ${done}/${rows.length}`);
      } catch (e) {
        failed++;
        console.log(`  ✗ ${p.slug}: ${e.message}`);
      }
    }
  }));

  console.log(JSON.stringify({ generated: done, failed, flagged_claims: flagged, executed: EXECUTE, samples }, null, 1));
  await c.end();
}
main().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
