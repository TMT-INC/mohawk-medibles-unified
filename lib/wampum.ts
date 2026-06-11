/**
 * Wampum integration helpers.
 *
 * Wampum is the self-hosted Interac e-Transfer middleware (separate repo,
 * deployed to Railway). It watches paymentsdept2026@gmail.com, validates
 * incoming transfers against our orders, forwards them to Blacfin for
 * deposit, and posts back to merchant sites with HMAC-signed events.
 *
 * Two HMAC channels are used:
 *   - WAMPUM_HMAC_SECRET — postback events (deposit-confirmed,
 *     transfer-rejected, transfer-received, transfer-expired, reopen-order).
 *     Wampum signs outbound, we verify inbound.
 *   - WAMPUM_LOOKUP_SECRET — inbound order-lookup queries (Wampum asks
 *     "do you have order MM-XXXX?" before forwarding the e-transfer).
 *     Separated so a leak of the postback secret can't be used to query
 *     order data, and vice-versa.
 */

import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Order } from "@prisma/client";

// ─── e-Transfer instructions (single source of truth) ────────
// The memo MUST carry the full MM- order number — Wampum's tenant router
// matches it against the Mohawk tenant's orderNumberRegex. A memo without
// it quarantines the transfer.

export const ETRANSFER_RECIPIENT_EMAIL = "paymentsdept2026@gmail.com";
export const ETRANSFER_RECIPIENT_NAME = "Payments Dept";
export const ETRANSFER_SECURITY_QUESTION = "Country";
export const ETRANSFER_SECURITY_ANSWER = "Canada";

export function buildEtransferInstructions(orderNumber: string): string {
    return `Send your Interac e-Transfer to ${ETRANSFER_RECIPIENT_EMAIL} (recipient name: ${ETRANSFER_RECIPIENT_NAME}). Security question: "${ETRANSFER_SECURITY_QUESTION}" — answer: "${ETRANSFER_SECURITY_ANSWER}". IMPORTANT: put your full order number ${orderNumber} (including the MM- prefix) in the message/memo field, exactly as shown, or your payment will be delayed.`;
}

// ─── HMAC verification ───────────────────────────────────────

/**
 * Verify the x-wampum-signature header against the raw request body.
 * Returns true on match (constant-time), false otherwise.
 */
export function verifyWampumSignature(
    rawBody: string,
    signatureHeader: string | null | undefined,
    secret: string,
): boolean {
    if (!signatureHeader || !secret) return false;
    const expected = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
    try {
        const a = Buffer.from(expected, "hex");
        const b = Buffer.from(signatureHeader, "hex");
        if (a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
    } catch {
        return false;
    }
}

/**
 * Common request entry point. Reads the raw body, verifies the HMAC, parses
 * JSON. On any failure returns a NextResponse that the caller should `return`
 * directly. On success returns `{ body, payload }`.
 */
export async function authenticateWampumRequest(
    req: Request,
    secret: string | undefined,
): Promise<
    | { ok: true; body: string; payload: Record<string, unknown> }
    | { ok: false; response: NextResponse }
> {
    if (!secret) {
        return {
            ok: false,
            response: NextResponse.json(
                { ok: false, error: "server_misconfigured" },
                { status: 500 },
            ),
        };
    }

    const body = await req.text();
    const sig = req.headers.get("x-wampum-signature");
    if (!verifyWampumSignature(body, sig, secret)) {
        return {
            ok: false,
            response: NextResponse.json(
                { ok: false, error: "invalid_signature" },
                { status: 401 },
            ),
        };
    }

    let payload: Record<string, unknown>;
    try {
        payload = JSON.parse(body) as Record<string, unknown>;
    } catch {
        return {
            ok: false,
            response: NextResponse.json(
                { ok: false, error: "invalid_json" },
                { status: 400 },
            ),
        };
    }

    return { ok: true, body, payload };
}

// ─── Shared order helpers for Wampum routes ──────────────────

/**
 * Look up an order by Wampum payload identifiers: orderNumber primarily
 * (MM-XXXX), numeric wc_order_id as fallback (legacy WC orders synced into
 * this DB carry their old WooCommerce id).
 */
export async function findWampumOrder(
    orderNumber: string | undefined,
    wcOrderId: string | number | null | undefined,
): Promise<Order | null> {
    if (orderNumber) {
        const byNumber = await prisma.order.findUnique({ where: { orderNumber } });
        if (byNumber) return byNumber;
    }
    if (wcOrderId != null) {
        const idNum = Number(wcOrderId);
        if (Number.isFinite(idNum)) {
            return prisma.order.findUnique({ where: { wcOrderId: idNum } });
        }
    }
    return null;
}

/** Append a timestamped line to the order's notes column. */
export async function appendOrderNote(orderId: string, note: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { notes: true },
    });
    const stamp = new Date().toISOString();
    const newNotes = [order?.notes, `[${stamp}] ${note}`].filter(Boolean).join("\n");
    await prisma.order.update({ where: { id: orderId }, data: { notes: newNotes } });
}

/** Billing identity parsed out of the order's billingData JSON snapshot. */
export function parseBilling(order: Order): { name: string; email: string } {
    try {
        const b = JSON.parse(order.billingData || "{}");
        const name = [b.first_name, b.last_name].filter(Boolean).join(" ");
        return { name: name || "", email: b.email || "" };
    } catch {
        return { name: "", email: "" };
    }
}
