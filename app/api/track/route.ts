/**
 * Anonymous Visitor Tracking — /api/track
 * ════════════════════════════════════════
 * Server-side event tracking for CRM guest insights.
 * Sets mm-visitor cookie (httpOnly, 90 days) on first request.
 * PIPEDA-compliant: no PII, only behavioral aggregates.
 */

import { NextRequest, NextResponse } from "next/server";
import { trackEvent, type TrackEvent } from "@/lib/visitorStore";
import { pushEvent as pushActivity } from "@/lib/activityStream";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { randomUUID } from "crypto";

const VALID_EVENTS = new Set([
    "category_view",
    "product_view",
    "search",
    "page_visit",
    "cart_add",
]);

const COOKIE_NAME = "mm-visitor";
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60; // 90 days in seconds

export async function POST(req: NextRequest) {
    // Rate limit: 60 events/min per IP
    const rateLimited = await applyRateLimit(req, RATE_LIMITS.api);
    if (rateLimited) return rateLimited;

    let body: { event?: string; data?: Record<string, string> };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Validate event type
    if (!body.event || !VALID_EVENTS.has(body.event)) {
        return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    // Validate data — must be a flat string record, max 5 keys
    const data = body.data || {};
    if (typeof data !== "object" || Array.isArray(data)) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const entries = Object.entries(data).slice(0, 5);
    const sanitizedData: Record<string, string> = {};
    for (const [key, value] of entries) {
        if (typeof key === "string" && typeof value === "string") {
            sanitizedData[key.slice(0, 50)] = value.slice(0, 200);
        }
    }

    // Get or create visitor ID from cookie
    let visitorId = req.cookies.get(COOKIE_NAME)?.value;
    const isNewVisitor = !visitorId;
    if (!visitorId) {
        visitorId = randomUUID();
    }

    // Track the event
    const eventType = body.event as TrackEvent["event"];
    const trackPayload: TrackEvent = {
        event: eventType,
        data: sanitizedData,
    };
    trackEvent(visitorId, trackPayload);

    // Push to activity stream for admin dashboard
    if (eventType === "search") {
        pushActivity("search", { query: sanitizedData.query });
    } else if (eventType === "product_view") {
        pushActivity("product_view", { productName: sanitizedData.slug, category: sanitizedData.category });
    }

    // Build response with cookie
    const response = NextResponse.json({ ok: true, new: isNewVisitor });

    if (isNewVisitor) {
        response.cookies.set(COOKIE_NAME, visitorId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: COOKIE_MAX_AGE,
            path: "/",
        });
    }

    return response;
}
