/**
 * Mohawk Medibles — Environment Variable Validation
 * ══════════════════════════════════════════════════
 * Validates all required environment variables at import time.
 * Fails fast at build/startup if critical vars are missing.
 */

const IS_PROD = process.env.NODE_ENV === "production";

interface EnvVar {
    key: string;
    required: boolean; // true = fail if missing in production
    description: string;
}

const ENV_SCHEMA: EnvVar[] = [
    // Critical — app won't function without these
    { key: "DATABASE_URL", required: true, description: "PostgreSQL connection string" },
    { key: "AUTH_SECRET", required: true, description: "JWT signing secret (64-byte hex)" },

    // Fulfillment
    { key: "SHIPSTATION_API_KEY", required: true, description: "ShipStation API key" },
    { key: "SHIPSTATION_API_SECRET", required: true, description: "ShipStation API secret" },
    { key: "SHIPSTATION_WEBHOOK_SECRET", required: true, description: "ShipStation webhook secret" },

    // Email
    { key: "RESEND_API_KEY", required: true, description: "Resend email API key" },

    // Security — needed for CAPTCHA and cron auth
    { key: "TURNSTILE_SECRET_KEY", required: true, description: "Cloudflare Turnstile CAPTCHA secret" },
    { key: "CRON_SECRET", required: true, description: "Vercel Cron job auth secret" },

    // Rate limiting (Upstash Redis)
    { key: "UPSTASH_REDIS_REST_URL", required: false, description: "Upstash Redis URL for distributed rate limiting" },
    { key: "UPSTASH_REDIS_REST_TOKEN", required: false, description: "Upstash Redis auth token" },

    // Optional — app works without these but with reduced functionality
    { key: "NEXT_PUBLIC_GA_MEASUREMENT_ID", required: false, description: "Google Analytics ID" },
    { key: "SENTRY_DSN", required: false, description: "Sentry error tracking DSN" },
    { key: "NEXT_PUBLIC_SENTRY_DSN", required: false, description: "Sentry client-side DSN" },
    { key: "GOOGLE_SITE_VERIFICATION", required: false, description: "Google Search Console verification" },
    { key: "AGENT_API_SECRET", required: false, description: "Python agent gateway secret" },
    { key: "AGENT_GATEWAY_URL", required: false, description: "Python agent gateway URL" },
];

/** Validate environment variables. Call at app startup. */
export function validateEnv(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const { key, required, description } of ENV_SCHEMA) {
        const value = process.env[key];
        const isEmpty = !value || value === "" || value.startsWith("CHANGE-ME");

        if (isEmpty) {
            if (required && IS_PROD) {
                errors.push(`Missing required env var: ${key} (${description})`);
            } else if (required) {
                warnings.push(`Missing env var: ${key} (${description}) — required in production`);
            }
        }
    }

    // Check for obviously insecure defaults
    if (process.env.AUTH_SECRET === "CHANGE-ME-generate-a-64-byte-hex-string") {
        errors.push("AUTH_SECRET is still the default value — generate a real secret");
    }

    if (errors.length > 0 && IS_PROD) {
        console.error("\n========================================");
        console.error("  ENVIRONMENT VALIDATION FAILED");
        console.error("========================================");
        for (const err of errors) console.error(`  [ERROR] ${err}`);
        for (const warn of warnings) console.warn(`  [WARN]  ${warn}`);
        console.error("========================================\n");
        throw new Error(`Missing ${errors.length} required environment variable(s). See logs above.`);
    }

    if (warnings.length > 0) {
        for (const warn of warnings) console.warn(`[env] ${warn}`);
    }

    return { valid: errors.length === 0, errors, warnings };
}

// Auto-validate on import (fails fast in production)
validateEnv();
