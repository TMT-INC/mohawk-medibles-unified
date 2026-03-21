/**
 * Contact Form API — Mohawk Medibles
 * POST /api/contact — Sends contact form submissions via Resend
 */
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { verifyCaptcha, getClientIp } from "@/lib/captcha";
import { verifyCsrf } from "@/lib/csrf";
import { log } from "@/lib/logger";

/** Escape HTML special characters to prevent XSS in email templates */
function escHtml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    // CSRF protection
    const csrfError = verifyCsrf(req);
    if (csrfError) return csrfError;

    try {
        const body = await req.json();
        const { name, email, department, subject, message, captchaToken } = body as {
            name?: string;
            email?: string;
            department?: string;
            subject?: string;
            message?: string;
            captchaToken?: string;
        };

        // CAPTCHA verification
        const captchaValid = await verifyCaptcha(captchaToken, getClientIp(req.headers));
        if (!captchaValid) {
            return NextResponse.json({ error: "CAPTCHA verification failed. Please try again." }, { status: 400 });
        }

        // Validation
        if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
            return NextResponse.json(
                { error: "Name, email, subject, and message are required" },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }

        // Honeypot: if message is suspiciously short or name contains URLs
        if (message.length < 10) {
            return NextResponse.json({ error: "Message too short" }, { status: 400 });
        }

        const deptLabel = department || "General";

        // Send notification to the Mohawk Medibles team
        const result = await sendEmail({
            to: process.env.CONTACT_EMAIL || "info@mohawkmedibles.ca",
            subject: `[${deptLabel.toUpperCase()}] Contact Form: ${subject}`,
            replyTo: email,
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f5f5f5;padding:20px;">
    <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;">
        <div style="background:#2D5016;padding:20px;text-align:center;">
            <h2 style="color:white;margin:0;">New Contact Form Submission</h2>
        </div>
        <div style="padding:24px;">
            <table style="width:100%;border-collapse:collapse;">
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:10px 0;font-weight:bold;color:#333;width:120px;">Name</td>
                    <td style="padding:10px 0;color:#555;">${escHtml(name)}</td>
                </tr>
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:10px 0;font-weight:bold;color:#333;">Email</td>
                    <td style="padding:10px 0;"><a href="mailto:${escHtml(email)}" style="color:#2D5016;">${escHtml(email)}</a></td>
                </tr>
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:10px 0;font-weight:bold;color:#333;">Department</td>
                    <td style="padding:10px 0;color:#555;">${escHtml(deptLabel)}</td>
                </tr>
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:10px 0;font-weight:bold;color:#333;">Subject</td>
                    <td style="padding:10px 0;color:#555;">${escHtml(subject)}</td>
                </tr>
            </table>
            <div style="margin-top:20px;padding:16px;background:#f9f9f9;border-radius:8px;">
                <p style="font-weight:bold;color:#333;margin:0 0 8px;">Message:</p>
                <p style="color:#555;white-space:pre-wrap;margin:0;line-height:1.6;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </div>
        </div>
    </div>
</body>
</html>`,
        });

        if (!result.success) {
            log.contact.error("Email send failed", { error: String(result.error) });
            // Still return success to user — we don't want to expose email failures
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        log.contact.error("Contact form error", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json(
            { error: "Failed to process contact form" },
            { status: 500 }
        );
    }
}
