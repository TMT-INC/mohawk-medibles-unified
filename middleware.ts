/**
 * Mohawk Medibles — Auth + Multi-Tenant + 3-Domain Middleware
 * ═════════════════════════════════════════════════════════════
 * 1. Resolves domain context:
 *    - mohawkmedibles.ca → primary storefront
 *    - mohawkmedibles.co → alias (serves same site)
 *    - mohawkmedibles.cc → admin/command center (/admin/* only)
 * 2. Resolves tenant from hostname → injects x-tenant-* headers
 * 3. Protects /admin routes + /api/admin/* endpoints
 * 4. Validates session tokens from cookies or Authorization header
 * 5. Enforces role-based access control
 *
 * MedAgent Integration:
 * All /api/sage/* routes are registered as public (no auth).
 * MedAgent-specific headers (X-MedAgent-Version) are injected.
 */
import { NextRequest, NextResponse } from "next/server";
import { resolveTenantByHost } from "@/lib/tenant";
import { setCsrfCookie } from "@/lib/csrf";
import { matchCutoverRedirect } from "@/lib/cutoverRedirects";

// ─── Domain Routing Config ───────────────────────────────
const DOMAINS = {
    PRIMARY: ["mohawkmedibles.ca", "www.mohawkmedibles.ca", "mohawkmedibles.co", "www.mohawkmedibles.co"],
    ADMIN: ["mohawkmedibles.cc", "www.mohawkmedibles.cc"],
};

// Only the canonical .ca host may be indexed by search engines. Every other
// host that serves this deployment — the .co staging alias, the .cc admin
// alias, *.vercel.app preview deploys, localhost — gets an X-Robots-Tag
// noindex on every response. This is what keeps mohawkmedibles.co out of
// Google while it stays fully usable as staging, and it flips automatically
// at cutover: once .ca DNS points here, host === mohawkmedibles.ca → indexable.
const CANONICAL_HOSTS = ["mohawkmedibles.ca", "www.mohawkmedibles.ca"];

// Routes that require authentication.
// NOTE: /api/trpc is deliberately NOT here — the tRPC route verifies the session
// cookie itself and each procedure declares its own auth tier (public/protected/
// admin). Gating the whole surface here 401'd anonymous visitors and 403'd
// customers, breaking every customer-facing tRPC feature.
const PROTECTED_PATHS = ["/admin", "/api/admin"];

// Routes that require specific roles
const ROLE_REQUIREMENTS: Record<string, string[]> = {
    "/admin": ["ADMIN", "SUPER_ADMIN", "LOGISTICS", "SUPPORT"],
    "/api/admin": ["ADMIN", "SUPER_ADMIN", "LOGISTICS", "SUPPORT"],
    "/api/admin/orders": ["ADMIN", "SUPER_ADMIN", "LOGISTICS"],
};

// Public API routes (no auth needed)
const PUBLIC_PATHS = [
    "/api/sage",
    "/api/chat",
    "/api/support",
    "/api/content",
    "/api/webhooks",
    "/api/health",
    "/api/voice",
    "/api/track",
    "/api/cron",
];

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // ── Resolve domain context ───────────────────────────────
    const host = (request.headers.get("host") || request.headers.get("x-forwarded-host") || "localhost:3000").toLowerCase().replace(/:\d+$/, "");

    // Strip any client-supplied identity headers up front so a handler can only
    // ever read x-user-* values that THIS middleware injects after verifying the
    // session token. Without this, non-protected routes received spoofable headers.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete("x-user-id");
    requestHeaders.delete("x-user-role");
    requestHeaders.delete("x-user-email");

    // ── Cutover: indexed off-strategy product URLs that no longer exist on the
    //    cannabis-only storefront. Returns a REAL 410/301 here (before the
    //    dynamic route streams an HTTP-200 soft-404). Runs on every host. ──
    const cutover = matchCutoverRedirect(pathname);
    if (cutover) {
        if (cutover.status === 410) {
            return new NextResponse(
                "<!doctype html><meta charset=utf-8><title>410 Gone</title><h1>410 — This product is no longer available.</h1>",
                { status: 410, headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex, nofollow" } }
            );
        }
        return NextResponse.redirect(cutover.to, cutover.status);
    }

    // .co domain — serve the unified site directly (same as .ca primary)

    // .cc domain → only allow /admin, /api/admin, /api/trpc, /login, /unauthorized
    if (DOMAINS.ADMIN.includes(host)) {
        const allowedPaths = ["/admin", "/api/admin", "/api/trpc", "/login", "/unauthorized", "/_next", "/assets", "/favicon.ico"];
        if (!allowedPaths.some((p) => pathname.startsWith(p)) && !pathname.includes(".")) {
            // Redirect non-admin paths back to .ca
            const redirectUrl = new URL(request.url);
            redirectUrl.hostname = "mohawkmedibles.ca";
            redirectUrl.port = "";
            return NextResponse.redirect(redirectUrl, 302);
        }
    }

    // ── Resolve tenant from hostname ────────────────────────
    const tenant = resolveTenantByHost(host);

    // Helper: inject tenant headers + CSRF cookie into any response
    function withTenantHeaders(response: NextResponse): NextResponse {
        // Keep every non-canonical host (.co staging, .cc, vercel previews,
        // localhost) out of search indexes. Googlebot can still crawl (robots
        // .txt stays permissive) so it sees this header and drops the URL.
        if (!CANONICAL_HOSTS.includes(host)) {
            response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
        }
        response.headers.set("x-tenant-id", tenant.id);
        response.headers.set("x-tenant-slug", tenant.slug);
        response.headers.set("x-tenant-name", tenant.name);
        response.headers.set("x-tenant-domain", tenant.domain);
        // Set cookie for client components (httpOnly=false so JS can read)
        response.cookies.set("mm-tenant", tenant.slug, {
            path: "/",
            httpOnly: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 1 day
        });
        // Set CSRF cookie if not already present (on page AND API responses so
        // the cookie reliably exists before the first client-side mutating POST)
        if (!request.cookies.get("mm-csrf")) {
            setCsrfCookie(response);
        }
        return response;
    }

    // ── Affiliate referral tracking ─────────────────────────
    // Check for ?ref=CODE parameter and set a 30-day cookie
    const refCode = request.nextUrl.searchParams.get("ref");
    function withAffiliateCookie(response: NextResponse): NextResponse {
        if (refCode && !request.cookies.get("mm-affiliate-ref")) {
            response.cookies.set("mm-affiliate-ref", refCode, {
                path: "/",
                httpOnly: false,
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });
            // Fire-and-forget: track the click via internal API
            // We do this asynchronously so it doesn't block the response
            const trackUrl = new URL("/api/track/affiliate", request.url);
            fetch(trackUrl.toString(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: refCode, page: pathname }),
            }).catch(() => { /* silent */ });
        }
        return response;
    }

    // ── Skip public paths ───────────────────────────────────
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        const response = withAffiliateCookie(withTenantHeaders(applySecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }))));
        // MedAgent-specific headers for /api/sage/* routes
        if (pathname.startsWith("/api/sage")) {
            response.headers.set("X-MedAgent-Version", "2.2.0");
            response.headers.set("X-Powered-By", "MedAgent Bot");
            response.headers.set("X-UCP-Compatible", "google-ucp-v1");
        }
        return response;
    }

    // ── Skip static files and non-protected routes ──────────
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/assets") ||
        pathname.includes(".") ||
        !PROTECTED_PATHS.some((p) => pathname.startsWith(p))
    ) {
        return withAffiliateCookie(withTenantHeaders(applySecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }))));
    }

    // ── Extract session token ───────────────────────────────
    const token =
        request.cookies.get("mm-session")?.value ||
        request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
        // API routes get 401; pages redirect to login
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── Validate token (lightweight check in middleware) ─────
    // Full DB validation happens in the API route itself.
    // Middleware does a structural check + expiry decode.
    try {
        const payload = await decodeSessionToken(token);

        if (!payload || payload.exp < Date.now() / 1000) {
            if (pathname.startsWith("/api/")) {
                return NextResponse.json(
                    { error: "Session expired" },
                    { status: 401 }
                );
            }
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // ── Role-based access check ────────────────────────
        const requiredRoles = getRequiredRoles(pathname);
        if (requiredRoles.length > 0 && !requiredRoles.includes(payload.role)) {
            if (pathname.startsWith("/api/")) {
                return NextResponse.json(
                    { error: "Insufficient permissions", required: requiredRoles },
                    { status: 403 }
                );
            }
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        // ── Attach verified user info to the FORWARDED REQUEST ──
        // Set on the request headers (not the response — never leak identity to
        // the client) and only after the signature/expiry checks above pass.
        requestHeaders.set("x-user-id", payload.sub);
        requestHeaders.set("x-user-role", payload.role);
        requestHeaders.set("x-user-email", payload.email || "");
        const response = NextResponse.next({ request: { headers: requestHeaders } });

        return withAffiliateCookie(withTenantHeaders(applySecurityHeaders(response)));
    } catch {
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                { error: "Invalid session token" },
                { status: 401 }
            );
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch {
    // Safety net: if anything in middleware throws unexpectedly,
    // pass through to Next.js routing so 404s aren't turned into 500s
    return NextResponse.next();
  }
}

// ─── Token Verifier (Edge-compatible, Web Crypto API) ───────

interface SessionPayload {
    sub: string; // user ID
    email?: string;
    role: string;
    exp: number; // expiry timestamp
}

/** Base64url encode a Uint8Array */
function toBase64url(buf: Uint8Array): string {
    let binary = "";
    for (const byte of buf) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** HMAC-SHA256 sign using Web Crypto (Edge-compatible) */
async function hmacSign(data: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    return toBase64url(new Uint8Array(sig));
}

/** Timing-safe comparison for Edge Runtime */
function safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

async function decodeSessionToken(token: string): Promise<SessionPayload | null> {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const [headerB64, payloadB64, signature] = parts;

        // Verify HMAC-SHA256 signature using Web Crypto
        const secret = process.env.AUTH_SECRET;
        if (secret) {
            const expected = await hmacSign(`${headerB64}.${payloadB64}`, secret);
            if (!safeCompare(signature, expected)) {
                return null;
            }
        }

        const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));

        return {
            sub: payload.sub || payload.userId,
            email: payload.email,
            role: payload.role || "CUSTOMER",
            exp: payload.exp || 0,
        };
    } catch {
        return null;
    }
}

// ─── Role Resolver ──────────────────────────────────────────

function getRequiredRoles(pathname: string): string[] {
    // Find the most specific matching path
    const sortedPaths = Object.keys(ROLE_REQUIREMENTS).sort(
        (a, b) => b.length - a.length
    );
    for (const path of sortedPaths) {
        if (pathname.startsWith(path)) {
            return ROLE_REQUIREMENTS[path];
        }
    }
    return [];
}

// ─── Security Headers ───────────────────────────────────────
// Note: Primary security headers (HSTS, CSP, X-Frame-Options, etc.)
// are set in next.config.ts headers(). Middleware only adds dynamic headers.

function applySecurityHeaders(response: NextResponse): NextResponse {
    return response;
}

// ─── Matcher ────────────────────────────────────────────────

export const config = {
    matcher: [
        // Match all routes except static files
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
