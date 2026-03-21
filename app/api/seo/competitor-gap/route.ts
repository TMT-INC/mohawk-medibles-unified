/**
 * SEO API — Competitor Gap & Backlink Analysis
 * GET  ?type=gaps      → keyword gap analysis
 * GET  ?type=quickwins → low difficulty, high ROI keywords
 * GET  ?type=backlinks → backlink strategy
 * GET  ?type=full      → full competitor analysis (uses Manus if available)
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { analyzeKeywordGaps, findQuickWins, generateContentGapReport, runCompetitorAnalysis } from "@/lib/seo/competitorGap";
import { generateBacklinkPlan } from "@/lib/seo/backlinkStrategy";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    const type = req.nextUrl.searchParams.get("type") || "gaps";
    const intent = req.nextUrl.searchParams.get("intent") || undefined;
    const maxDiff = parseInt(req.nextUrl.searchParams.get("maxDifficulty") || "100");

    try {
        switch (type) {
            case "gaps":
                return NextResponse.json({
                    keywords: analyzeKeywordGaps({ intent, maxDifficulty: maxDiff }),
                    contentGapReport: generateContentGapReport(),
                });

            case "quickwins":
                return NextResponse.json({
                    quickWins: findQuickWins(maxDiff || 30),
                    message: "Low difficulty keywords with highest ROI potential",
                });

            case "backlinks":
                return NextResponse.json(generateBacklinkPlan());

            case "full": {
                const analysis = await runCompetitorAnalysis();
                return NextResponse.json(analysis);
            }

            default:
                return NextResponse.json({ error: "Invalid type. Use: gaps, quickwins, backlinks, full" }, { status: 400 });
        }
    } catch (e) {
        return NextResponse.json({ error: "Analysis failed", detail: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
    }
}
