/**
 * Mohawk Medibles — Behavioral Intelligence Tracker
 * ═══════════════════════════════════════════════════
 * PIPEDA-Compliant behavioral tracking for personalized experiences.
 *
 * Tracks: categories browsed, products viewed, search queries, page visits.
 * Does NOT track: PII, IP addresses, or any identifying information.
 * All data stored in localStorage (client-side only, user-controlled).
 *
 * Province compliance data for legal age enforcement.
 */

// ─── Types ──────────────────────────────────────────

export interface BrowsingBehavior {
    /** Categories the user has browsed (with visit count) */
    categoryInterests: Record<string, number>;
    /** Recent product slugs viewed (last 20) */
    recentProducts: string[];
    /** Search queries made (last 10) */
    searchQueries: string[];
    /** Page paths visited this session */
    pagesVisited: string[];
    /** Province detected from delivery page visits */
    detectedProvince?: string;
    /** User type: new, returning, or authenticated */
    userType: "new" | "returning" | "authenticated";
    /** Total visits to the site */
    visitCount: number;
    /** First visit timestamp */
    firstVisit: number;
    /** Last visit timestamp */
    lastVisit: number;
}

export interface ProvinceCompliance {
    legalAge: number;
    possessionLimit: string;
    homeGrowing: boolean;
    keyRestriction: string;
}

// ─── Province Compliance Data ────────────────────────

export const PROVINCE_COMPLIANCE: Record<string, ProvinceCompliance> = {
    ontario: { legalAge: 19, possessionLimit: "30g in public", homeGrowing: true, keyRestriction: "No consumption in vehicles or enclosed public spaces" },
    quebec: { legalAge: 21, possessionLimit: "30g in public", homeGrowing: false, keyRestriction: "No home growing permitted. Legal age is 21, not 18 or 19" },
    alberta: { legalAge: 18, possessionLimit: "30g in public", homeGrowing: true, keyRestriction: "Municipalities may restrict public consumption areas" },
    "british-columbia": { legalAge: 19, possessionLimit: "30g in public", homeGrowing: true, keyRestriction: "No smoking in most public indoor areas" },
    manitoba: { legalAge: 19, possessionLimit: "30g in public", homeGrowing: false, keyRestriction: "No home growing permitted in Manitoba" },
    saskatchewan: { legalAge: 19, possessionLimit: "30g in public", homeGrowing: true, keyRestriction: "Municipalities may restrict public use" },
    "nova-scotia": { legalAge: 19, possessionLimit: "30g in public", homeGrowing: true, keyRestriction: "No smoking where tobacco is prohibited" },
    "new-brunswick": { legalAge: 19, possessionLimit: "30g in public", homeGrowing: true, keyRestriction: "No public consumption except on private property" },
    "newfoundland-and-labrador": { legalAge: 19, possessionLimit: "30g in public", homeGrowing: true, keyRestriction: "No smoking in enclosed public places" },
    "prince-edward-island": { legalAge: 19, possessionLimit: "30g in public", homeGrowing: true, keyRestriction: "No public consumption except designated areas" },
    "northwest-territories": { legalAge: 19, possessionLimit: "30g in public", homeGrowing: true, keyRestriction: "Consumption rules set by community" },
    nunavut: { legalAge: 19, possessionLimit: "30g in public", homeGrowing: true, keyRestriction: "Community-level restrictions may apply" },
    yukon: { legalAge: 19, possessionLimit: "30g in public", homeGrowing: true, keyRestriction: "No consumption in public spaces" },
};

// ─── Storage Key ─────────────────────────────────────

const BEHAVIOR_KEY = "mm_browsing_behavior";

// ─── Read / Write ────────────────────────────────────

export function getBehavior(): BrowsingBehavior {
    if (typeof window === "undefined") {
        return createDefaultBehavior();
    }
    try {
        const raw = localStorage.getItem(BEHAVIOR_KEY);
        if (!raw) return initBehavior();
        const data = JSON.parse(raw) as BrowsingBehavior;
        // Update visit tracking
        data.lastVisit = Date.now();
        data.visitCount = (data.visitCount || 0) + 1;
        data.userType = data.visitCount > 1 ? "returning" : "new";
        saveBehavior(data);
        return data;
    } catch {
        return initBehavior();
    }
}

function initBehavior(): BrowsingBehavior {
    const behavior = createDefaultBehavior();
    behavior.firstVisit = Date.now();
    behavior.lastVisit = Date.now();
    behavior.visitCount = 1;
    saveBehavior(behavior);
    return behavior;
}

function createDefaultBehavior(): BrowsingBehavior {
    return {
        categoryInterests: {},
        recentProducts: [],
        searchQueries: [],
        pagesVisited: [],
        userType: "new",
        visitCount: 0,
        firstVisit: Date.now(),
        lastVisit: Date.now(),
    };
}

function saveBehavior(data: BrowsingBehavior): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(BEHAVIOR_KEY, JSON.stringify(data));
    } catch {
        // localStorage full or unavailable — silently fail
    }
}

// ─── Tracking Methods ────────────────────────────────

export function trackCategoryView(category: string): void {
    const behavior = getBehaviorDirect();
    if (!behavior) return;
    behavior.categoryInterests[category] = (behavior.categoryInterests[category] || 0) + 1;
    saveBehavior(behavior);
}

export function trackProductView(slug: string): void {
    const behavior = getBehaviorDirect();
    if (!behavior) return;
    // Keep last 20, no duplicates at head
    behavior.recentProducts = [slug, ...behavior.recentProducts.filter((s) => s !== slug)].slice(0, 20);
    saveBehavior(behavior);
}

export function trackSearch(query: string): void {
    const behavior = getBehaviorDirect();
    if (!behavior) return;
    behavior.searchQueries = [query, ...behavior.searchQueries.filter((q) => q !== query)].slice(0, 10);
    saveBehavior(behavior);
}

export function trackPageVisit(path: string): void {
    const behavior = getBehaviorDirect();
    if (!behavior) return;
    // Detect province from delivery page path
    const deliveryMatch = path.match(/^\/delivery\/([a-z-]+)/);
    if (deliveryMatch) {
        behavior.detectedProvince = deliveryMatch[1];
    }
    behavior.pagesVisited = [...behavior.pagesVisited, path].slice(-30);
    saveBehavior(behavior);
}

// ─── Server-Side Tracking (fire-and-forget) ─────────

/** Post event to /api/track for server-side CRM aggregation */
export function trackServerEvent(
    event: "category_view" | "product_view" | "search" | "page_visit" | "cart_add",
    data: Record<string, string>
): void {
    if (typeof window === "undefined") return;
    fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, data }),
    }).catch(() => { /* silent — fire and forget */ });
}

export function setUserAuthenticated(): void {
    const behavior = getBehaviorDirect();
    if (!behavior) return;
    behavior.userType = "authenticated";
    saveBehavior(behavior);
}

/** Direct read without incrementing visitCount */
function getBehaviorDirect(): BrowsingBehavior | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(BEHAVIOR_KEY);
        if (!raw) return initBehavior();
        return JSON.parse(raw) as BrowsingBehavior;
    } catch {
        return null;
    }
}

// ─── Prompt Sanitization ──────────────────────────────

/** Strip prompt injection patterns from user-controlled strings */
function sanitizeForPrompt(text: string): string {
    return text
        .replace(/ignore\s*(all\s*)?(previous|prior|above)\s*(instructions?|rules?|prompts?)/gi, "")
        .replace(/(forget|disregard|override|bypass)\s*(your|all|the)\s*(rules?|instructions?|prompt)/gi, "")
        .replace(/(you\s+are\s+now|act\s+as|pretend\s+to\s+be|new\s+persona|system\s+prompt)/gi, "")
        .replace(/(jailbreak|DAN|developer\s+mode)/gi, "")
        .replace(/[\x00-\x1F\x7F]/g, "")
        .replace(/\s{3,}/g, " ")
        .trim()
        .slice(0, 100);
}

// ─── Cart Item Type (shared between client & server) ─────

export interface CartItemInfo {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

// ─── Context Builder (for MedAgent prompt injection) ──

export function buildBehavioralContext(behavior: BrowsingBehavior, cartTotal?: number, cartItems?: CartItemInfo[]): string {
    const parts: string[] = [];

    // User type context
    if (behavior.userType === "new") {
        parts.push("CUSTOMER CONTEXT: This appears to be a first-time visitor. Be extra welcoming and offer guidance without being overwhelming.");
    } else if (behavior.userType === "returning") {
        parts.push(`CUSTOMER CONTEXT: Returning visitor (${behavior.visitCount} visits). They know the site. Be helpful without over-explaining basics.`);
    } else if (behavior.userType === "authenticated") {
        parts.push("CUSTOMER CONTEXT: Authenticated customer with an account. They trust us. Treat them like a valued regular.");
    }

    // Category interests (sanitized)
    const topCategories = Object.entries(behavior.categoryInterests)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => sanitizeForPrompt(cat))
        .filter(Boolean);

    if (topCategories.length > 0) {
        parts.push(`BROWSING INTERESTS: This customer has been exploring: ${topCategories.join(", ")}. If they ask for help, these categories may be relevant — but don't assume. Ask what they're looking for.`);
    }

    // Recent searches (sanitized)
    if (behavior.searchQueries.length > 0) {
        const safeQueries = behavior.searchQueries.slice(0, 3).map(sanitizeForPrompt).filter(Boolean);
        if (safeQueries.length > 0) {
            parts.push(`RECENT SEARCHES: ${safeQueries.join(", ")}. If relevant, you can reference these to show attentiveness — but naturally, not creepily.`);
        }
    }

    // Cart awareness — item-level detail when available
    if (cartItems && cartItems.length > 0) {
        const itemList = cartItems
            .map((item) => `  • ${item.name} × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`)
            .join("\n");
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const remaining = 149 - total;

        parts.push(`CART CONTENTS (${cartItems.length} item${cartItems.length !== 1 ? "s" : ""}, $${total.toFixed(2)} total):\n${itemList}\n${
            remaining > 0
                ? `Customer is $${remaining.toFixed(2)} away from free shipping ($149+ threshold).`
                : `Customer qualifies for FREE shipping.`
        }\nIMPORTANT: You know exactly what is in the customer's cart. When they ask about their cart, list the items by name. When they ask to remove something, identify the exact item and use [ACTION: REMOVE_FROM_CART] with the item name. To clear everything, use [ACTION: CLEAR_CART].`);
    } else if (cartTotal !== undefined && cartTotal > 0) {
        // Fallback to total-only awareness
        const remaining = 149 - cartTotal;
        if (remaining > 0) {
            parts.push(`CART STATUS: Customer has $${cartTotal.toFixed(2)} in their cart. They are $${remaining.toFixed(2)} away from free shipping ($149+ threshold). If it comes up naturally, you can mention this — but never push products just to hit the threshold.`);
        } else {
            parts.push(`CART STATUS: Customer has $${cartTotal.toFixed(2)} in their cart and qualifies for FREE shipping. If they ask about shipping, reassure them.`);
        }
    }

    // Province compliance
    if (behavior.detectedProvince && PROVINCE_COMPLIANCE[behavior.detectedProvince]) {
        const compliance = PROVINCE_COMPLIANCE[behavior.detectedProvince];
        const provinceName = behavior.detectedProvince.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        parts.push(`PROVINCE COMPLIANCE (${provinceName}): Legal age is ${compliance.legalAge}+. Possession limit: ${compliance.possessionLimit}. ${compliance.keyRestriction}. Always use the correct legal age for this province when discussing age requirements.`);
    }

    return parts.length > 0 ? "\n\n" + parts.join("\n\n") : "";
}

// ─── Authenticated User Context Builder ──────────────

export interface AuthenticatedUserData {
    name?: string;
    orderCount: number;
    totalSpend: number;
    topCategories: string[];
    lastOrderDate?: string;
    segment: string;
}

export function buildAuthenticatedContext(userData: AuthenticatedUserData): string {
    const parts: string[] = [];

    if (userData.name) {
        parts.push(`RETURNING CUSTOMER: ${userData.name} (${userData.segment} tier). ${userData.orderCount} previous orders, $${userData.totalSpend.toFixed(2)} total spend.`);
    }

    if (userData.topCategories.length > 0) {
        parts.push(`PURCHASE HISTORY CATEGORIES: ${userData.topCategories.join(", ")}. They have established preferences — if they ask for recommendations, lean toward these categories unless they specifically want to try something new.`);
    }

    if (userData.lastOrderDate) {
        const daysSince = Math.floor((Date.now() - new Date(userData.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince > 60) {
            parts.push(`NOTE: It's been ${daysSince} days since their last order. They may need a warm welcome back — but don't mention the gap unless they do. Just be naturally glad to see them.`);
        }
    }

    parts.push("IMPORTANT: Never reveal specific purchase amounts, order counts, or segment labels to the customer. Use this context to be a better guide, not to show off data.");

    return parts.join("\n\n");
}
