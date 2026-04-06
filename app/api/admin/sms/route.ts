/**
 * Admin SMS Notifications API — /api/admin/sms
 * GET ?action=stats|history&userId=N&limit=N&offset=N
 * POST { action: "blast", message: string } — Send promo SMS to all opted-in users
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";
import { log } from "@/lib/logger";
import { sendPromoSMS, logSmsToDb } from "@/lib/sms";
import { maskPhone } from "@/lib/phoneValidation";

export async function GET(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    const { prisma } = await import("@/lib/db");
    const action = req.nextUrl.searchParams.get("action") || "stats";

    try {
        switch (action) {
            case "stats": {
                // Count from SmsOptIn table (accurate opt-in tracking)
                let smsOptInCount = 0;
                try {
                    smsOptInCount = await prisma.smsOptIn.count({ where: { optedIn: true } });
                } catch {
                    // SmsOptIn table might not exist yet — fallback to user phone count
                    smsOptInCount = await prisma.user.count({ where: { phone: { not: null } } });
                }
                const totalOptedIn = smsOptInCount;

                // Count from both SmsNotification (legacy) and SmsLog (new)
                let totalSent = 0, totalDelivered = 0, totalFailed = 0, totalPending = 0;
                try {
                    totalSent = await prisma.smsNotification.count({ where: { status: "sent" } });
                    totalDelivered = await prisma.smsNotification.count({ where: { status: "delivered" } });
                    totalFailed = await prisma.smsNotification.count({ where: { status: "failed" } });
                    totalPending = await prisma.smsNotification.count({ where: { status: "pending" } });
                } catch { /* table might not exist */ }

                try {
                    totalSent += await prisma.smsLog.count({ where: { status: "SENT" } });
                    totalFailed += await prisma.smsLog.count({ where: { status: "FAILED" } });
                    totalPending += await prisma.smsLog.count({ where: { status: "QUEUED" } });
                } catch { /* table might not exist yet */ }

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
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    const { prisma } = await import("@/lib/db");

    try {
        const body = await req.json();

        if (body.action === "blast") {
            const message = body.message?.trim();
            if (!message || message.length > 160) {
                return NextResponse.json({ error: "Message must be 1-160 characters" }, { status: 400 });
            }

            // Get all opted-in users
            let optedInUsers: { phone: string; userId: string }[] = [];
            try {
                optedInUsers = await prisma.smsOptIn.findMany({
                    where: { optedIn: true },
                    select: { phone: true, userId: true },
                });
            } catch {
                return NextResponse.json({ error: "SmsOptIn table not available. Run prisma db push." }, { status: 500 });
            }

            if (optedInUsers.length === 0) {
                return NextResponse.json({ sent: 0, failed: 0, total: 0 });
            }

            let sent = 0;
            let failed = 0;

            // Send in batches of 10
            for (let i = 0; i < optedInUsers.length; i += 10) {
                const batch = optedInUsers.slice(i, i + 10);
                const results = await Promise.allSettled(
                    batch.map(async (user) => {
                        const result = await sendPromoSMS(user.phone, message);
                        // Log to new SmsLog table
                        try {
                            await logSmsToDb({
                                phone: user.phone,
                                message: `${message}\n\nReply STOP to unsubscribe. Mohawk Medibles`,
                                status: result.success ? "SENT" : "FAILED",
                                type: "PROMO",
                                userId: user.userId,
                                error: result.error,
                                messageId: result.messageId,
                            });
                        } catch { /* ignore log failures */ }
                        return result;
                    })
                );

                for (const r of results) {
                    if (r.status === "fulfilled" && r.value.success) sent++;
                    else failed++;
                }
            }

            log.admin.info("SMS blast sent", { sent, failed, total: optedInUsers.length });
            return NextResponse.json({ sent, failed, total: optedInUsers.length });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (err: any) {
        log.admin.error("SMS POST error", { error: err instanceof Error ? err.message : String(err) });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
