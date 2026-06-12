#!/usr/bin/env node
/**
 * Mohawk Medibles — Strain → Product Daily Merge Engine
 * =====================================================
 * Merges the 47,809-record strain encyclopedia (data/strains/) into live
 * Neon `ProductSpec` rows — gradually, additively, and Google-safely.
 *
 * Match pipeline:  exact/alias/n-gram  →  fuzzy (token similarity)  →
 *                  AI adjudication (LOCAL Ollama qwen2.5:3b, 127.0.0.1:11434)
 *
 * SEO-SAFETY HARD RULES (do not relax):
 *   1. ADDITIVE ONLY — writes ONLY to ProductSpec columns in ALLOWED_SPEC_FIELDS
 *      and ONLY when the existing value is NULL/empty. Never rewrites product
 *      titles, slugs, meta descriptions, longDescription, or schema.org types.
 *   2. MAX_LIMIT = 25 products per run, hard-clamped. Default 12/day.
 *   3. Deterministic batch order (stable sort by product slug, id tiebreak)
 *      so every daily batch is predictable and resumable.
 *   4. Idempotent via the strain_merge_ledger table — a product is enriched
 *      exactly once; re-runs skip ledgered products.
 *   5. POTENCY GUARD (verifier fix 2026-06-11) — strain thc/cbd are FLOWER
 *      percentages. They are only written to Flower/Pre-Rolls products
 *      (concentrates run 60-90%, edibles are dosed in mg — flower % would be
 *      factually wrong on those pages). Values are also sanity-checked:
 *      impossible (thc 200%) or chemotype-contradictory (cbd 25% on a
 *      25%-THC strain) encyclopedia data is dropped, never written.
 *
 * Modes:
 *   (default)      --dry-run : print the next batch plan. WRITES NOTHING.
 *   --apply                  : write batch to Neon ProductSpec + ledger.
 *   --write-plan             : regenerate data/strains/_merge-plan.json
 *                              (consumed by app/api/cron/strain-merge).
 *   --status                 : ledger progress / match stats / last run.
 *   --limit N                : batch size (default 12, clamped to 25).
 *   --no-ai                  : skip Ollama adjudication tier.
 *
 * DATABASE_URL resolution: env var first, then .env.production.local
 * (the repo's .env points at localhost — real Neon lives in production.local).
 * Secret values are NEVER printed.
 *
 * PIPEDA: product/strain catalog data is public, non-PII. The only LLM used
 * is local Ollama on this Mac (Canadian soil). No PII leaves Canada.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const STRAINS_DIR = resolve(PROJECT_ROOT, 'data/strains');
const INDEX_FILE = resolve(STRAINS_DIR, '_index.json');
const PLAN_FILE = resolve(STRAINS_DIR, '_merge-plan.json');

// ─── Hard limits (SEO safety) ───────────────────────────────
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 25; // hard clamp — never exceed, regardless of flags
// The ONLY columns this engine is allowed to write. Anything else
// (name, slug, metaDescription, longDescription, ...) is off-limits.
const ALLOWED_SPEC_FIELDS = ['thc', 'cbd', 'type', 'terpenes', 'lineage', 'eeatNarrative'];

const CANNABIS_CATEGORIES = [
    'Flower', 'Concentrates', 'Edibles', 'Vapes', 'Disposables', 'Pre-Rolls',
    'Infused Pre-Rolls', 'Cartridges', 'CBD', 'Capsules', 'THC', 'Baked Goods',
];

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

// ─── CLI args ───────────────────────────────────────────────
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const WRITE_PLAN = args.includes('--write-plan');
const STATUS = args.includes('--status');
const NO_AI = args.includes('--no-ai');
const limitIdx = args.indexOf('--limit');
let LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : DEFAULT_LIMIT;
if (!Number.isFinite(LIMIT) || LIMIT < 1) LIMIT = DEFAULT_LIMIT;
if (LIMIT > MAX_LIMIT) {
    console.log(`[clamp] --limit ${LIMIT} exceeds hard max; clamped to ${MAX_LIMIT}`);
    LIMIT = MAX_LIMIT;
}

// ─── DATABASE_URL resolution (never printed) ────────────────
function resolveDatabaseUrl() {
    let url = process.env.DATABASE_URL;
    const isLocal = (u) => !u || u.includes('localhost') || u.includes('127.0.0.1');
    if (isLocal(url)) {
        for (const f of ['.env.production.local', '.env.local']) {
            const p = resolve(PROJECT_ROOT, f);
            if (!existsSync(p)) continue;
            const m = readFileSync(p, 'utf-8').match(/^DATABASE_URL\s*=\s*"?([^"\n]+)"?/m);
            if (m && !isLocal(m[1])) { url = m[1].trim(); break; }
        }
    }
    if (isLocal(url)) {
        console.error('No remote DATABASE_URL found (env or .env.production.local). Aborting.');
        process.exit(1);
    }
    return url;
}

// ─── Normalization (ported from pull-strains.mjs --match) ───
const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const STOP_TOKENS = new Set([
    'og', 'kush', 'haze', 'cake', 'jack', 'sour', 'sweet', 'cookies', 'cookie',
    'gelato', 'runtz', 'sherbet', 'sherbert', 'pie', 'cream', 'punch', 'glue',
    'crack', 'mac', 'gas', 'fire', 'rocks', 'breath', 'rose', 'fuel', 'star',
    'cheese', 'diesel', 'mist', 'goo', 'bud', 'shelf', 'melt', 'temple',
    'cherry', 'lemon', 'orange', 'apple', 'mint', 'banana', 'mango', 'grape',
    'berry', 'chocolate', 'vanilla', 'caramel', 'milk', 'tequila', 'wine',
    'pink', 'purple', 'green', 'blue', 'white', 'black', 'red', 'gold', 'silver',
    'diamonds', 'shatter', 'rosin', 'distillate', 'badder', 'budder', 'sauce',
    'hash', 'kief', 'live', 'cured', 'thca', 'thc', 'cbd', 'cbn', 'cbg', 'delta',
    'kabul', 'moroccan', 'turkish', 'turkey', 'lebanese', 'afghan', 'pakistani',
    'horseman', 'starburst',
    'dream', 'wreck', 'magic', 'special', 'craft',
    'euphoria', 'drizzle', 'stellar', 'stoned', 'asend', 'zillionaire', 'dozo',
    'zahara', 'wesley', 'hashwood', 'afg', 'medibles',
    // Flavour/format words added after live-Neon false-positive audit 2026-06-11
    'strawberry', 'pineapple', 'watermelon', 'blueberry', 'raspberry', 'kiwi',
    'peach', 'honey', 'gummies', 'gummy', 'candy',
]);

// Encyclopedia entries that are generic descriptors, never a valid match target.
const GENERIC_STRAIN_NAMES = new Set(['indica', 'sativa', 'hybrid', 'thc', 'cbd', 'og', 'kush', 'hash']);

// Fuzzy + AI tiers only run on categories where product names ARE strain names.
// Edibles/CBD/Capsules are flavour-named — fuzzy matching there creates
// false positives (e.g. chocolate bars matching dessert strains).
const FUZZY_AI_CATEGORIES = new Set([
    'Flower', 'Concentrates', 'Pre-Rolls', 'Infused Pre-Rolls',
    'Vapes', 'Cartridges', 'Disposables',
]);

// Strain thc/cbd are FLOWER potency percentages. Only these categories may
// receive them — concentrates/vapes run 60-90% and edibles are mg-dosed,
// so flower % on those product pages would be factually wrong.
const POTENCY_OK_CATEGORIES = new Set(['Flower', 'Pre-Rolls']);

const STRONG_SINGLES = new Set([
    'biscotti', 'gushers', 'zkittlez', 'zkittles', 'tangie', 'chemdawg',
    'trainwreck', 'skywalker', 'mimosa', 'wifi',
]);

const STOP_NGRAMS = new Set([
    'delta 9', 'delta 8', 'full melt', 'live resin', 'live rosin',
    'top shelf', 'hot chocolate', 'ice cream', 'whipped cream',
    'thc bomb', 'cbd oil', 'shatter bar', 'shatter bars',
    // Fix from live-Neon audit 2026-06-11: "STELLAR THC Dark Chocolate Bar"
    // falsely matched strain "dark-chocolate". Flavour phrase, not a strain.
    'dark chocolate', 'milk chocolate', 'white chocolate', 'dark chocolate bar',
    'wine hash',
]);

const ALIASES = [
    ['mac', 'miracle-alien-cookies'],
    ['gsc', 'girl-scout-cookies'],
    ['gg4', 'gorilla-glue-4'],
    ['gdp', 'granddaddy-purple'],
    ['lcg', 'lemon-cherry-gelato'],
    ['wcake', 'wedding-cake'],
    ['gmo', 'gmo-cookies'],
    ['rs11', 'rainbow-sherbet-11'],
];

function cleanProductName(productName) {
    return normalize(
        productName
            .replace(/mohawk\s*medibles/gi, ' ')
            .replace(/\$[\d.]+\s*\/?\s*(g|gram|grams|oz|ml|mg|each|deal|special)?/gi, ' ')
            .replace(/\b\d+\s*(g|gram|grams|oz|ml|mg|mL|MG)\b/gi, ' ')
            .replace(/\b(premium|special|sale|aaaa|craft|exotic|deal|canada|smalls)\b/gi, ' ')
    );
}

// ─── Tier 1: exact / alias / n-gram ─────────────────────────
function exactMatch(tokens, index, ngramMap) {
    for (const [alias, slug] of ALIASES) {
        if (tokens.includes(alias) && index[slug]) return { slug, method: 'alias' };
    }
    for (const n of [4, 3, 2]) {
        for (let i = 0; i + n <= tokens.length; i++) {
            const phrase = tokens.slice(i, i + n).join(' ');
            if (STOP_NGRAMS.has(phrase)) continue;
            if (ngramMap.has(phrase)) return { slug: ngramMap.get(phrase), method: `ngram${n}` };
        }
    }
    // Joined 2-gram: "Candy Land" → strain "Candyland" (audit fix 2026-06-11)
    for (let i = 0; i + 2 <= tokens.length; i++) {
        const joined = tokens[i] + tokens[i + 1];
        if (GENERIC_STRAIN_NAMES.has(joined)) continue;
        if (ngramMap.has(joined)) return { slug: ngramMap.get(joined), method: 'joined2' };
    }
    for (const t of tokens) {
        if (!STRONG_SINGLES.has(t) || STOP_TOKENS.has(t)) continue;
        if (ngramMap.has(t)) return { slug: ngramMap.get(t), method: 'single' };
    }
    return null;
}

// ─── Tier 2: fuzzy (token Dice + bigram similarity) ─────────
function bigrams(s) {
    const out = new Set();
    const t = s.replace(/ /g, '');
    for (let i = 0; i < t.length - 1; i++) out.add(t.slice(i, i + 2));
    return out;
}

function diceCoeff(aSet, bSet) {
    if (aSet.size === 0 || bSet.size === 0) return 0;
    let inter = 0;
    for (const x of aSet) if (bSet.has(x)) inter++;
    return (2 * inter) / (aSet.size + bSet.size);
}

function fuzzyCandidates(tokens, tokenInvIndex, index) {
    // Gather candidate strains sharing >=1 distinctive token, score them.
    const candSlugs = new Set();
    for (const t of tokens) {
        if (STOP_TOKENS.has(t) || t.length < 4) continue;
        const slugs = tokenInvIndex.get(t);
        if (slugs) for (const s of slugs) { candSlugs.add(s); if (candSlugs.size > 400) break; }
    }
    const allProdTokens = new Set(tokens);
    const distinctiveProdTokens = new Set(tokens.filter((t) => !STOP_TOKENS.has(t)));
    const prodBigrams = bigrams([...distinctiveProdTokens].join(' '));
    const scored = [];
    for (const slug of candSlugs) {
        const strainNorm = normalize(index[slug].name);
        if (GENERIC_STRAIN_NAMES.has(strainNorm)) continue; // "Indica", "Sativa", ... never valid
        const strainTokens = [...new Set(strainNorm.split(' ').filter(Boolean))];
        // Strain tokens must be (mostly) contained in the product name —
        // a product is "strain + format noise", never the reverse.
        let contained = 0;
        for (const st of strainTokens) if (allProdTokens.has(st)) contained++;
        const containment = contained / strainTokens.length;
        if (containment < 0.5) continue;
        const score =
            0.6 * containment +
            0.4 * diceCoeff(prodBigrams, bigrams(strainNorm));
        scored.push({
            slug,
            name: index[slug].name,
            score: Math.round(score * 1000) / 1000,
            containment,
            strainTokens,
        });
    }
    scored.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));
    return scored.slice(0, 5);
}

// Deterministic evidence guard applied to fuzzy auto-accepts AND AI verdicts.
// A match is strong evidence only when:
//   - every distinctive (non-stop) strain token appears in the product name,
//   - matched tokens cover >= 60% of ALL strain tokens,
//   - single-token strain names need a coined/distinctive token (>= 8 chars,
//     not a stop word) — common words ("volcano", "strawberry") go to review.
function evidenceGuard(cand, allProdTokens) {
    const distinctive = cand.strainTokens.filter((t) => !STOP_TOKENS.has(t));
    if (distinctive.length === 0) return 'reject';
    for (const t of distinctive) if (!allProdTokens.has(t)) return 'reject';
    const matchedAll = cand.strainTokens.filter((t) => allProdTokens.has(t)).length;
    if (matchedAll / cand.strainTokens.length < 0.6) return 'reject';
    if (cand.strainTokens.length === 1) {
        const t = cand.strainTokens[0];
        return t.length >= 8 && !STOP_TOKENS.has(t) ? 'strong' : 'weak';
    }
    return 'strong';
}

// ─── Tier 3: AI adjudication via LOCAL Ollama ───────────────
async function ollamaAvailable() {
    try {
        const r = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(2000) });
        if (!r.ok) return false;
        const j = await r.json();
        return (j.models || []).some((m) => m.name === OLLAMA_MODEL);
    } catch { return false; }
}

async function adjudicate(productName, candidates) {
    const list = candidates.map((c, i) => `${i + 1}. ${c.name} (slug: ${c.slug})`).join('\n');
    const prompt = `You match cannabis store product names to strain encyclopedia entries.

Product name: "${productName}"

Candidate strains:
${list}

Rules:
- Pick a candidate ONLY if the product is clearly that strain (the strain name appears in the product name, allowing abbreviations/typos).
- Brand names, flavours (e.g. "dark chocolate"), hash types, and hardware are NOT strains — answer NONE.
- If unsure, answer NONE.

Respond with ONLY JSON: {"slug": "<candidate-slug-or-NONE>"}`;
    try {
        const r = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: false,
                format: 'json',
                options: { temperature: 0, seed: 42, num_predict: 60 },
            }),
            signal: AbortSignal.timeout(30000),
        });
        if (!r.ok) return null;
        const j = await r.json();
        const parsed = JSON.parse(j.response || '{}');
        const slug = (parsed.slug || '').trim();
        if (!slug || slug.toUpperCase() === 'NONE') return null;
        return candidates.find((c) => c.slug === slug) ? slug : null;
    } catch { return null; }
}

// ─── Strain record loader (full record from chunk) ──────────
const chunkCache = new Map();
function fullStrainRecord(slug, indexEntry) {
    const chunkFile = indexEntry.chunk;
    if (!chunkCache.has(chunkFile)) {
        chunkCache.set(chunkFile, JSON.parse(readFileSync(resolve(STRAINS_DIR, chunkFile), 'utf-8')));
    }
    const chunk = chunkCache.get(chunkFile);
    const arr = Array.isArray(chunk) ? chunk : chunk.strains || chunk.data || [];
    return arr.find((s) => s.slug === slug) || null;
}

// ─── Field builders (strain record → ProductSpec values) ────
function titleCaseType(t) {
    if (!t) return null;
    const map = { INDICA: 'Indica', SATIVA: 'Sativa', HYBRID: 'Hybrid', CBD: 'CBD' };
    return map[t.toUpperCase()] || null;
}

function pctRange(min, max) {
    if (max == null && min == null) return null;
    if (min != null && max != null && min !== max) return `${min}-${max}%`;
    return `${max ?? min}%`;
}

function buildSpecFields(strain, indexEntry) {
    const fields = {};
    const thc = pctRange(strain?.thcMin ?? null, strain?.thcMax ?? indexEntry.thcMax ?? null);
    const cbd = pctRange(strain?.cbdMin ?? null, strain?.cbdMax ?? indexEntry.cbdMax ?? null);
    const type = titleCaseType(strain?.type || indexEntry.type);
    const terpeneNames = (strain?.terpenes || []).map((t) => (typeof t === 'string' ? t : t.name)).filter(Boolean);
    const idxTerpenes = (indexEntry.terpenes || []).filter(Boolean);
    const terpenes = terpeneNames.length ? terpeneNames : idxTerpenes;
    if (thc) fields.thc = thc;
    if (cbd) fields.cbd = cbd;
    if (type) fields.type = type;
    if (terpenes.length) fields.terpenes = JSON.stringify(terpenes); // schema: JSON array stored as string
    if (strain?.lineage) fields.lineage = String(strain.lineage).slice(0, 300);
    if (strain?.description) fields.eeatNarrative = String(strain.description).slice(0, 2000);
    // effects[] have no ProductSpec column — they surface via the linked
    // /strains/[slug] page (cross-link already wired in ProductDetailClient).
    return fields;
}

// ─── Potency guard (verifier fix 2026-06-11) ────────────────
// Strain thc/cbd are flower percentages and the encyclopedia contains bad
// rows (thc "200%", cbd "25%" on 25%-THC strains — value swapped). This
// guard (a) restricts thc/cbd to POTENCY_OK_CATEGORIES and (b) drops
// implausible values. Mutates and returns `fields`.
function parsePctMax(v) {
    const m = String(v).match(/([\d.]+)%$/);
    return m ? parseFloat(m[1]) : NaN;
}

function applyPotencyGuards(fields, category) {
    const thcMax = 'thc' in fields ? parsePctMax(fields.thc) : NaN;
    const cbdMax = 'cbd' in fields ? parsePctMax(fields.cbd) : NaN;
    if (!POTENCY_OK_CATEGORIES.has(category)) {
        delete fields.thc;
        delete fields.cbd;
        return fields;
    }
    // THC: flower-plausible window only (drops 200% garbage and <5% rows
    // that contradict a THC-dominant strain, e.g. Kandy Kush "1.27%").
    if ('thc' in fields && !(thcMax >= 5 && thcMax <= 35)) delete fields.thc;
    // CBD: cap at 30%, and drop chemotype contradictions — a strain cannot
    // be 10%+ THC AND 5%+ CBD in this catalog (those rows are data errors).
    if ('cbd' in fields && !(cbdMax >= 0 && cbdMax <= 30)) delete fields.cbd;
    if ('cbd' in fields && cbdMax > 5 && thcMax > 10) delete fields.cbd;
    return fields;
}

// ─── DB helpers ─────────────────────────────────────────────
const LEDGER_DDL = `CREATE TABLE IF NOT EXISTS strain_merge_ledger (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL UNIQUE,
    product_slug TEXT NOT NULL,
    strain_slug TEXT NOT NULL,
    match_method TEXT NOT NULL,
    fields_added TEXT[] NOT NULL,
    merged_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

async function readLedger(client) {
    try {
        const r = await client.query('SELECT product_id, product_slug, strain_slug, match_method, fields_added, merged_at FROM strain_merge_ledger ORDER BY merged_at');
        return r.rows;
    } catch (e) {
        if (e.code === '42P01') return []; // table doesn't exist yet — empty ledger
        throw e;
    }
}

async function fetchProducts(client) {
    const r = await client.query(
        `SELECT p.id, p.slug, p.name, p.category,
                s.thc, s.cbd, s.type, s.terpenes, s.lineage, s."eeatNarrative",
                (s."productId" IS NOT NULL) AS has_spec
           FROM "Product" p
           LEFT JOIN "ProductSpec" s ON s."productId" = p.id
          WHERE p.status = 'ACTIVE' AND p.category = ANY($1)
          ORDER BY p.slug ASC, p.id ASC`,
        [CANNABIS_CATEGORIES]
    );
    return r.rows;
}

// ─── Match all products (3 tiers) ───────────────────────────
async function buildMatches(products, index) {
    const ngramMap = new Map();
    for (const [slug, info] of Object.entries(index)) {
        const norm = normalize(info.name);
        if (norm && !ngramMap.has(norm)) ngramMap.set(norm, slug);
    }
    // Inverted token index for fuzzy candidate generation
    const tokenInvIndex = new Map();
    for (const [slug, info] of Object.entries(index)) {
        for (const t of normalize(info.name).split(' ')) {
            if (!t || t.length < 4 || STOP_TOKENS.has(t)) continue;
            if (!tokenInvIndex.has(t)) tokenInvIndex.set(t, []);
            const arr = tokenInvIndex.get(t);
            if (arr.length < 200) arr.push(slug);
        }
    }

    const aiOk = NO_AI ? false : await ollamaAvailable();
    if (!NO_AI && !aiOk) console.log(`[ai] Ollama ${OLLAMA_MODEL} unavailable at ${OLLAMA_URL} — ambiguous cases marked needs-review`);

    const matched = [];
    const unmatched = [];
    const stats = { exact: 0, fuzzy: 0, ai: 0, needsReview: 0, none: 0 };

    for (const p of products) {
        const tokens = cleanProductName(p.name + ' ' + (p.slug || '')).split(' ').filter(Boolean);
        const allProdTokens = new Set(tokens);

        // Tier 1 — exact/alias/n-gram/joined (all categories)
        const t1 = exactMatch(tokens, index, ngramMap);
        if (t1) { stats.exact++; matched.push({ product: p, strainSlug: t1.slug, method: t1.method, confidence: 1 }); continue; }

        // Tiers 2+3 only run on strain-named categories (flavour-named
        // categories like Edibles produce false positives).
        if (!FUZZY_AI_CATEGORIES.has(p.category)) {
            stats.none++;
            unmatched.push({ product: p, reason: 'no-match' });
            continue;
        }

        // Tier 2 — fuzzy auto-accept (high score + clear gap + strong evidence)
        const cands = fuzzyCandidates(tokens, tokenInvIndex, index);
        const top = cands[0];
        if (top && top.score >= 0.85 && (!cands[1] || top.score - cands[1].score >= 0.08)
            && evidenceGuard(top, allProdTokens) === 'strong') {
            stats.fuzzy++;
            matched.push({ product: p, strainSlug: top.slug, method: 'fuzzy', confidence: top.score });
            continue;
        }

        // Tier 3 — ambiguous gray zone goes to local AI, verdict re-checked
        // by the deterministic evidence guard (the 3B model over-accepts).
        if (top && top.score >= 0.55) {
            if (aiOk) {
                const slug = await adjudicate(p.name, cands);
                const cand = slug ? cands.find((c) => c.slug === slug) : null;
                const verdict = cand ? evidenceGuard(cand, allProdTokens) : 'reject';
                if (verdict === 'strong') {
                    stats.ai++;
                    matched.push({ product: p, strainSlug: cand.slug, method: 'ai', confidence: cand.score });
                    continue;
                }
                if (verdict === 'weak') {
                    stats.needsReview++;
                    unmatched.push({ product: p, reason: 'needs-review', candidates: cands.slice(0, 3) });
                    continue;
                }
            } else {
                stats.needsReview++;
                unmatched.push({ product: p, reason: 'needs-review', candidates: cands.slice(0, 3) });
                continue;
            }
        }
        stats.none++;
        unmatched.push({ product: p, reason: 'no-match' });
    }
    return { matched, unmatched, stats };
}

// ─── Plan builder: matched products → additive field plan ───
function buildPlan(matched, index) {
    const plan = [];
    for (const m of matched) {
        const indexEntry = index[m.strainSlug];
        if (!indexEntry) continue;
        const full = fullStrainRecord(m.strainSlug, indexEntry);
        const allFields = applyPotencyGuards(buildSpecFields(full, indexEntry), m.product.category);
        // ADDITIVE-ONLY: keep a field only if the product's current value is empty
        const fields = {};
        for (const f of ALLOWED_SPEC_FIELDS) {
            if (!(f in allFields)) continue;
            const existing = f === 'eeatNarrative' ? m.product.eeatNarrative : m.product[f.toLowerCase()] ?? m.product[f];
            if (existing == null || String(existing).trim() === '') fields[f] = allFields[f];
        }
        if (Object.keys(fields).length === 0) continue; // nothing to add
        plan.push({
            productId: m.product.id,
            productSlug: m.product.slug,
            productName: m.product.name,
            category: m.product.category,
            strainSlug: m.strainSlug,
            strainName: indexEntry.name,
            method: m.method,
            confidence: m.confidence,
            hasSpecRow: m.product.has_spec,
            fields,
        });
    }
    // Deterministic, stable order — daily batches are predictable
    plan.sort((a, b) => a.productSlug.localeCompare(b.productSlug) || a.productId - b.productId);
    return plan;
}

// ─── Apply: write one batch to Neon (ProductSpec + ledger) ──
async function applyBatch(client, batch) {
    await client.query(LEDGER_DDL);
    const applied = [];
    for (const item of batch) {
        await client.query('BEGIN');
        try {
            // Re-check additive guard at write time (race-safe): only fill empty columns.
            const setClauses = [];
            const params = [];
            let i = 1;
            for (const [f, v] of Object.entries(item.fields)) {
                const col = f === 'eeatNarrative' ? '"eeatNarrative"' : `"${f}"`;
                setClauses.push(`${col} = COALESCE(NULLIF(${col}, ''), $${i})`);
                params.push(v);
                i++;
            }
            if (item.hasSpecRow) {
                params.push(item.productId);
                await client.query(`UPDATE "ProductSpec" SET ${setClauses.join(', ')} WHERE "productId" = $${i}`, params);
            } else {
                const cols = Object.keys(item.fields).map((f) => `"${f}"`).join(', ');
                const vals = Object.keys(item.fields).map((_, idx) => `$${idx + 2}`).join(', ');
                await client.query(
                    `INSERT INTO "ProductSpec" ("productId", ${cols}) VALUES ($1, ${vals}) ON CONFLICT ("productId") DO NOTHING`,
                    [item.productId, ...Object.values(item.fields)]
                );
            }
            // Touch Product.updatedAt so sitemap/ISR pick up freshness naturally
            await client.query(`UPDATE "Product" SET "updatedAt" = now() WHERE id = $1`, [item.productId]);
            // Ledger (idempotency anchor)
            await client.query(
                `INSERT INTO strain_merge_ledger (product_id, product_slug, strain_slug, match_method, fields_added)
                 VALUES ($1, $2, $3, $4, $5) ON CONFLICT (product_id) DO NOTHING`,
                [item.productId, item.productSlug, item.strainSlug, item.method, Object.keys(item.fields)]
            );
            await client.query('COMMIT');
            applied.push(item.productSlug);
        } catch (e) {
            await client.query('ROLLBACK');
            console.error(`  FAILED ${item.productSlug}: ${e.message}`);
        }
    }
    return applied;
}

// ─── Status ─────────────────────────────────────────────────
async function showStatus(client) {
    const ledger = await readLedger(client);
    const plan = existsSync(PLAN_FILE) ? JSON.parse(readFileSync(PLAN_FILE, 'utf-8')) : null;
    const planned = plan ? plan.plan.length : '?';
    const done = ledger.length;
    const remaining = plan ? plan.plan.filter((p) => !ledger.some((l) => l.product_id === p.productId)).length : '?';
    console.log('\nStrain Merge Status');
    console.log('───────────────────');
    console.log(`  Plan file:      ${plan ? `${planned} products planned (generated ${plan.generatedAt})` : 'MISSING — run --write-plan'}`);
    console.log(`  Ledger:         ${done} products enriched`);
    console.log(`  Remaining:      ${remaining}`);
    if (typeof remaining === 'number') console.log(`  Days remaining: ${Math.ceil(remaining / DEFAULT_LIMIT)} at ${DEFAULT_LIMIT}/day`);
    console.log(`  Last merge:     ${done ? new Date(ledger[ledger.length - 1].merged_at).toISOString() : 'never'}`);
    if (plan) {
        const s = plan.stats;
        console.log(`  Match stats:    exact=${s.exact} fuzzy=${s.fuzzy} ai=${s.ai} needs-review=${s.needsReview} no-match=${s.none} (of ${s.total} ACTIVE cannabis products)`);
        console.log(`  Match rate:     ${(((s.exact + s.fuzzy + s.ai) / s.total) * 100).toFixed(1)}%`);
    }
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
    const dbUrl = resolveDatabaseUrl();
    const client = new pg.Client({ connectionString: dbUrl, statement_timeout: 30000 });
    await client.connect();
    console.log('[db] connected to remote Neon (url not printed)');

    try {
        if (STATUS) { await showStatus(client); return; }

        const index = JSON.parse(readFileSync(INDEX_FILE, 'utf-8')).strains;
        const products = await fetchProducts(client);
        console.log(`[load] ${products.length} ACTIVE cannabis products · ${Object.keys(index).length} strains in index`);

        const { matched, unmatched, stats } = await buildMatches(products, index);
        stats.total = products.length;
        const plan = buildPlan(matched, index);
        console.log(`[match] exact=${stats.exact} fuzzy=${stats.fuzzy} ai=${stats.ai} needs-review=${stats.needsReview} no-match=${stats.none} → ${plan.length} products have fields to add`);

        if (WRITE_PLAN) {
            writeFileSync(PLAN_FILE, JSON.stringify({
                generatedAt: new Date().toISOString(),
                stats,
                plan,
                needsReview: unmatched.filter((u) => u.reason === 'needs-review').map((u) => ({
                    productSlug: u.product.slug, productName: u.product.name,
                    candidates: (u.candidates || []).map((c) => c.slug),
                })),
            }, null, 2));
            console.log(`[plan] wrote ${plan.length} entries → ${PLAN_FILE}`);
        }

        const ledger = await readLedger(client);
        const ledgered = new Set(ledger.map((l) => l.product_id));
        const pending = plan.filter((p) => !ledgered.has(p.productId));
        const batch = pending.slice(0, LIMIT);

        console.log(`\n[ledger] ${ledger.length} already enriched · ${pending.length} pending · batch size ${batch.length} (limit ${LIMIT}, hard max ${MAX_LIMIT})`);
        console.log(`\n${APPLY ? 'APPLYING' : 'DRY-RUN (default — writes nothing; use --apply to write)'} — next batch:`);
        for (const b of batch) {
            console.log(`  [${b.method.padEnd(6)}] ${b.productName.slice(0, 44).padEnd(46)} → ${b.strainName.padEnd(28)} +{${Object.keys(b.fields).join(',')}}`);
        }
        if (batch.length === 0) console.log('  (nothing to do — all planned products are ledgered)');

        if (APPLY && batch.length > 0) {
            const applied = await applyBatch(client, batch);
            console.log(`\n[apply] wrote ${applied.length}/${batch.length} products to ProductSpec + ledger`);
        }
    } finally {
        await client.end();
    }
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
