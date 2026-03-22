/**
 * Campaign Analytics API — Performance metrics, comparisons
 * GET /api/admin/analytics/campaigns?action=dashboard|detail|compare
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

    const sp = req.nextUrl.searchParams;
    const action = sp.get("action") || "dashboard";

    const validActions = ["dashboard", "detail", "compare"];
    if (!validActions.includes(action)) {
        return NextResponse.json({ error: `Invalid action` }, { status: 400 });
    }

    try {
        const { prisma } = await import("@/lib/db");

        if (action === "dashboard") {
            const campaigns = await prisma.campaign.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    sends: {
                        select: { status: true, sentAt: true, openedAt: true, clickedAt: true },
                    },
                },
            });

            const enriched = campaigns.map((c: any) => {
                const recipients = c.sends.length;
                const opened = c.sends.filter((s: any) => s.openedAt || s.status === "opened" || s.status === "clicked").length;
                const clicked = c.sends.filter((s: any) => s.clickedAt || s.status === "clicked").length;
                const openRate = recipients > 0 ? Math.round((opened / recipients) * 1000) / 10 : 0;
                const clickRate = recipients > 0 ? Math.round((clicked / recipients) * 1000) / 10 : 0;
                const clickToOpenRate = opened > 0 ? Math.round((clicked / opened) * 1000) / 10 : 0;

                return {
                    id: c.id,
                    name: c.name,
                    subject: c.subject,
                    status: c.status.toLowerCase(),
                    recipients,
                    opened,
                    clicked,
                    openRate,
                    clickRate,
                    clickToOpenRate,
                    sentAt: c.sentAt,
                    scheduledAt: c.scheduledAt,
                    createdAt: c.createdAt,
                };
            });

            const sentCampaigns = enriched.filter(c => c.status === "sent" && c.recipients > 0);
            const totalCampaigns = enriched.length;
            const totalSent = sentCampaigns.length;
            const totalDraft = enriched.filter(c => c.status === "draft").length;
            const totalRecipients = sentCampaigns.reduce((s, c) => s + c.recipients, 0);
            const totalOpened = sentCampaigns.reduce((s, c) => s + c.opened, 0);
            const totalClicked = sentCampaigns.reduce((s, c) => s + c.clicked, 0);
            const avgOpenRate = sentCampaigns.length > 0
                ? Math.round((sentCampaigns.reduce((s, c) => s + c.openRate, 0) / sentCampaigns.length) * 10) / 10
                : 0;
            const avgClickRate = sentCampaigns.length > 0
                ? Math.round((sentCampaigns.reduce((s, c) => s + c.clickRate, 0) / sentCampaigns.length) * 10) / 10
                : 0;
            const avgClickToOpenRate = sentCampaigns.length > 0
                ? Math.round((sentCampaigns.reduce((s, c) => s + c.clickToOpenRate, 0) / sentCampaigns.length) * 10) / 10
                : 0;

            // Timeline: daily send counts
            const timelineMap: Record<string, number> = {};
            sentCampaigns.forEach(c => {
                if (c.sentAt) {
                    const day = new Date(c.sentAt).toISOString().split("T")[0];
                    timelineMap[day] = (timelineMap[day] || 0) + c.recipients;
                }
            });
            const timeline = Object.entries(timelineMap)
                .sort(([a], [b]) => a.localeCompare(b))
                .slice(-30)
                .map(([date, recipients]) => ({ date, recipients }));

            // Top performers
            const topPerformers = [...sentCampaigns]
                .sort((a, b) => b.openRate - a.openRate)
                .slice(0, 5);

            return NextResponse.json({
                overview: {
                    totalCampaigns, totalSent, totalDraft, totalRecipients,
                    totalOpened, totalClicked,
                    avgOpenRate, avgClickRate, avgClickToOpenRate,
                },
                campaigns: enriched,
                timeline,
                topPerformers,
            });
        }

        if (action === "detail") {
            const id = sp.get("id");
            if (!id) return NextResponse.json({ error: "Missing campaign id" }, { status: 400 });

            const campaign = await prisma.campaign.findUnique({
                where: { id },
                include: { sends: true },
            });
            if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

            const recipients = campaign.sends.length;
            const opened = campaign.sends.filter((s: any) => s.openedAt || s.status === "opened" || s.status === "clicked").length;
            const clicked = campaign.sends.filter((s: any) => s.clickedAt || s.status === "clicked").length;
            const bounced = campaign.sends.filter((s: any) => s.status === "bounced").length;
            const openRate = recipients > 0 ? Math.round((opened / recipients) * 1000) / 10 : 0;
            const clickRate = recipients > 0 ? Math.round((clicked / recipients) * 1000) / 10 : 0;
            const clickToOpenRate = opened > 0 ? Math.round((clicked / opened) * 1000) / 10 : 0;

            return NextResponse.json({
                id: campaign.id,
                name: campaign.name,
                subject: campaign.subject,
                status: campaign.status.toLowerCase(),
                recipients,
                opened,
                clicked,
                bounced,
                unsubscribed: 0,
                openRate,
                clickRate,
                clickToOpenRate,
                unsubscribeRate: 0,
                sentAt: campaign.sentAt,
                createdAt: campaign.createdAt,
                audience: campaign.segmentRules ? JSON.parse(campaign.segmentRules).segment || "all" : "all",
            });
        }

        if (action === "compare") {
            const idA = sp.get("idA");
            const idB = sp.get("idB");
            if (!idA || !idB) return NextResponse.json({ error: "Missing campaign ids" }, { status: 400 });

            const [campA, campB] = await Promise.all([
                prisma.campaign.findUnique({ where: { id: idA }, include: { sends: true } }),
                prisma.campaign.findUnique({ where: { id: idB }, include: { sends: true } }),
            ]);
            if (!campA || !campB) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

            function calcMetrics(c: any) {
                const recipients = c.sends.length;
                const opened = c.sends.filter((s: any) => s.openedAt || s.status === "opened" || s.status === "clicked").length;
                const clicked = c.sends.filter((s: any) => s.clickedAt || s.status === "clicked").length;
                return {
                    id: c.id, name: c.name, subject: c.subject,
                    sentAt: c.sentAt,
                    audience: c.segmentRules ? JSON.parse(c.segmentRules).segment || "all" : "all",
                    recipients, opened, clicked, unsubscribed: 0,
                    openRate: recipients > 0 ? Math.round((opened / recipients) * 1000) / 10 : 0,
                    clickRate: recipients > 0 ? Math.round((clicked / recipients) * 1000) / 10 : 0,
                    clickToOpenRate: opened > 0 ? Math.round((clicked / opened) * 1000) / 10 : 0,
                    unsubscribeRate: 0,
                };
            }

            const a = calcMetrics(campA);
            const b = calcMetrics(campB);

            const deltas = {
                openRate: Math.round((a.openRate - b.openRate) * 10) / 10,
                clickRate: Math.round((a.clickRate - b.clickRate) * 10) / 10,
                clickToOpenRate: Math.round((a.clickToOpenRate - b.clickToOpenRate) * 10) / 10,
                unsubscribeRate: 0,
                recipients: a.recipients - b.recipients,
                opened: a.opened - b.opened,
                clicked: a.clicked - b.clicked,
                unsubscribed: 0,
            };

            function winner(aVal: number, bVal: number, lowerIsBetter = false): "a" | "b" | "tie" {
                if (aVal === bVal) return "tie";
                return (lowerIsBetter ? aVal < bVal : aVal > bVal) ? "a" : "b";
            }

            const winners = {
                openRate: winner(a.openRate, b.openRate),
                clickRate: winner(a.clickRate, b.clickRate),
                clickToOpenRate: winner(a.clickToOpenRate, b.clickToOpenRate),
                unsubscribeRate: "tie" as const,
            };

            const winsA = Object.values(winners).filter(w => w === "a").length;
            const winsB = Object.values(winners).filter(w => w === "b").length;
            const overallWinner = winsA > winsB ? "a" : winsB > winsA ? "b" : "tie";

            return NextResponse.json({
                campaignA: a,
                campaignB: b,
                deltas,
                winners,
                overallWinner,
            });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (error) {
        log.admin.error("Campaign analytics error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
