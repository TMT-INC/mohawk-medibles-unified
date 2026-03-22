/**
 * Mohawk Medibles — CSRF Protection
 * ═══════════════════════════════════
 * Double-submit cookie pattern for CSRF protection.
 * Edge-compatible: uses Web Crypto API, no Node.js crypto.
 *
 * Usage in API routes:
 *   const csrfError = verifyCsrf(req);
 *   if (csrfError) return csrfError;
 */

import { NextRequest, NextResponse } from "next/server";

const CSRF_COOKIE = "mm-csrf";
const CSRF_HEADER = "x-csrf-token";

/** Generate a random hex token using Web Crypto (Edge-compatible) */
function generateToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Timing-safe string comparison (Edge-compatible) */
function safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

/**
 * Generate a new CSRF token and set it as a cookie on a response.
 */
export function setCsrfCookie(response: NextResponse): NextResponse {
    const token = generateToken();
    response.cookies.set(CSRF_COOKIE, token, {
        httpOnly: false, // Client JS needs to read this to send as header
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
    });
    return response;
}

/**
 * Verify CSRF token: cookie value must match X-CSRF-Token header.
 * Returns a 403 NextResponse on failure, or null on success.
 */
export function verifyCsrf(req: NextRequest): NextResponse | null {
    // CSRF is enforced in all environments.
    // Set SKIP_CSRF=true only for automated test runners.
    if (process.env.SKIP_CSRF === "true") {
        return null;
    }

    const cookieToken = req.cookies.get(CSRF_COOKIE)?.value;
    const headerToken = req.headers.get(CSRF_HEADER);

    if (!cookieToken || !headerToken) {
        return NextResponse.json(
            { error: "Missing CSRF token" },
            { status: 403 }
        );
    }

    if (!safeCompare(cookieToken, headerToken)) {
        return NextResponse.json(
            { error: "Invalid CSRF token" },
            { status: 403 }
        );
    }

    return null;
}
