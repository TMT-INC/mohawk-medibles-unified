/**
 * Mohawk Medibles — Content Strategy Engine
 * Revenue-driven content prioritization and keyword-revenue mapping.
 */

import { prisma } from "@/lib/db";

// ─── Content Priority Analysis ──────────────────────────────

interface ContentPriority {
    productId: number;
    productName: string;
    category: string;
    revenue: number;
    unitsSold: number;
    pageViews: number; // from keyword impressions
    contentGap: number; // higher = more opportunity
    recommendation: string;
}

/** Identify high-margin, low-content products for content creation */
export async function getContentPriorities(): Promise<ContentPriority[]> {
    // Get product revenue data
    const products = await prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: {
            id: true,
            name: true,
            category: true,
            slug: true,
            price: true,
            orderItems: {
                select: { quantity: true, price: true },
            },
        },
    });

    // Get keyword data — map by category to products
    const keywords = await prisma.keyword.findMany({
        select: { term: true, volume: true, currentRank: true, category: true },
    });

    const keywordMap = new Map<string, { volume: number; position: number }>();
    for (const kw of keywords) {
        if (kw.category) {
            const existing = keywordMap.get(kw.category);
            const vol = kw.volume || 0;
            if (!existing || vol > existing.volume) {
                keywordMap.set(kw.category, { volume: vol, position: kw.currentRank || 100 });
            }
        }
    }

    const priorities: ContentPriority[] = products.map((p: { id: number; name: string; category: string; slug: string; price: number; orderItems: { quantity: number; price: number }[] }) => {
        const revenue = p.orderItems.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);
        const unitsSold = p.orderItems.reduce((s: number, i: { price: number; quantity: number }) => s + i.quantity, 0);
        const kwData = keywordMap.get(p.category);
        const pageViews = kwData?.volume || 0;

        // Content gap: high revenue + low visibility = big opportunity
        const revenueScore = Math.min(revenue / 1000, 10); // 0-10
        const visibilityScore = pageViews > 0 ? Math.min(pageViews / 500, 10) : 0;
        const contentGap = Math.max(0, revenueScore - visibilityScore);

        let recommendation = "Monitor";
        if (contentGap > 5) recommendation = "Create deep-dive blog + social campaign";
        else if (contentGap > 3) recommendation = "Create product spotlight content";
        else if (revenueScore > 5 && visibilityScore > 5) recommendation = "Optimize existing content";
        else if (revenueScore < 2) recommendation = "Bundle with top sellers in content";

        return {
            productId: p.id,
            productName: p.name,
            category: p.category,
            revenue: Math.round(revenue * 100) / 100,
            unitsSold,
            pageViews,
            contentGap: Math.round(contentGap * 10) / 10,
            recommendation,
        };
    });

    return priorities.sort((a, b) => b.contentGap - a.contentGap);
}

// ─── Keyword Revenue Potential ──────────────────────────────

interface KeywordRevenuePotential {
    keyword: string;
    volume: number;
    position: number;
    associatedProduct: string;
    productRevenue: number;
    estimatedTrafficValue: number;
    action: string;
}

/** Cross-reference keywords with product revenue for prioritization */
export async function getKeywordRevenuePotential(): Promise<KeywordRevenuePotential[]> {
    const keywords = await prisma.keyword.findMany({
        select: { term: true, volume: true, currentRank: true, category: true, targetUrl: true },
    });

    // Get revenue by category
    const products = await prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: {
            category: true,
            name: true,
            orderItems: { select: { price: true, quantity: true } },
        },
    });

    const categoryRevMap = new Map<string, { topProduct: string; revenue: number }>();
    for (const p of products) {
        const revenue = p.orderItems.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);
        const existing = categoryRevMap.get(p.category);
        if (!existing || revenue > existing.revenue) {
            categoryRevMap.set(p.category, { topProduct: p.name, revenue });
        }
    }

    return keywords
        .map((kw: { term: string; volume: number | null; currentRank: number | null; category: string | null; targetUrl: string | null }) => {
            const catData = categoryRevMap.get(kw.category || "");
            const volume = kw.volume || 0;
            const position = kw.currentRank || 100;
            const ctr = position <= 1 ? 0.30 : position <= 3 ? 0.15 : position <= 10 ? 0.05 : 0.01;
            const estimatedTraffic = volume * ctr;
            const conversionRate = 0.02;
            const avgOrderValue = 173;
            const estimatedTrafficValue = Math.round(estimatedTraffic * conversionRate * avgOrderValue);

            let action = "Monitor";
            if (position > 10 && volume > 100) action = "Create content to rank top 10";
            else if (position > 3 && position <= 10) action = "Optimize to reach top 3";
            else if (position <= 3) action = "Defend position, expand content";

            return {
                keyword: kw.term,
                volume,
                position,
                associatedProduct: catData?.topProduct || kw.category || "",
                productRevenue: Math.round((catData?.revenue || 0) * 100) / 100,
                estimatedTrafficValue,
                action,
            };
        })
        .sort((a: KeywordRevenuePotential, b: KeywordRevenuePotential) => b.estimatedTrafficValue - a.estimatedTrafficValue);
}

// ─── Content Brief Generator ────────────────────────────────

interface ContentBrief {
    title: string;
    targetKeyword: string;
    product: string;
    contentType: string;
    outline: string[];
    seoNotes: string[];
    estimatedImpact: string;
}

/** Generate a structured content brief for the content agent */
export function generateContentBrief(
    keyword: string,
    productName: string,
    position: number,
    volume: number,
): ContentBrief {
    const isNewContent = position > 10;
    const contentType = isNewContent ? "New Blog Post (1500+ words)" : "Content Optimization";

    const outline = isNewContent
        ? [
            `H1: ${keyword} — Expert Guide from Mohawk Medibles`,
            `H2: What is ${keyword}?`,
            `H2: The Science Behind ${keyword}`,
            `H2: How to Choose the Right Product`,
            `H2: Our Expert Recommendation: ${productName}`,
            `H2: Frequently Asked Questions`,
            `Internal link: /shop → ${productName}`,
        ]
        : [
            `Update meta title with "${keyword}"`,
            `Add FAQ schema targeting "${keyword}"`,
            `Expand H2 sections with more detail`,
            `Add internal links to ${productName}`,
            `Update publish date for freshness signal`,
        ];

    return {
        title: `${keyword} — Complete Guide`,
        targetKeyword: keyword,
        product: productName,
        contentType,
        outline,
        seoNotes: [
            `Target keyword: "${keyword}" (vol: ${volume}, pos: ${position})`,
            `Include keyword in title, H1, first paragraph, and meta description`,
            `Add FAQ schema for AEO/voice search optimization`,
            `Include EEAT signals: author bio, citations, first-hand experience`,
            `Internal link to ${productName} product page`,
        ],
        estimatedImpact: volume > 500
            ? "High — significant traffic potential"
            : volume > 100
                ? "Medium — steady organic growth"
                : "Low — long-tail niche content",
    };
}
