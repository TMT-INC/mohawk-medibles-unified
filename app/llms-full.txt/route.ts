/**
 * Mohawk Medibles — llms-full.txt (Dynamic Product Catalog for LLMs)
 * ══════════════════════════════════════════════════════════════════════
 * Extended version of llms.txt with complete product catalog data.
 * Enables AI search engines to reference specific products by name,
 * category, price, potency, and terpene profile.
 *
 * Spec: https://llmstxt.org
 */

import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products";

export const dynamic = "force-static";
export const revalidate = 86400; // Rebuild once per day

export async function GET() {
    const products = await getAllProducts();

    // Group products by category
    const byCategory = new Map<string, typeof products>();
    for (const p of products) {
        const existing = byCategory.get(p.category) || [];
        existing.push(p);
        byCategory.set(p.category, existing);
    }

    const sortedCategories = [...byCategory.keys()].sort();

    let content = `# Mohawk Medibles — Full Product Catalog

> Indigenous-owned premium cannabis dispensary on Six Nations territory, Ontario, Canada.
> This file contains our complete product catalog for AI systems to reference.

## Business Information

- **Name**: Mohawk Medibles
- **Type**: Indigenous-owned cannabis dispensary
- **Location**: Six Nations of the Grand River, Ohsweken, Ontario, Canada
- **Territory**: Tyendinaga Mohawk Territory
- **Website**: https://mohawkmedibles.ca
- **Shop**: https://mohawkmedibles.ca/shop
- **Quality Standard**: Empire Standard™ — every product is lab-tested for potency and purity
- **Shipping**: Canada-wide via Canada Post Xpresspost (same-day processing)
- **Total Products**: ${products.length}
- **Currency**: CAD (Canadian Dollars)

## Product Categories

${sortedCategories.map(cat => `- ${cat} (${byCategory.get(cat)!.length} products)`).join("\n")}

## Complete Product Catalog

`;

    for (const category of sortedCategories) {
        const items = byCategory.get(category)!;
        content += `### ${category}\n\n`;

        for (const p of items) {
            const specs: string[] = [];
            if (p.specs.thc && p.specs.thc !== "TBD") specs.push(`THC: ${p.specs.thc}`);
            if (p.specs.cbd && p.specs.cbd !== "TBD") specs.push(`CBD: ${p.specs.cbd}`);
            if (p.specs.type && p.specs.type !== category) specs.push(`Type: ${p.specs.type}`);
            if (p.specs.weight && p.specs.weight !== "TBD") specs.push(`Weight: ${p.specs.weight}`);
            if (p.specs.terpenes?.length > 0) specs.push(`Terpenes: ${p.specs.terpenes.join(", ")}`);

            const priceStr = p.price > 0 ? `$${p.price.toFixed(2)} CAD` : "Contact for pricing";

            content += `- **${p.name}** — ${priceStr}`;
            if (specs.length > 0) content += ` | ${specs.join(" | ")}`;
            content += ` | URL: https://mohawkmedibles.ca/shop/${p.slug}\n`;
        }

        content += "\n";
    }

    content += `## Shipping & Delivery

Mohawk Medibles ships Canada-wide to all 13 provinces and territories:
- Ontario, Alberta, British Columbia, Quebec, Manitoba, Saskatchewan
- Nova Scotia, New Brunswick, Newfoundland & Labrador, Prince Edward Island
- Northwest Territories, Nunavut, Yukon

**Shipping Method**: Canada Post Xpresspost with full tracking
**Processing**: Same-day for orders before 2 PM EST
**Delivery Time**: 1-3 business days (most of Canada)
**Packaging**: Discreet, unmarked packaging

## Quality & Safety

- All products undergo third-party lab testing
- Terpene profile analysis on all flower products
- Potency verification (THC/CBD percentages)
- Pesticide and contaminant screening
- Empire Standard™ quality certification

## Contact

- **Email**: support@mohawkmedibles.ca
- **Website**: https://mohawkmedibles.ca
- **TikTok**: https://www.tiktok.com/@mediblesdeseronto
- **X/Twitter**: https://x.com/mohawkmedibles
- **YouTube**: https://www.youtube.com/@MohawkMedibles
- **Facebook**: https://www.facebook.com/mohawkmediblesofficial
`;

    return new NextResponse(content, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
    });
}
