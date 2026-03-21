/**
 * Mohawk Medibles — Product Search API
 * ═════════════════════════════════════
 * Full-text search across all 288 products.
 * Used by the voice agent and search widget.
 */

import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/gemini";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
    const limited = await applyRateLimit(request, RATE_LIMITS.api);
    if (limited) return limited;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const category = searchParams.get("category");

    if (!query || query.length < 2) {
        return NextResponse.json(
            { error: "Query parameter 'q' is required and must be at least 2 characters." },
            { status: 400 }
        );
    }

    let results = searchProducts(query, Math.min(limit, 50));

    // Optional category filter
    if (category) {
        results = results.filter((r) =>
            r.category.toLowerCase() === category.toLowerCase()
        );
    }

    return NextResponse.json({
        query,
        count: results.length,
        results,
    });
}
