/**
 * MedAgent Chat API — /api/sage/chat
 * ════════════════════════════════════
 * POST endpoint for the MedAgent chat widget.
 * Delegates to the centralized MedAgent engine.
 */

import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/sage/engine";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { pushEvent } from "@/lib/activityStream";
import { log } from "@/lib/logger";
import { verifySessionToken } from "@/lib/auth";
import type { AuthenticatedUserData } from "@/lib/sage/behavioral";

const MESSAGE_MAX_LENGTH = 2000;
const CONTEXT_MAX_BYTES = 10_000; // 10KB max for behavioral/memory payloads
const VALID_PERSONAS = new Set(["medagent", "turtle", "trickster"]);

/** Validate that a context payload is a plain object within size limits */
function validateContextPayload(data: unknown): object | null {
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    try {
        const serialized = JSON.stringify(data);
        if (serialized.length > CONTEXT_MAX_BYTES) return null;
        return data as object;
    } catch {
        return null;
    }
}

/** Validate cart items array from client */
function validateCartItems(data: unknown): { id: string; name: string; price: number; quantity: number }[] | null {
    if (!Array.isArray(data) || data.length === 0 || data.length > 50) return null;
    const validated: { id: string; name: string; price: number; quantity: number }[] = [];
    for (const item of data) {
        if (!item || typeof item !== "object") return null;
        const { id, name, price, quantity } = item as Record<string, unknown>;
        if (typeof id !== "string" || typeof name !== "string" || typeof price !== "number" || typeof quantity !== "number") return null;
        if (name.length > 200 || price < 0 || price > 10000 || quantity < 1 || quantity > 100) return null;
        validated.push({ id: id.slice(0, 50), name: name.slice(0, 200), price, quantity: Math.floor(quantity) });
    }
    return validated;
}

export async function POST(req: NextRequest) {
    // Rate limit
    const limited = await applyRateLimit(req, RATE_LIMITS.support);
    if (limited) return limited;

    // Parse body
    let body: { message?: string; sessionId?: string; persona?: string; behavioralData?: object; cartTotal?: number; cartItems?: unknown[]; memory?: object };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { message, sessionId, persona, behavioralData, cartTotal, cartItems, memory } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
        return NextResponse.json(
            { error: "Message is required." },
            { status: 400 }
        );
    }

    // Reject oversized messages (cost amplification / regex DoS protection)
    if (message.length > MESSAGE_MAX_LENGTH) {
        return NextResponse.json(
            { error: `Message exceeds maximum length of ${MESSAGE_MAX_LENGTH} characters.` },
            { status: 400 }
        );
    }

    // Validate persona — default to medagent if invalid
    const safePersona = VALID_PERSONAS.has(persona || "") ? persona : "medagent";

    try {
        // Resolve authenticated user from session cookie
        let authenticatedUser: AuthenticatedUserData | undefined;
        const sessionCookie = req.cookies.get("mm-session")?.value;
        if (sessionCookie) {
            const token = verifySessionToken(sessionCookie);
            if (token) {
                authenticatedUser = {
                    name: token.name,
                    orderCount: 0,
                    totalSpend: 0,
                    topCategories: [],
                    segment: "returning",
                };
            }
        }

        const validatedCartItems = validateCartItems(cartItems);
        const result = await processMessage({
            message,
            sessionId,
            channel: "chat",
            persona: safePersona,
            ...(validateContextPayload(behavioralData) && { behavioralData: behavioralData as any }),
            ...(cartTotal !== undefined && typeof cartTotal === "number" && cartTotal >= 0 && cartTotal < 100000 && { cartTotal }),
            ...(validatedCartItems && { cartItems: validatedCartItems }),
            ...(validateContextPayload(memory) && { memory: memory as any }),
            ...(authenticatedUser && { authenticatedUser }),
        });

        // Push activity event for admin dashboard
        pushEvent("agent_chat", {
            message: message.slice(0, 80),
        });

        return NextResponse.json(result);
    } catch (error) {
        log.sage.error("Chat error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            {
                sessionId: sessionId || "",
                text: "I'm having a moment — please try again shortly, or browse our shop directly.",
                actions: [],
                model: "flash",
            },
            { status: 500 }
        );
    }
}
