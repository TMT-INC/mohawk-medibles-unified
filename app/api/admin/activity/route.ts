/**
 * Admin Activity Stream — /api/admin/activity
 * ═════════════════════════════════════════════
 * SSE endpoint that streams real-time site activity to admin dashboard.
 * Also supports GET with ?mode=poll for simple JSON polling.
 */

import { NextRequest, NextResponse } from "next/server";
import { getRecentEvents, getEventsSince, getLatestEventId } from "@/lib/activityStream";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    const mode = req.nextUrl.searchParams.get("mode");

    // Simple JSON poll mode
    if (mode === "poll") {
        const sinceId = parseInt(req.nextUrl.searchParams.get("since") || "0", 10);
        const events = sinceId > 0 ? getEventsSince(sinceId) : getRecentEvents(50);
        return NextResponse.json({
            events,
            cursor: getLatestEventId(),
        });
    }

    // SSE streaming mode
    const encoder = new TextEncoder();
    let cursorId = getLatestEventId();

    const stream = new ReadableStream({
        start(controller) {
            // Send initial batch
            const initial = getRecentEvents(20);
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ events: initial, cursor: cursorId })}\n\n`)
            );

            // Poll every 3 seconds for new events
            const interval = setInterval(() => {
                try {
                    const newEvents = getEventsSince(cursorId);
                    const newCursor = getLatestEventId();

                    if (newEvents.length > 0 || newCursor !== cursorId) {
                        cursorId = newCursor;
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ events: newEvents, cursor: cursorId })}\n\n`)
                        );
                    } else {
                        // Keep-alive
                        controller.enqueue(encoder.encode(": keepalive\n\n"));
                    }
                } catch {
                    clearInterval(interval);
                    controller.close();
                }
            }, 3000);

            // Close after 5 minutes (Vercel serverless timeout safety)
            setTimeout(() => {
                clearInterval(interval);
                try {
                    controller.close();
                } catch { /* already closed */ }
            }, 5 * 60 * 1000);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}
