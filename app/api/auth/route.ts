/**
 * Auth API — Login / Register / Password Reset
 * POST /api/auth { action: "login" | "register" | "forgot-password" | "reset-password", ... }
 *
 * Persists users to PostgreSQL via Prisma. Sends welcome & reset emails via Resend.
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { hashPassword, verifyPassword, createSessionToken, generateToken, hashResetToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendPasswordReset, sendWelcomeEmail } from "@/lib/email";
import { verifyCaptcha, getClientIp } from "@/lib/captcha";
import { verifyCsrf } from "@/lib/csrf";
import { log } from "@/lib/logger";

export async function POST(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.auth);
    if (limited) return limited;

    // CSRF protection
    const csrfError = verifyCsrf(req);
    if (csrfError) return csrfError;

    try {
        const body = await req.json();
        const { action, captchaToken } = body;

        // CAPTCHA verification for register and forgot-password actions
        if (action === "register" || action === "forgot-password") {
            const captchaValid = await verifyCaptcha(captchaToken, getClientIp(req.headers));
            if (!captchaValid) {
                return NextResponse.json({ error: "CAPTCHA verification failed. Please try again." }, { status: 400 });
            }
        }

        switch (action) {
            case "register": {
                const { name, email, password } = body;
                if (!name || !email || !password) {
                    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
                }
                if (password.length < 8) {
                    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
                }

                // Check if email already exists
                const existing = await prisma.user.findUnique({ where: { email } });
                if (existing) {
                    // Guest user (created during checkout with empty passwordHash) — upgrade account
                    if (existing.passwordHash === "") {
                        const hashed = await hashPassword(password);
                        const updated = await prisma.user.update({
                            where: { id: existing.id },
                            data: { name, passwordHash: hashed, lastLogin: new Date() },
                        });

                        const token = createSessionToken({
                            id: updated.id,
                            email: updated.email,
                            role: updated.role,
                            name: updated.name,
                        });

                        const res = NextResponse.json({
                            success: true,
                            user: { name: updated.name, email: updated.email, role: updated.role },
                            message: "Account upgraded from guest. Welcome back!",
                        });
                        res.cookies.set("mm-session", token, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            sameSite: "lax",
                            path: "/",
                            maxAge: 60 * 60 * 24 * 7,
                        });
                        return res;
                    }

                    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
                }

                const hashed = await hashPassword(password);

                const user = await prisma.user.create({
                    data: {
                        name,
                        email,
                        passwordHash: hashed,
                        role: "CUSTOMER",
                        lastLogin: new Date(),
                    },
                });

                const token = createSessionToken({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                });

                const res = NextResponse.json({
                    success: true,
                    user: { name: user.name, email: user.email, role: user.role },
                });
                res.cookies.set("mm-session", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7,
                });

                // Send welcome email (non-blocking)
                sendWelcomeEmail(email, name).catch((err) =>
                    log.auth.error("Welcome email failed", { error: err instanceof Error ? err.message : "Unknown" })
                );

                return res;
            }

            case "login": {
                const { email, password } = body;
                if (!email || !password) {
                    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
                }

                const user = await prisma.user.findUnique({ where: { email } });
                if (!user) {
                    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
                }

                // Guest users (empty password from checkout) need to register first
                if (user.passwordHash === "") {
                    return NextResponse.json(
                        { error: "Please complete registration — your account was created as a guest checkout." },
                        { status: 401 }
                    );
                }

                const valid = await verifyPassword(password, user.passwordHash);
                if (!valid) {
                    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
                }

                // Update last login timestamp
                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLogin: new Date() },
                });

                const token = createSessionToken({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                });

                const res = NextResponse.json({
                    success: true,
                    user: { name: user.name, email: user.email, role: user.role },
                });
                res.cookies.set("mm-session", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7,
                });
                return res;
            }

            case "logout": {
                const res = NextResponse.json({ success: true });
                res.cookies.delete("mm-session");
                return res;
            }

            case "reset-password": {
                const { token, password } = body;
                if (!token || !password) {
                    return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
                }
                if (password.length < 8) {
                    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
                }

                // Find the reset session token (hash the input to match stored hash)
                const hashedInput = hashResetToken(token);
                const session = await prisma.session.findFirst({
                    where: {
                        token: `reset_${hashedInput}`,
                        expiresAt: { gt: new Date() },
                    },
                    include: { user: true },
                });

                if (!session) {
                    return NextResponse.json(
                        { error: "Invalid or expired reset token. Please request a new password reset." },
                        { status: 400 }
                    );
                }

                // Update password
                const hashed = await hashPassword(password);
                await prisma.user.update({
                    where: { id: session.userId },
                    data: { passwordHash: hashed },
                });

                // Delete the used reset token (and any other reset tokens for this user)
                await prisma.session.deleteMany({
                    where: {
                        userId: session.userId,
                        token: { startsWith: "reset_" },
                    },
                });

                return NextResponse.json({
                    success: true,
                    message: "Password has been reset. You can now log in with your new password.",
                });
            }

            case "forgot-password": {
                const { email } = body;
                if (!email) {
                    return NextResponse.json({ error: "Email is required" }, { status: 400 });
                }

                // Always return success to prevent email enumeration
                const user = await prisma.user.findUnique({ where: { email } });

                if (user && user.passwordHash !== "") {
                    const resetToken = generateToken(32);
                    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

                    // Store hashed token (prevents exposure if DB is breached)
                    const hashedToken = hashResetToken(resetToken);
                    await prisma.session.create({
                        data: {
                            userId: user.id,
                            token: `reset_${hashedToken}`,
                            expiresAt,
                        },
                    });

                    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://mohawkmedibles.ca"}/reset-password?token=${resetToken}`;

                    sendPasswordReset(email, resetUrl).catch((err) =>
                        log.auth.error("Password reset email failed", { error: err instanceof Error ? err.message : "Unknown" })
                    );
                }

                return NextResponse.json({
                    success: true,
                    message: "If an account exists with that email, a password reset link has been sent.",
                });
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (e) {
        log.auth.error("Auth error", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json(
            { error: "Authentication failed" },
            { status: 500 }
        );
    }
}
