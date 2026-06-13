#!/usr/bin/env node
/**
 * Site Strain Library Generator
 * ═════════════════════════════
 * Builds data/strains/site-strains.json — the curated strain library that
 * powers /strains and /strains/[slug] (terpene-profile AEO pages).
 *
 * Sources (all local, no network):
 *   - data/strains/_index.json       47,806-strain index (terpenes/effects/type)
 *   - data/strains/chunk-*.json      full records (thc/cbd ranges, indica %, aliases)
 *   - data/strains/_merge-plan.json  authoritative product↔strain matches (54 products)
 *   - lib/productData.ts             full catalog (names/slugs/paths for product linking)
 *
 * Selection: EVERY strain in the index with terpene data (~10,600 of
 * 47,806 — the rest have no terpene profile to show). Product links come
 * from the merge plan (authoritative) plus guarded extended name matching.
 * Records are compact (no scraped descriptions, aliases only for
 * product-linked strains) so the committed JSON stays ~2 MB.
 *
 * Compliance: effects pass through a medical-claims blocklist (Health Canada
 * §17 — no therapeutic claims). Seed-bank scraped descriptions are NOT used.
 *
 * Run:  node scripts/generate-site-strains.mjs        (writes the JSON)
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STRAINS_DIR = resolve(ROOT, "data/strains");
const OUT_PATH = resolve(STRAINS_DIR, "site-strains.json");

// Words that look like strain names but are brand/venue collisions.
const NAME_BLOCKLIST = new Set(["mohawk", "medibles", "empire", "canada", "special"]);

// Extended matching only runs in categories where the product IS a strain.
// Edibles are flavor-named (Banana gummies ≠ Banana strain), accessories
// and mushrooms can never be strain-specific.
const STRAIN_BEARING_CATEGORIES = new Set(["Flower", "Concentrates", "Pre-Rolls", "Vapes"]);

// Brand phrases observed in the catalog that contain strain-looking words.
// If the matched strain name sits inside one of these in the product name,
// the match is the brand, not the strain ("Pineapple Express Meds" oils).
const BRAND_PHRASES = [
    "pineapple express meds", "pem", "cactus labs", "top shelf",
    "euphoria psychedelics", "stellar",
];

// Single generic color/fruit/flavor words that exist as strain names but
// produce flavor false-positives when standing alone. Multi-word names
// containing them ("Banana Sherbert") still match.
const GENERIC_SINGLE_WORDS = new Set([
    "purple", "banana", "strawberry", "pineapple", "cherry", "grape",
    "orange", "lemon", "mango", "blueberry", "watermelon", "peach",
    "apple", "berry", "tropical", "cookies", "cream", "sugar", "candy",
    "gold", "silver", "diamond", "platinum", "cactus", "afghan", "original",
]);

// Health Canada §17 — strip anything that reads as a therapeutic claim.
const MEDICAL_EFFECT_BLOCKLIST = new Set([
    "Pain Relief", "Pain", "Anxiety", "Stress", "Insomnia", "Depression",
    "Nausea", "Seizures", "Arthritis", "Migraines", "Cramps", "Inflammation",
]);

// Normalize near-duplicate effect labels to their canonical form.
const EFFECT_CANON = {
    Euphoria: "Euphoric", Calming: "Calm", Relaxing: "Relaxed",
    Energizing: "Energetic", Uplifting: "Uplifted", Focus: "Focused",
};

function norm(s) {
    return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

// ─── Load sources ────────────────────────────────────────────

const index = JSON.parse(readFileSync(resolve(STRAINS_DIR, "_index.json"), "utf8")).strains;
// _merge-plan.json ships with the strain-merge PR; when absent (e.g. that
// branch not merged yet) we fall back to extended name matching only.
let plan = { plan: [], needsReview: [] };
try {
    plan = JSON.parse(readFileSync(resolve(STRAINS_DIR, "_merge-plan.json"), "utf8"));
} catch {
    console.warn("[warn] _merge-plan.json not found — extended matching only");
}

// Extract the PRODUCTS literal out of lib/productData.ts (pure JSON body).
const productDataSrc = readFileSync(resolve(ROOT, "lib/productData.ts"), "utf8");
// Anchor on the assignment so the `[` in the `Product[]` type annotation
// doesn't trip the extractor.
const arrStart = productDataSrc.indexOf("[", productDataSrc.indexOf("=", productDataSrc.indexOf("PRODUCTS")));
// The array terminator is the first "\n];" after the opener (helper code
// further down the file also contains "]").
const arrEnd = productDataSrc.indexOf("\n];", arrStart);
const PRODUCTS = JSON.parse(productDataSrc.slice(arrStart, arrEnd + 2));
console.log(`[load] ${Object.keys(index).length} strains · ${PRODUCTS.length} products · ${plan.plan.length} plan matches`);

// Strain slug → index entry; build a name-keyed lookup for extended matching.
const needsReviewSlugs = new Set(plan.needsReview.map((r) => r.productSlug));
const planByStrain = new Map(); // strainSlug -> [{productSlug,...}]
for (const item of plan.plan) {
    if (!planByStrain.has(item.strainSlug)) planByStrain.set(item.strainSlug, []);
    planByStrain.get(item.strainSlug).push(item.productSlug);
}

// name/alias (normalized) → strain slug. Multi-word or ≥6 chars only.
const nameToSlug = new Map();
for (const [slug, s] of Object.entries(index)) {
    const candidates = [s.name];
    for (const cand of candidates) {
        const n = norm(cand);
        if (!n || NAME_BLOCKLIST.has(n)) continue;
        const words = n.split(" ");
        if (words.length === 1 && n.length < 6) continue;
        if (words.some((w) => NAME_BLOCKLIST.has(w)) && words.length === 1) continue;
        // Prefer the more popular strain when names collide.
        const existing = nameToSlug.get(n);
        if (!existing || (index[existing].popularityScore || 0) < (s.popularityScore || 0)) {
            nameToSlug.set(n, slug);
        }
    }
}

// ─── 1+2. Product-matched strains ───────────────────────────

const productsByStrain = new Map(); // strainSlug -> Set(productSlug)
const addMatch = (strainSlug, productSlug) => {
    if (!productsByStrain.has(strainSlug)) productsByStrain.set(strainSlug, new Set());
    productsByStrain.get(strainSlug).add(productSlug);
};

// Authoritative plan matches first.
for (const item of plan.plan) addMatch(item.strainSlug, item.productSlug);

// Extended word-boundary scan over strain-bearing categories.
// Longest-match-wins: "Amnesia Haze $5/Gram" links to Amnesia Haze, never
// to the shorter "Amnesia" as well.
const productBySlug = new Map(PRODUCTS.map((p) => [p.slug, p]));
const planProductSlugs = new Set(plan.plan.map((i) => i.productSlug));
let extended = 0;
for (const p of PRODUCTS) {
    if (needsReviewSlugs.has(p.slug)) continue; // human-parked — stay parked
    if (planProductSlugs.has(p.slug)) continue; // plan match is authoritative
    if (!STRAIN_BEARING_CATEGORIES.has(p.category)) continue;
    const pn = ` ${norm(p.name)} `;
    const hits = [];
    for (const [n, strainSlug] of nameToSlug) {
        if (n.split(" ").length === 1 && GENERIC_SINGLE_WORDS.has(n)) continue;
        if (!pn.includes(` ${n} `)) continue;
        // Brand guard: the strain words actually belong to a brand phrase.
        if (BRAND_PHRASES.some((b) => b.includes(n) && pn.includes(` ${b} `))) continue;
        hits.push({ n, strainSlug });
    }
    if (!hits.length) continue;
    const maxLen = Math.max(...hits.map((h) => h.n.length));
    for (const h of hits.filter((x) => x.n.length === maxLen)) {
        addMatch(h.strainSlug, p.slug);
        extended++;
    }
}
console.log(`[match] ${productsByStrain.size} distinct strains across catalog (+${extended} extended product links)`);

// ─── 3. Build entries + popularity top-up ────────────────────

function cleanEffects(effects) {
    // Chunk effects are {name, intensity} objects (index flattened them to
    // strings) — normalize FIRST or the §17 blocklist silently never matches.
    const named = (effects || [])
        .map((e) => (typeof e === "string" ? { name: e, intensity: 0 } : { name: e?.name, intensity: e?.intensity || 0 }))
        .filter((e) => e.name)
        .sort((a, b) => b.intensity - a.intensity);
    const out = [];
    for (const { name } of named) {
        if (MEDICAL_EFFECT_BLOCKLIST.has(name)) continue;
        const c = EFFECT_CANON[name] || name;
        if (!out.includes(c)) out.push(c);
    }
    return out;
}

// ─── Build entries: EVERY terpene-bearing strain from the chunks ──────

const entries = new Map();
const chunkFiles = readdirSync(STRAINS_DIR).filter((f) => /^chunk-\d+\.json$/.test(f));
for (const f of chunkFiles) {
    let arr;
    try {
        arr = JSON.parse(readFileSync(resolve(STRAINS_DIR, f), "utf8"));
    } catch {
        continue;
    }
    for (const rec of Array.isArray(arr) ? arr : Object.values(arr)) {
        if (!rec.terpenes?.length || !rec.slug || entries.has(rec.slug)) continue;
        const effects = cleanEffects(rec.effects);
        const products = [...(productsByStrain.get(rec.slug) || [])]
            .map((ps) => productBySlug.get(ps))
            .filter(Boolean)
            .map((p) => ({
                slug: p.slug,
                name: p.name,
                path: p.path || `/shop/${p.slug}`,
                category: p.category,
                price: p.price ?? null,
            }));
        // Terpenes arrive as {name, level: high|medium|low} — keep the
        // level (dominance) and sort high→low so terpenes[0] is dominant.
        const LEVEL_RANK = { high: 0, medium: 1, low: 2 };
        const terpenes = rec.terpenes
            .map((t) => (typeof t === "string" ? { name: t } : { name: t?.name, ...(t?.level ? { level: t.level } : {}) }))
            .filter((t) => t.name)
            .sort((a, b) => (LEVEL_RANK[a.level] ?? 3) - (LEVEL_RANK[b.level] ?? 3));
        if (!terpenes.length) continue;

        // Compact record — omit null/empty fields so the committed JSON for
        // 10k+ strains stays small. (No scraped descriptions, no
        // medicalUses — §17; aliases only for strains that carry products.)
        const e = { slug: rec.slug, name: rec.name, type: rec.type || "HYBRID", terpenes, effects, products };
        if (rec.thcMin != null) e.thcMin = rec.thcMin;
        if (rec.thcMax != null) e.thcMax = rec.thcMax;
        if (rec.cbdMax != null) e.cbdMax = rec.cbdMax;
        if (rec.indicaPercent != null) e.indicaPercent = rec.indicaPercent;
        if (rec.sativaPercent != null) e.sativaPercent = rec.sativaPercent;
        if (typeof rec.lineage === "string" && rec.lineage.trim()) e.lineage = rec.lineage.slice(0, 120);
        const flavors = (rec.flavors || []).map((x) => x?.name).filter(Boolean).slice(0, 5);
        if (flavors.length) e.flavors = flavors;
        if (products.length > 0 && rec.aliases?.length) e.aliases = rec.aliases.slice(0, 4);
        if (rec.popularityScore) e.popularityScore = rec.popularityScore;
        entries.set(rec.slug, e);
    }
}
console.log(`[build] ${entries.size} terpene-bearing strains from ${chunkFiles.length} chunks`);

// Deterministic order: product-linked first, then popularity, then slug —
// the /strains index features the head of this list.
const all = [...entries.values()];
all.sort((a, b) => b.products.length - a.products.length || (b.popularityScore || 0) - (a.popularityScore || 0) || a.slug.localeCompare(b.slug));

// NOTE: "similar strains" are computed at request time in lib/strains.ts
// via terpene bitmasks — precomputing 4 slugs × 10k strains would add
// ~600 KB to the JSON for no quality gain.

const out = {
    generatedAt: new Date().toISOString(),
    total: all.length,
    withProducts: all.filter((e) => e.products.length > 0).length,
    strains: all,
};
writeFileSync(OUT_PATH, JSON.stringify(out));
console.log(`[done] ${out.total} strains (${out.withProducts} linked to products) → ${OUT_PATH}`);
