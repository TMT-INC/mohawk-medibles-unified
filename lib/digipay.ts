/**
 * Digipay Payment Gateway — Native Integration
 * AES-256-CBC encrypted redirect to Digipay hosted payment page.
 * Postback handler validates payment and marks orders as paid.
 */
import crypto from "crypto";

const DIGIPAY_BASE_URL = "https://secure.digipay.co/order/creditcard/cc_form_enc.php";
const DIGIPAY_ALLOWED_IPS = ["185.240.29.227"];

// ─── Encryption (AES-256-CBC, matches Digipay PHP SDK) ──────

function digipayEncrypt(plaintext: string, key: string): string {
    const encryptMethod = "aes-256-cbc";
    const ivLength = 16; // AES-256-CBC IV is always 16 bytes
    const iv = crypto.randomBytes(ivLength);
    const salt = crypto.randomBytes(256);
    const iterations = 999;

    // PBKDF2 key derivation (matches PHP: hash_pbkdf2('sha512', key, salt, 999, 64))
    const hashKey = crypto.pbkdf2Sync(key, salt, iterations, 32, "sha512");

    const cipher = crypto.createCipheriv(encryptMethod, hashKey, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

    const output = {
        ciphertext: encrypted.toString("base64"),
        iv: iv.toString("hex"),
        salt: salt.toString("hex"),
        iterations,
    };

    return Buffer.from(JSON.stringify(output)).toString("base64");
}

// ─── URL Builder ────────────────────────────────────────────

export interface DigipayOrderParams {
    orderId: string;
    amount: number; // in dollars, e.g. 29.99
    description: string;
    billing: {
        first_name: string;
        last_name: string;
        email: string;
        address: string;
        city: string;
        state: string; // Province code: "ON", "BC"
        postcode: string;
        country?: string;
    };
    postbackUrl: string;
    returnUrl: string;
}

export function buildDigipayPaymentUrl(params: DigipayOrderParams): string {
    const siteId = process.env.DIGIPAY_SITE_ID;
    if (!siteId && process.env.NODE_ENV === 'production') {
        throw new Error('DIGIPAY_SITE_ID must be set in production');
    }

    const encryptionKey = process.env.DIGIPAY_ENCRYPTION_KEY;
    if (!encryptionKey && process.env.NODE_ENV === 'production') {
        throw new Error('DIGIPAY_ENCRYPTION_KEY must be set in production');
    }

    if (!encryptionKey) {
        throw new Error("DIGIPAY_ENCRYPTION_KEY not configured");
    }

    const queryParams = new URLSearchParams({
        site_id: siteId || "6099",
        charge_amount: params.amount.toFixed(2),
        type: "purchase",
        order_description: params.description.substring(0, 255),
        session: params.orderId,
        encrypt: "1",
        shipped: "1", // Physical goods
        first_name: params.billing.first_name,
        last_name: params.billing.last_name,
        email: params.billing.email,
        address: params.billing.address,
        city: params.billing.city,
        state: params.billing.state,
        zip: params.billing.postcode.replace(/\s+/g, ""),
        country: params.billing.country || "CA",
        pburl: params.postbackUrl,
        tcomplete: params.returnUrl,
    });

    const fullUrl = `${DIGIPAY_BASE_URL}?${queryParams.toString()}`;
    const encrypted = digipayEncrypt(fullUrl, encryptionKey);

    return `${DIGIPAY_BASE_URL}?param=${encodeURIComponent(encrypted)}`;
}

// ─── Postback Parsing ───────────────────────────────────────

export interface DigipayPostbackData {
    session: string;  // Our order ID
    amount: string;   // Format: "29_99" (underscore, not decimal)
    description: string;
    email: string | null;
    last: string | null;
}

/**
 * Parse Digipay postback data.
 * Digipay sends JSON embedded as a POST key (not a value).
 */
export function parseDigipayPostback(body: Record<string, string>): DigipayPostbackData | null {
    for (const key of Object.keys(body)) {
        if (key.startsWith("{")) {
            try {
                return JSON.parse(key) as DigipayPostbackData;
            } catch {
                return null;
            }
        }
    }
    return null;
}

/**
 * Convert Digipay amount format (29_99) to decimal (29.99)
 */
export function parseDigipayAmount(raw: string): number {
    return parseFloat(raw.replace(/_/g, "."));
}

// ─── IP Validation ──────────────────────────────────────────

export function isDigipayIp(ip: string): boolean {
    // Handle x-forwarded-for (first IP in chain)
    const cleanIp = ip.includes(",") ? ip.split(",")[0].trim() : ip.trim();
    return DIGIPAY_ALLOWED_IPS.includes(cleanIp);
}

// ─── XML Response Builder ───────────────────────────────────

export function digipayXmlResponse(
    status: "ok" | "fail",
    message: string,
    code: number,
    receipt?: string
): string {
    const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    if (status === "ok") {
        return [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<rsp stat="ok" version="1.0">',
            `    <message id="${code}">${escape(message)}</message>`,
            receipt ? `    <receipt>${escape(receipt)}</receipt>` : "",
            "</rsp>",
        ].filter(Boolean).join("\n");
    }

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rsp stat="fail" version="1.0">',
        `    <error id="${code}">${escape(message)}</error>`,
        "</rsp>",
    ].join("\n");
}

// ─── Test Session ───────────────────────────────────────────

export function isTestSession(session: string): boolean {
    const siteId = process.env.DIGIPAY_SITE_ID || "6099";
    return session === `${siteId}_test`;
}
