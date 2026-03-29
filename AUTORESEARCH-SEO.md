# AutoResearch SEO Plan — Mohawk Medibles

## Configuration for `/autoresearch`

```
Goal: Improve SEO quality score across all 363 product pages
Scope: lib/productData.ts (the _RAW_PRODUCTS array — product metadata, descriptions, specs, alt text)
Metric: Average SEO score (0-100) from scripts/seo-score.mjs
Direction: higher is better
Verify: node scripts/seo-score.mjs --summary | grep -oP 'SEO_SCORE: \K\d+'
Guard: node -e "const d=require('fs').readFileSync('lib/productData.ts','utf-8'); const m=d.match(/\"slug\"/g); if(!m||m.length<360) {console.error('GUARD FAIL: product count dropped below 360'); process.exit(1);} console.log('GUARD PASS:',m.length,'products');"
```

## Baseline (2026-03-28)

- **Average Score: 72/100**
- **363 products**
- **1 below 50, 30 above 80**
- **Lowest: 49** (heisenberg-extractions-live-resin-distillate-dual-flavour-3g-thc-vape-canada)
- **Highest: 86** (stellar-cherry-cola-gummies-canada)

## Target

- **Average Score: 82+/100** (10-point improvement)
- **0 products below 60**
- **100+ products above 80**

## Improvement Priorities (by impact)

1. **Missing specs** — Fill in THC/CBD/weight/terpenes/lineage for products with "TBD" or empty values
2. **Missing effects** — Add 3+ effects per product (Relaxed, Euphoric, Creative, etc.)
3. **Missing SKU** — Generate SKU format: MM-{category-code}-{id}
4. **Markdown in meta/short descriptions** — Remove raw `**` markdown from metaDescription and shortDescription
5. **Alt text improvement** — Make alt text descriptive beyond "{name} - Mohawk Medibles" template
6. **EEAT narratives** — Ensure 200+ char quality narratives mentioning lab testing
7. **Description HTML** — Add structured headings, FAQ sections, usage guides

## Rules for AutoResearch Loop

- **ONE product per iteration** — modify one product's data, verify, keep/discard
- **Focus on lowest-scoring products first** — use `node scripts/seo-score.mjs --worst 10` to find targets
- **Never delete products** — Guard ensures count stays above 360
- **Never fabricate THC/CBD numbers** — Use "Varies by batch" if unknown rather than making up percentages
- **Keep category-appropriate specs** — Nicotine products don't need THC/CBD, cannabis products don't need nicotine specs
- **All content must be accurate** — No hallucinated strain names, effects, or claims
