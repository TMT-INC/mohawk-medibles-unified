/**
 * Newsletter Unsubscribe API — Mohawk Medibles
 * GET /api/newsletter/unsubscribe?email=xxx&token=xxx
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { log } from "@/lib/logger";

const HMAC_SECRET = process.env.AUTH_SECRET || "mohawk-medibles-unsubscribe-secret";

/** Generate HMAC token for an email to prevent abuse */
export function generateUnsubscribeToken(email: string): string {
    return crypto.createHmac("sha256", HMAC_SECRET).update(email.toLowerCase()).digest("hex").substring(0, 32);
}

/** Build a full unsubscribe URL */
export function buildUnsubscribeUrl(email: string, campaignId?: string): string {
    const token = generateUnsubscribeToken(email);
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://mohawkmedibles.ca";
    const params = new URLSearchParams({ email, token });
    if (campaignId) params.set("campaign", campaignId);
    return `${base}/api/newsletter/unsubscribe?${params.toString()}`;
}

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    const email = req.nextUrl.searchParams.get("email");
    const token = req.nextUrl.searchParams.get("token");

    if (!email || !token) {
        return new NextResponse(unsubPage("Invalid unsubscribe link.", false), {
            status: 400,
            headers: { "Content-Type": "text/html" },
        });
    }

    // Verify HMAC token
    const expectedToken = generateUnsubscribeToken(email);
    if (token !== expectedToken) {
        return new NextResponse(unsubPage("Invalid or expired unsubscribe link.", false), {
            status: 403,
            headers: { "Content-Type": "text/html" },
        });
    }

    try {
        const { prisma } = await import("@/lib/db");

        await prisma.subscriber.updateMany({
            where: { email: email.toLowerCase() },
            data: { status: "unsubscribed", unsubscribedAt: new Date() },
        });

        return new NextResponse(unsubPage("You've been successfully unsubscribed.", true), {
            headers: { "Content-Type": "text/html" },
        });
    } catch (e) {
        log.newsletter.error("Unsubscribe error", { error: e instanceof Error ? e.message : "Unknown" });
        return new NextResponse(unsubPage("Something went wrong. Please try again.", false), {
            status: 500,
            headers: { "Content-Type": "text/html" },
        });
    }
}

function unsubPage(message: string, success: boolean): string {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribe — Mohawk Medibles</title></head>
<body style="margin:0;padding:40px 20px;font-family:system-ui,sans-serif;background:#f5f5f5;text-align:center;">
<div style="max-width:500px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
    <div style="background:#2D5016;padding:24px;"><h1 style="color:white;margin:0;font-size:20px;">Mohawk Medibles</h1></div>
    <div style="padding:40px 32px;">
        <div style="font-size:48px;margin-bottom:16px;">${success ? "✅" : "⚠️"}</div>
        <h2 style="color:#333;margin:0 0 12px;">${success ? "Unsubscribed" : "Oops"}</h2>
        <p style="color:#666;line-height:1.6;">${message}</p>
        ${success ? '<p style="color:#999;font-size:13px;margin-top:20px;">You can re-subscribe anytime from our website.</p>' : ""}
        <a href="https://mohawkmedibles.ca" style="display:inline-block;margin-top:24px;background:#2D5016;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:14px;">Visit Mohawk Medibles</a>
    </div>
</div></body></html>`;
}
