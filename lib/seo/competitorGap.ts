/**
 * Mohawk Medibles — Competitor Keyword Gap Analyzer
 * Integrates with Manus (SimilarWeb) for real competitor data.
 */

export interface Competitor {
    name: string;
    domain: string;
    type: "direct" | "indirect" | "aspirational";
    estimatedTraffic?: number;
    topCategories?: string[];
}

export const COMPETITORS: Competitor[] = [
    { name: "Native Leaf", domain: "nativeleaf.ca", type: "direct", topCategories: ["flower", "edibles"] },
    { name: "Smoke Signals", domain: "smokesignals.ca", type: "direct", topCategories: ["flower", "vapes"] },
    { name: "OCS", domain: "ocs.ca", type: "indirect", estimatedTraffic: 2_500_000 },
    { name: "WeedMaps", domain: "weedmaps.com", type: "indirect", estimatedTraffic: 5_000_000 },
    { name: "Leafly", domain: "leafly.ca", type: "indirect", estimatedTraffic: 8_000_000 },
];

export interface KeywordOpportunity {
    keyword: string;
    searchVolume: number;
    difficulty: number;
    gap: "not_ranking" | "underperforming" | "competitive";
    opportunityScore: number;
    suggestedContentType: "blog" | "product_page" | "faq" | "guide" | "landing_page";
    intent: "informational" | "transactional" | "navigational" | "commercial";
}

type SeedKW = Omit<KeywordOpportunity, "opportunityScore">;

export const SEED_KEYWORDS: SeedKW[] = [
    // Transactional
    { keyword: "buy weed online canada", searchVolume: 22000, difficulty: 65, gap: "not_ranking", suggestedContentType: "landing_page", intent: "transactional" },
    { keyword: "buy cannabis online ontario", searchVolume: 12000, difficulty: 55, gap: "not_ranking", suggestedContentType: "landing_page", intent: "transactional" },
    { keyword: "order weed online", searchVolume: 18000, difficulty: 60, gap: "not_ranking", suggestedContentType: "landing_page", intent: "transactional" },
    { keyword: "mail order marijuana canada", searchVolume: 8000, difficulty: 50, gap: "not_ranking", suggestedContentType: "landing_page", intent: "transactional" },
    { keyword: "buy edibles online canada", searchVolume: 9500, difficulty: 45, gap: "not_ranking", suggestedContentType: "landing_page", intent: "transactional" },
    { keyword: "cannabis delivery ontario", searchVolume: 4500, difficulty: 38, gap: "not_ranking", suggestedContentType: "landing_page", intent: "transactional" },
    // Commercial
    { keyword: "best online dispensary canada", searchVolume: 15000, difficulty: 70, gap: "not_ranking", suggestedContentType: "landing_page", intent: "commercial" },
    { keyword: "best cannabis strains 2025", searchVolume: 8000, difficulty: 35, gap: "not_ranking", suggestedContentType: "blog", intent: "commercial" },
    { keyword: "strongest edibles canada", searchVolume: 5500, difficulty: 30, gap: "not_ranking", suggestedContentType: "blog", intent: "commercial" },
    { keyword: "best indica strains for sleep", searchVolume: 7000, difficulty: 32, gap: "not_ranking", suggestedContentType: "blog", intent: "commercial" },
    { keyword: "indigenous cannabis dispensary", searchVolume: 1200, difficulty: 15, gap: "not_ranking", suggestedContentType: "landing_page", intent: "commercial" },
    { keyword: "lab tested cannabis canada", searchVolume: 2000, difficulty: 20, gap: "not_ranking", suggestedContentType: "blog", intent: "commercial" },
    // Informational
    { keyword: "what are terpenes in cannabis", searchVolume: 6000, difficulty: 22, gap: "not_ranking", suggestedContentType: "blog", intent: "informational" },
    { keyword: "cannabis edible dosage guide", searchVolume: 8500, difficulty: 30, gap: "not_ranking", suggestedContentType: "guide", intent: "informational" },
    { keyword: "indica vs sativa effects", searchVolume: 12000, difficulty: 45, gap: "not_ranking", suggestedContentType: "blog", intent: "informational" },
    { keyword: "entourage effect cannabis explained", searchVolume: 3500, difficulty: 20, gap: "not_ranking", suggestedContentType: "blog", intent: "informational" },
    { keyword: "how to store cannabis properly", searchVolume: 4000, difficulty: 18, gap: "not_ranking", suggestedContentType: "blog", intent: "informational" },
    { keyword: "CBD vs THC difference", searchVolume: 14000, difficulty: 55, gap: "not_ranking", suggestedContentType: "blog", intent: "informational" },
    // Navigational / Long-tail
    { keyword: "mohawk medibles", searchVolume: 800, difficulty: 5, gap: "competitive", suggestedContentType: "landing_page", intent: "navigational" },
    { keyword: "tyendinaga dispensary", searchVolume: 1500, difficulty: 12, gap: "underperforming", suggestedContentType: "landing_page", intent: "navigational" },
    { keyword: "best weed delivery tyendinaga", searchVolume: 400, difficulty: 5, gap: "not_ranking", suggestedContentType: "landing_page", intent: "transactional" },
    { keyword: "premium craft cannabis ontario", searchVolume: 1200, difficulty: 18, gap: "not_ranking", suggestedContentType: "product_page", intent: "commercial" },
];

// ─── Gap Analysis Engine ──────────────────────────────

export function analyzeKeywordGaps(options?: {
    intent?: string; maxDifficulty?: number; minVolume?: number; limit?: number;
}): KeywordOpportunity[] {
    const opts = { maxDifficulty: 100, minVolume: 0, limit: 50, ...options };

    return SEED_KEYWORDS
        .filter((kw) => {
            if (opts.intent && kw.intent !== opts.intent) return false;
            if (kw.difficulty > opts.maxDifficulty) return false;
            if (kw.searchVolume < opts.minVolume) return false;
            return true;
        })
        .map((kw) => {
            const gapMul = kw.gap === "not_ranking" ? 1.5 : kw.gap === "underperforming" ? 1.2 : 0.8;
            const opportunityScore = Math.round((kw.searchVolume * (100 / (kw.difficulty + 1)) * gapMul) / 100);
            return { ...kw, opportunityScore };
        })
        .sort((a, b) => b.opportunityScore - a.opportunityScore)
        .slice(0, opts.limit);
}

export function findQuickWins(maxDiff = 30, minVol = 500) {
    return analyzeKeywordGaps({ maxDifficulty: maxDiff, minVolume: minVol }).slice(0, 15);
}

export function generateContentGapReport(): Record<string, KeywordOpportunity[]> {
    const all = analyzeKeywordGaps();
    const grouped: Record<string, KeywordOpportunity[]> = {};
    for (const kw of all) {
        (grouped[kw.suggestedContentType] ??= []).push(kw);
    }
    return grouped;
}

// ─── Manus / SimilarWeb Integration ──────────────────

export interface ManusCompetitorData {
    domain: string;
    monthlyVisits: number;
    bounceRate: number;
    topKeywords: { keyword: string; share: number }[];
    trafficSources: Record<string, number>;
}

export async function fetchManusCompetitorData(domain: string): Promise<ManusCompetitorData | null> {
    const url = process.env.MANUS_API_URL;
    const key = process.env.MANUS_API_KEY;
    if (!url || !key) { console.warn("[SEO] Manus not configured. Using seed data."); return null; }
    try {
        const res = await fetch(`${url}/api/competitor-analysis`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
            body: JSON.stringify({ domain }),
            signal: AbortSignal.timeout(15000),
        });
        return res.ok ? await res.json() : null;
    } catch { return null; }
}

export async function runCompetitorAnalysis(domains?: string[]) {
    const targets = domains || COMPETITORS.map((c) => c.domain);
    const data: Record<string, ManusCompetitorData | null> = {};
    for (const d of targets) data[d] = await fetchManusCompetitorData(d);
    const gaps = analyzeKeywordGaps();
    return {
        competitors: COMPETITORS.filter((c) => targets.includes(c.domain)),
        competitorData: data,
        keywordGaps: gaps,
        quickWins: findQuickWins(),
        contentGapReport: generateContentGapReport(),
        totalOpportunityVolume: gaps.reduce((s, k) => s + k.searchVolume, 0),
        topPriorityKeywords: gaps.slice(0, 10),
    };
}
