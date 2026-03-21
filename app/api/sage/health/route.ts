/**
 * MedAgent Health API — /api/sage/health
 * ═══════════════════════════════════════
 * GET endpoint for MedAgent service health.
 * Reports engine status, product/category counts, session stats, and Gemini config.
 */

import { NextRequest, NextResponse } from "next/server";
import { healthCheck } from "@/lib/sage/engine";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    return NextResponse.json(healthCheck());
}
