/**
 * MedAgent Turbo Router — Zero-Latency Intent Handler
 * ════════════════════════════════════════════════════
 * Pattern-matches transactional intents (navigate, browse, cart,
 * search, quick lookups) and returns instant responses without
 * any LLM API call. Sub-10ms response time.
 *
 * Tier 1 of the 3-tier MedAgent routing:
 *   🟢 TURBO  → local pattern match (0ms, no API)
 *   🟡 FLASH  → Gemini Flash (sub-second, simple chat)
 *   🔴 PRO    → Gemini Pro (1-3s, complex reasoning)
 */

import { searchProducts } from "@/lib/gemini";
import { getProductsByCategory, getProductsByEffect, getCategories, getOnSaleProducts, getFeaturedProducts, type CategoryInfo } from "./productHelpers";
import { PRODUCTS, getShortName } from "@/lib/productData";
import { addToCart, removeFromCart, clearCart, formatCartForDisplay, getCart } from "./commerce";

// ─── Types ──────────────────────────────────────────────────

export interface TurboResult {
    handled: true;
    text: string;
    actions: { type: string; payload: string }[];
    products?: unknown[];
    categories?: CategoryInfo[];
    cart?: ReturnType<typeof getCart>;
    model: "turbo";
}

export interface TurboSkip {
    handled: false;
}

export type TurboResponse = TurboResult | TurboSkip;

// ─── Navigation Patterns ────────────────────────────────────

const NAV_PATTERNS: [RegExp, string, string][] = [
    // [pattern, path, response text]
    [/\b(go\s*to|open|show\s*me|take\s*me\s*to|visit)\s*(the\s*)?(shop|store|products?)\b/i, "/shop", "Taking you to the shop now! 🛒"],
    [/\b(go\s*to|open|show\s*me|take\s*me\s*to|visit)\s*(the\s*)?(home|homepage|main)\b/i, "/", "Heading home! 🏠"],
    [/\b(go\s*to|open|show\s*me|take\s*me\s*to|visit)\s*(the\s*)?(about|about\s*us)\b/i, "/about", "Here's our story! 📖"],
    [/\b(go\s*to|open|show\s*me|take\s*me\s*to|visit)\s*(the\s*)?(faq|questions)\b/i, "/faq", "Let me pull up the FAQ for you! ❓"],
    [/\b(go\s*to|open|show\s*me|take\s*me\s*to|visit)\s*(the\s*)?(support|help|contact)\b/i, "/support", "Connecting you with support! 💬"],
    [/\b(go\s*to|open|show\s*me|take\s*me\s*to|visit)\s*(the\s*)?(cart|my\s*cart|basket)\b/i, "/checkout", "Opening your cart! 🛒"],
    [/\b(go\s*to|open|show\s*me|take\s*me\s*to|visit)\s*(the\s*)?(checkout|pay)\b/i, "/checkout", "Let's get you checked out! 💳"],
    [/\b(go\s*to|open|show\s*me|take\s*me\s*to|visit)\s*(the\s*)?(reviews?|testimonials?)\b/i, "/reviews", "Here's what our customers are saying! ⭐"],
    [/\b(go\s*to|open|show\s*me|take\s*me\s*to|visit)\s*(the\s*)?(account|my\s*account|profile)\b/i, "/account", "Opening your account! 👤"],
    [/\b(go\s*to|open|show\s*me|take\s*me\s*to|visit)\s*(the\s*)?(login|sign\s*in)\b/i, "/login", "Let's get you signed in! 🔐"],
];

// ─── Category Quick Patterns (explicit command: "show me flowers") ──

const CATEGORY_PATTERNS: [RegExp, string][] = [
    [/\b(show|browse|see|view|list)\s*(me\s*)?(all\s*)?(the\s*)?(flower|flowers|buds?|nugs?)\b/i, "Flower"],
    [/\b(show|browse|see|view|list)\s*(me\s*)?(all\s*)?(the\s*)?(edible|edibles|gummies?|chocolate)\b/i, "Edibles"],
    [/\b(show|browse|see|view|list)\s*(me\s*)?(all\s*)?(the\s*)?(concentrate|concentrates|shatter|wax|rosin|hash)\b/i, "Concentrates"],
    [/\b(show|browse|see|view|list)\s*(me\s*)?(all\s*)?(the\s*)?(vape|vapes|cartridge|carts?|pen|pens)\b/i, "Vapes"],
    [/\b(show|browse|see|view|list)\s*(me\s*)?(all\s*)?(the\s*)?(pre[\s-]?roll|pre[\s-]?rolls|joints?)\b/i, "Pre-Rolls"],
    [/\b(show|browse|see|view|list)\s*(me\s*)?(all\s*)?(the\s*)?(tincture|tinctures|oil|oils|cbd\s*oil|cbd)\b/i, "CBD"],
    [/\b(show|browse|see|view|list)\s*(me\s*)?(all\s*)?(the\s*)?(topical|topicals|cream|lotion|balm|bath|body)\b/i, "Bath & Body"],
    [/\b(show|browse|see|view|list)\s*(me\s*)?(all\s*)?(the\s*)?(accessori|accessories|grinder|pipe|paper|bong)\b/i, "Accessories"],
    [/\b(show|browse|see|view|list)\s*(me\s*)?(all\s*)?(the\s*)?(capsule|capsules|pill|pills)\b/i, "Capsules"],
    [/\b(show|browse|see|view|list)\s*(me\s*)?(all\s*)?(the\s*)?(mushroom|mushrooms|shroom|shrooms|psychedelic)\b/i, "Mushrooms"],
    [/\b(show|browse|see|view|list)\s*(me\s*)?(all\s*)?(the\s*)?(wellness|health|supplement)\b/i, "Wellness"],
];

// ─── Semantic Category Patterns (conversational: "I want edibles") ──
// These catch natural intent without requiring "show/browse/list" prefix

const SEMANTIC_CATEGORY_PATTERNS: [RegExp, string][] = [
    // Flower / buds
    [/\b(i\s*want|i\s*need|looking\s*for|interested\s*in|got\s*any|any|what)\s*(some\s*|your\s*)?(flower|flowers|buds?|nugs?|weed|dried\s*flower)\b/i, "Flower"],
    [/\b(what|which)\s*(flower|flowers|buds?|strains?)\s*(do\s*you\s*have|you\s*got|are\s*available)\b/i, "Flower"],
    // Only intercept "sativa/indica/hybrid" when paired with explicit shopping intent —
    // educational queries ("difference between indica and sativa", "what is sativa") fall through to Gemini.
    [/\b(i\s*want|i\s*need|looking\s*for|got\s*any|show\s*me|got)\s+(a\s+|some\s+|any\s+)?(sativa|indica|hybrid)s?\b/i, "Flower"],
    // Edibles
    [/\b(i\s*want|i\s*need|looking\s*for|interested\s*in|got\s*any|any|what)\s*(some\s*|your\s*)?(edible|edibles|gummies?|chocolate|candy|candies|brownie|cookie)\b/i, "Edibles"],
    [/\b(what|which)\s*(edible|edibles|gummies?)\s*(do\s*you\s*have|you\s*got|are\s*available)\b/i, "Edibles"],
    [/\b(something\s*(i\s*can\s*)?eat|eat(able)?)\s*(cannabis|weed|thc)?\b/i, "Edibles"],
    // Concentrates
    [/\b(i\s*want|i\s*need|looking\s*for|interested\s*in|got\s*any|any|what)\s*(some\s*|your\s*)?(concentrate|concentrates|shatter|wax|rosin|hash|dabs?|extract)\b/i, "Concentrates"],
    [/\b(what|which)\s*(concentrate|concentrates|dabs?)\s*(do\s*you\s*have|you\s*got|are\s*available)\b/i, "Concentrates"],
    // Vapes
    [/\b(i\s*want|i\s*need|looking\s*for|interested\s*in|got\s*any|any|what)\s*(some\s*|your\s*)?(vape|vapes|cartridge|carts?|pen|pens|disposable)\b/i, "Vapes"],
    [/\b(what|which)\s*(vape|vapes|carts?|cartridge)\s*(do\s*you\s*have|you\s*got|are\s*available)\b/i, "Vapes"],
    // Pre-Rolls
    [/\b(i\s*want|i\s*need|looking\s*for|interested\s*in|got\s*any|any|what)\s*(some\s*|your\s*)?(pre[\s-]?roll|pre[\s-]?rolls|joints?|blunts?|rolled)\b/i, "Pre-Rolls"],
    [/\b(what|which)\s*(pre[\s-]?rolls?|joints?)\s*(do\s*you\s*have|you\s*got|are\s*available)\b/i, "Pre-Rolls"],
    // CBD
    [/\b(i\s*want|i\s*need|looking\s*for|interested\s*in|got\s*any|any|what)\s*(some\s*|your\s*)?(cbd|tincture|tinctures|cbd\s*oil)\b/i, "CBD"],
    // Bath & Body
    [/\b(i\s*want|i\s*need|looking\s*for|interested\s*in|got\s*any|any|what)\s*(some\s*|your\s*)?(topical|topicals|cream|lotion|balm|bath\s*(bomb)?|body)\b/i, "Bath & Body"],
    // Accessories
    [/\b(i\s*want|i\s*need|looking\s*for|interested\s*in|got\s*any|any|what)\s*(some\s*|your\s*)?(accessor|accessories|grinder|pipe|papers?|bong|rolling)\b/i, "Accessories"],
    // Capsules
    [/\b(i\s*want|i\s*need|looking\s*for|interested\s*in|got\s*any|any|what)\s*(some\s*|your\s*)?(capsule|capsules|pills?|tablet)\b/i, "Capsules"],
    // Mushrooms
    [/\b(i\s*want|i\s*need|looking\s*for|interested\s*in|got\s*any|any|what)\s*(some\s*|your\s*)?(mushroom|mushrooms|shroom|shrooms|psilocybin|psychedelic|magic\s*mushroom)\b/i, "Mushrooms"],
    // Wellness
    [/\b(i\s*want|i\s*need|looking\s*for|interested\s*in|got\s*any|any|what)\s*(some\s*|your\s*)?(wellness|health|supplement)\b/i, "Wellness"],
];

// ─── Quick Reply Patterns ───────────────────────────────────

// Randomized humanized replies — picks one at random for variety
function pick(options: string[]): string {
    return options[Math.floor(Math.random() * options.length)];
}

const QUICK_REPLIES: [RegExp, () => string][] = [
    [/\b(hours?|open|close|when)\b.*\b(open|close|hours?)\b/i, () => pick([
        "We're open **7 days a week**, 10 AM – 10 PM ET. Orders placed before 4 PM ship same day — so you're in good shape!",
        "Open every day, 10 AM to 10 PM ET. And if you order before 4 PM, it ships the same day. We don't play around with speed.",
    ])],
    [/\b(where|location|address|find\s*you)\b/i, () => pick([
        "We're based on **Tyendinaga Mohawk Territory**, Ontario. Indigenous land, premium product. We ship Canada-wide via Xpresspost!",
        "Home base is **Tyendinaga Mohawk Territory / Tyendinaga Mohawk Territory**, Ontario. We ship coast to coast across Canada!",
    ])],
    [/\b(deliver|shipping|ship|how\s*long)\b.*\b(cost|free|price|long|take|time)\b/i, () => pick([
        "**Same-day** to Tyendinaga, Belleville, Deseronto. **Next-day** to Toronto, Hamilton, Brantford. **Canada-wide** via Xpresspost in 2-5 days. We move fast!",
        "Quick breakdown: local same-day, GTA next-day, and everywhere else in Canada within 2-5 business days via Xpresspost. All packaging is discreet.",
    ])],
    [/\b(payment|pay|e[\s-]?transfer|method)\b/i, () => pick([
        "We accept **Google Pay**, **Interac e-Transfer**, and major credit/debit cards. Everything's secure and 100% discreet.",
        "You can pay with **Google Pay**, **e-Transfer**, or credit/debit. All secure, all discreet — nobody needs to know but you.",
    ])],
    [/\b(age|how\s*old|id|19)\b/i, () =>
        "You must be **19+** to purchase. We verify age on all orders — no exceptions. It's the law, and we respect it."
    ],
    [/\bhi\b|\bhello\b|\bhey\b|\byo\b|\bwhat'?s?\s*up\b/i, () => pick([
        "Hey there! Welcome to Mohawk Medibles. I'm MedAgent — your personal cannabis guide. What are you looking for today?",
        "What's good! I'm MedAgent, here to help you find exactly what you need. Browsing for something specific, or just exploring?",
        "Hey! Welcome in. I'm MedAgent — think of me as your knowledgeable friend behind the counter. What can I help you find?",
    ])],
    [/\b(thank|thanks|thx|ty|appreciate)\b/i, () => pick([
        "Anytime! That's what I'm here for. Let me know if anything else comes to mind.",
        "You're welcome! Enjoy, and don't hesitate to reach out if you need anything else.",
        "My pleasure! Hope you love everything. I'm always here if you need me.",
    ])],
    [/\b(bye|goodbye|see\s*ya|later|peace)\b/i, () => pick([
        "Take it easy! Come back anytime — I'll be here.",
        "Peace! Enjoy, and we'll see you next time.",
        "Later! Hope to see you again soon. Stay elevated.",
    ])],
];

// ─── Sale & Deals Patterns ──────────────────────────────────

const SALE_PATTERNS = /\b(sale|deal|deals|discount|discounts|clearance|promo|special|specials|cheap|budget|on\s*sale)\b/i;

// ─── Featured / Popular Patterns ────────────────────────────

const FEATURED_PATTERNS = /\b(popular|best\s*seller|top\s*seller|trending|featured|hot|new\s*arrival)\b/i;

// ─── Categories List Pattern ────────────────────────────────

const CATEGORY_LIST_PATTERNS = /\b(categor|what.*sell|what.*have|what.*carry|browse|menu|show\s*everything|all.*products?)\b/i;

// ─── Page Index (for deep search) ───────────────────────────

interface PageEntry {
    path: string;
    title: string;
    keywords: string[];
}

const PAGE_INDEX: PageEntry[] = [
    { path: "/shop", keywords: ["shop", "store", "browse", "products", "buy", "catalog", "all"], title: "Shop All Products" },
    { path: "/about", keywords: ["about", "story", "indigenous", "mohawk", "history", "tyendinaga", "who"], title: "About Us" },
    { path: "/faq", keywords: ["faq", "questions", "help", "how", "answers", "info"], title: "FAQ" },
    { path: "/support", keywords: ["support", "help", "contact", "issue", "problem", "assistance"], title: "Support" },
    { path: "/reviews", keywords: ["reviews", "testimonials", "ratings", "stars", "feedback", "customers"], title: "Customer Reviews" },
    { path: "/checkout", keywords: ["cart", "checkout", "pay", "order", "purchase", "buy"], title: "Checkout" },
    { path: "/contact", keywords: ["contact", "email", "reach", "message", "get in touch"], title: "Contact Us" },
    { path: "/account", keywords: ["account", "profile", "settings", "my account", "login"], title: "My Account" },
    { path: "/login", keywords: ["login", "sign in", "register", "account"], title: "Sign In" },
    { path: "/shipping-policy", keywords: ["shipping", "delivery", "tracking", "ship", "courier", "xpresspost"], title: "Shipping Policy" },
    { path: "/returns-policy", keywords: ["returns", "refund", "exchange", "return policy", "money back"], title: "Returns Policy" },
    { path: "/privacy-policy", keywords: ["privacy", "data", "personal information", "cookies"], title: "Privacy Policy" },
    { path: "/terms-of-service", keywords: ["terms", "conditions", "tos", "legal", "agreement"], title: "Terms of Service" },
    { path: "/shop?category=Flower", keywords: ["flower", "bud", "nugs", "dried", "sativa", "indica", "hybrid", "strain"], title: "Shop Flower" },
    { path: "/shop?category=Edibles", keywords: ["edibles", "gummies", "chocolate", "candy", "food", "drink", "beverages"], title: "Shop Edibles" },
    { path: "/shop?category=Concentrates", keywords: ["concentrates", "shatter", "wax", "rosin", "hash", "dabs", "extract"], title: "Shop Concentrates" },
    { path: "/shop?category=Vapes", keywords: ["vapes", "vape", "cartridge", "cart", "pen", "disposable"], title: "Shop Vapes" },
    { path: "/shop?category=Pre-Rolls", keywords: ["pre-rolls", "pre-roll", "joints", "joint", "blunt", "rolled"], title: "Shop Pre-Rolls" },
    { path: "/shop?category=CBD", keywords: ["cbd", "tincture", "oil", "hemp", "cannabidiol", "non-psychoactive"], title: "Shop CBD" },
    { path: "/shop?category=Bath+%26+Body", keywords: ["bath", "body", "topical", "cream", "lotion", "balm", "salve"], title: "Shop Bath & Body" },
    { path: "/shop?category=Accessories", keywords: ["accessories", "grinder", "pipe", "paper", "bong", "rolling", "lighter"], title: "Shop Accessories" },
    { path: "/shop?category=Capsules", keywords: ["capsules", "capsule", "pill", "pills", "tablet"], title: "Shop Capsules" },
    { path: "/shop?category=Mushrooms", keywords: ["mushrooms", "mushroom", "shroom", "shrooms", "psilocybin", "psychedelic"], title: "Shop Mushrooms" },
    { path: "/shop?category=Wellness", keywords: ["wellness", "health", "supplement", "vitamins", "natural"], title: "Shop Wellness" },
];

// ─── Deep Search Function ───────────────────────────────────

export interface DeepSearchResult {
    products: ReturnType<typeof searchProducts>;
    pages: { path: string; title: string; score: number }[];
    categories: CategoryInfo[];
}

export function deepSearch(query: string): DeepSearchResult {
    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter((w) => w.length >= 2);

    // Search products
    const products = searchProducts(q, 8);

    // Search pages
    const pages = PAGE_INDEX.map((page) => {
        let score = 0;
        const titleLower = page.title.toLowerCase();
        const pathLower = page.path.toLowerCase();

        // Exact query match in title or keywords
        if (titleLower.includes(q)) score += 10;
        if (page.keywords.some((k) => k === q)) score += 10;

        // Partial keyword matches
        for (const kw of page.keywords) {
            if (kw.includes(q) || q.includes(kw)) score += 5;
        }

        // Word-level matching
        for (const word of words) {
            if (word.length < 3) continue;
            if (titleLower.includes(word)) score += 3;
            if (pathLower.includes(word)) score += 2;
            if (page.keywords.some((k) => k.includes(word))) score += 3;
        }

        return { path: page.path, title: page.title, score };
    })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    // Search categories
    const allCategories = getCategories();
    const categories = allCategories.filter((cat) => {
        const catLower = cat.name.toLowerCase();
        if (catLower.includes(q) || q.includes(catLower)) return true;
        return words.some((w) => w.length >= 3 && catLower.includes(w));
    });

    return { products, pages, categories };
}

// ─── Quick Search Patterns ──────────────────────────────────

const SEARCH_PATTERN = /\b(search|find|look\s*(for|up)|got\s*any)\s+(.+)/i;
const DEEP_SEARCH_PATTERN = /\b(everything\s*about|all\s*about|info\s*(on|about)|tell\s*me\s*about|what\s*do\s*you\s*(have|know)\s*about|where\s*can\s*i\s*find)\s+(.+)/i;

// ─── Commerce Patterns (UCP) ────────────────────────────────

const ADD_TO_CART_PATTERN = /\b(add|put|throw|toss)\s+(.+?)\s+(to|in|into)\s*(my\s*)?(cart|basket|bag)\b/i;
// Tighter pattern — requires "a/an/some/the/one/two/1/2" etc. before the product name
// Prevents false matches on "buy some edibles" (browsing) vs "buy a Blue Dream" (cart)
const ADD_TO_CART_SHORT = /\b(add|order|buy|get\s*me)\s+(\d+\s+|an?\s+|some\s+|the\s+|one\s+|two\s+|three\s+)?(.{4,}?)\s+(to\s+cart|please|now|asap)\b/i;
const VIEW_CART_PATTERN = /\b(what'?s?\s*(in\s*)?(my\s*)?cart|view\s*cart|show\s*(my\s*)?cart|my\s*cart|cart\s*items?)\b/i;
const CHECKOUT_PATTERN = /\b(checkout|check\s*out|ready\s*to\s*(pay|buy|order)|place\s*(my\s*)?order|buy\s*now|complete\s*(my\s*)?(order|purchase)|help\s*me\s*(checkout|check\s*out|pay|order|purchase)|i\s*want\s*to\s*(pay|order|checkout|check\s*out)|finish\s*(my\s*)?(order|purchase)|proceed\s*to\s*(checkout|payment))\b/i;
const REMOVE_FROM_CART_PATTERN = /\b(remove|delete|take\s*out|drop)\s+(.+?)\s+(from\s*)?(my\s*)?(cart|basket|bag)\b/i;
const CLEAR_CART_PATTERN = /\b(clear|empty|remove\s*all|delete\s*all|wipe)\s*(my\s*)?(entire\s*)?(cart|basket|bag)\b|\b(empty|clear)\s*(everything\s*)?(from|in)\s*(my\s*)?(cart|basket|bag)\b/i;

// ─── Compliance Pre-Check (runs BEFORE all pattern matching) ──

const UNDERAGE_PATTERN = /\b(i'?m|i\s+am|age\s*[=:]\s*)\s*(1[0-8]|[1-9])\b|\b(under\s*(age|19|18)|not\s*(19|18)\s*(yet)?|minor|too\s*young)\b/i;
const MEDICAL_ADVICE_PATTERN = /\b(diagnos|prescription|prescribe|doctor|physician|cure|treat\s+(my|a|the)|medical\s+advice|clinical\s+trial|dosage\s+for\s+(my|a)|will\s+(it|this|cannabis)\s+(cure|treat|heal|fix))\b/i;
const LEGAL_ADVICE_PATTERN = /\b(legal\s+advice|lawyer|is\s+it\s+(legal|illegal)\s+to|can\s+i\s+(get\s+)?arrested|law\s+about|sue|court\s+case|criminal)\b/i;

function compliancePreCheck(message: string): TurboResult | null {
    // Age gate: if user indicates they're underage, block immediately
    if (UNDERAGE_PATTERN.test(message)) {
        return {
            handled: true,
            text: "You must be **19+** to browse or purchase cannabis products. This is a legal requirement we take seriously — no exceptions. If you believe this is an error, please contact our support team.",
            actions: [],
            model: "turbo",
        };
    }

    // Medical advice: redirect to healthcare provider
    if (MEDICAL_ADVICE_PATTERN.test(message)) {
        return {
            handled: true,
            text: "I appreciate you trusting me with that question, but I'm not qualified to give medical advice. For health-related questions, please consult your healthcare provider. What I *can* do is share what effects our customers commonly report for different products — would that be helpful?",
            actions: [],
            model: "turbo",
        };
    }

    // Legal advice: redirect appropriately
    if (LEGAL_ADVICE_PATTERN.test(message)) {
        return {
            handled: true,
            text: "That's a great question, but I'm not able to provide legal advice. For legal questions about cannabis in your province, I'd recommend checking your provincial cannabis authority's website. I *can* share general info about our delivery policies and age requirements — want me to do that?",
            actions: [],
            model: "turbo",
        };
    }

    return null; // No compliance issue
}

// ─── Main Turbo Router ─────────────────────────────────────

export function turboRoute(message: string, sessionId?: string): TurboResponse {
    const trimmed = message.trim();
    const lower = trimmed.toLowerCase();

    // ── 0. Compliance pre-check (BEFORE all pattern matching) ──
    const complianceBlock = compliancePreCheck(trimmed);
    if (complianceBlock) return complianceBlock;

    // ── 1. Navigation (instant page flip) ───────────────────
    for (const [pattern, path, text] of NAV_PATTERNS) {
        if (pattern.test(trimmed)) {
            return {
                handled: true,
                text,
                actions: [{ type: "NAVIGATE", payload: path }],
                model: "turbo",
            };
        }
    }

    // ── 2. Commerce: Add to Cart (UCP) ──────────────────────
    if (sessionId) {
        const addMatch = ADD_TO_CART_PATTERN.exec(trimmed);
        if (addMatch && addMatch[2]) {
            const productQuery = addMatch[2].trim();
            const result = addToCart(sessionId, productQuery);
            return {
                handled: true,
                text: result.message,
                actions: result.success
                    ? [{ type: "ADD_TO_CART", payload: JSON.stringify(result.item) }]
                    : [],
                cart: result.cart,
                model: "turbo",
            };
        }

        // Remove from cart
        const removeMatch = REMOVE_FROM_CART_PATTERN.exec(trimmed);
        if (removeMatch && removeMatch[2]) {
            const productQuery = removeMatch[2].trim();
            const result = removeFromCart(sessionId, productQuery);
            return {
                handled: true,
                text: result.message,
                actions: result.success
                    ? [{ type: "REMOVE_FROM_CART", payload: productQuery }]
                    : [],
                cart: result.cart,
                model: "turbo",
            };
        }

        // View cart
        if (VIEW_CART_PATTERN.test(trimmed)) {
            const cartDisplay = formatCartForDisplay(sessionId);
            const cart = getCart(sessionId);
            return {
                handled: true,
                text: cartDisplay,
                actions: [{ type: "VIEW_CART", payload: sessionId }],
                cart,
                model: "turbo",
            };
        }

        // Clear cart
        if (CLEAR_CART_PATTERN.test(trimmed)) {
            const cart = clearCart(sessionId);
            return {
                handled: true,
                text: "Cart cleared! Ready to start fresh — what would you like to browse?",
                actions: [{ type: "CLEAR_CART", payload: "" }],
                cart,
                model: "turbo",
            };
        }

        // Checkout — with payment guidance
        if (CHECKOUT_PATTERN.test(trimmed)) {
            const cart = getCart(sessionId);
            if (cart.items.length === 0) {
                return {
                    handled: true,
                    text: "Your cart is empty! Browse our shop or tell me what you're looking for, and I'll help you find the perfect products. 🛒",
                    actions: [{ type: "NAVIGATE", payload: "/shop" }],
                    cart,
                    model: "turbo",
                };
            }
            const shippingNote = cart.subtotal >= 149
                ? "You qualify for **FREE shipping**! 🎉"
                : `Add **$${(149 - cart.subtotal).toFixed(2)}** more for **FREE shipping**.`;

            return {
                handled: true,
                text: `Ready to checkout! 🛒\n\n**${cart.itemCount} item${cart.itemCount !== 1 ? "s" : ""}** — **$${cart.subtotal.toFixed(2)} CAD**\n${shippingNote}\n\n**Payment options:**\n• 💳 Credit Card (Visa, Mastercard, Amex)\n• 📧 Interac e-Transfer\n• ₿ Cryptocurrency\n\nYou can check out as a guest or sign in for order tracking. Taking you to checkout now!`,
                actions: [{ type: "CHECKOUT", payload: sessionId }],
                cart,
                model: "turbo",
            };
        }
    }

    // ── 3. Category browsing (instant filter) ───────────────
    for (const [pattern, category] of CATEGORY_PATTERNS) {
        if (pattern.test(trimmed)) {
            const products = getProductsByCategory(category, 6);
            const productResults = products.map((p) => ({
                id: p.id,
                name: p.name,
                shortName: getShortName(p),
                category: p.category,
                price: p.price,
                image: p.image,
                slug: p.slug,
                path: p.path,
                thc: p.specs.thc,
                cbd: p.specs.cbd,
                score: 10,
            }));
            return {
                handled: true,
                text: `Here are our top ${category} picks — ${products.length} shown from ${PRODUCTS.filter(p => p.category === category).length} in stock. 🔥`,
                actions: [{ type: "FILTER", payload: category }],
                products: productResults,
                model: "turbo",
            };
        }
    }

    // ── 4. Category listing ─────────────────────────────────
    if (CATEGORY_LIST_PATTERNS.test(trimmed)) {
        const cats = getCategories();
        const catText = cats.map((c) => `• **${c.name}** (${c.count})`).join("\n");
        return {
            handled: true,
            text: `Here's everything we carry:\n\n${catText}\n\nWhat catches your eye?`,
            actions: [],
            categories: cats,
            model: "turbo",
        };
    }

    // ── 5. Sales & deals ────────────────────────────────────
    if (SALE_PATTERNS.test(trimmed)) {
        const saleProducts = getOnSaleProducts(6);
        if (saleProducts.length > 0) {
            const productResults = saleProducts.map((p) => ({
                id: p.id,
                name: p.name,
                shortName: getShortName(p),
                category: p.category,
                price: p.price,
                image: p.image,
                slug: p.slug,
                path: p.path,
                thc: p.specs.thc,
                cbd: p.specs.cbd,
                score: 5,
            }));
            return {
                handled: true,
                text: `Here are our current deals! 🔥 Great finds at great prices.`,
                actions: [],
                products: productResults,
                model: "turbo",
            };
        }
    }

    // ── 6. Featured / popular ───────────────────────────────
    if (FEATURED_PATTERNS.test(trimmed)) {
        const featured = getFeaturedProducts(6);
        const productResults = featured.map((p) => ({
            id: p.id,
            name: p.name,
            shortName: getShortName(p),
            category: p.category,
            price: p.price,
            image: p.image,
            slug: p.slug,
            path: p.path,
            thc: p.specs.thc,
            cbd: p.specs.cbd,
            score: 8,
        }));
        return {
            handled: true,
            text: `Our most popular picks right now — customers love these! 🌟`,
            actions: [],
            products: productResults,
            model: "turbo",
        };
    }

    // ── 7. Deep search ("everything about X", "tell me about X") ──
    const deepMatch = DEEP_SEARCH_PATTERN.exec(trimmed);
    if (deepMatch) {
        const query = deepMatch[deepMatch.length - 1].trim();
        const results = deepSearch(query);
        const parts: string[] = [];

        if (results.products.length > 0) {
            parts.push(`**Products** (${results.products.length} found):`);
            results.products.slice(0, 4).forEach((p) => {
                parts.push(`  • ${p.name} — $${p.price}`);
            });
        }

        if (results.categories.length > 0) {
            parts.push(`\n**Categories**: ${results.categories.map((c) => `${c.name} (${c.count})`).join(", ")}`);
        }

        if (results.pages.length > 0) {
            parts.push(`\n**Pages**: ${results.pages.map((p) => p.title).join(", ")}`);
        }

        if (parts.length > 0) {
            return {
                handled: true,
                text: `Here's everything I found for "${query}":\n\n${parts.join("\n")}`,
                actions: results.products.length > 0
                    ? [{ type: "SEARCH", payload: query }]
                    : [],
                products: results.products.length > 0 ? results.products : undefined,
                categories: results.categories.length > 0 ? results.categories : undefined,
                model: "turbo",
            };
        }
    }

    // ── 8. Quick search ─────────────────────────────────────
    const searchMatch = SEARCH_PATTERN.exec(trimmed);
    if (searchMatch && searchMatch[3]) {
        const query = searchMatch[3].trim();
        const results = searchProducts(query, 6);
        if (results.length > 0) {
            return {
                handled: true,
                text: `Found ${results.length} result${results.length > 1 ? "s" : ""} for "${query}" — here you go! 🔍`,
                actions: [{ type: "SEARCH", payload: query }],
                products: results,
                model: "turbo",
            };
        }
    }

    // ── 9. Quick replies (FAQ-style, humanized) ─────────────
    for (const [pattern, getText] of QUICK_REPLIES) {
        if (pattern.test(trimmed)) {
            return {
                handled: true,
                text: getText(),
                actions: [],
                model: "turbo",
            };
        }
    }

    // ── 10. Semantic category browsing (conversational intent) ──
    for (const [pattern, category] of SEMANTIC_CATEGORY_PATTERNS) {
        if (pattern.test(trimmed)) {
            const products = getProductsByCategory(category, 6);
            const productResults = products.map((p) => ({
                id: p.id,
                name: p.name,
                shortName: getShortName(p),
                category: p.category,
                price: p.price,
                image: p.image,
                slug: p.slug,
                path: p.path,
                thc: p.specs.thc,
                cbd: p.specs.cbd,
                score: 10,
            }));
            const total = PRODUCTS.filter(p => p.category === category).length;
            return {
                handled: true,
                text: pick([
                    `Great taste! Here are our top **${category}** picks — ${products.length} shown from ${total} in stock. Let me know if anything catches your eye!`,
                    `You're in luck — we've got ${total} **${category}** products! Here are some favourites to get you started.`,
                    `Love it! Check out these **${category}** options — all top quality. Want me to narrow it down?`,
                ]),
                actions: [{ type: "FILTER", payload: category }],
                products: productResults,
                model: "turbo",
            };
        }
    }

    // ── 11. Short "add/buy to cart" (tight match — must say "to cart" or "please/now") ──
    if (sessionId) {
        const shortAdd = ADD_TO_CART_SHORT.exec(trimmed);
        if (shortAdd && shortAdd[3] && shortAdd[3].length > 3) {
            const productQuery = shortAdd[3].trim();
            const result = addToCart(sessionId, productQuery);
            if (result.success) {
                return {
                    handled: true,
                    text: result.message,
                    actions: [{ type: "ADD_TO_CART", payload: JSON.stringify(result.item) }],
                    cart: result.cart,
                    model: "turbo",
                };
            }
        }
    }

    // ── 12. Effects-based search ("something for relaxation", "I want energy") ──
    const EFFECTS_PATTERN = /\b(something|anything|products?)\s*(for|that\s*(helps?|makes?|gives?))\s+(relax|sleep|energy|focus|creat|calm|happy|euphori|uplift|pain|stress|anxiety)/i;
    const EFFECTS_INTENT = /\b(i\s*want|i\s*need|looking\s*for|help\s*with)\s*(something\s*)?(for\s+)?(relax|sleep|energy|focus|creat|calm|happy|euphori|uplift|pain|stress|anxiety)/i;

    const effectsMatch = EFFECTS_PATTERN.exec(trimmed) || EFFECTS_INTENT.exec(trimmed);
    if (effectsMatch) {
        const rawEffect = effectsMatch[effectsMatch.length - 1].toLowerCase();
        // Map common words to effect tags
        const effectMap: Record<string, string> = {
            "relax": "relaxed", "sleep": "sleepy", "energy": "energetic",
            "focus": "focused", "creat": "creative", "calm": "calm",
            "happy": "happy", "euphori": "euphoric", "uplift": "uplifted",
            "pain": "pain-relief", "stress": "calm", "anxiety": "calm",
        };
        const effect = effectMap[rawEffect] || rawEffect;
        const products = getProductsByEffect(effect, 6);
        if (products.length > 0) {
            const productResults = products.map((p) => ({
                id: p.id, name: p.name, shortName: getShortName(p),
                category: p.category, price: p.price, image: p.image,
                slug: p.slug, path: p.path,
                thc: p.specs.thc, cbd: p.specs.cbd, score: 8,
            }));
            return {
                handled: true,
                text: pick([
                    `Great question! Here are products our customers commonly associate with a **${effect}** experience. Remember, effects vary by person.`,
                    `I've got some options that customers often describe as **${effect}**. Everyone's experience is different, so start low and see what works for you!`,
                ]),
                actions: [{ type: "SEARCH", payload: effect }],
                products: productResults,
                model: "turbo",
            };
        }
    }

    // ── Not a turbo intent → pass to LLM ───────────────────
    return { handled: false };
}

