/**
 * Wampum-side order lookup endpoint.
 *
 * Wampum calls this when matching an incoming Interac e-transfer to a
 * Mohawk Medibles order. Two query modes:
 *   - byOrderNumber: customer wrote the order# (MM-XXXX) in the e-transfer memo
 *   - byNameAndAmount: memo missing or unparseable; rescue lookup
 *
 * Returns OrderDetails-shaped JSON (matches Wampum's WcOrderDetails).
 *
 * Auth: HMAC-SHA256 on the raw body using WAMPUM_LOOKUP_SECRET, sent in
 * the x-wampum-signature header. Separate from WAMPUM_HMAC_SECRET so a
 * leak of one secret doesn't grant access to both surfaces.
 */
import { NextRequest, NextResponse } from "next/server";
import type { Order } from "@prisma/client";
import { prisma } from "@/lib/db";
import { authenticateWampumRequest, parseBilling } from "@/lib/wampum";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WcShapedOrder {
    orderId: string;
    orderNumber: string;
    total: number;
    currency: string;
    status: string;
    billingName: string;
    billingEmail: string;
    createdAt: string;
}

function mapOrder(o: Order): WcShapedOrder {
    const billing = parseBilling(o);
    return {
        orderId: o.id,
        orderNumber: o.orderNumber,
        total: Number(o.total ?? 0),
        currency: o.currency || "CAD",
        // e-transfer orders sit at ON_HOLD (or PENDING); map both → "on-hold"
        // so Wampum's matchEngine (which gates on status === 'on-hold')
        // accepts them. Other states pass through lowercased.
        status:
            o.status === "ON_HOLD" || o.status === "PENDING"
                ? "on-hold"
                : o.status.toLowerCase(),
        billingName: billing.name,
        billingEmail: billing.email,
        createdAt: o.createdAt.toISOString(),
    };
}

export async function POST(req: NextRequest) {
    const auth = await authenticateWampumRequest(req, process.env.WAMPUM_LOOKUP_SECRET);
    if (!auth.ok) return auth.response;

    const { mode } = auth.payload as { mode?: string };

    if (mode === "byOrderNumber") {
        const orderNumber = String((auth.payload as { orderNumber?: unknown }).orderNumber ?? "").trim();
        if (!orderNumber) {
            return NextResponse.json({ ok: false, error: "missing_orderNumber" }, { status: 400 });
        }
        let row = await prisma.order.findUnique({ where: { orderNumber } });
        // Transition shim: legacy WooCommerce memos carry the bare numeric id
        // (e.g. "93123"); those orders were synced here as MM-{wcId}.
        if (!row && /^\d+$/.test(orderNumber)) {
            row = await prisma.order.findUnique({ where: { orderNumber: `MM-${orderNumber}` } });
        }
        if (!row) {
            return NextResponse.json({ found: false });
        }
        return NextResponse.json({ found: true, order: mapOrder(row) });
    }

    if (mode === "byNameAndAmount") {
        const senderName = String((auth.payload as { senderName?: unknown }).senderName ?? "").trim();
        const amount = Number((auth.payload as { amount?: unknown }).amount);
        const tolerance = Number((auth.payload as { toleranceDollars?: unknown }).toleranceDollars ?? 0);
        if (!senderName || !Number.isFinite(amount)) {
            return NextResponse.json({ ok: false, error: "missing_inputs" }, { status: 400 });
        }

        // Same name-token logic Wampum uses for WC, applied to the billing
        // name + email local-part from the billingData snapshot. Amount slop
        // covers small round-down typos.
        const slop = Math.max(0.01, tolerance + 0.01);
        const tokens = senderName
            .toLowerCase()
            .replace(/[^a-z\s]/g, "")
            .split(/\s+/)
            .filter((t) => t.length > 1);
        if (tokens.length === 0) return NextResponse.json({ orders: [] });

        // Narrow by amount/status/date in SQL, then token-match the name in
        // JS — billing identity lives inside the billingData JSON snapshot.
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 3600 * 1000);
        const candidates = await prisma.order.findMany({
            where: {
                status: { in: ["ON_HOLD", "PENDING"] },
                total: { gte: amount - slop, lte: amount + slop },
                createdAt: { gte: fourteenDaysAgo },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
        });

        const matches = candidates
            .filter((o) => {
                const billing = parseBilling(o);
                const name = billing.name.toLowerCase();
                const emailLocal = billing.email.split("@")[0]?.toLowerCase() ?? "";
                return tokens.some((t) => name.includes(t) || emailLocal.includes(t));
            })
            .slice(0, 10);

        return NextResponse.json({ orders: matches.map(mapOrder) });
    }

    return NextResponse.json({ ok: false, error: "unknown_mode" }, { status: 400 });
}
