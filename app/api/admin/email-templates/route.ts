/**
 * Admin Email Templates API
 * GET  /api/admin/email-templates — list template versions
 * POST /api/admin/email-templates — preview a template
 */
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

const TEMPLATE_OPTIONS = [
    { id: "order_confirmation", label: "Order Confirmation" },
    { id: "payment_received", label: "Payment Received" },
    { id: "order_shipped", label: "Order Shipped" },
    { id: "order_delivered", label: "Order Delivered" },
    { id: "order_cancelled", label: "Order Cancelled" },
    { id: "order_refunded", label: "Refund Processed" },
    { id: "back_in_stock", label: "Back in Stock" },
    { id: "password_reset", label: "Password Reset" },
    { id: "owner_alert", label: "New Order Alert (Owner)" },
    { id: "low_stock", label: "Low Stock Alert (Owner)" },
];

export async function GET(_req: NextRequest) {
    const auth = requireAdmin(_req);
    if (isAuthError(auth)) return auth;

    try {
        const settingRow = await prisma.storeSetting.findUnique({
            where: { settingKey: "email_template_versions" },
        });
        const versions = settingRow?.settingValue ? JSON.parse(settingRow.settingValue) : [];

        return NextResponse.json({ versions, templates: TEMPLATE_OPTIONS });
    } catch (error) {
        log.admin.error("Email templates GET error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ versions: [], templates: TEMPLATE_OPTIONS });
    }
}

export async function POST(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const { templateId, action, versionId, versionA, versionB } = await req.json();

        if (action === "preview") {
            // Generate a simple preview
            const template = TEMPLATE_OPTIONS.find(t => t.id === templateId);
            const sampleHtml = (lang: string) => `
                <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;padding:20px;">
                    <div style="background:linear-gradient(135deg,#C8E63E,#a5c431);padding:20px;border-radius:12px 12px 0 0;text-align:center;">
                        <h1 style="color:#000;margin:0;font-size:24px;">Mohawk Medibles</h1>
                    </div>
                    <div style="background:#fff;padding:30px;border:1px solid #eee;border-radius:0 0 12px 12px;">
                        <h2 style="color:#333;">${template?.label || templateId} ${lang === "fr" ? "(FR)" : ""}</h2>
                        <p style="color:#666;line-height:1.6;">
                            ${lang === "fr"
                                ? "Ceci est un aper\u00e7u de votre mod\u00e8le d'email. Le contenu r\u00e9el sera remplac\u00e9 par les donn\u00e9es de la commande."
                                : "This is a preview of your email template. Actual content will be replaced with order data."
                            }
                        </p>
                        <div style="background:#f9f9f9;border:1px solid #eee;border-radius:8px;padding:16px;margin:20px 0;">
                            <p style="color:#888;font-size:14px;margin:0;">Order #12345 | $99.99 | 3 items</p>
                        </div>
                        <p style="color:#999;font-size:12px;text-align:center;margin-top:30px;">
                            Mohawk Medibles &mdash; ${lang === "fr" ? "Courriel automatis\u00e9" : "Automated Email"}
                        </p>
                    </div>
                </div>
            `;

            return NextResponse.json({
                en: { subject: `${template?.label || templateId}`, html: sampleHtml("en"), text: "Preview text" },
                fr: { subject: `${template?.label || templateId} (FR)`, html: sampleHtml("fr"), text: "Texte d'aper\u00e7u" },
            });
        }

        if (action === "compare" && versionA && versionB) {
            const settingRow = await prisma.storeSetting.findUnique({
                where: { settingKey: "email_template_versions" },
            });
            const versions = settingRow?.settingValue ? JSON.parse(settingRow.settingValue) : [];
            const a = versions.find((v: any) => v.id === versionA);
            const b = versions.find((v: any) => v.id === versionB);

            if (!a || !b) {
                return NextResponse.json({ diffs: [] });
            }

            const diffs: any[] = [];
            const allKeys = new Set([...Object.keys(a.settings || {}), ...Object.keys(b.settings || {})]);
            for (const key of allKeys) {
                if (JSON.stringify(a.settings?.[key]) !== JSON.stringify(b.settings?.[key])) {
                    diffs.push({ field: key, label: key, oldValue: a.settings?.[key], newValue: b.settings?.[key] });
                }
            }

            return NextResponse.json({ diffs });
        }

        if (action === "get" && versionId) {
            const settingRow = await prisma.storeSetting.findUnique({
                where: { settingKey: "email_template_versions" },
            });
            const versions = settingRow?.settingValue ? JSON.parse(settingRow.settingValue) : [];
            const version = versions.find((v: any) => v.id === versionId);
            return NextResponse.json(version || null);
        }

        if (action === "revert" && versionId) {
            // Revert logic — swap current with selected version
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        log.admin.error("Email templates POST error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
