/**
 * MedAgent Engine — Core Backend Service
 * ═══════════════════════════════════════
 * Centralized MedAgent engine with 3-tier intent routing:
 *
 *   🟢 TURBO  → local pattern match (0ms, no API call)
 *   🟡 FLASH  → Gemini Flash (sub-second, simple chat)
 *   🔴 PRO    → Gemini Pro (1-3s, complex reasoning)
 *
 * All API routes under /api/sage/* delegate to this MedAgent engine.
 */

import { chat, searchProducts, type GeminiMessage } from "@/lib/gemini";
import {
    generateSessionId,
    getOrCreateSession,
    addMessage,
    getMessages,
    getSessionStats,
} from "./sessions";
import {
    getCategories,
    getProductsByCategory,
    getOnSaleProducts,
    getFeaturedProducts,
    type CategoryInfo,
} from "./productHelpers";
import { turboRoute } from "./turboRouter";
import { getAgentConfig } from "./agentConfig";
import { getAllProducts } from "@/lib/products";
import { type MedAgentCart, syncClientCart } from "./commerce";
import {
    analyzeSentiment,
    updateEmotionalContext,
    getEmotionalContext,
    buildToneInstruction,
    type SentimentResult,
    type Mood,
} from "./sentiment";
import { getPersonaPromptOverlay } from "./personas";
import {
    type BrowsingBehavior,
    type CartItemInfo,
    buildBehavioralContext,
    buildAuthenticatedContext,
    type AuthenticatedUserData,
} from "./behavioral";
import {
    type CustomerMemory,
    buildMemoryContext,
} from "./memory";

// ─── Types ──────────────────────────────────────────────────

export type PersonaId = "medagent" | "turtle" | "trickster";

export interface MedAgentRequest {
    message: string;
    sessionId?: string;
    channel?: "chat" | "voice";
    persona?: string;
    metadata?: {
        page?: string;
        userAgent?: string;
        locale?: string;
    };
    /** Client-side behavioral data (PIPEDA-compliant, no PII) */
    behavioralData?: BrowsingBehavior;
    /** Cart total for free shipping awareness */
    cartTotal?: number;
    /** Client-side cart items for full agent awareness */
    cartItems?: CartItemInfo[];
    /** Authenticated user context (server-resolved) */
    authenticatedUser?: AuthenticatedUserData;
    /** Persistent memory from localStorage */
    memory?: CustomerMemory;
}

export interface MedAgentResponse {
    sessionId: string;
    text: string;
    actions: { type: string; payload: string }[];
    model: "turbo" | "flash" | "pro";
    products?: unknown[];
    categories?: CategoryInfo[];
    cart?: MedAgentCart;
    latency?: number;
    sentiment?: {
        mood: Mood;
        confidence: number;
        rapport: number;
        tone: string;
    };
}

// ─── Semantic Intent Inference (post-processing fallback) ───

/**
 * If Gemini responded but didn't emit an ACTION tag,
 * infer a navigation/filter action from the user's original message.
 * This catches conversational intent like "I want edibles" or
 * "tell me about your flowers" that Gemini understood but forgot to tag.
 */
const INFERRED_CATEGORY_MAP: [RegExp, string][] = [
    [/\b(flower|flowers|buds?|nugs?|dried\s*flower|strain|strains|sativa|indica|hybrid)\b/i, "Flower"],
    [/\b(edible|edibles|gummies?|gummy|chocolate|brownie|candy|candies|cookie)\b/i, "Edibles"],
    [/\b(concentrate|concentrates|shatter|wax|rosin|hash|dabs?|extract|resin)\b/i, "Concentrates"],
    [/\b(vape|vapes|cartridge|carts?|pen|pens|disposable|pod)\b/i, "Vapes"],
    [/\b(pre[\s-]?roll|pre[\s-]?rolls|joints?|blunts?|rolled)\b/i, "Pre-Rolls"],
    [/\b(cbd|tincture|tinctures|cbd\s*oil|hemp\s*oil|cannabidiol)\b/i, "CBD"],
    [/\b(topical|topicals|cream|lotion|balm|bath\s*bomb|body)\b/i, "Bath & Body"],
    [/\b(accessor|accessories|grinder|pipe|papers?|bong|rolling)\b/i, "Accessories"],
    [/\b(capsule|capsules|pills?|tablet)\b/i, "Capsules"],
    [/\b(mushroom|mushrooms|shroom|shrooms|psilocybin|psychedelic|magic\s*mushroom)\b/i, "Mushrooms"],
    [/\b(wellness|health|supplement|vitamin)\b/i, "Wellness"],
];

const INFERRED_NAV_MAP: [RegExp, string][] = [
    [/\b(review|reviews|testimonial|rating|what.*customers?\s*say)\b/i, "/reviews"],
    [/\b(contact|reach|email|get\s*in\s*touch)\b/i, "/contact"],
    [/\b(about|story|who\s*are\s*you|history|indigenous)\b/i, "/about"],
    [/\b(faq|question|how\s*does)\b/i, "/faq"],
    [/\b(support|help\s*center|assistance)\b/i, "/support"],
    [/\b(return|refund|exchange|money\s*back)\b/i, "/returns-policy"],
    [/\b(shipping\s*policy|delivery\s*policy)\b/i, "/shipping-policy"],
    [/\b(privacy|data\s*protection)\b/i, "/privacy-policy"],
    [/\b(terms|conditions|tos|legal)\b/i, "/terms-of-service"],
];

// Phrases that indicate browsing intent (not just asking about)
const BROWSING_INTENT = /\b(want|need|looking\s*for|interested|got\s*any|shop|browse|check\s*out|see|what.*have|what.*carry|show|find|get|pick\s*up)\b/i;

function inferSemanticAction(message: string): { type: "NAVIGATE" | "ADD_TO_CART" | "SEARCH" | "FILTER"; payload: string } | null {
    const lower = message.toLowerCase();

    // Skip if it's clearly a question about policies/info (no browsing intent)
    const isQuestion = /^(what|how|when|where|why|is|are|can|do|does)\b/i.test(lower);

    // Check for category intent — only if browsing intent detected
    if (BROWSING_INTENT.test(lower)) {
        for (const [pattern, category] of INFERRED_CATEGORY_MAP) {
            if (pattern.test(lower)) {
                return { type: "FILTER", payload: category };
            }
        }
    }

    // Check for page navigation intent (always, even for questions)
    for (const [pattern, path] of INFERRED_NAV_MAP) {
        if (pattern.test(lower)) {
            return { type: "NAVIGATE", payload: path };
        }
    }

    // If it mentions a product category AND is a question, still filter
    if (isQuestion) {
        for (const [pattern, category] of INFERRED_CATEGORY_MAP) {
            if (pattern.test(lower)) {
                return { type: "FILTER", payload: category };
            }
        }
    }

    return null;
}

// ─── Core Engine ────────────────────────────────────────────

/**
 * Process a message through the MedAgent engine.
 * 3-tier routing: Turbo → Flash → Pro
 */
export async function processMessage(req: MedAgentRequest): Promise<MedAgentResponse> {
    const startTime = Date.now();
    const { message, channel = "chat", metadata, persona } = req;
    const trimmed = message.trim();

    // Session management
    const sessionId = req.sessionId || generateSessionId();
    const session = getOrCreateSession(sessionId, channel);

    if (metadata) {
        session.metadata = { ...session.metadata, ...metadata };
    }

    // ═══════════════════════════════════════════════════════
    // SENTIMENT ANALYSIS — runs on every message (<1ms)
    // ═══════════════════════════════════════════════════════
    const sentimentResult = analyzeSentiment(trimmed);
    const emotionalCtx = updateEmotionalContext(sessionId, sentimentResult);
    const toneInstruction = buildToneInstruction(emotionalCtx);

    const sentimentPayload = {
        mood: emotionalCtx.currentMood,
        confidence: sentimentResult.confidence,
        rapport: Math.round(emotionalCtx.rapport * 10) / 10,
        tone: emotionalCtx.toneSuggestion,
    };

    // ═══════════════════════════════════════════════════════
    // AGENT CONFIG — runtime tuning from admin panel
    // ═══════════════════════════════════════════════════════
    const agentConfig = getAgentConfig();

    // Check blocked topics
    if (agentConfig.blockedTopics.length > 0) {
        const lower = trimmed.toLowerCase();
        const blocked = agentConfig.blockedTopics.find((t) => lower.includes(t));
        if (blocked) {
            return {
                sessionId,
                text: "I'm not able to discuss that topic. Is there something else I can help you with? Browse our shop or ask me about our products!",
                actions: [{ type: "NAVIGATE", payload: "/shop" }],
                model: "turbo",
                latency: Date.now() - startTime,
                sentiment: sentimentPayload,
            };
        }
    }

    // ═══════════════════════════════════════════════════════
    // CART SYNC — bridge client localStorage → server cart
    // ═══════════════════════════════════════════════════════
    if (req.cartItems && req.cartItems.length > 0) {
        await syncClientCart(sessionId, req.cartItems);
    }

    // ═══════════════════════════════════════════════════════
    // TIER 1: TURBO — instant local response (no API call)
    // ═══════════════════════════════════════════════════════
    const turbo = agentConfig.turboEnabled ? await turboRoute(trimmed, sessionId) : { handled: false as const };

    if (turbo.handled) {
        // Store in session for context continuity
        addMessage(sessionId, { role: "user", parts: [{ text: trimmed }] });
        addMessage(sessionId, { role: "model", parts: [{ text: turbo.text }] });

        return {
            sessionId,
            text: turbo.text,
            actions: turbo.actions,
            model: "turbo",
            ...(turbo.products && { products: turbo.products }),
            ...(turbo.categories && { categories: turbo.categories }),
            ...(turbo.cart && { cart: turbo.cart }),
            latency: Date.now() - startTime,
            sentiment: sentimentPayload,
        };
    }

    // ═══════════════════════════════════════════════════════
    // TIER 2/3: FLASH or PRO — Gemini AI (auto-routed)
    // Emotional context + persona overlay injected into prompt
    // ═══════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════
    // BEHAVIORAL CONTEXT — personalize without being creepy
    // ═══════════════════════════════════════════════════════
    let behavioralPrompt = "";
    if (req.behavioralData) {
        behavioralPrompt = buildBehavioralContext(req.behavioralData, req.cartTotal, req.cartItems);
    }
    if (req.authenticatedUser) {
        behavioralPrompt += "\n\n" + buildAuthenticatedContext(req.authenticatedUser);
    }
    if (req.memory && req.memory.sessionCount > 0) {
        behavioralPrompt += buildMemoryContext(req.memory);
    }

    const personaOverlay = getPersonaPromptOverlay(persona);
    const configOverride = agentConfig.systemPromptOverride ? `\n\nADMIN INSTRUCTIONS: ${agentConfig.systemPromptOverride}` : "";
    const emotionalPrompt = toneInstruction + behavioralPrompt + (personaOverlay ? `\n${personaOverlay}` : "") + configOverride;
    const history: GeminiMessage[] = getMessages(sessionId);
    const response = await chat(trimmed, history, emotionalPrompt);

    addMessage(sessionId, { role: "user", parts: [{ text: trimmed }] });
    addMessage(sessionId, { role: "model", parts: [{ text: response.text }] });

    // ═══════════════════════════════════════════════════════
    // POST-PROCESSING: Semantic Intent Injection
    // If Gemini talked about a category but forgot the action tag,
    // detect it from the user message and inject the action.
    // ═══════════════════════════════════════════════════════
    const actions = [...response.actions];

    if (actions.length === 0) {
        const inferredAction = inferSemanticAction(trimmed);
        if (inferredAction) {
            actions.push(inferredAction);
        }
    }

    // Enrich with product data from actions
    let products: unknown[] | undefined;
    let categories: CategoryInfo[] | undefined;

    for (const action of actions) {
        switch (action.type) {
            case "SEARCH":
                products = await searchProducts(action.payload, 6);
                break;
            case "FILTER": {
                const catProducts = await getProductsByCategory(action.payload, 6);
                // Category label may not exist in the live catalog — don't
                // attach an empty product grid to the response.
                if (catProducts.length === 0) break;
                products = catProducts.map((p) => ({
                    id: p.id,
                    name: p.name,
                    shortName: p.name.split(" – ")[0] || p.name,
                    category: p.category,
                    price: p.price,
                    image: p.image,
                    slug: p.slug,
                    path: p.path,
                    thc: p.specs.thc,
                    cbd: p.specs.cbd,
                    score: 10,
                }));
                break;
            }
        }
    }

    return {
        sessionId,
        text: response.text,
        actions,
        model: response.model,
        ...(products && { products }),
        ...(categories && { categories }),
        latency: Date.now() - startTime,
        sentiment: sentimentPayload,
    };
}

// ─── Product Query (REST) ───────────────────────────────────

export interface ProductQueryParams {
    category?: string;
    search?: string;
    on_sale?: boolean;
    featured?: boolean;
    limit?: number;
}

export async function queryProducts(params: ProductQueryParams) {
    const limit = params.limit || 12;

    if (params.search) {
        return { type: "search" as const, results: await searchProducts(params.search, limit) };
    }

    if (params.category) {
        return { type: "category" as const, results: await getProductsByCategory(params.category, limit) };
    }

    if (params.on_sale) {
        return { type: "on_sale" as const, results: await getOnSaleProducts(limit) };
    }

    if (params.featured) {
        return { type: "featured" as const, results: await getFeaturedProducts(limit) };
    }

    return { type: "categories" as const, results: await getCategories() };
}

// ─── Health Check ───────────────────────────────────────────

export async function healthCheck() {
    const stats = getSessionStats();
    const products = await getAllProducts();
    const categories = await getCategories();
    return {
        status: "ok",
        service: "MedAgent Bot",
        version: "2.2.0",
        engine: "3-Tier: Turbo (local) → Flash → Pro",
        routing: {
            turbo: "Pattern-matched transactional intents (0ms, no API call)",
            flash: "Gemini 2.5 Flash — simple conversational (sub-second)",
            pro: "Gemini 2.5 Pro — complex reasoning (1-3s)",
        },
        ucp: {
            compatible: true,
            protocol: "google-ucp-v1",
            features: ["agentic_checkout", "product_feed", "google_pay", "cart_management"],
            endpoints: {
                feed: "/api/sage/feed",
                checkout: "/api/sage/checkout",
                chat: "/api/sage/chat",
            },
        },
        productCount: products.length,
        categoryCount: categories.length,
        sessions: stats,
        gemini: {
            configured: !!process.env.GEMINI_API_KEY,
            models: ["gemini-2.5-flash", "gemini-2.5-pro"],
        },
        timestamp: new Date().toISOString(),
    };
}

// ─── Re-exports for convenience ─────────────────────────────

export { getCategories, getProductsByCategory, getOnSaleProducts, getFeaturedProducts } from "./productHelpers";
export { generateSessionId, getSessionStats } from "./sessions";

