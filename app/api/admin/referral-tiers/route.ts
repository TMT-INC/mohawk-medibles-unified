/**
 * Admin Referral Tiers API
 * GET  /api/admin/referral-tiers — get tier settings
 * PUT  /api/admin/referral-tiers — save tier settings
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";
import { log } from "@/lib/logger";

// Default tiers used when no settings exist
const DEFAULT_TIERS = [
    { name: "Bronze", minReferrals: 0, multiplier: 1.0, icon: "\ud83e\udd49", color: "#cd7f32", bgColor: "rgba(205, 127, 50, 0.15)", perks: ["Base referral bonus"] },
    { name: "Silver", minReferrals: 5, multiplier: 1.5, icon: "\ud83e\udd48", color: "#9ca3af", bgColor: "rgba(156, 163, 175, 0.15)", perks: ["1.5x bonus multiplier", "Priority support"] },
    { name: "Gold", minReferrals: 15, multiplier: 2.0, icon: "\ud83e\udd47", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.15)", perks: ["2x bonus multiplier", "Exclusive deals", "Early access"] },
    { name: "Diamond", minReferrals: 30, multiplier: 3.0, icon: "\ud83d\udc8e", color: "#8b5cf6", bgColor: "rgba(139, 92, 246, 0.15)", perks: ["3x bonus multiplier", "VIP perks", "Free shipping", "Birthday bonus"] },
];

export async function GET(_req: NextRequest) {
    const auth = requireAdmin(_req);
    if (isAuthError(auth)) return auth;

    try {
        // Check for stored tier settings in SiteSettings
        const setting = await prisma.storeSetting.findUnique({
            where: { settingKey: "referral_tiers" },
        });

        if (setting?.settingValue) {
            return NextResponse.json(JSON.parse(setting.settingValue));
        }

        return NextResponse.json(DEFAULT_TIERS);
    } catch (error) {
        log.admin.error("Get referral tiers error", { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(DEFAULT_TIERS);
    }
}

export async function PUT(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const tiers = await req.json();

        if (!Array.isArray(tiers) || tiers.length === 0) {
            return NextResponse.json({ error: "Invalid tiers data" }, { status: 400 });
        }

        // Validate first tier starts at 0
        if (tiers[0].minReferrals !== 0) {
            return NextResponse.json({ error: "First tier must start at 0 referrals" }, { status: 400 });
        }

        // Validate ascending thresholds
        for (let i = 1; i < tiers.length; i++) {
            if (tiers[i].minReferrals <= tiers[i - 1].minReferrals) {
                return NextResponse.json({ error: "Tier thresholds must be ascending" }, { status: 400 });
            }
        }

        await prisma.storeSetting.upsert({
            where: { settingKey: "referral_tiers" },
            create: { settingKey: "referral_tiers", settingValue: JSON.stringify(tiers), settingGroup: "referrals" },
            update: { settingValue: JSON.stringify(tiers) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        log.admin.error("Update referral tiers error", { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: "Failed to save tier settings" }, { status: 500 });
    }
}
