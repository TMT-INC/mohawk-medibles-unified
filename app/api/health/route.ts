/**
 * Health Check — /api/health
 * Checks DB connectivity, ShipStation API, agent gateway, and MedAgent bot.
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { healthCheck as sageHealthCheck } from "@/lib/sage/engine";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.health);
    if (limited) return limited;

    const checks: Record<string, { status: string; latency?: number; error?: string; details?: unknown }> = {};

    // ── Database ────────────────────────────────────────────
    try {
        const start = Date.now();
        const { prisma } = await import("@/lib/db");
        await prisma.$queryRaw`SELECT 1`;
        checks.database = { status: "healthy", latency: Date.now() - start };
    } catch (e) {
        checks.database = { status: "unhealthy", error: e instanceof Error ? e.message : "Unknown" };
    }

    // ── ShipStation API ─────────────────────────────────────
    try {
        const start = Date.now();
        const apiKey = process.env.SHIPSTATION_API_KEY;
        const apiSecret = process.env.SHIPSTATION_API_SECRET;

        if (apiKey && apiSecret) {
            const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
            const res = await fetch("https://ssapi.shipstation.com/stores", {
                headers: { Authorization: `Basic ${auth}` },
                signal: AbortSignal.timeout(5000),
            });
            checks.shipstation = {
                status: res.ok ? "healthy" : "degraded",
                latency: Date.now() - start,
            };
        } else {
            checks.shipstation = { status: "not_configured" };
        }
    } catch (e) {
        checks.shipstation = { status: "unhealthy", error: e instanceof Error ? e.message : "Timeout" };
    }

    // ── Agent Gateway ───────────────────────────────────────
    try {
        const start = Date.now();
        const gatewayUrl = process.env.AGENT_GATEWAY_URL || "http://localhost:8000";
        const res = await fetch(`${gatewayUrl}/`, {
            signal: AbortSignal.timeout(3000),
        });
        checks.agent_gateway = {
            status: res.ok ? "healthy" : "degraded",
            latency: Date.now() - start,
        };
    } catch (e) {
        checks.agent_gateway = { status: "unhealthy", error: e instanceof Error ? e.message : "Timeout" };
    }

    // ── MedAgent Bot ──────────────────────────────────────────
    try {
        const start = Date.now();
        const sage = sageHealthCheck();
        checks.sage = {
            status: sage.status === "ok" ? "healthy" : "degraded",
            latency: Date.now() - start,
            details: {
                products: sage.productCount,
                categories: sage.categoryCount,
                sessions: sage.sessions,
                gemini: sage.gemini.configured ? "configured" : "demo_mode",
            },
        };
    } catch (e) {
        checks.sage = { status: "unhealthy", error: e instanceof Error ? e.message : "Unknown" };
    }

    // ── Overall Status ──────────────────────────────────────
    const overall = Object.values(checks).every((c) => c.status === "healthy" || c.status === "not_configured")
        ? "healthy"
        : Object.values(checks).some((c) => c.status === "unhealthy")
            ? "unhealthy"
            : "degraded";

    const statusCode = overall === "healthy" ? 200 : overall === "degraded" ? 200 : 503;

    return NextResponse.json(
        {
            status: overall,
            version: process.env.npm_package_version || "1.0.0",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            checks,
        },
        { status: statusCode }
    );
}
