/**
 * Newsletter Subscribe API — Mohawk Medibles
 * POST /api/newsletter/subscribe
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { verifyCaptcha, getClientIp } from "@/lib/captcha";
import { verifyCsrf } from "@/lib/csrf";
import { log } from "@/lib/logger";

export async function POST(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    // CSRF protection
    const csrfError = verifyCsrf(req);
    if (csrfError) return csrfError;

    try {
        const body = await req.json();
        const { email, name, source, captchaToken } = body as {
            email?: string;
            name?: string;
            source?: string;
            captchaToken?: string;
        };

        // CAPTCHA verification
        const captchaValid = await verifyCaptcha(captchaToken, getClientIp(req.headers));
        if (!captchaValid) {
            return NextResponse.json({ error: "CAPTCHA verification failed. Please try again." }, { status: 400 });
        }

        if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
        }

        const { prisma } = await import("@/lib/db");

        // Check for existing subscriber
        const existing = await prisma.subscriber.findUnique({ where: { email: email.toLowerCase() } });

        if (existing) {
            if (existing.status === "active") {
                return NextResponse.json({ success: true, message: "Already subscribed!" });
            }
            // Re-activate previously unsubscribed
            await prisma.subscriber.update({
                where: { email: email.toLowerCase() },
                data: { status: "active", subscribedAt: new Date(), unsubscribedAt: null },
            });
            return NextResponse.json({ success: true, message: "Welcome back! You've been re-subscribed." });
        }

        // Create new subscriber
        await prisma.subscriber.create({
            data: {
                email: email.toLowerCase(),
                name: name?.trim() || null,
                source: source || "footer",
                status: "active",
            },
        });

        // Send welcome email (non-blocking)
        try {
            const { sendWelcomeEmail } = await import("@/lib/email");
            await sendWelcomeEmail(email, name?.trim() || "Friend");
        } catch {
            // Don't fail the subscription if email fails
        }

        return NextResponse.json({ success: true, message: "Welcome to the Empire! Check your inbox." });
    } catch (e) {
        log.newsletter.error("Subscribe error", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }
}
