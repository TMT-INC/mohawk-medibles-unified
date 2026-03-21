/**
 * Agent Config API — /api/admin/agent-config
 * ════════════════════════════════════════════
 * GET: Return current agent configuration.
 * PUT: Update agent configuration (partial merge).
 */

import { NextRequest, NextResponse } from "next/server";
import { getAgentConfig, updateAgentConfig, resetAgentConfig } from "@/lib/sage/agentConfig";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    return NextResponse.json(getAgentConfig());
}

export async function PUT(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Special action: reset to defaults
    if (body.action === "reset") {
        return NextResponse.json(resetAgentConfig());
    }

    const updated = updateAgentConfig(body as any);
    return NextResponse.json(updated);
}
