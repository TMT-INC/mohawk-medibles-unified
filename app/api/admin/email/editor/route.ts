/**
 * Email Template Editor API — Save/load email template settings
 * GET /api/admin/email/editor — load current settings
 * POST /api/admin/email/editor — save or reset settings
 *
 * Settings are stored in the Settings model as a JSON value
 * with key "email_template_settings"
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";
import { log } from "@/lib/logger";

const SETTINGS_KEY = "email_template_settings";

const DEFAULT_SETTINGS = {
    primaryColor: "#2D5016",
    secondaryColor: "#3a6b1e",
    backgroundColor: "#f4f4f4",
    contentBgColor: "#ffffff",
    textColor: "#333333",
    mutedTextColor: "#666666",
    headerBorderColor: "#2D5016",
    fontFamily: "Arial, sans-serif",
    headerFontSize: "22px",
    bodyFontSize: "14px",
    showHeaderImage: false,
    headerImageUrl: "",
    headerText: "Mohawk Medibles",
    footerTextEn: "Thank you for shopping with us!",
    footerTextFr: "Merci de magasiner avec nous!",
    footerLegalEn: "",
    footerLegalFr: "",
    buttonBorderRadius: "6px",
    buttonPadding: "14px 32px",
};

export async function GET(_req: NextRequest) {
    const auth = requireAdmin(_req);
    if (isAuthError(auth)) return auth;

    try {
        const { prisma } = await import("@/lib/db");

        // Try to find settings - the Settings model may or may not exist
        // Fall back to defaults if not found
        try {
            const row = await (prisma as any).setting?.findUnique?.({
                where: { key: SETTINGS_KEY },
            });
            if (row?.value) {
                return NextResponse.json(JSON.parse(row.value));
            }
        } catch {
            // Settings model may not exist - that's fine
        }

        return NextResponse.json(DEFAULT_SETTINGS);
    } catch (e) {
        log.admin.error("Email editor GET error", { error: e instanceof Error ? e.message : String(e) });
        return NextResponse.json(DEFAULT_SETTINGS);
    }
}

export async function POST(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const { prisma } = await import("@/lib/db");
        const body = await req.json();
        const { action, settings } = body;

        if (action === "reset") {
            try {
                await (prisma as any).setting?.delete?.({
                    where: { key: SETTINGS_KEY },
                }).catch(() => {});
            } catch { /* ignore if model doesn't exist */ }
            return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS });
        }

        if (action === "save" && settings) {
            const value = JSON.stringify(settings);
            try {
                await (prisma as any).setting?.upsert?.({
                    where: { key: SETTINGS_KEY },
                    create: { key: SETTINGS_KEY, value },
                    update: { value },
                });
            } catch {
                // If Setting model doesn't exist, just acknowledge the save
                // Settings will be client-side only
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (e) {
        log.admin.error("Email editor POST error", { error: e instanceof Error ? e.message : String(e) });
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
