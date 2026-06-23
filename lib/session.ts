/**
 * Mohawk Medibles — Server-side session resolver
 * ════════════════════════════════════════════════
 * Single source of truth for "who is the authenticated user" inside Node
 * route handlers. Reads the signed `mm-session` cookie and verifies its
 * HMAC signature via verifySessionToken. NEVER trust x-user-* request
 * headers for identity — those are client-supplied on non-protected routes.
 */
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export interface SessionUser {
    userId: string;
    email: string;
    role: string;
    name: string;
}

/**
 * Resolve the authenticated user from the verified `mm-session` cookie.
 * Returns null when the cookie is absent, malformed, or fails signature/expiry.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("mm-session")?.value;
    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload) return null;

    return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name,
    };
}
