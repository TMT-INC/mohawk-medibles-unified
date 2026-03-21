/**
 * SEO API — Dynamic FAQ for AEO
 * GET  ?category=products  → FAQs for product pages
 * GET  ?product=strain-name → Product-specific FAQs  
 * GET  (no params)         → All FAQs as JSON-LD
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { getFAQsForSchema, generateProductFAQs, MASTER_FAQ_DATABASE } from "@/lib/seo/aeo";
import { faqSchema } from "@/lib/seo/schemas";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    const category = req.nextUrl.searchParams.get("category");
    const product = req.nextUrl.searchParams.get("product");
    const format = req.nextUrl.searchParams.get("format") || "json";

    try {
        if (product) {
            const faqs = generateProductFAQs({
                name: product.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                category: category || "Flower",
            });
            const data = faqs.map(({ question, answer }) => ({ question, answer }));
            return format === "jsonld"
                ? NextResponse.json(faqSchema(data))
                : NextResponse.json({ faqs: data });
        }

        if (category) {
            const faqs = getFAQsForSchema([category]);
            return format === "jsonld"
                ? NextResponse.json(faqSchema(faqs))
                : NextResponse.json({ faqs, total: faqs.length });
        }

        // All FAQs
        const allFaqs = MASTER_FAQ_DATABASE.map(({ question, answer, category: cat, intent }) => ({
            question, answer, category: cat, intent,
        }));
        return format === "jsonld"
            ? NextResponse.json(faqSchema(allFaqs))
            : NextResponse.json({ faqs: allFaqs, total: allFaqs.length });
    } catch (e) {
        return NextResponse.json(
            { error: "FAQ generation failed", detail: e instanceof Error ? e.message : "Unknown" },
            { status: 500 }
        );
    }
}
