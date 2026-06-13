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
 * Selection:
 *   1. Every strain matched to a product by the merge plan (authoritative).
 *   2. Extended word-boundary name matches across the full catalog
 *      (multi-word or ≥6-char names only; needs-review products excluded —
 *      same human-review outcome as the merge plan; brand-word blocklist).
 *   3. Top-up by popularityScore until TARGET strains, requiring ≥3 terpenes
 *      AND ≥2 effects so every page has a real terpene profile.
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
const TARGET = 72; // comfortably past the "60+ strains" goal

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
    const out = [];
    for (const e of effects || []) {
        if (MEDICAL_EFFECT_BLOCKLIST.has(e)) continue;
        const c = EFFECT_CANON[e] || e;
        if (!out.includes(c)) out.push(c);
    }
    return out;
}

const chunkCache = new Map();
function fullRecord(slug) {
    const entry = index[slug];
    if (!entry?.chunk) return null;
    if (!chunkCache.has(entry.chunk)) {
        try {
            chunkCache.set(entry.chunk, JSON.parse(readFileSync(resolve(STRAINS_DIR, entry.chunk), "utf8")));
        } catch {
            chunkCache.set(entry.chunk, []);
        }
    }
    const arr = chunkCache.get(entry.chunk);
    return (Array.isArray(arr) ? arr : Object.values(arr)).find((r) => r.slug === slug) || null;
}

function buildEntry(slug) {
    const s = index[slug];
    if (!s) return null;
    const terpenes = s.terpenes || [];
    const effects = cleanEffects(s.effects);
    if (terpenes.length === 0) return null; // it's a terpene library
    const rec = fullRecord(slug) || {};
    const products = [...(productsByStrain.get(slug) || [])]
        .map((ps) => productBySlug.get(ps))
        .filter(Boolean)
        .map((p) => ({
            slug: p.slug,
            name: p.name,
            path: p.path || `/shop/${p.slug}`,
            category: p.category,
            price: p.price ?? null,
        }));
    return {
        slug,
        name: s.name,
        type: s.type || "HYBRID",
        thcMin: rec.thcMin ?? null,
        thcMax: rec.thcMax ?? s.thcMax ?? null,
        cbdMax: rec.cbdMax ?? s.cbdMax ?? null,
        indicaPercent: rec.indicaPercent ?? null,
        sativaPercent: rec.sativaPercent ?? null,
        aliases: (rec.aliases || []).slice(0, 4),
        popularityScore: s.popularityScore || 0,
        terpenes,
        effects,
        products,
    };
}

const entries = new Map();
// Product-matched strains first (any terpene count ≥1).
for (const slug of productsByStrain.keys()) {
    const e = buildEntry(slug);
    if (e) entries.set(slug, e);
}
console.log(`[build] ${entries.size} product-matched strains with terpene data`);

// Drop product-matched entries that lost every product to a longer match
// AND whose name is a substring of an included strain (e.g. "Amnesia" when
// "Amnesia Haze" carries the product) — duplicate thin pages help nobody.
for (const [slug, e] of [...entries]) {
    if (e.products.length > 0) continue;
    const n = norm(e.name);
    const shadowed = [...entries.values()].some(
        (o) => o.slug !== slug && o.products.length > 0 && norm(o.name).includes(n)
    );
    if (shadowed) entries.delete(slug);
}

// Top-up by popularity with strict quality bar. Skip names that duplicate
// (substring either way) a strain already in the library.
if (entries.size < TARGET) {
    const ranked = Object.entries(index)
        .filter(([slug, s]) =>
            !entries.has(slug) &&
            (s.terpenes?.length || 0) >= 3 &&
            (s.effects?.length || 0) >= 2 &&
            (s.popularityScore || 0) > 0 &&
            !NAME_BLOCKLIST.has(norm(s.name)))
        .sort((a, b) => (b[1].popularityScore || 0) - (a[1].popularityScore || 0));
    for (const [slug, s] of ranked) {
        if (entries.size >= TARGET) break;
        const n = norm(s.name);
        const dup = [...entries.values()].some((o) => {
            const on = norm(o.name);
            return on.includes(n) || n.includes(on);
        });
        if (dup) continue;
        const e = buildEntry(slug);
        if (e) entries.set(slug, e);
    }
}

// ─── Similar strains by terpene-profile overlap ──────────────

const all = [...entries.values()];
for (const e of all) {
    const mine = new Set(e.terpenes);
    e.similar = all
        .filter((o) => o.slug !== e.slug)
        .map((o) => {
            const shared = o.terpenes.filter((t) => mine.has(t)).length;
            const union = new Set([...o.terpenes, ...e.terpenes]).size;
            return {
                slug: o.slug,
                jaccard: union ? shared / union : 0,
                typeBonus: o.type === e.type ? 0.1 : 0,
                pop: o.popularityScore || 0,
            };
        })
        .sort((a, b) => (b.jaccard + b.typeBonus) - (a.jaccard + a.typeBonus) || b.pop - a.pop)
        .slice(0, 4)
        .map((x) => x.slug);
}

// Deterministic order: products first (by product count, then popularity).
all.sort((a, b) => b.products.length - a.products.length || b.popularityScore - a.popularityScore || a.slug.localeCompare(b.slug));

const out = {
    generatedAt: new Date().toISOString(),
    total: all.length,
    withProducts: all.filter((e) => e.products.length > 0).length,
    strains: all,
};
writeFileSync(OUT_PATH, JSON.stringify(out, null, 1));
console.log(`[done] ${out.total} strains (${out.withProducts} linked to products) → ${OUT_PATH}`);
