/**
 * Mohawk Medibles — Client API Fetch Wrapper
 * ════════════════════════════════════════════
 * Browser-only ("use client"-safe) helpers for talking to our own /api routes.
 *
 * CSRF protection uses a double-submit cookie pattern (see lib/csrf.ts):
 * the server sets a non-HttpOnly `mm-csrf` cookie, and every state-changing
 * request must echo that value back in an `x-csrf-token` header. This module
 * reads the cookie and injects the header automatically so callers don't have
 * to remember to do it.
 *
 * IMPORTANT: pure browser code only — do NOT import server modules here.
 */

const CSRF_COOKIE = "mm-csrf";
const CSRF_HEADER = "x-csrf-token";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Read the `mm-csrf` token from document.cookie.
 * Returns "" when absent or when not running in a browser.
 */
export function getCsrfToken(): string {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(
        new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : "";
}

/** True for same-origin requests targeting our own /api routes. */
function isOwnApiUrl(input: string): boolean {
    // Relative path to our API.
    if (input.startsWith("/api/")) return true;
    // Absolute URL — only treat as ours if same-origin AND under /api/.
    if (typeof window !== "undefined") {
        try {
            const url = new URL(input, window.location.origin);
            return url.origin === window.location.origin && url.pathname.startsWith("/api/");
        } catch {
            return false;
        }
    }
    return false;
}

/**
 * Thin fetch wrapper that injects the CSRF header on mutating requests
 * (POST/PUT/PATCH/DELETE) to our own same-origin /api routes.
 *
 * - Preserves any caller-supplied headers and credentials.
 * - Ensures `Content-Type: application/json` when a body is present and the
 *   caller didn't set one.
 * - GET (and any non-API / cross-origin request) passes straight through.
 */
export function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
    const method = (init.method || "GET").toUpperCase();

    if (!MUTATING_METHODS.has(method) || !isOwnApiUrl(input)) {
        return fetch(input, init);
    }

    // Merge headers, preserving anything the caller passed.
    const headers = new Headers(init.headers);
    if (!headers.has(CSRF_HEADER)) {
        headers.set(CSRF_HEADER, getCsrfToken());
    }
    if (init.body != null && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    return fetch(input, { ...init, headers });
}
