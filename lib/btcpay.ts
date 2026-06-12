/**
 * BTCPay Server (self-hosted, btc.paymohawk.com) — crypto checkout helpers.
 *
 * Invoice creation at checkout + HMAC verification for the webhook receiver
 * at /api/webhooks/btcpay. The store is shared with the legacy WordPress
 * site during the transition, so the receiver must tolerate events for
 * invoices it didn't create.
 */
import crypto from "node:crypto";

export interface BTCPayInvoiceParams {
    orderId: string;
    orderNumber: string;
    total: number;
    currency: string;
    customerEmail: string;
    customerName: string;
    redirectUrl: string;
}

/** Create a BTCPay invoice and return { invoiceId, checkoutLink }. */
export async function createBTCPayInvoice(
    params: BTCPayInvoiceParams
): Promise<{ invoiceId: string; checkoutLink: string }> {
    const url = process.env.BTCPAY_URL;
    const apiKey = process.env.BTCPAY_API_KEY;
    const storeId = process.env.BTCPAY_STORE_ID;
    if (!url || !apiKey || !storeId) {
        throw new Error("BTCPay not configured (BTCPAY_URL / BTCPAY_API_KEY / BTCPAY_STORE_ID)");
    }

    const res = await fetch(`${url}/api/v1/stores/${storeId}/invoices`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            Authorization: `token ${apiKey}`,
        },
        body: JSON.stringify({
            amount: params.total.toFixed(2),
            currency: params.currency,
            metadata: {
                orderId: params.orderId,
                orderNumber: params.orderNumber,
                buyerName: params.customerName,
                buyerEmail: params.customerEmail,
            },
            checkout: {
                redirectURL: params.redirectUrl,
                redirectAutomatically: true,
                defaultLanguage: "en",
            },
            receipt: { enabled: true, showQR: true, showPayments: true },
        }),
        signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`BTCPay invoice creation failed: ${res.status} ${text.slice(0, 200)}`);
    }
    const invoice = await res.json();
    return { invoiceId: invoice.id, checkoutLink: invoice.checkoutLink };
}

/** Verify the btcpay-sig header (HMAC-SHA256, "sha256=<hex>") on the raw body. */
export function verifyBTCPayWebhook(body: string, signature: string | null): boolean {
    const secret = process.env.BTCPAY_WEBHOOK_SECRET;
    if (!secret || !signature) return false;

    const expectedSig = crypto
        .createHmac("sha256", Buffer.from(secret, "utf8"))
        .update(body)
        .digest("hex");

    const cleanSig = signature.startsWith("sha256=") ? signature.slice(7) : signature;
    // timingSafeEqual throws on length mismatch — a malformed header must be
    // a clean 401, not a 500.
    const expectedBuf = Buffer.from(expectedSig, "hex");
    const actualBuf = Buffer.from(cleanSig, "hex");
    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
