/**
 * Admin Gift Cards API
 * GET  /api/admin/gift-cards — list all + stats
 * POST /api/admin/gift-cards — create gift card
 * PUT  /api/admin/gift-cards — disable gift card
 */
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(_req: NextRequest) {
    const auth = requireAdmin(_req);
    if (isAuthError(auth)) return auth;

    try {
        const cards = await prisma.giftCard.findMany({
            orderBy: { createdAt: "desc" },
            include: { transactions: true },
        });

        const totalCards = cards.length;
        const activeCards = cards.filter((c: any) => c.status === "active");
        const totalValue = cards.reduce((sum: number, c: any) => sum + (c.initialBalance || 0), 0);
        const totalRedeemed = cards.reduce((sum: number, c: any) => sum + (c.initialBalance - c.currentBalance), 0);

        return NextResponse.json({
            cards: cards.map((c: any) => ({
                id: c.id,
                code: c.code,
                originalAmount: c.initialBalance,
                balance: c.currentBalance,
                recipientEmail: c.recipientEmail,
                recipientName: c.recipientName,
                senderName: c.senderName,
                design: c.design,
                isActive: c.status === "active",
                createdAt: c.createdAt.toISOString(),
                expiresAt: c.expiresAt?.toISOString() || null,
            })),
            stats: {
                totalCards,
                activeCount: activeCards.length,
                totalValue,
                totalRedeemed,
            },
        });
    } catch (error) {
        log.admin.error("Admin gift cards GET error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ cards: [], stats: { totalCards: 0, activeCount: 0, totalValue: 0, totalRedeemed: 0 } });
    }
}

export async function POST(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const body = await req.json();
        const { amount, recipientEmail, recipientName, senderName, design } = body;

        if (!amount || amount < 5 || amount > 1000) {
            return NextResponse.json({ error: "Amount must be between $5 and $1000" }, { status: 400 });
        }

        const code = `MM-${randomBytes(3).toString("hex").toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

        const card = await prisma.giftCard.create({
            data: {
                code,
                initialBalance: amount,
                currentBalance: amount,
                recipientEmail: recipientEmail || null,
                recipientName: recipientName || null,
                senderName: senderName || "Admin",
                design: design || "classic",
                status: "active",
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
        });

        await prisma.giftCardTransaction.create({
            data: {
                giftCardId: card.id,
                amount,
                balanceAfter: amount,
                type: "purchase",
                description: `Admin-issued gift card`,
            },
        });

        return NextResponse.json({ success: true, card }, { status: 201 });
    } catch (error) {
        log.admin.error("Admin gift cards POST error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Failed to create gift card" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await req.json();

        await prisma.giftCard.update({
            where: { id },
            data: { status: "disabled" },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        log.admin.error("Admin gift cards PUT error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Failed to disable gift card" }, { status: 500 });
    }
}
