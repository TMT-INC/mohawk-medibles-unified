/**
 * MedAgent Products API — /api/sage/products
 * ════════════════════════════════════════════
 * GET endpoint for querying products.
 * Supports: ?category=, ?search=, ?on_sale=true, ?featured=true, ?limit=
 *
 * Mirrors sage/v1/products from the original WordPress plugin.
 */

import { NextRequest, NextResponse } from "next/server";
import { queryProducts } from "@/lib/sage/engine";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { log } from "@/lib/logger";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    const { searchParams } = req.nextUrl;

    const params = {
        category: searchParams.get("category") || undefined,
        search: searchParams.get("search") || undefined,
        on_sale: searchParams.get("on_sale") === "true",
        featured: searchParams.get("featured") === "true",
        limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
    };

    try {
        const result = queryProducts(params);
        return NextResponse.json({
            success: true,
            queryType: result.type,
            count: Array.isArray(result.results) ? result.results.length : 0,
            results: result.results,
        });
    } catch (error) {
        log.sage.error("Products query error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            { success: false, error: "Failed to query products" },
            { status: 500 }
        );
    }
}
