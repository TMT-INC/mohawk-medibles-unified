/**
 * Admin Cart Recovery API — Full stats, settings, email log, and process trigger
 * GET  /api/admin/cart-recovery?action=stats|settings|emails
 * POST /api/admin/cart-recovery  { action: "process" | "updateSettings", ... }
 */
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

// ─── GET handler ────────────────────────────────────────

export async function GET(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    const action = req.nextUrl.searchParams.get("action") || "stats";

    try {
        if (action === "settings") {
            return NextResponse.json(await getSettings());
        }

        if (action === "emails") {
            const limit = Number(req.nextUrl.searchParams.get("limit") || "50");
            return NextResponse.json(await getRecentEmails(limit));
        }

        // Default: full stats
        return NextResponse.json(await getStats());
    } catch (error) {
        log.admin.error("Admin cart-recovery GET error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

// ─── POST handler ───────────────────────────────────────

export async function POST(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const body = await req.json();
        const { action } = body;

        if (action === "updateSettings") {
            const { settings } = body;
            const result = await updateSettings(settings);
            return NextResponse.json({ success: result });
        }

        if (action === "process") {
            const result = await processAbandonedCarts();
            return NextResponse.json(result);
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (error) {
        log.admin.error("Admin cart-recovery POST error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Action failed" }, { status: 500 });
    }
}

// ─── Stats ──────────────────────────────────────────────

async function getStats() {
    const allCarts = await prisma.abandonedCart.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true, email: true } },
            recoveryEmails: {
                select: { id: true, status: true, emailNumber: true, sentAt: true },
                orderBy: { sentAt: "desc" },
                take: 1,
            },
        },
    });

    const totalAbandoned = allCarts.length;
    const totalActive = allCarts.filter((c) => c.status === "active").length;
    const totalRecovered = allCarts.filter((c) => c.status === "recovered").length;
    const totalExpired = allCarts.filter((c) => c.status === "expired").length;
    const recoveryRate = totalAbandoned > 0 ? Math.round((totalRecovered / totalAbandoned) * 100) : 0;

    const totalRevenueLost = allCarts
        .filter((c) => c.status === "active" || c.status === "expired")
        .reduce((sum, c) => sum + (c.cartTotal || 0), 0);

    const totalRevenueRecovered = allCarts
        .filter((c) => c.status === "recovered")
        .reduce((sum, c) => sum + (c.cartTotal || 0), 0);

    const recentCarts = allCarts.slice(0, 20).map((cart) => ({
        id: cart.id,
        email: cart.email || cart.user?.email || `User #${cart.userId}`,
        userName: cart.user?.name || null,
        cartTotal: cart.cartTotal,
        emailsSent: cart.emailsSent,
        status: cart.status,
        createdAt: cart.createdAt.toISOString(),
        recoveredAt: cart.recoveredAt?.toISOString() || null,
    }));

    // Campaign email stats
    const allEmails = await prisma.cartRecoveryEmail.findMany({
        select: {
            status: true,
            emailNumber: true,
            discountCode: true,
            discountPercent: true,
            subjectVariant: true,
        },
    });

    const totalEmailsSent = allEmails.length;
    const totalOpened = allEmails.filter((e) =>
        ["opened", "clicked", "converted"].includes(e.status)
    ).length;
    const totalClicked = allEmails.filter((e) =>
        ["clicked", "converted"].includes(e.status)
    ).length;
    const totalConverted = allEmails.filter((e) => e.status === "converted").length;
    const codesGenerated = allEmails.filter((e) => e.discountCode != null).length;

    const campaignStats = {
        totalEmailsSent,
        totalOpened,
        totalClicked,
        totalConverted,
        codesGenerated,
        openRate: totalEmailsSent > 0 ? Math.round((totalOpened / totalEmailsSent) * 100) : 0,
        clickRate: totalEmailsSent > 0 ? Math.round((totalClicked / totalEmailsSent) * 100) : 0,
        conversionRate: totalEmailsSent > 0 ? Math.round((totalConverted / totalEmailsSent) * 100) : 0,
    };

    // Per-email-number breakdown
    const emailBreakdown: Array<{
        emailNumber: number;
        total: number;
        converted: number;
        avgDiscount: number;
    }> = [];
    for (const num of [1, 2, 3]) {
        const subset = allEmails.filter((e) => e.emailNumber === num);
        if (subset.length > 0) {
            const converted = subset.filter((e) => e.status === "converted").length;
            const avgDiscount =
                subset.reduce((s, e) => s + (e.discountPercent || 0), 0) / subset.length;
            emailBreakdown.push({
                emailNumber: num,
                total: subset.length,
                converted,
                avgDiscount,
            });
        }
    }

    // A/B test performance
    const abTestStats = {
        a: buildVariantStats(allEmails.filter((e) => e.subjectVariant !== "b")),
        b: buildVariantStats(allEmails.filter((e) => e.subjectVariant === "b")),
    };

    return {
        totalAbandoned,
        totalActive,
        totalRecovered,
        totalExpired,
        recoveryRate,
        totalRevenueLost,
        totalRevenueRecovered,
        recentCarts,
        campaignStats,
        emailBreakdown,
        abTestStats,
    };
}

function buildVariantStats(
    emails: Array<{ status: string }>
): { sent: number; opened: number; clicked: number; converted: number; openRate: number; clickRate: number; conversionRate: number } {
    const sent = emails.length;
    const opened = emails.filter((e) => ["opened", "clicked", "converted"].includes(e.status)).length;
    const clicked = emails.filter((e) => ["clicked", "converted"].includes(e.status)).length;
    const converted = emails.filter((e) => e.status === "converted").length;
    return {
        sent,
        opened,
        clicked,
        converted,
        openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
        clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
        conversionRate: sent > 0 ? Math.round((converted / sent) * 100) : 0,
    };
}

// ─── Settings ───────────────────────────────────────────

async function getSettings() {
    const row = await prisma.cartRecoverySettings.findFirst();
    if (!row) {
        return {
            isEnabled: true,
            email1Enabled: true,
            email1DelayMs: 60 * 60 * 1000,
            email1DiscountPercent: 0,
            email1Subject: "You left something behind!",
            email2Enabled: true,
            email2DelayMs: 24 * 60 * 60 * 1000,
            email2DiscountPercent: 10,
            email2Subject: "Your cart is waiting — here's 10% off!",
            email3Enabled: true,
            email3DelayMs: 72 * 60 * 60 * 1000,
            email3DiscountPercent: 15,
            email3Subject: "Last chance — 15% off your cart!",
            maxEmailsPerCart: 3,
            cartExpiryMs: 7 * 24 * 60 * 60 * 1000,
            autoGenerateDiscountCodes: true,
            discountCodePrefix: "RECOVER",
            discountCodeExpiryHours: 48,
            freeShippingOnRecovery: false,
        };
    }

    return {
        isEnabled: row.isEnabled,
        email1Enabled: row.email1Enabled,
        email1DelayMs: row.email1DelayMinutes * 60 * 1000,
        email1DiscountPercent: row.email1DiscountPercent,
        email1Subject: row.email1Subject,
        email2Enabled: row.email2Enabled,
        email2DelayMs: row.email2DelayMinutes * 60 * 1000,
        email2DiscountPercent: row.email2DiscountPercent,
        email2Subject: row.email2Subject,
        email3Enabled: row.email3Enabled,
        email3DelayMs: row.email3DelayMinutes * 60 * 1000,
        email3DiscountPercent: row.email3DiscountPercent,
        email3Subject: row.email3Subject,
        maxEmailsPerCart: row.maxEmailsPerCart,
        cartExpiryMs: row.cartExpiryDays * 24 * 60 * 60 * 1000,
        autoGenerateDiscountCodes: row.autoGenerateDiscountCodes,
        discountCodePrefix: row.discountCodePrefix,
        discountCodeExpiryHours: row.discountCodeExpiryHours,
        freeShippingOnRecovery: row.freeShippingOnRecovery,
    };
}

async function updateSettings(updates: Record<string, unknown>): Promise<boolean> {
    // Convert client-side field names to Prisma column names
    const data: Record<string, unknown> = {};

    const directFields = [
        "isEnabled",
        "email1Enabled", "email1DiscountPercent", "email1Subject",
        "email2Enabled", "email2DiscountPercent", "email2Subject",
        "email3Enabled", "email3DiscountPercent", "email3Subject",
        "maxEmailsPerCart",
        "autoGenerateDiscountCodes", "discountCodePrefix",
        "discountCodeExpiryHours", "freeShippingOnRecovery",
    ];

    for (const key of directFields) {
        if (key in updates) data[key] = updates[key];
    }

    // Delay fields: client sends minutes, DB stores minutes
    if ("email1DelayMinutes" in updates) data.email1DelayMinutes = Number(updates.email1DelayMinutes);
    if ("email2DelayMinutes" in updates) data.email2DelayMinutes = Number(updates.email2DelayMinutes);
    if ("email3DelayMinutes" in updates) data.email3DelayMinutes = Number(updates.email3DelayMinutes);
    if ("cartExpiryDays" in updates) data.cartExpiryDays = Number(updates.cartExpiryDays);

    const existing = await prisma.cartRecoverySettings.findFirst();

    if (existing) {
        await prisma.cartRecoverySettings.update({
            where: { id: existing.id },
            data,
        });
    } else {
        await prisma.cartRecoverySettings.create({ data });
    }
    return true;
}

// ─── Recent Emails ──────────────────────────────────────

async function getRecentEmails(limit: number) {
    const emails = await prisma.cartRecoveryEmail.findMany({
        orderBy: { sentAt: "desc" },
        take: limit,
        include: {
            abandonedCart: {
                include: {
                    user: { select: { name: true } },
                },
            },
        },
    });

    return emails.map((e) => ({
        id: e.id,
        abandonedCartId: e.abandonedCartId,
        emailNumber: e.emailNumber,
        subject: e.subject,
        recipientEmail: e.recipientEmail,
        discountCode: e.discountCode,
        discountPercent: e.discountPercent,
        cartTotal: e.cartTotal,
        status: e.status,
        sentAt: e.sentAt.toISOString(),
        subjectVariant: e.subjectVariant || "a",
        userName: e.abandonedCart?.user?.name || null,
    }));
}

// ─── Process Abandoned Carts ────────────────────────────

async function processAbandonedCarts(): Promise<{ processed: number; emailsSent: number }> {
    const settings = await getSettings();
    if (!settings.isEnabled) return { processed: 0, emailsSent: 0 };

    const now = Date.now();
    let emailsSent = 0;

    const activeCarts = await prisma.abandonedCart.findMany({
        where: { status: "active" },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { email: true, name: true } } },
    });

    for (const cart of activeCarts) {
        const cartAge = now - new Date(cart.createdAt).getTime();

        // Expire old carts
        if (cartAge > settings.cartExpiryMs) {
            await prisma.abandonedCart.update({
                where: { id: cart.id },
                data: { status: "expired" },
            });
            continue;
        }

        // Determine which email to send
        let shouldSend = false;
        let emailNumber = cart.emailsSent + 1;
        let discountPercent = 0;
        let emailSubject = "";

        if (cart.emailsSent === 0 && cartAge >= settings.email1DelayMs) {
            shouldSend = settings.email1Enabled;
            discountPercent = settings.email1DiscountPercent;
            emailSubject = settings.email1Subject;
        } else if (cart.emailsSent === 1 && cartAge >= settings.email2DelayMs) {
            shouldSend = settings.email2Enabled;
            discountPercent = settings.email2DiscountPercent;
            emailSubject = settings.email2Subject;
        } else if (cart.emailsSent === 2 && cartAge >= settings.email3DelayMs) {
            shouldSend = settings.email3Enabled;
            discountPercent = settings.email3DiscountPercent;
            emailSubject = settings.email3Subject;
        }

        const recipientEmail = cart.email || cart.user?.email;
        if (shouldSend && emailNumber <= settings.maxEmailsPerCart && recipientEmail) {
            // Log the recovery email
            await prisma.cartRecoveryEmail.create({
                data: {
                    abandonedCartId: cart.id,
                    userId: cart.userId,
                    emailNumber,
                    subject: emailSubject,
                    recipientEmail,
                    discountPercent,
                    cartTotal: cart.cartTotal,
                    status: "sent",
                    subjectVariant: "a",
                },
            });

            await prisma.abandonedCart.update({
                where: { id: cart.id },
                data: {
                    emailsSent: emailNumber,
                    lastEmailSentAt: new Date(),
                },
            });

            emailsSent++;
        }
    }

    return { processed: activeCarts.length, emailsSent };
}
