/**
 * Mohawk Medibles — Grok (xAI) Client
 * ════════════════════════════════════
 * PRIMARY brain for the Sage/MedAgent engine — same architecture as
 * LocalAIHub's voice agent: Grok fast model first (lowest-latency
 * information retrieval), Gemini fallback, canned last resort.
 *
 * Shares the MedAgent system prompt and [ACTION: ...] grammar with
 * lib/gemini.ts so the two brains are interchangeable mid-conversation.
 *
 * Env:
 *   XAI_API_KEY — required (returns null without it → engine falls back)
 *   XAI_MODEL   — optional override; defaults to the fast non-reasoning
 *                 tier. Bump here when xAI ships a newer fast model —
 *                 no code change needed.
 */

import {
    buildMedAgentPrompt,
    parseActions,
    type GeminiMessage,
    type GeminiResponse,
} from "@/lib/gemini";
import { log } from "@/lib/logger";

const XAI_API_KEY = process.env.XAI_API_KEY || "";
const XAI_MODEL = process.env.XAI_MODEL || "grok-4-1-fast-non-reasoning";
const XAI_URL = "https://api.x.ai/v1/chat/completions";
const TIMEOUT_MS = 12_000; // fail fast — Gemini fallback is waiting

interface OpenAIMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

/**
 * Chat through Grok. Returns null on ANY failure (missing key, HTTP
 * error, timeout, empty completion) so the engine can fall back to
 * Gemini without surfacing an error to the customer.
 */
export async function grokChat(
    userMessage: string,
    conversationHistory: GeminiMessage[] = [],
    emotionalContext?: string
): Promise<GeminiResponse | null> {
    if (!XAI_API_KEY) return null;

    const messages: OpenAIMessage[] = [
        { role: "system", content: buildMedAgentPrompt(emotionalContext) },
        ...conversationHistory.map((m): OpenAIMessage => ({
            role: m.role === "model" ? "assistant" : "user",
            content: m.parts.map((p) => p.text).join("\n"),
        })),
        { role: "user", content: userMessage },
    ];

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        const response = await fetch(XAI_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${XAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: XAI_MODEL,
                messages,
                temperature: 0.8,
                max_tokens: 1024,
            }),
            signal: controller.signal,
        });
        clearTimeout(timer);

        if (!response.ok) {
            log.sage.error("Grok API error", { status: response.status, model: XAI_MODEL });
            return null;
        }

        const data = await response.json();
        const text: string | undefined = data?.choices?.[0]?.message?.content;
        if (!text) return null;

        const actions = parseActions(text);
        let cleanText = text;
        for (const action of actions) {
            cleanText = cleanText.replace(`[ACTION: ${action.type}] ${action.payload}`, "").trim();
        }

        return { text: cleanText, actions, model: "grok" };
    } catch (error) {
        log.sage.error("Grok call failed", {
            error: error instanceof Error ? error.message : String(error),
        });
        return null;
    }
}

export function grokConfigured(): boolean {
    return Boolean(XAI_API_KEY);
}

export function grokModel(): string {
    return XAI_MODEL;
}
