/**
 * Admin Newsletter API — Subscriber stats and listing
 * GET /api/admin/newsletter
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";
import { log } from "@/lib/logger";

interface SubscriberRecord {
    id: string;
    email: string;
    name: string | null;
    status: string;
    source: string | null;
    subscribedAt: Date | null;
    unsubscribedAt: Date | null;
}

export async function GET(_req: NextRequest) {
    const auth = requireAdmin(_req);
    if (isAuthError(auth)) return auth;

    try {
        const allSubscribers: SubscriberRecord[] = await prisma.subscriber.findMany({
            orderBy: { subscribedAt: "desc" },
        });

        const total = allSubscribers.length;
        const active = allSubscribers.filter((s: SubscriberRecord) => s.status === "active").length;
        const unsubscribed = allSubscribers.filter((s: SubscriberRecord) => s.status === "unsubscribed").length;
        const bounced = allSubscribers.filter((s: SubscriberRecord) => s.status === "bounced").length;

        // Source breakdown
        const sourceMap: Record<string, number> = {};
        for (const sub of allSubscribers) {
            const src = sub.source || "unknown";
            sourceMap[src] = (sourceMap[src] || 0) + 1;
        }
        const sources = Object.entries(sourceMap)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count);

        // Growth: subscribers in last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
        const recentCount = allSubscribers.filter(
            (s: SubscriberRecord) => s.subscribedAt && new Date(s.subscribedAt.toString()) >= thirtyDaysAgo
        ).length;

        return NextResponse.json({
            stats: { total, active, unsubscribed, bounced, recentCount, sources },
            subscribers: allSubscribers.map((sub: SubscriberRecord) => ({
                id: sub.id,
                email: sub.email,
                name: sub.name,
                status: sub.status,
                source: sub.source,
                subscribedAt: sub.subscribedAt?.toISOString() || null,
                unsubscribedAt: sub.unsubscribedAt?.toISOString() || null,
            })),
        });
    } catch (error) {
        log.newsletter.error("Admin newsletter error", { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            {
                stats: { total: 0, active: 0, unsubscribed: 0, bounced: 0, recentCount: 0, sources: [] },
                subscribers: [],
            },
            { status: 500 }
        );
    }
}
