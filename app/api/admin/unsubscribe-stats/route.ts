/**
 * Admin Unsubscribe/Subscriber Stats API
 * GET /api/admin/unsubscribe-stats
 *
 * Gathers subscriber statistics from users, back-in-stock subscriptions,
 * and notification types from customer notifications.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";
import { log } from "@/lib/logger";

export async function GET(_req: NextRequest) {
    const auth = requireAdmin(_req);
    if (isAuthError(auth)) return auth;

    try {
        const totalUsers = await prisma.user.count();
        const withEmail = await prisma.user.count({ where: { email: { not: "" } } });

        // Count unique users who received different notification types
        const notifStats = await prisma.customerNotification.groupBy({
            by: ["type"],
            _count: { userId: true },
        }).catch(() => []);

        const notifCounts: Record<string, number> = {};
        for (const stat of notifStats) {
            notifCounts[stat.type] = stat._count.userId;
        }

        // Count back-in-stock subscriptions as restock interest
        const restockSubs = await prisma.backInStockSubscription.count({
            where: { status: "active" },
        }).catch(() => 0);

        // Count auto-reorder subscriptions
        const autoReorderSubs = await prisma.subscription.count({
            where: { status: "active" },
        }).catch(() => 0);

        // Abandoned cart recovery opt-out tracking via StoreSetting
        const cartOptOutSetting = await prisma.storeSetting.findUnique({
            where: { settingKey: "cart_recovery_opt_out_count" },
        }).catch(() => null);
        const cartRecoveryOptOut = cartOptOutSetting?.settingValue
            ? parseInt(cartOptOutSetting.settingValue) : 0;

        return NextResponse.json({
            totalUsers,
            withEmail,
            anyOptIn: withEmail, // All users with email are potentially opted in
            allOptedOut: Math.max(0, totalUsers - withEmail),
            emailPromotionsOptIn: notifCounts["promotion"] || 0,
            emailOrderUpdatesOptIn: notifCounts["order_update"] || withEmail,
            emailRestockAlertsOptIn: restockSubs,
            emailNewsletterOptIn: autoReorderSubs,
            cartRecoveryOptOut,
        });
    } catch (error) {
        log.admin.error("Unsubscribe stats error", { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({
            totalUsers: 0, withEmail: 0, anyOptIn: 0, allOptedOut: 0,
            emailPromotionsOptIn: 0, emailOrderUpdatesOptIn: 0,
            emailRestockAlertsOptIn: 0, emailNewsletterOptIn: 0,
            cartRecoveryOptOut: 0,
        });
    }
}
