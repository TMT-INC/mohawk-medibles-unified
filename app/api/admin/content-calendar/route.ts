/**
 * Content Calendar API — Mohawk Medibles
 * GET /api/admin/content-calendar — list content pieces + priorities
 * POST /api/admin/content-calendar — create/update/schedule/publish
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { log } from "@/lib/logger";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    try {
        const { prisma } = await import("@/lib/db");
        const action = req.nextUrl.searchParams.get("action") || "list";

        if (action === "priorities") {
            const { getContentPriorities } = await import("@/lib/content-strategy");
            const priorities = await getContentPriorities();
            return NextResponse.json({ priorities: priorities.slice(0, 30) });
        }

        if (action === "keywords") {
            const { getKeywordRevenuePotential } = await import("@/lib/content-strategy");
            const keywords = await getKeywordRevenuePotential();
            return NextResponse.json({ keywords: keywords.slice(0, 50) });
        }

        if (action === "stats") {
            const [total, drafts, scheduled, published] = await Promise.all([
                prisma.contentPiece.count(),
                prisma.contentPiece.count({ where: { status: "DRAFT" } }),
                prisma.contentPiece.count({ where: { status: "SCHEDULED" } }),
                prisma.contentPiece.count({ where: { status: "PUBLISHED" } }),
            ]);
            return NextResponse.json({ total, drafts, scheduled, published });
        }

        // Default: list all content pieces
        const pieces = await prisma.contentPiece.findMany({
            orderBy: { createdAt: "desc" },
            take: 100,
        });
        return NextResponse.json(pieces);
    } catch (e) {
        log.content.error("GET error", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    try {
        const { prisma } = await import("@/lib/db");
        const body = await req.json();
        const { action } = body;

        if (action === "create") {
            const { channel, pillar, title, content, productId, keyword, scheduledAt } = body;
            if (!title?.trim()) {
                return NextResponse.json({ error: "Title is required" }, { status: 400 });
            }
            const piece = await prisma.contentPiece.create({
                data: {
                    channel: channel || "blog",
                    pillar: pillar || "education",
                    title: title.trim(),
                    content: content || "",
                    productId: productId ? Number(productId) : null,
                    keyword: keyword || null,
                    status: scheduledAt ? "SCHEDULED" : "DRAFT",
                    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                },
            });
            return NextResponse.json({ success: true, piece });
        }

        if (action === "update") {
            const { id, title, content, channel, pillar, keyword, status, scheduledAt } = body;
            if (!id) return NextResponse.json({ error: "Content ID required" }, { status: 400 });
            const piece = await prisma.contentPiece.update({
                where: { id },
                data: {
                    ...(title && { title: title.trim() }),
                    ...(content !== undefined && { content }),
                    ...(channel && { channel }),
                    ...(pillar && { pillar }),
                    ...(keyword !== undefined && { keyword }),
                    ...(status && { status }),
                    ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
                },
            });
            return NextResponse.json({ success: true, piece });
        }

        if (action === "publish") {
            const { id } = body;
            if (!id) return NextResponse.json({ error: "Content ID required" }, { status: 400 });
            const piece = await prisma.contentPiece.update({
                where: { id },
                data: { status: "PUBLISHED", publishedAt: new Date() },
            });
            return NextResponse.json({ success: true, piece });
        }

        if (action === "delete") {
            const { id } = body;
            if (!id) return NextResponse.json({ error: "Content ID required" }, { status: 400 });
            await prisma.contentPiece.delete({ where: { id } });
            return NextResponse.json({ success: true });
        }

        if (action === "generate-brief") {
            const { keyword, productName, position, volume } = body;
            const { generateContentBrief } = await import("@/lib/content-strategy");
            const brief = generateContentBrief(
                keyword || "cannabis",
                productName || "Premium Selection",
                position || 50,
                volume || 100,
            );
            return NextResponse.json({ brief });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (e) {
        log.content.error("POST error", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json({ error: "Failed to process content" }, { status: 500 });
    }
}
