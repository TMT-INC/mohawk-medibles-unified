/**
 * MedAgent Voice API — /api/sage/voice
 * ═════════════════════════════════════
 * REST endpoint for voice-to-action processing.
 * Accepts text input, routes through the MedAgent engine,
 * returns structured response with actions.
 */

import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/sage/engine";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { log } from "@/lib/logger";

const MESSAGE_MAX_LENGTH = 2000;

// ─── Types ──────────────────────────────────────────────────

interface VoiceRequest {
    message: string;
    sessionId?: string;
    metadata?: {
        page?: string;
        userAgent?: string;
    };
}

// ─── POST /api/sage/voice ───────────────────────────────────

export async function POST(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.support);
    if (limited) return limited;

    try {
        const body: VoiceRequest = await req.json();
        const { message, metadata } = body;

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return NextResponse.json(
                { error: "Message is required." },
                { status: 400 }
            );
        }

        if (message.length > MESSAGE_MAX_LENGTH) {
            return NextResponse.json(
                { error: `Message exceeds maximum length of ${MESSAGE_MAX_LENGTH} characters.` },
                { status: 400 }
            );
        }

        const result = await processMessage({
            message,
            sessionId: body.sessionId,
            channel: "voice",
            metadata,
        });

        return NextResponse.json(result);
    } catch (error) {
        log.sage.error("Voice error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            { error: "Internal server error. Please try again." },
            { status: 500 }
        );
    }
}

// ─── GET /api/sage/voice — Health Check ─────────────────────

export async function GET() {
    return NextResponse.json({
        status: "ok",
        agent: "MedAgent",
    });
}
