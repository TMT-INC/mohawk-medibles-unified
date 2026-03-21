/**
 * Wishlist Sync API — /api/wishlist/sync
 * ═══════════════════════════════════════
 * POST: Save wishlist to server for cross-device persistence.
 * GET: Retrieve stored wishlist.
 */

import { NextRequest, NextResponse } from "next/server";
import { setWishlist, getWishlist } from "@/lib/wishlistStore";
import { pushEvent } from "@/lib/activityStream";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

const COOKIE_NAME = "mm-visitor";

export async function POST(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    const visitorId = req.cookies.get(COOKIE_NAME)?.value;
    if (!visitorId) {
        return NextResponse.json({ ok: true, synced: false });
    }

    let body: { items?: unknown[] };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!Array.isArray(body.items)) {
        return NextResponse.json({ error: "items[] required" }, { status: 400 });
    }

    const items = body.items
        .filter((i: any) => i && typeof i.id === "string" && typeof i.name === "string")
        .slice(0, 50)
        .map((i: any) => ({
            id: String(i.id),
            slug: String(i.slug || ""),
            name: String(i.name).slice(0, 200),
            price: typeof i.price === "number" ? i.price : 0,
            image: String(i.image || "").slice(0, 500),
            category: String(i.category || "").slice(0, 100),
            addedAt: typeof i.addedAt === "number" ? i.addedAt : Date.now(),
        }));

    setWishlist(visitorId, items);

    if (items.length > 0) {
        pushEvent("wishlist_add", { productName: items[0].name });
    }

    return NextResponse.json({ ok: true, synced: true, count: items.length });
}

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    const visitorId = req.cookies.get(COOKIE_NAME)?.value;
    if (!visitorId) {
        return NextResponse.json({ items: [] });
    }

    return NextResponse.json({ items: getWishlist(visitorId) });
}
