#!/usr/bin/env node
/**
 * Mohawk Medibles — SEO Score Verifier for AutoResearch
 * ═══════════════════════════════════════════════════════
 * Scores product pages on SEO quality (0-100).
 * Used as the "Verify" command in AutoResearch loops.
 *
 * Usage:
 *   node scripts/seo-score.mjs                  # Score all products, output average
 *   node scripts/seo-score.mjs --slug <slug>    # Score single product
 *   node scripts/seo-score.mjs --worst 10       # Show 10 worst-scoring products
 *   node scripts/seo-score.mjs --summary        # One-line summary (for AutoResearch)
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

// ─── Load product data directly (avoid needing Next.js/TS compilation) ──────
function loadProducts() {
    const raw = readFileSync(resolve(PROJECT_ROOT, 'lib/productData.ts'), 'utf-8');

    // Extract the JSON array from _RAW_PRODUCTS
    const startMarker = 'const _RAW_PRODUCTS: Product[] = [';
    const startIdx = raw.indexOf(startMarker);
    if (startIdx === -1) throw new Error('Could not find _RAW_PRODUCTS in productData.ts');

    let bracketDepth = 0;
    // Skip past the "= " to find the actual array start (not the [] in Product[])
    const eqSign = raw.indexOf('=', startIdx);
    let arrayStart = raw.indexOf('[', eqSign);
    let arrayEnd = -1;

    for (let i = arrayStart; i < raw.length; i++) {
        if (raw[i] === '[') bracketDepth++;
        if (raw[i] === ']') bracketDepth--;
        if (bracketDepth === 0) { arrayEnd = i + 1; break; }
    }

    if (arrayEnd === -1) throw new Error('Could not parse _RAW_PRODUCTS array');
    const jsonStr = raw.slice(arrayStart, arrayEnd);
    return JSON.parse(jsonStr);
}

// ─── SEO Scoring Rules ─────────────────────────────────────────────────────
// Each rule returns 0-N points. Total normalized to 0-100.

function scoreProduct(product) {
    const checks = [];

    // 1. Meta Description quality (0-15 pts)
    const meta = product.metaDescription || '';
    let metaScore = 0;
    if (meta.length > 0) metaScore += 3;
    if (meta.length >= 120 && meta.length <= 160) metaScore += 5;  // Ideal length
    else if (meta.length > 50 && meta.length < 200) metaScore += 2;
    if (!meta.includes('**')) metaScore += 3;  // No raw markdown in meta
    if (meta.toLowerCase().includes('canada') || meta.toLowerCase().includes('mohawk')) metaScore += 2;
    if (meta.toLowerCase().includes(product.category.toLowerCase())) metaScore += 2;
    checks.push({ name: 'metaDescription', score: metaScore, max: 15 });

    // 2. Alt text quality (0-10 pts)
    const alt = product.altText || '';
    let altScore = 0;
    if (alt.length > 0) altScore += 3;
    if (alt.length >= 20 && alt.length <= 125) altScore += 3;  // Ideal length
    if (alt !== `${product.name} - Mohawk Medibles`) altScore += 2;  // Not generic template
    if (alt.toLowerCase().includes(product.category.toLowerCase())) altScore += 2;
    checks.push({ name: 'altText', score: altScore, max: 10 });

    // 3. Product name/title optimization (0-10 pts)
    const name = product.name || '';
    let nameScore = 0;
    if (name.length > 0) nameScore += 2;
    if (name.length <= 60) nameScore += 3;  // Google truncates at ~60
    if (name.length >= 10) nameScore += 2;  // Not too short
    if (!/^[A-Z\s]+$/.test(name)) nameScore += 1;  // Not ALL CAPS
    if (!name.includes('|') && !name.includes('-')) nameScore += 2;  // Clean title, no pipe/dash separators
    checks.push({ name: 'title', score: nameScore, max: 10 });

    // 4. Short description (0-10 pts)
    const short = product.shortDescription || '';
    let shortScore = 0;
    if (short.length > 0) shortScore += 2;
    if (short.length >= 50 && short.length <= 300) shortScore += 3;
    if (!short.includes('**')) shortScore += 3;  // No raw markdown
    if (short.toLowerCase().includes('buy') || short.toLowerCase().includes('shop')) shortScore += 2;  // Transactional intent
    checks.push({ name: 'shortDescription', score: shortScore, max: 10 });

    // 5. Specs completeness (0-15 pts)
    const specs = product.specs || {};
    let specScore = 0;
    if (specs.thc && specs.thc !== 'TBD' && specs.thc !== '') specScore += 3;
    if (specs.cbd && specs.cbd !== 'TBD' && specs.cbd !== '') specScore += 3;
    if (specs.weight && specs.weight !== 'TBD' && specs.weight !== '') specScore += 2;
    if (specs.type && specs.type !== '' && specs.type !== product.category) specScore += 2;
    if (specs.terpenes && specs.terpenes.length > 0) specScore += 3;
    if (specs.lineage && specs.lineage !== '' && specs.lineage !== 'TBD') specScore += 2;
    checks.push({ name: 'specs', score: specScore, max: 15 });

    // 6. Effects array (0-5 pts)
    const effects = product.effects || [];
    let effectScore = 0;
    if (effects.length > 0) effectScore += 2;
    if (effects.length >= 3) effectScore += 3;
    checks.push({ name: 'effects', score: effectScore, max: 5 });

    // 7. EEAT narrative (0-10 pts)
    const eeat = product.eeatNarrative || '';
    let eeatScore = 0;
    if (eeat.length > 0) eeatScore += 3;
    if (eeat.length >= 100) eeatScore += 3;
    if (eeat.length >= 200) eeatScore += 2;
    if (eeat.toLowerCase().includes('lab') || eeat.toLowerCase().includes('test')) eeatScore += 2;
    checks.push({ name: 'eeatNarrative', score: eeatScore, max: 10 });

    // 8. Images (0-10 pts)
    const images = product.images || [];
    let imgScore = 0;
    if (images.length > 0) imgScore += 3;
    if (images.length >= 2) imgScore += 3;
    if (images.length >= 4) imgScore += 2;
    if (product.image && product.image.startsWith('http')) imgScore += 2;
    checks.push({ name: 'images', score: imgScore, max: 10 });

    // 9. SKU present (0-5 pts)
    let skuScore = 0;
    if (product.sku && product.sku.length > 0) skuScore += 5;
    checks.push({ name: 'sku', score: skuScore, max: 5 });

    // 10. Description HTML quality (0-10 pts)
    const html = product.descriptionHTML || '';
    let htmlScore = 0;
    if (html.length > 0) htmlScore += 2;
    if (html.includes('<h2') || html.includes('<h3')) htmlScore += 2;  // Structured headings
    if (html.includes('<ul') || html.includes('<ol')) htmlScore += 2;  // Lists
    if (html.length >= 500) htmlScore += 2;  // Substantial content
    if (html.includes('FAQ') || html.includes('frequently')) htmlScore += 2;  // FAQ section
    checks.push({ name: 'descriptionHTML', score: htmlScore, max: 10 });

    // Calculate total
    const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
    const totalMax = checks.reduce((sum, c) => sum + c.max, 0);
    const normalized = Math.round((totalScore / totalMax) * 100);

    return { slug: product.slug, name: product.name, score: normalized, checks, totalScore, totalMax };
}

// ─── Main ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const slugIdx = args.indexOf('--slug');
const worstIdx = args.indexOf('--worst');
const summaryMode = args.includes('--summary');

try {
    const products = loadProducts();
    const results = products.map(scoreProduct).sort((a, b) => a.score - b.score);

    if (slugIdx !== -1 && args[slugIdx + 1]) {
        // Single product mode
        const target = args[slugIdx + 1];
        const result = results.find(r => r.slug === target);
        if (!result) { console.error(`Product not found: ${target}`); process.exit(1); }
        console.log(JSON.stringify(result, null, 2));
        console.log(`\nSEO_SCORE: ${result.score}`);
    } else if (worstIdx !== -1) {
        // Worst N products
        const n = parseInt(args[worstIdx + 1]) || 10;
        const worst = results.slice(0, n);
        console.log(`\n  WORST ${n} PRODUCTS BY SEO SCORE\n  ${'═'.repeat(50)}`);
        for (const r of worst) {
            const failing = r.checks.filter(c => c.score < c.max * 0.5).map(c => c.name);
            console.log(`  ${String(r.score).padStart(3)}  ${r.slug.padEnd(40)} [${failing.join(', ')}]`);
        }
        const avg = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
        console.log(`\n  Average: ${avg}/100 across ${results.length} products`);
        console.log(`  SEO_SCORE: ${avg}`);
    } else if (summaryMode) {
        // One-line output for AutoResearch verify
        const avg = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
        const below50 = results.filter(r => r.score < 50).length;
        const above80 = results.filter(r => r.score >= 80).length;
        console.log(`SEO_SCORE: ${avg} | products: ${results.length} | below50: ${below50} | above80: ${above80}`);
    } else {
        // Full report
        const avg = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
        const median = results[Math.floor(results.length / 2)].score;
        const below50 = results.filter(r => r.score < 50).length;
        const above80 = results.filter(r => r.score >= 80).length;

        console.log(`\n  MOHAWK MEDIBLES — SEO SCORE REPORT`);
        console.log(`  ${'═'.repeat(50)}`);
        console.log(`  Total Products:    ${results.length}`);
        console.log(`  Average Score:     ${avg}/100`);
        console.log(`  Median Score:      ${median}/100`);
        console.log(`  Below 50 (poor):   ${below50}`);
        console.log(`  Above 80 (good):   ${above80}`);
        console.log(`  Lowest:            ${results[0].score} (${results[0].slug})`);
        console.log(`  Highest:           ${results[results.length - 1].score} (${results[results.length - 1].slug})`);
        console.log(`\n  SEO_SCORE: ${avg}`);

        // Category breakdown
        const byCategory = {};
        for (const r of results) {
            const product = products.find(p => p.slug === r.slug);
            const cat = product?.category || 'Unknown';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(r.score);
        }
        console.log(`\n  BY CATEGORY:`);
        for (const [cat, scores] of Object.entries(byCategory).sort()) {
            const catAvg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
            console.log(`    ${cat.padEnd(25)} ${catAvg}/100  (${scores.length} products)`);
        }
    }
} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}
