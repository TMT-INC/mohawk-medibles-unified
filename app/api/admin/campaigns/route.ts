/**
 * Campaign Management API — Mohawk Medibles
 * GET /api/admin/campaigns — list/detail campaigns
 * POST /api/admin/campaigns — create/update/send/schedule/cancel
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { log } from "@/lib/logger";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const { prisma } = await import("@/lib/db");
        const action = req.nextUrl.searchParams.get("action") || "list";
        const id = req.nextUrl.searchParams.get("id");

        // Validate action parameter
        const validActions = ["list", "detail", "stats"];
        if (!validActions.includes(action)) {
            return NextResponse.json({ error: `Invalid action. Must be one of: ${validActions.join(", ")}` }, { status: 400 });
        }

        if (action === "detail" && id) {
            const campaign = await prisma.campaign.findUnique({
                where: { id },
                include: { sends: { take: 100, orderBy: { sentAt: "desc" } } },
            });
            if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
            return NextResponse.json(campaign);
        }

        if (action === "stats") {
            const [total, active, subscribers, sends] = await Promise.all([
                prisma.campaign.count(),
                prisma.campaign.count({ where: { status: { in: ["SENDING", "SCHEDULED"] } } }),
                prisma.subscriber.count({ where: { status: "active" } }),
                prisma.campaignSend.groupBy({
                    by: ["status"],
                    _count: { id: true },
                }),
            ]);
            const sendStats = Object.fromEntries(sends.map((s: any) => [s.status, s._count.id]));
            const totalSent = (sendStats["sent"] || 0) + (sendStats["delivered"] || 0) + (sendStats["opened"] || 0) + (sendStats["clicked"] || 0);
            const totalOpened = (sendStats["opened"] || 0) + (sendStats["clicked"] || 0);

            return NextResponse.json({
                totalCampaigns: total,
                activeCampaigns: active,
                totalSubscribers: subscribers,
                totalSent,
                openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 1000) / 10 : 0,
                clickRate: totalSent > 0 ? Math.round(((sendStats["clicked"] || 0) / totalSent) * 1000) / 10 : 0,
            });
        }

        // Default: list
        const campaigns = await prisma.campaign.findMany({
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { sends: true } } },
        });
        return NextResponse.json(campaigns);
    } catch (e) {
        log.campaign.error("GET error", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const { prisma } = await import("@/lib/db");
        const body = await req.json();
        const { action } = body;

        // ─── Create ────────────────────────────────
        if (action === "create") {
            const { name, subject, previewText, htmlContent, segmentRules } = body;
            if (!name?.trim() || !subject?.trim()) {
                return NextResponse.json({ error: "Name and subject are required" }, { status: 400 });
            }
            const campaign = await prisma.campaign.create({
                data: {
                    name: name.trim(),
                    subject: subject.trim(),
                    previewText: previewText?.trim() || null,
                    htmlContent: htmlContent || "",
                    segmentRules: segmentRules ? JSON.stringify(segmentRules) : null,
                    status: "DRAFT",
                },
            });
            return NextResponse.json({ success: true, campaign });
        }

        // ─── Update ────────────────────────────────
        if (action === "update") {
            const { id, name, subject, previewText, htmlContent, segmentRules } = body;
            if (!id) return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
            const campaign = await prisma.campaign.update({
                where: { id },
                data: {
                    ...(name && { name: name.trim() }),
                    ...(subject && { subject: subject.trim() }),
                    ...(previewText !== undefined && { previewText: previewText?.trim() || null }),
                    ...(htmlContent !== undefined && { htmlContent }),
                    ...(segmentRules !== undefined && { segmentRules: segmentRules ? JSON.stringify(segmentRules) : null }),
                },
            });
            return NextResponse.json({ success: true, campaign });
        }

        // ─── Schedule ──────────────────────────────
        if (action === "schedule") {
            const { id, scheduledAt } = body;
            if (!id || !scheduledAt) return NextResponse.json({ error: "ID and scheduledAt required" }, { status: 400 });
            const campaign = await prisma.campaign.update({
                where: { id },
                data: { status: "SCHEDULED", scheduledAt: new Date(scheduledAt) },
            });
            return NextResponse.json({ success: true, campaign });
        }

        // ─── Send ──────────────────────────────────
        if (action === "send") {
            const { id } = body;
            if (!id) return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });

            const campaign = await prisma.campaign.findUnique({ where: { id } });
            if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
            if (campaign.status === "SENT" || campaign.status === "SENDING") {
                return NextResponse.json({ error: "Campaign already sent or sending" }, { status: 400 });
            }

            // Mark as sending
            await prisma.campaign.update({ where: { id }, data: { status: "SENDING" } });

            // Resolve audience
            const { buildCampaignAudience } = await import("@/lib/customer-segments");
            let segmentRules = null;
            try { segmentRules = campaign.segmentRules ? JSON.parse(campaign.segmentRules) : null; } catch { /* invalid JSON defaults to all subscribers */ }
            const emails = await buildCampaignAudience(segmentRules);

            // Create send records
            const sendData = emails.map((email) => ({
                campaignId: id,
                email,
                status: "pending",
            }));

            // Batch create sends
            for (let i = 0; i < sendData.length; i += 100) {
                await prisma.campaignSend.createMany({ data: sendData.slice(i, i + 100) });
            }

            // Send in background batches
            const { sendCampaignEmail } = await import("@/lib/email");
            let sent = 0;
            let failed = 0;

            for (let i = 0; i < emails.length; i += 50) {
                const batch = emails.slice(i, i + 50);
                const results = await Promise.allSettled(
                    batch.map((email) =>
                        sendCampaignEmail(email, campaign.subject, campaign.htmlContent, id)
                    )
                );

                for (let j = 0; j < results.length; j++) {
                    const email = batch[j];
                    const result = results[j];
                    const success = result.status === "fulfilled" && result.value.success;

                    await prisma.campaignSend.updateMany({
                        where: { campaignId: id, email },
                        data: {
                            status: success ? "sent" : "failed",
                            sentAt: success ? new Date() : undefined,
                        },
                    });

                    if (success) sent++;
                    else failed++;
                }

                // Rate limit: brief pause between batches
                if (i + 50 < emails.length) {
                    await new Promise((r) => setTimeout(r, 1000));
                }
            }

            // Mark campaign as sent
            await prisma.campaign.update({
                where: { id },
                data: {
                    status: "SENT",
                    sentAt: new Date(),
                    totalSent: sent,
                    totalBounced: failed,
                },
            });

            return NextResponse.json({ success: true, totalSent: sent, totalFailed: failed, totalAudience: emails.length });
        }

        // ─── Cancel ────────────────────────────────
        if (action === "cancel") {
            const { id } = body;
            if (!id) return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
            const campaign = await prisma.campaign.update({
                where: { id },
                data: { status: "CANCELLED" },
            });
            return NextResponse.json({ success: true, campaign });
        }

        // ─── Duplicate ─────────────────────────────
        if (action === "duplicate") {
            const { id } = body;
            if (!id) return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
            const source = await prisma.campaign.findUnique({ where: { id } });
            if (!source) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
            const copy = await prisma.campaign.create({
                data: {
                    name: `${source.name} (Copy)`,
                    subject: source.subject,
                    previewText: source.previewText,
                    htmlContent: source.htmlContent,
                    segmentRules: source.segmentRules,
                    status: "DRAFT",
                },
            });
            return NextResponse.json({ success: true, campaign: copy });
        }

        // ─── Delete ─────────────────────────────
        if (action === "delete") {
            const { id } = body;
            if (!id) return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
            // Delete sends first (foreign key), then campaign
            await prisma.campaignSend.deleteMany({ where: { campaignId: id } });
            await prisma.campaign.delete({ where: { id } });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (e) {
        log.campaign.error("POST error", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json({ error: "Failed to process campaign" }, { status: 500 });
    }
}
