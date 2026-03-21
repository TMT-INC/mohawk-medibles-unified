/**
 * Mohawk Medibles — Production Logger
 * ════════════════════════════════════
 * Environment-aware structured logging with PII redaction.
 * - Development: human-readable colored output
 * - Production: structured JSON (Sentry/Vercel compatible), PII stripped
 */

const IS_PROD = process.env.NODE_ENV === "production";

/** Redact email addresses: john@example.com → j***@e***.com */
function redactEmail(email: string): string {
    if (!IS_PROD) return email;
    const [local, domain] = email.split("@");
    if (!domain) return "***@***";
    return `${local[0]}***@${domain[0]}***.${domain.split(".").pop()}`;
}

/** Redact any string value that looks like an email */
function redactValue(val: unknown): unknown {
    if (typeof val === "string" && val.includes("@") && val.includes(".")) {
        return redactEmail(val);
    }
    return val;
}

/** Redact PII from a data object */
function redactData(data: Record<string, unknown>): Record<string, unknown> {
    if (!IS_PROD) return data;
    const redacted: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data)) {
        if (key === "email" || key === "customerEmail" || key === "to") {
            redacted[key] = typeof val === "string" ? redactEmail(val) : "***";
        } else if (key === "password" || key === "passwordHash" || key === "secret" || key === "token") {
            redacted[key] = "[REDACTED]";
        } else {
            redacted[key] = redactValue(val);
        }
    }
    return redacted;
}

function formatMessage(level: string, context: string, message: string, data?: Record<string, unknown>): void {
    const safe = data ? redactData(data) : undefined;

    if (IS_PROD) {
        // Structured JSON for production log aggregators
        const entry = {
            level,
            context,
            message,
            ...(safe && Object.keys(safe).length > 0 ? { data: safe } : {}),
            timestamp: new Date().toISOString(),
        };
        if (level === "error") {
            console.error(JSON.stringify(entry));
        } else if (level === "warn") {
            console.warn(JSON.stringify(entry));
        } else {
            console.log(JSON.stringify(entry));
        }
    } else {
        // Human-readable for development
        const prefix = `[${context}]`;
        const parts: unknown[] = [prefix, message];
        if (safe && Object.keys(safe).length > 0) parts.push(safe);

        if (level === "error") {
            console.error(...parts);
        } else if (level === "warn") {
            console.warn(...parts);
        } else if (level === "debug") {
            console.debug(...parts);
        } else {
            console.log(...parts);
        }
    }
}

/** Create a scoped logger for a specific module/context */
export function createLogger(context: string) {
    return {
        info: (message: string, data?: Record<string, unknown>) => formatMessage("info", context, message, data),
        warn: (message: string, data?: Record<string, unknown>) => formatMessage("warn", context, message, data),
        error: (message: string, data?: Record<string, unknown>) => formatMessage("error", context, message, data),
        debug: (message: string, data?: Record<string, unknown>) => {
            if (!IS_PROD) formatMessage("debug", context, message, data);
        },
    };
}

/** Pre-built loggers for common modules */
export const log = {
    wc: createLogger("WooCommerce"),
    shipstation: createLogger("ShipStation"),
    campaign: createLogger("Campaign"),
    newsletter: createLogger("Newsletter"),
    agent: createLogger("Agent"),
    auth: createLogger("Auth"),
    checkout: createLogger("Checkout"),
    contact: createLogger("Contact"),
    admin: createLogger("Admin"),
    content: createLogger("Content"),
    seo: createLogger("SEO"),
    webhook: createLogger("Webhook"),
    support: createLogger("Support"),
    sage: createLogger("MedAgent"),
    financial: createLogger("Financial"),
};
