/**
 * MedAgent Categories API — /api/sage/categories
 * ════════════════════════════════════════════════
 * GET endpoint returning all product categories with counts.
 * Mirrors sage/v1/categories from the original WordPress plugin.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/sage/engine";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    return NextResponse.json({
        success: true,
        categories: getCategories(),
    });
}
