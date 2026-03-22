/**
 * Admin Referrals API — Referral program stats and listing
 * GET /api/admin/referrals
 */
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

interface ReferralRecord {
    id: number;
    referrerId: string;
    refereeId: string | null;
    referralCode: string;
    status: string;
    referrerPointsAwarded: number;
    refereePointsAwarded: number;
    createdAt: Date;
    completedAt: Date | null;
    referrer?: { name: string | null; email: string } | null;
}

export async function GET(_req: NextRequest) {
    const auth = requireAdmin(_req);
    if (isAuthError(auth)) return auth;

    try {
        const allReferrals: ReferralRecord[] = await prisma.referral.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                referrer: { select: { name: true, email: true } },
            },
        });

        const totalReferrals = allReferrals.length;
        const completed = allReferrals.filter((r: ReferralRecord) => r.status === "completed").length;
        const pending = allReferrals.filter((r: ReferralRecord) => r.status === "pending" || r.status === "signed_up").length;
        const expired = allReferrals.filter((r: ReferralRecord) => r.status === "expired").length;
        const totalPointsAwarded = allReferrals.reduce(
            (sum: number, r: ReferralRecord) => sum + (r.referrerPointsAwarded || 0) + (r.refereePointsAwarded || 0),
            0
        );
        const conversionRate = totalReferrals > 0
            ? ((completed / totalReferrals) * 100).toFixed(1)
            : "0.0";

        return NextResponse.json({
            stats: { totalReferrals, completed, pending, expired, totalPointsAwarded, conversionRate },
            referrals: allReferrals.map((ref: ReferralRecord) => ({
                id: ref.id,
                referralCode: ref.referralCode,
                referrerName: ref.referrer?.name || ref.referrer?.email || `User #${ref.referrerId}`,
                refereeId: ref.refereeId,
                status: ref.status,
                referrerPointsAwarded: ref.referrerPointsAwarded,
                refereePointsAwarded: ref.refereePointsAwarded,
                createdAt: ref.createdAt.toISOString(),
                completedAt: ref.completedAt?.toISOString() || null,
            })),
        });
    } catch (error) {
        log.admin.error("Admin referrals error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            {
                stats: { totalReferrals: 0, completed: 0, pending: 0, expired: 0, totalPointsAwarded: 0, conversionRate: "0.0" },
                referrals: [],
            },
            { status: 500 }
        );
    }
}
