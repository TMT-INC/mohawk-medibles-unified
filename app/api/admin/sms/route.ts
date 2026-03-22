/**
 * Admin SMS Notifications API — /api/admin/sms
 * GET ?action=stats|history&userId=N&limit=N&offset=N
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";
import { log } from "@/lib/logger";

export async function GET(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    const { prisma } = await import("@/lib/db");
    const action = req.nextUrl.searchParams.get("action") || "stats";

    try {
        switch (action) {
            case "stats": {
                // Count users with phone numbers as proxy for opt-in
                const totalOptedIn = await prisma.user.count({
                    where: { phone: { not: null } },
                });
                const totalSent = await prisma.smsNotification.count({ where: { status: "sent" } });
                const totalDelivered = await prisma.smsNotification.count({ where: { status: "delivered" } });
                const totalFailed = await prisma.smsNotification.count({ where: { status: "failed" } });
                const totalPending = await prisma.smsNotification.count({ where: { status: "pending" } });

                const twilioConfigured = !!(
                    process.env.TWILIO_ACCOUNT_SID &&
                    process.env.TWILIO_AUTH_TOKEN &&
                    process.env.TWILIO_PHONE_NUMBER
                );

                return NextResponse.json({
                    totalOptedIn,
                    totalSent,
                    totalDelivered,
                    totalFailed,
                    totalPending,
                    twilioConfigured,
                });
            }

            case "history": {
                const userId = req.nextUrl.searchParams.get("userId");
                const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");
                const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

                const where: any = {};
                if (userId) where.userId = userId;

                const [notifications, total] = await Promise.all([
                    prisma.smsNotification.findMany({
                        where,
                        orderBy: { createdAt: "desc" },
                        take: limit,
                        skip: offset,
                        include: {
                            user: { select: { name: true, email: true } },
                        },
                    }),
                    prisma.smsNotification.count({ where }),
                ]);

                return NextResponse.json({
                    notifications: notifications.map((n) => ({
                        id: n.id,
                        userId: n.userId,
                        phone: n.phone,
                        orderId: n.orderId,
                        type: n.messageType,
                        status: n.status,
                        errorMessage: n.errorMessage,
                        sentAt: n.sentAt || n.createdAt,
                        userName: n.user?.name,
                    })),
                    total,
                });
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (err: any) {
        log.admin.error("SMS API error", { error: err instanceof Error ? err.message : String(err) });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
