/**
 * Mohawk Medibles — Rate Limiter
 * ══════════════════════════════
 * Distributed rate limiter using Upstash Redis (production)
 * with in-memory fallback (development / missing UPSTASH_REDIS_REST_URL).
 *
 * The public API (applyRateLimit, checkRateLimit, RATE_LIMITS) is unchanged
 * so all existing call sites work without modification.
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Config Types ──────────────────────────────────────────

export interface RateLimitConfig {
    /** Maximum requests per window */
    limit: number;
    /** Window duration in seconds */
    windowSeconds: number;
    /** Key prefix for namespace isolation */
    prefix?: string;
}

export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: number;
    retryAfterSeconds?: number;
}

// ─── Preset Configs ─────────────────────────────────────────

export const RATE_LIMITS = {
    /** Standard API calls: 60/min */
    api: { limit: 60, windowSeconds: 60, prefix: "api" } satisfies RateLimitConfig,
    /** Admin operations: 30/min */
    admin: { limit: 30, windowSeconds: 60, prefix: "admin" } satisfies RateLimitConfig,
    /** Auth attempts: 5/min (brute force protection) */
    auth: { limit: 5, windowSeconds: 60, prefix: "auth" } satisfies RateLimitConfig,
    /** Support/voice agent: 20/min */
    support: { limit: 20, windowSeconds: 60, prefix: "support" } satisfies RateLimitConfig,
    /** Content generation: 10/min */
    content: { limit: 10, windowSeconds: 60, prefix: "content" } satisfies RateLimitConfig,
    /** Webhooks: 100/min */
    webhook: { limit: 100, windowSeconds: 60, prefix: "webhook" } satisfies RateLimitConfig,
    /** Health check: 120/min */
    health: { limit: 120, windowSeconds: 60, prefix: "health" } satisfies RateLimitConfig,
    /** TTS synthesis: 10/min (ElevenLabs billing protection) */
    tts: { limit: 10, windowSeconds: 60, prefix: "tts" } satisfies RateLimitConfig,
} as const;

// ─── Upstash Redis Rate Limiter (production) ────────────────

let upstashLimiter: {
    limit: (key: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }>;
} | null = null;
let upstashReady = false;
let upstashConfig: RateLimitConfig | null = null;

async function getUpstashLimiter(config: RateLimitConfig) {
    // Only initialize once per config change
    if (upstashReady && upstashConfig?.prefix === config.prefix && upstashConfig?.limit === config.limit) {
        return upstashLimiter;
    }

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        upstashReady = true;
        upstashLimiter = null;
        return null;
    }

    try {
        const { Ratelimit } = await import("@upstash/ratelimit");
        const { Redis } = await import("@upstash/redis");

        const redis = new Redis({ url, token });
        upstashLimiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(config.limit, `${config.windowSeconds} s`),
            prefix: `mm:rl:${config.prefix || "default"}`,
            analytics: true,
        });
        upstashConfig = config;
        upstashReady = true;
        return upstashLimiter;
    } catch {
        upstashReady = true;
        upstashLimiter = null;
        return null;
    }
}

// ─── In-Memory Fallback (dev / no Redis) ────────────────────

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 60 seconds
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of memoryStore) {
            if (entry.resetAt < now) memoryStore.delete(key);
        }
    }, 60_000);
}

function checkMemoryRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
    const key = `${config.prefix || "default"}:${identifier}`;
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;

    let entry = memoryStore.get(key);

    if (!entry || entry.resetAt < now) {
        entry = { count: 0, resetAt: now + windowMs };
        memoryStore.set(key, entry);
    }

    entry.count++;

    if (entry.count > config.limit) {
        return {
            allowed: false,
            limit: config.limit,
            remaining: 0,
            resetAt: entry.resetAt,
            retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
        };
    }

    return {
        allowed: true,
        limit: config.limit,
        remaining: config.limit - entry.count,
        resetAt: entry.resetAt,
    };
}

// ─── Unified Rate Limit Check ───────────────────────────────

/**
 * Check rate limit for a given identifier.
 * Uses Upstash Redis in production, falls back to in-memory.
 */
export async function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const limiter = await getUpstashLimiter(config);

    if (limiter) {
        try {
            const key = `${config.prefix || "default"}:${identifier}`;
            const result = await limiter.limit(key);
            return {
                allowed: result.success,
                limit: result.limit,
                remaining: result.remaining,
                resetAt: result.reset,
                retryAfterSeconds: result.success
                    ? undefined
                    : Math.ceil((result.reset - Date.now()) / 1000),
            };
        } catch {
            // Redis failure — fall through to in-memory
        }
    }

    return checkMemoryRateLimit(identifier, config);
}

// ─── Next.js Response Helpers ───────────────────────────────

/**
 * Get client IP from request (handles proxies).
 */
export function getClientIP(request: NextRequest): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        request.headers.get("cf-connecting-ip") ||
        "anonymous"
    );
}

/**
 * Apply rate limiting to a Next.js API route.
 * Returns a 429 response if the limit is exceeded, or null if allowed.
 */
export async function applyRateLimit(
    request: NextRequest,
    config: RateLimitConfig = RATE_LIMITS.api
): Promise<NextResponse | null> {
    const ip = getClientIP(request);
    const result = await checkRateLimit(ip, config);

    if (!result.allowed) {
        const response = NextResponse.json(
            {
                error: "Too many requests",
                retryAfterSeconds: result.retryAfterSeconds,
                limit: result.limit,
            },
            { status: 429 }
        );
        response.headers.set("Retry-After", String(result.retryAfterSeconds));
        response.headers.set("X-RateLimit-Limit", String(result.limit));
        response.headers.set("X-RateLimit-Remaining", "0");
        response.headers.set(
            "X-RateLimit-Reset",
            String(Math.ceil(result.resetAt / 1000))
        );
        return response;
    }

    return null;
}

/**
 * Add rate limit headers to a response.
 */
export async function addRateLimitHeaders(
    response: NextResponse,
    identifier: string,
    config: RateLimitConfig
): Promise<NextResponse> {
    const result = await checkRateLimit(identifier, config);
    response.headers.set("X-RateLimit-Limit", String(result.limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set(
        "X-RateLimit-Reset",
        String(Math.ceil(result.resetAt / 1000))
    );
    return response;
}
