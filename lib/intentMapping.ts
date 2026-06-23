// =============================================================
// Intent-Based Shopping — Product → Mood/Intent Mapping
// Maps products to shopping intents based on strain type,
// category, effects, terpenes, and description keywords.
// =============================================================

import type { Product } from "@/lib/productData";

export type ShoppingIntent = "relax" | "energize" | "balance" | "sleep" | "unwind";

export interface IntentConfig {
    key: ShoppingIntent;
    label: string;
    description: string;
    tagline: string;
    icon: string; // Lucide icon name
    accentColor: string; // Tailwind color classes
    gradientFrom: string;
    gradientTo: string;
    pillActive: string;
    pillText: string;
}

export const INTENTS: IntentConfig[] = [
    {
        key: "relax",
        label: "Relax",
        description: "Wind down, de-stress, and let the tension melt away",
        tagline: "Wind down, de-stress",
        icon: "Cloud",
        accentColor: "purple",
        gradientFrom: "from-purple-600/20",
        gradientTo: "to-violet-900/30",
        pillActive: "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40",
        pillText: "text-purple-400",
    },
    {
        key: "energize",
        label: "Energize",
        description: "Get creative, stay active, and spark your inspiration",
        tagline: "Get creative, stay active",
        icon: "Zap",
        accentColor: "amber",
        gradientFrom: "from-amber-500/20",
        gradientTo: "to-orange-900/30",
        pillActive: "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40",
        pillText: "text-amber-400",
    },
    {
        key: "balance",
        label: "Balance",
        description: "Find your center with a smooth, even experience",
        tagline: "Find your center",
        icon: "Leaf",
        accentColor: "emerald",
        gradientFrom: "from-emerald-600/20",
        gradientTo: "to-teal-900/30",
        pillActive: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40",
        pillText: "text-emerald-400",
    },
    {
        key: "sleep",
        label: "Sleep",
        description: "Drift off peacefully into deep, restful slumber",
        tagline: "Drift off peacefully",
        icon: "Moon",
        accentColor: "indigo",
        gradientFrom: "from-indigo-600/20",
        gradientTo: "to-blue-950/30",
        pillActive: "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40",
        pillText: "text-indigo-400",
    },
    {
        key: "unwind",
        label: "Unwind",
        description: "Sink into a cozy, mellow body buzz and chill out",
        tagline: "Get cozy & mellow",
        icon: "Heart",
        accentColor: "rose",
        gradientFrom: "from-rose-600/20",
        gradientTo: "to-red-950/30",
        pillActive: "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40",
        pillText: "text-rose-400",
    },
];

export function getIntentConfig(key: ShoppingIntent): IntentConfig {
    return INTENTS.find((i) => i.key === key) ?? INTENTS[0];
}

// ── Keyword dictionaries for description-based matching ──────

const RELAX_KEYWORDS = [
    "relax", "relaxing", "relaxation", "calm", "chill", "mellow",
    "unwind", "soothing", "tranquil", "stress-free", "de-stress",
    "couch", "evening", "laid-back",
];

const ENERGIZE_KEYWORDS = [
    "energy", "energize", "energizing", "energetic", "uplifting",
    "creative", "creativity", "focus", "focused", "motivat",
    "active", "daytime", "morning", "euphori", "social",
    "productivity", "stimulat", "cerebral", "invigorat",
];

const BALANCE_KEYWORDS = [
    "balance", "balanced", "hybrid", "versatile", "moderate",
    "well-rounded", "smooth", "even", "functional", "gentle",
    "any time", "anytime", "all-day",
];

const SLEEP_KEYWORDS = [
    "sleep", "sleepy", "insomnia", "bedtime", "nighttime",
    "night-time", "drowsy", "sedat", "drift off", "restful",
    "deep sleep", "knockout", "heavy", "couch-lock",
];

const UNWIND_KEYWORDS = [
    "mellow", "cozy", "cosy", "comfort", "comforting", "body buzz",
    "body high", "heavy body", "warm", "soothing", "lounge",
    "couch", "snug", "easy-going", "laid-back", "chill",
];

function textMatchesKeywords(text: string, keywords: string[]): boolean {
    const lower = text.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
}

// ── Main mapping function ────────────────────────────────────

export function getProductIntents(product: Product): ShoppingIntent[] {
    const intents = new Set<ShoppingIntent>();
    const type = product.specs.type.toLowerCase();
    const category = product.category.toLowerCase();
    const effects = product.effects.map((e) => e.toLowerCase());
    const terpenes = product.specs.terpenes.map((t) => t.toLowerCase());
    const text = `${product.name} ${product.shortDescription} ${product.category}`;

    // ── Strain type mapping ──
    if (type.includes("indica")) {
        intents.add("relax");
        intents.add("sleep");
    }
    if (type.includes("sativa")) {
        intents.add("energize");
    }
    if (type.includes("hybrid")) {
        intents.add("balance");
    }

    // ── Category mapping ──
    if (category.includes("bath") || category.includes("topical")) {
        intents.add("unwind");
        intents.add("relax");
    }
    if (category === "cbd" || category.includes("capsule")) {
        intents.add("unwind");
    }

    // ── Effects mapping ──
    if (effects.includes("relaxed") || effects.includes("calm")) {
        intents.add("relax");
    }
    if (effects.includes("sleepy") || effects.includes("sedated")) {
        intents.add("sleep");
    }
    if (effects.includes("energetic") || effects.includes("uplifted") || effects.includes("creative") || effects.includes("focused")) {
        intents.add("energize");
    }
    if (effects.includes("happy") || effects.includes("euphoric")) {
        intents.add("balance");
        intents.add("energize");
    }
    if (effects.includes("relaxed") || effects.includes("body-high") || effects.includes("tingly")) {
        intents.add("unwind");
    }

    // ── Terpene mapping ──
    if (terpenes.includes("myrcene") || terpenes.includes("linalool")) {
        intents.add("relax");
        intents.add("sleep");
    }
    if (terpenes.includes("limonene") || terpenes.includes("pinene") || terpenes.includes("terpinolene")) {
        intents.add("energize");
    }
    if (terpenes.includes("caryophyllene") || terpenes.includes("bisabolol") || terpenes.includes("humulene")) {
        intents.add("unwind");
    }

    // ── Description keyword matching ──
    if (textMatchesKeywords(text, RELAX_KEYWORDS)) intents.add("relax");
    if (textMatchesKeywords(text, ENERGIZE_KEYWORDS)) intents.add("energize");
    if (textMatchesKeywords(text, BALANCE_KEYWORDS)) intents.add("balance");
    if (textMatchesKeywords(text, SLEEP_KEYWORDS)) intents.add("sleep");
    if (textMatchesKeywords(text, UNWIND_KEYWORDS)) intents.add("unwind");

    // If no intents matched at all, default to balance
    if (intents.size === 0) {
        intents.add("balance");
    }

    return Array.from(intents);
}

// ── Filter products by intent ────────────────────────────────

export function filterByIntent(products: Product[], intent: ShoppingIntent): Product[] {
    return products.filter((p) => getProductIntents(p).includes(intent));
}
