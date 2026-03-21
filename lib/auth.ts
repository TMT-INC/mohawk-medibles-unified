/**
 * Mohawk Medibles — Auth Utilities
 * ════════════════════════════════
 * Password hashing (bcrypt), JWT session tokens, and auth helpers.
 */
import { randomBytes, createHmac, timingSafeEqual } from "crypto";

/** Lazily resolved so the module can load at build time without AUTH_SECRET */
function getSecret(): string {
    const secret = process.env.AUTH_SECRET;
    if (!secret && process.env.NODE_ENV === "production") {
        throw new Error("FATAL: AUTH_SECRET environment variable is required in production");
    }
    return secret || "dev-secret-local-only";
}
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

// ─── Password Hashing (bcrypt-compatible via native crypto) ─

/**
 * Hash a password using PBKDF2 (built-in, no native dependency).
 * Format: algorithm$iterations$salt$hash
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const iterations = 100_000;
    const hash = await pbkdf2(password, salt, iterations, 64, "sha512");
    return `pbkdf2$${iterations}$${salt}$${hash}`;
}

/**
 * Verify a password against a stored hash.
 */
export async function verifyPassword(
    password: string,
    storedHash: string
): Promise<boolean> {
    const parts = storedHash.split("$");
    if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;

    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const originalHash = parts[3];

    const hash = await pbkdf2(password, salt, iterations, 64, "sha512");

    // Timing-safe comparison to prevent timing attacks
    const a = Buffer.from(originalHash, "hex");
    const b = Buffer.from(hash, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
}

function pbkdf2(
    password: string,
    salt: string,
    iterations: number,
    keylen: number,
    digest: string
): Promise<string> {
    return new Promise((resolve, reject) => {
        const crypto = require("crypto");
        crypto.pbkdf2(
            password,
            salt,
            iterations,
            keylen,
            digest,
            (err: Error | null, derivedKey: Buffer) => {
                if (err) reject(err);
                else resolve(derivedKey.toString("hex"));
            }
        );
    });
}

// ─── JWT-like Session Tokens ────────────────────────────────

interface TokenPayload {
    sub: string; // user ID
    email: string;
    role: string;
    name: string;
    iat: number;
    exp: number;
}

/**
 * Create a signed session token (HMAC-SHA256).
 * Structure: base64url(header).base64url(payload).signature
 */
export function createSessionToken(user: {
    id: string;
    email: string;
    role: string;
    name: string;
}): string {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const payload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        iat: now,
        exp: now + SESSION_DURATION,
    };

    const headerB64 = base64url(JSON.stringify(header));
    const payloadB64 = base64url(JSON.stringify(payload));
    const signature = sign(`${headerB64}.${payloadB64}`);

    return `${headerB64}.${payloadB64}.${signature}`;
}

/**
 * Verify and decode a session token.
 */
export function verifySessionToken(token: string): TokenPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const [headerB64, payloadB64, signature] = parts;

        // Verify signature
        const expected = sign(`${headerB64}.${payloadB64}`);
        const sigBuf = Buffer.from(signature, "base64url");
        const expBuf = Buffer.from(expected, "base64url");

        if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
            return null;
        }

        // Decode payload
        const payload: TokenPayload = JSON.parse(
            Buffer.from(payloadB64, "base64url").toString("utf-8")
        );

        // Check expiry
        if (payload.exp < Date.now() / 1000) return null;

        return payload;
    } catch {
        return null;
    }
}

// ─── Helpers ────────────────────────────────────────────────

function base64url(str: string): string {
    return Buffer.from(str)
        .toString("base64url");
}

function sign(data: string): string {
    return createHmac("sha256", getSecret())
        .update(data)
        .digest("base64url");
}

/**
 * Generate a secure random token (e.g., for password reset).
 */
export function generateToken(bytes: number = 32): string {
    return randomBytes(bytes).toString("hex");
}

/**
 * Generate a CSRF token.
 */
export function generateCSRFToken(): string {
    return randomBytes(32).toString("hex");
}

/**
 * Verify a CSRF token using HMAC.
 */
export function verifyCSRFToken(token: string, sessionId: string): boolean {
    const expected = createHmac("sha256", getSecret())
        .update(sessionId)
        .digest("hex");

    const tokenBuf = Buffer.from(token, "hex");
    const expectedBuf = Buffer.from(expected, "hex");

    if (tokenBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(tokenBuf, expectedBuf);
}
