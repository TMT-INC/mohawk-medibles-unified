/**
 * Email Analytics API — Campaign performance dashboard data
 * GET /api/admin/email/analytics
 * Returns overview metrics, campaign list with rates, timeline, top performers, audience breakdown
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";
import { log } from "@/lib/logger";

export async function GET(_req: NextRequest) {
    const auth = requireAdmin(_req);
    if (isAuthError(auth)) return auth;

    try {
        const { prisma } = await import("@/lib/db");

        const campaigns = await prisma.campaign.findMany({
            orderBy: { createdAt: "desc" },
        });

        const sentCampaigns = campaigns.filter(c => c.status === "SENT");

        // Overview
        const totalRecipients = sentCampaigns.reduce((sum, c) => sum + (c.totalSent || 0), 0);
        const totalOpened = sentCampaigns.reduce((sum, c) => sum + (c.totalOpened || 0), 0);
        const totalClicked = sentCampaigns.reduce((sum, c) => sum + (c.totalClicked || 0), 0);
        const totalUnsubscribed = 0; // Not tracked in this schema

        const campaignRates = sentCampaigns
            .filter(c => (c.totalSent || 0) > 0)
            .map(c => ({
                openRate: ((c.totalOpened || 0) / (c.totalSent || 1)) * 100,
                clickRate: ((c.totalClicked || 0) / (c.totalSent || 1)) * 100,
                clickToOpenRate: (c.totalOpened || 0) > 0 ? ((c.totalClicked || 0) / (c.totalOpened || 1)) * 100 : 0,
            }));

        const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length * 100) / 100 : 0;

        const overview = {
            totalCampaigns: campaigns.length,
            totalSent: sentCampaigns.length,
            totalScheduled: campaigns.filter(c => c.status === "SCHEDULED").length,
            totalDraft: campaigns.filter(c => c.status === "DRAFT").length,
            avgOpenRate: avg(campaignRates.map(r => r.openRate)),
            avgClickRate: avg(campaignRates.map(r => r.clickRate)),
            avgClickToOpenRate: avg(campaignRates.map(r => r.clickToOpenRate)),
            totalRecipients,
            totalOpened,
            totalClicked,
            totalUnsubscribed,
        };

        // Campaign list with rates
        const campaignList = campaigns.map(c => {
            const recipients = c.totalSent || 0;
            const opened = c.totalOpened || 0;
            const clicked = c.totalClicked || 0;
            return {
                id: c.id,
                name: c.name,
                subject: c.subject,
                status: c.status,
                sentAt: c.sentAt,
                createdAt: c.createdAt,
                recipients,
                opened,
                clicked,
                openRate: recipients > 0 ? Math.round((opened / recipients) * 10000) / 100 : 0,
                clickRate: recipients > 0 ? Math.round((clicked / recipients) * 10000) / 100 : 0,
                clickToOpenRate: opened > 0 ? Math.round((clicked / opened) * 10000) / 100 : 0,
            };
        });

        // Timeline: group sent campaigns by date
        const timelineMap = new Map<string, { date: string; sent: number; opened: number; clicked: number; recipients: number }>();
        sentCampaigns.forEach(c => {
            const date = c.sentAt
                ? new Date(c.sentAt).toISOString().split("T")[0]
                : c.createdAt
                    ? new Date(c.createdAt).toISOString().split("T")[0]
                    : "unknown";
            const existing = timelineMap.get(date) || { date, sent: 0, opened: 0, clicked: 0, recipients: 0 };
            existing.sent += 1;
            existing.opened += c.totalOpened || 0;
            existing.clicked += c.totalClicked || 0;
            existing.recipients += c.totalSent || 0;
            timelineMap.set(date, existing);
        });
        const timeline = Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date));

        // Top performers by open rate
        const topPerformers = [...campaignList]
            .filter(c => c.status === "SENT" && c.recipients > 0)
            .sort((a, b) => b.openRate - a.openRate)
            .slice(0, 5);

        // Audience breakdown by segment
        const audienceMap = new Map<string, { audience: string; count: number; totalRecipients: number; totalOpened: number; totalClicked: number }>();
        sentCampaigns.forEach(c => {
            let aud = "all";
            try {
                if (c.segmentRules) {
                    const rules = JSON.parse(c.segmentRules);
                    aud = rules.segment || "all";
                }
            } catch { /* default to all */ }
            const existing = audienceMap.get(aud) || { audience: aud, count: 0, totalRecipients: 0, totalOpened: 0, totalClicked: 0 };
            existing.count += 1;
            existing.totalRecipients += c.totalSent || 0;
            existing.totalOpened += c.totalOpened || 0;
            existing.totalClicked += c.totalClicked || 0;
            audienceMap.set(aud, existing);
        });
        const audienceBreakdown = Array.from(audienceMap.values()).map(a => ({
            ...a,
            avgOpenRate: a.totalRecipients > 0 ? Math.round((a.totalOpened / a.totalRecipients) * 10000) / 100 : 0,
            avgClickRate: a.totalRecipients > 0 ? Math.round((a.totalClicked / a.totalRecipients) * 10000) / 100 : 0,
        }));

        return NextResponse.json({
            overview,
            campaigns: campaignList,
            timeline,
            topPerformers,
            audienceBreakdown,
        });
    } catch (e) {
        log.admin.error("Email analytics error", { error: e instanceof Error ? e.message : String(e) });
        return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
    }
}
