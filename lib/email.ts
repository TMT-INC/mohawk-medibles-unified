/**
 * Mohawk Medibles — Email Client (Resend)
 * ══════════════════════════════════════════
 * Transactional emails: order confirmation, shipping, password reset
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.EMAIL_FROM || "orders@mohawkmedibles.ca";

// ─── Core Send ──────────────────────────────────────────────

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: EmailOptions) {
    if (!RESEND_API_KEY) {
        console.warn("[Email] RESEND_API_KEY not set — skipping email send");
        return { success: false, error: "API key not configured" };
    }

    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: [to],
                subject,
                html,
                reply_to: replyTo,
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || res.statusText);
        }

        const data = await res.json();
        return { success: true, id: data.id };
    } catch (e) {
        console.error("[Email] Send error:", e);
        return { success: false, error: e instanceof Error ? e.message : "Unknown" };
    }
}

// ─── Email Templates ────────────────────────────────────────

const BRAND_HEADER = `
<div style="background-color:#2D5016;padding:24px;text-align:center;">
    <h1 style="color:white;font-size:24px;margin:0;font-family:system-ui;">🍃 Mohawk Medibles</h1>
    <p style="color:#a0bba5;font-size:14px;margin:4px 0 0;">Premium Indigenous Cannabis • Six Nations Territory</p>
</div>`;

const BRAND_FOOTER = `
<div style="background-color:#f5f5dc;padding:24px;text-align:center;font-size:12px;color:#4a5c40;">
    <p>Mohawk Medibles — Indigenous-Owned Cannabis Dispensary</p>
    <p>Six Nations of the Grand River Territory, Ontario, Canada</p>
    <p style="margin-top:12px;">
        <a href="https://mohawkmedibles.ca" style="color:#2D5016;">mohawkmedibles.ca</a>
    </p>
</div>`;

function emailWrapper(content: string) {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background-color:#f5f5f5;">
    <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        ${BRAND_HEADER}
        <div style="padding:32px;color:#333;">${content}</div>
        ${BRAND_FOOTER}
    </div>
</body>
</html>`;
}

// ─── Order Confirmation ─────────────────────────────────────

interface OrderEmailData {
    orderNumber: string;
    customerName: string;
    items: { name: string; qty: number; price: number }[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    etransferInstructions?: string;
}

export async function sendOrderConfirmation(to: string, order: OrderEmailData) {
    const itemRows = order.items
        .map((i) => `<tr><td style="padding:8px 0;">${i.name}</td><td style="text-align:center;">${i.qty}</td><td style="text-align:right;">$${i.price.toFixed(2)}</td></tr>`)
        .join("");

    const html = emailWrapper(`
        <h2 style="color:#2D5016;margin-top:0;">Order Confirmed! 🎉</h2>
        <p>Hi ${order.customerName}, thank you for your order!</p>
        <p><strong>Order number:</strong> ${order.orderNumber}</p>

        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <thead><tr style="border-bottom:2px solid #e5e5e5;">
                <th style="text-align:left;padding:8px 0;">Item</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Price</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
                <tr style="border-top:1px solid #e5e5e5;"><td colspan="2" style="padding:4px 0;">Subtotal</td><td style="text-align:right;">$${order.subtotal.toFixed(2)}</td></tr>
                <tr><td colspan="2" style="padding:4px 0;">Shipping</td><td style="text-align:right;">${order.shipping === 0 ? "FREE" : "$" + order.shipping.toFixed(2)}</td></tr>
                <tr><td colspan="2" style="padding:4px 0;">Tax (Tax-Free)</td><td style="text-align:right;">$0.00</td></tr>
                <tr style="border-top:2px solid #2D5016;"><td colspan="2" style="padding:8px 0;font-weight:bold;">Total</td><td style="text-align:right;font-weight:bold;color:#2D5016;font-size:18px;">$${order.total.toFixed(2)} CAD</td></tr>
            </tfoot>
        </table>

        ${order.etransferInstructions ? `
        <div style="background:#FFF8E1;border-left:4px solid #F9A825;padding:16px;margin:20px 0;border-radius:4px;">
            <h3 style="margin:0 0 8px;color:#F57F17;">Interac e-Transfer Payment Instructions</h3>
            <p style="margin:0;color:#333;">${order.etransferInstructions}</p>
            <p style="margin:8px 0 0;color:#333;"><strong>Order Reference:</strong> ${order.orderNumber}</p>
        </div>
        ` : ''}
        <p style="color:#666;">We'll send you a shipping notification with tracking info once your order ships via Canada Post Xpresspost.</p>
    `);

    return sendEmail({ to, subject: `Order Confirmed — ${order.orderNumber} | Mohawk Medibles`, html });
}

// ─── Shipping Notification ──────────────────────────────────

export async function sendShippingNotification(
    to: string,
    data: { orderNumber: string; customerName: string; tracking: string; carrier: string }
) {
    const trackingUrl = `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${data.tracking}`;

    const html = emailWrapper(`
        <h2 style="color:#2D5016;margin-top:0;">Your Order Has Shipped! 📦</h2>
        <p>Hi ${data.customerName}, your order <strong>${data.orderNumber}</strong> is on its way!</p>

        <div style="background:#f5f5dc;padding:16px;border-radius:8px;margin:20px 0;">
            <p style="margin:0;font-size:14px;"><strong>Carrier:</strong> ${data.carrier}</p>
            <p style="margin:8px 0 0;font-size:14px;"><strong>Tracking:</strong> ${data.tracking}</p>
        </div>

        <a href="${trackingUrl}" style="display:inline-block;background:#2D5016;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Track Your Package</a>

        <p style="color:#666;margin-top:20px;">Estimated delivery: 2-5 business days. Age verification (19+) may be required at delivery.</p>
    `);

    return sendEmail({ to, subject: `Shipped — ${data.orderNumber} | Mohawk Medibles`, html });
}

// ─── Password Reset ─────────────────────────────────────────

export async function sendPasswordReset(to: string, resetUrl: string) {
    const html = emailWrapper(`
        <h2 style="color:#2D5016;margin-top:0;">Reset Your Password</h2>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>

        <a href="${resetUrl}" style="display:inline-block;background:#2D5016;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0;">Reset Password</a>

        <p style="color:#666;font-size:13px;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
    `);

    return sendEmail({ to, subject: "Password Reset — Mohawk Medibles", html });
}

// ─── Welcome Email ──────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
    const html = emailWrapper(`
        <h2 style="color:#2D5016;margin-top:0;">Welcome to Mohawk Medibles! 🍃</h2>
        <p>Hi ${name}, welcome to Canada's trusted Indigenous-owned cannabis dispensary.</p>

        <div style="background:#f5f5dc;padding:16px;border-radius:8px;margin:20px 0;">
            <p style="margin:0;font-weight:bold;color:#2D5016;">What makes us different:</p>
            <ul style="color:#4a5c40;font-size:14px;">
                <li>360+ lab-tested products meeting the Empire Standard™</li>
                <li>Indigenous-owned, Six Nations of the Grand River Territory</li>
                <li>Discreet Canada-wide shipping via Xpresspost</li>
                <li>Dedicated customer support</li>
            </ul>
        </div>

        <a href="https://mohawkmedibles.ca/shop" style="display:inline-block;background:#2D5016;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Browse Our Collection</a>
    `);

    return sendEmail({ to, subject: "Welcome to Mohawk Medibles 🍃", html });
}

// ─── Review Request ────────────────────────────────────────

export async function sendReviewRequestEmail(
    to: string,
    data: { customerName: string; productName: string; productSlug: string; orderNumber: string }
) {
    const reviewUrl = `https://mohawkmedibles.ca/shop/${data.productSlug}#reviews`;

    const html = emailWrapper(`
        <h2 style="color:#2D5016;margin-top:0;">How Did You Like It? ⭐</h2>
        <p>Hi ${data.customerName}, we hope you're enjoying your <strong>${data.productName}</strong> from order ${data.orderNumber}!</p>

        <p>Your feedback helps other customers find the right products and helps us keep improving.</p>

        <a href="${reviewUrl}" style="display:inline-block;background:#2D5016;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0;">Leave a Review</a>

        <p style="color:#666;font-size:13px;">It only takes a minute. Thank you for supporting Indigenous-owned business!</p>
    `);

    return sendEmail({ to, subject: `How was your ${data.productName}? | Mohawk Medibles`, html });
}

// ─── Gift Card Email ───────────────────────────────────────

export async function sendGiftCardEmail(
    to: string,
    data: { code: string; amount: number; senderName?: string; recipientName?: string; personalMessage?: string }
) {
    const html = emailWrapper(`
        <h2 style="color:#2D5016;margin-top:0;">You've Received a Gift Card! 🎁</h2>
        <p>Hi${data.recipientName ? ` ${data.recipientName}` : ""},${data.senderName ? ` ${data.senderName} sent you` : " you've received"} a Mohawk Medibles gift card!</p>

        <div style="background:#f5f5dc;padding:24px;border-radius:8px;margin:20px 0;text-align:center;">
            <p style="margin:0;font-size:14px;color:#666;">Gift Card Value</p>
            <p style="margin:4px 0 12px;font-size:32px;font-weight:bold;color:#2D5016;">$${data.amount.toFixed(2)} CAD</p>
            <p style="margin:0;font-size:14px;color:#666;">Your Code</p>
            <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#333;letter-spacing:2px;">${data.code}</p>
        </div>

        ${data.personalMessage ? `<div style="background:#f0f0f0;padding:16px;border-radius:8px;margin:20px 0;border-left:4px solid #2D5016;"><p style="margin:0;font-style:italic;color:#666;">"${data.personalMessage}"</p></div>` : ""}

        <a href="https://mohawkmedibles.ca/shop" style="display:inline-block;background:#2D5016;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Start Shopping</a>

        <p style="color:#666;font-size:13px;margin-top:20px;">Enter the code at checkout to apply your balance. This card is valid for 1 year.</p>
    `);

    return sendEmail({ to, subject: `${data.senderName || "Someone"} sent you a Mohawk Medibles gift card!`, html });
}

// ─── Cart Recovery Email ───────────────────────────────────

export async function sendCartRecoveryEmail(
    to: string,
    data: { customerName: string; cartTotal: number; discountCode?: string; discountPercent?: number; emailNumber: number }
) {
    const subjects = [
        "You left something behind! | Mohawk Medibles",
        "Still thinking about it? Your cart is waiting",
        "Last chance — your cart expires soon!",
    ];
    const subject = subjects[Math.min(data.emailNumber - 1, 2)];

    const discountBlock = data.discountCode && data.discountPercent
        ? `<div style="background:#2D5016;padding:16px;border-radius:8px;margin:20px 0;text-align:center;">
            <p style="margin:0;color:#a0bba5;font-size:14px;">Special offer just for you</p>
            <p style="margin:4px 0;color:white;font-size:24px;font-weight:bold;">${data.discountPercent}% OFF</p>
            <p style="margin:4px 0 0;color:white;font-size:16px;">Use code: <strong>${data.discountCode}</strong></p>
           </div>`
        : "";

    const html = emailWrapper(`
        <h2 style="color:#2D5016;margin-top:0;">Your Cart Is Waiting! 🛒</h2>
        <p>Hi ${data.customerName}, you left $${data.cartTotal.toFixed(2)} worth of products in your cart.</p>

        ${discountBlock}

        <a href="https://mohawkmedibles.ca/checkout" style="display:inline-block;background:#2D5016;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Complete Your Order</a>

        <p style="color:#666;margin-top:20px;font-size:13px;">Orders over $199 ship FREE across Canada via Xpresspost.</p>
    `);

    return sendEmail({ to, subject, html });
}

// ─── Refund Notification ───────────────────────────────────

export async function sendRefundNotification(
    to: string,
    data: { orderNumber: string; customerName: string; amount: number; reason?: string; isPartial: boolean }
) {
    const html = emailWrapper(`
        <h2 style="color:#2D5016;margin-top:0;">${data.isPartial ? "Partial Refund" : "Full Refund"} Processed</h2>
        <p>Hi ${data.customerName},</p>
        <p>We've processed a ${data.isPartial ? "partial" : "full"} refund for your order <strong>${data.orderNumber}</strong>.</p>

        <div style="background:#f5f5dc;padding:16px;border-radius:8px;margin:20px 0;">
            <p style="margin:0;font-size:16px;font-weight:bold;color:#2D5016;">Refund Amount: $${data.amount.toFixed(2)} CAD</p>
            ${data.reason ? `<p style="margin:8px 0 0;font-size:14px;color:#666;">Reason: ${data.reason}</p>` : ""}
        </div>

        <p style="color:#666;">The refund will appear on your original payment method within <strong>5-10 business days</strong>, depending on your bank or credit card provider.</p>

        <p style="color:#666;margin-top:16px;">If you have any questions about this refund, please contact us at <a href="mailto:support@mohawkmedibles.ca" style="color:#2D5016;">support@mohawkmedibles.ca</a>.</p>
    `);

    return sendEmail({ to, subject: `Refund Processed — ${data.orderNumber} | Mohawk Medibles`, html });
}

// ─── Abandoned Cart Reminder ───────────────────────────────

export async function sendAbandonedCartReminder(
    to: string,
    data: { customerName: string; items: { name: string; price: number }[]; cartTotal: number }
) {
    const itemList = data.items
        .slice(0, 5)
        .map((i) => `<li style="padding:4px 0;">${i.name} — <strong>$${i.price.toFixed(2)}</strong></li>`)
        .join("");
    const moreItems = data.items.length > 5 ? `<li style="padding:4px 0;color:#999;">...and ${data.items.length - 5} more items</li>` : "";

    const html = emailWrapper(`
        <h2 style="color:#2D5016;margin-top:0;">You Left Something Behind! 🛒</h2>
        <p>Hi ${data.customerName}, it looks like you left some items in your cart.</p>

        <div style="background:#f5f5dc;padding:16px;border-radius:8px;margin:20px 0;">
            <p style="margin:0 0 8px;font-weight:bold;color:#2D5016;">Your Cart (${data.items.length} items):</p>
            <ul style="color:#4a5c40;font-size:14px;margin:0;padding-left:20px;">
                ${itemList}
                ${moreItems}
            </ul>
            <p style="margin:12px 0 0;font-size:16px;font-weight:bold;color:#2D5016;">Cart Total: $${data.cartTotal.toFixed(2)} CAD</p>
        </div>

        <a href="https://mohawkmedibles.ca/checkout" style="display:inline-block;background:#2D5016;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Complete Your Order</a>

        <p style="color:#666;margin-top:20px;font-size:13px;">Orders over $199 ship FREE across Canada. Don't miss out on your selection!</p>
    `);

    return sendEmail({ to, subject: "Don't forget your cart! | Mohawk Medibles", html });
}

// ─── Campaign Email Templates ─────────────────────────────

import crypto from "crypto";

const HMAC_SECRET = process.env.AUTH_SECRET || "mohawk-medibles-unsubscribe-secret";

/** Generate HMAC-signed unsubscribe URL for campaign emails */
export function generateUnsubscribeUrl(email: string, campaignId?: string): string {
    const token = crypto.createHmac("sha256", HMAC_SECRET).update(email.toLowerCase()).digest("hex").substring(0, 32);
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://mohawkmedibles.ca";
    const params = new URLSearchParams({ email, token });
    if (campaignId) params.set("campaign", campaignId);
    return `${base}/api/newsletter/unsubscribe?${params.toString()}`;
}

/** Wrap campaign content in brand template with unsubscribe footer */
export function buildCampaignEmail(content: string, unsubscribeUrl: string): string {
    const unsubFooter = `
<div style="background:#f0f0f0;padding:16px;text-align:center;font-size:11px;color:#999;">
    <p style="margin:0;">You're receiving this because you subscribed to Mohawk Medibles updates.</p>
    <p style="margin:4px 0 0;">
        <a href="${unsubscribeUrl}" style="color:#666;text-decoration:underline;">Unsubscribe</a> •
        <a href="https://mohawkmedibles.ca" style="color:#666;text-decoration:underline;">Visit Store</a>
    </p>
</div>`;

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background-color:#f5f5f5;">
    <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        ${BRAND_HEADER}
        <div style="padding:32px;color:#333;">${content}</div>
        ${BRAND_FOOTER}
        ${unsubFooter}
    </div>
</body>
</html>`;
}

/** Send a campaign email to a single recipient */
export async function sendCampaignEmail(
    to: string,
    subject: string,
    htmlContent: string,
    campaignId?: string
) {
    const unsubUrl = generateUnsubscribeUrl(to, campaignId);
    const html = buildCampaignEmail(htmlContent, unsubUrl);
    return sendEmail({ to, subject, html });
}

// ─── Order Delivered Notification ──────────────────────────

export async function sendDeliveryConfirmation(
    to: string,
    data: { orderNumber: string; customerName: string }
) {
    const html = emailWrapper(`
        <h2 style="color:#2D5016;margin-top:0;">Your Order Has Been Delivered! ✅</h2>
        <p>Hi ${data.customerName}, great news — your order <strong>${data.orderNumber}</strong> has been delivered!</p>

        <p style="color:#666;">We hope you enjoy your products. If anything doesn't meet your expectations, please contact us within 48 hours.</p>

        <div style="background:#f5f5dc;padding:16px;border-radius:8px;margin:20px 0;">
            <p style="margin:0;font-weight:bold;color:#2D5016;">How was your experience?</p>
            <p style="margin:8px 0 0;font-size:14px;color:#4a5c40;">We'd love to hear your feedback. Your review helps us serve you better and helps other customers find the right products.</p>
        </div>

        <a href="https://mohawkmedibles.ca/shop" style="display:inline-block;background:#2D5016;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Shop Again</a>
    `);

    return sendEmail({ to, subject: `Delivered — ${data.orderNumber} | Mohawk Medibles`, html });
}
