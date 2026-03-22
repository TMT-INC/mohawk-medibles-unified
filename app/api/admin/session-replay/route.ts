/**
 * Admin Session Replay API — /api/admin/session-replay
 * GET ?action=list|stats|analytics|detail&sessionId=X&days=N
 */
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    const { prisma } = await import("@/lib/db");
    const action = req.nextUrl.searchParams.get("action") || "list";

    try {
        switch (action) {
            case "stats": {
                const totalSessions = await prisma.sessionRecording.count();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todaySessions = await prisma.sessionRecording.count({
                    where: { startedAt: { gte: today } },
                });
                const errorSessions = await prisma.sessionRecording.count({
                    where: { errorsCount: { gt: 0 } },
                });
                const avgResult = await prisma.sessionRecording.aggregate({
                    _avg: { duration: true },
                });

                return NextResponse.json({
                    totalSessions,
                    todaySessions,
                    errorSessions,
                    avgDuration: avgResult._avg.duration || 0,
                });
            }

            case "analytics": {
                const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
                const since = new Date();
                since.setDate(since.getDate() - days);

                const sessions = await prisma.sessionRecording.findMany({
                    where: { startedAt: { gte: since } },
                });

                const totalSessions = sessions.length;
                const avgPageCount =
                    totalSessions > 0
                        ? sessions.reduce((sum, s) => sum + s.pageCount, 0) / totalSessions
                        : 0;
                const convertedCount = sessions.filter((s) => s.converted).length;
                const conversionRate = totalSessions > 0 ? (convertedCount / totalSessions) * 100 : 0;
                const bounceCount = sessions.filter((s) => s.pageCount <= 1).length;
                const bounceRate = totalSessions > 0 ? (bounceCount / totalSessions) * 100 : 0;

                // Top pages from events
                const events = await prisma.sessionEvent.findMany({
                    where: {
                        eventType: "pageview",
                        recording: { startedAt: { gte: since } },
                    },
                    select: { page: true },
                });
                const pageCounts: Record<string, number> = {};
                events.forEach((e) => {
                    if (e.page) pageCounts[e.page] = (pageCounts[e.page] || 0) + 1;
                });
                const topPages = Object.entries(pageCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([page, views]) => ({ page, views }));

                // Error pages
                const errorEvents = await prisma.sessionEvent.findMany({
                    where: {
                        eventType: "error",
                        recording: { startedAt: { gte: since } },
                    },
                    select: { page: true },
                });
                const errorCounts: Record<string, number> = {};
                errorEvents.forEach((e) => {
                    if (e.page) errorCounts[e.page] = (errorCounts[e.page] || 0) + 1;
                });
                const errorPages = Object.entries(errorCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([page, errors]) => ({ page, errors }));

                return NextResponse.json({
                    overview: { totalSessions, avgPageCount, conversionRate, bounceRate },
                    topPages,
                    errorPages,
                });
            }

            case "detail": {
                const sessionId = req.nextUrl.searchParams.get("sessionId");
                if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

                const recording = await prisma.sessionRecording.findUnique({
                    where: { sessionId },
                    include: { events: { orderBy: { timestamp: "asc" } } },
                });
                if (!recording) return NextResponse.json({ error: "Not found" }, { status: 404 });

                return NextResponse.json({
                    summary: {
                        duration: recording.duration,
                        pageCount: recording.pageCount,
                        eventCount: recording.events.length,
                        browser: recording.browser,
                    },
                    events: recording.events,
                });
            }

            default: {
                // List sessions
                const hasErrors = req.nextUrl.searchParams.get("hasErrors") === "true";
                const hasRageClicks = req.nextUrl.searchParams.get("hasRageClicks") === "true";
                const converted = req.nextUrl.searchParams.get("converted") === "true";

                const where: any = {};
                if (hasErrors) where.errorsCount = { gt: 0 };
                if (hasRageClicks) where.rageClicks = { gt: 0 };
                if (converted) where.converted = true;

                const sessions = await prisma.sessionRecording.findMany({
                    where,
                    orderBy: { startedAt: "desc" },
                    take: 50,
                });

                return NextResponse.json({ sessions });
            }
        }
    } catch (err: any) {
        log.admin.error("Session Replay GET error", { error: err instanceof Error ? err.message : "Unknown" });
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
