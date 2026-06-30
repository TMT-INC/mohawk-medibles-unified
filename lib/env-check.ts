/**
 * Mohawk Medibles — Environment Variable Validation
 * ═══════════════════════════════════════════════════
 * Validates critical environment variables at startup.
 * Logs warnings for missing service keys.
 */

const CRITICAL_VARS = [
    { key: "DATABASE_URL", label: "PostgreSQL Database" },
    { key: "AUTH_SECRET", label: "Auth Session Secret" },
    // Launch payment-rail confirmation secrets. Their webhooks fail CLOSED when
    // unset (500/503 — no forged-PAID risk), but a blank value silently leaves
    // every paid order stuck ON_HOLD/PENDING, so surface it loudly at startup.
    { key: "WAMPUM_HMAC_SECRET", label: "Wampum e-Transfer webhook HMAC" },
    { key: "WAMPUM_LOOKUP_SECRET", label: "Wampum order-lookup secret" },
    { key: "BTCPAY_WEBHOOK_SECRET", label: "BTCPay crypto webhook secret" },
] as const;

const WARNING_VARS = [
    { key: "WC_CONSUMER_KEY", label: "WooCommerce API" },
    { key: "WC_CONSUMER_SECRET", label: "WooCommerce API Secret" },
    { key: "WC_WEBHOOK_SECRET", label: "WooCommerce webhook HMAC" },
    { key: "SHIPSTATION_API_KEY", label: "ShipStation Fulfillment" },
    { key: "RESEND_API_KEY", label: "Resend Email" },
    { key: "TURNSTILE_SECRET_KEY", label: "Cloudflare CAPTCHA" },
    { key: "CRON_SECRET", label: "Cron job auth secret" },
    { key: "BLOB_READ_WRITE_TOKEN", label: "Vercel Blob (product images)" },
    { key: "BTCPAY_URL", label: "BTCPay server URL" },
    { key: "BTCPAY_API_KEY", label: "BTCPay API key" },
    { key: "BTCPAY_STORE_ID", label: "BTCPay store id" },
    { key: "NEXT_PUBLIC_GA_MEASUREMENT_ID", label: "Google Analytics" },
] as const;

interface EnvCheckResult {
    valid: boolean;
    critical: string[];
    warnings: string[];
}

let _cachedResult: EnvCheckResult | null = null;

export function checkEnvironment(): EnvCheckResult {
    if (_cachedResult) return _cachedResult;

    const critical: string[] = [];
    const warnings: string[] = [];

    for (const v of CRITICAL_VARS) {
        const val = process.env[v.key];
        if (!val || val === "" || val === "change_me_in_production") {
            critical.push(`${v.label} (${v.key})`);
        }
    }

    for (const v of WARNING_VARS) {
        const val = process.env[v.key];
        if (!val || val === "") {
            warnings.push(`${v.label} (${v.key})`);
        }
    }

    if (critical.length > 0) {
        console.error(`[ENV] ❌ CRITICAL: Missing required environment variables:\n  ${critical.join("\n  ")}`);
    }
    if (warnings.length > 0 && process.env.NODE_ENV === "production") {
        console.warn(`[ENV] ⚠️  Missing optional service keys (features will be degraded):\n  ${warnings.join("\n  ")}`);
    }

    _cachedResult = { valid: critical.length === 0, critical, warnings };
    return _cachedResult;
}

/** Call at module load to validate on first import */
if (typeof process !== "undefined" && process.env) {
    checkEnvironment();
}
