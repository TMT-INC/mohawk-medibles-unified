/**
 * Admin Visitor Insights — /api/admin/visitors
 * ══════════════════════════════════════════════
 * Returns aggregate visitor stats from in-memory store.
 * Used by CustomersView to show live browsing activity.
 */

import { NextRequest, NextResponse } from "next/server";
import { getVisitorStats } from "@/lib/visitorStore";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    const stats = getVisitorStats();

    return NextResponse.json(stats);
}
