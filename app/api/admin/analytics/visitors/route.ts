/**
 * Visitor Analytics API — Sessions, Page Views, Geography, Devices
 * GET /api/admin/analytics/visitors?days=30&action=overview|sessions|customer-list|customer-detail
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
    const action = sp.get("action") || "overview";
    const days = Math.min(parseInt(sp.get("days") || "30") || 30, 365);
    const search = sp.get("search") || "";
    const userId = sp.get("userId") || "";

    const validActions = ["overview", "sessions", "customer-list", "customer-detail"];
    if (!validActions.includes(action)) {
        return NextResponse.json({ error: `Invalid action` }, { status: 400 });
    }

    try {
        const { prisma } = await import("@/lib/db");
        const since = new Date(Date.now() - days * 86400000);

        if (action === "overview") {
            const [sessions, pageViews] = await Promise.all([
                prisma.visitorSession.findMany({
                    where: { startedAt: { gte: since } },
                    orderBy: { startedAt: "desc" },
                }),
                prisma.pageView.findMany({
                    where: { createdAt: { gte: since } },
                    select: { path: true, createdAt: true, sessionId: true },
                }),
            ]);

            const totalVisitors = sessions.length;
            const uniqueIPs = new Set(sessions.map(s => s.ipAddress).filter(Boolean)).size;
            const avgDuration = totalVisitors > 0
                ? Math.round(sessions.reduce((s, v) => s + (v.duration || 0), 0) / totalVisitors)
                : 0;
            const avgPages = totalVisitors > 0
                ? (sessions.reduce((s, v) => s + (v.pageCount || 0), 0) / totalVisitors).toFixed(1)
                : "0.0";
            const cartAdds = sessions.filter(s => s.addedToCart).length;
            const conversions = sessions.filter(s => s.converted).length;
            const conversionRate = totalVisitors > 0
                ? ((conversions / totalVisitors) * 100).toFixed(1)
                : "0.0";

            // Daily visits
            const dailyMap: Record<string, { visits: number; uniqueVisitors: Set<string> }> = {};
            sessions.forEach(s => {
                const day = s.startedAt.toISOString().split("T")[0];
                if (!dailyMap[day]) dailyMap[day] = { visits: 0, uniqueVisitors: new Set() };
                dailyMap[day].visits++;
                if (s.ipAddress) dailyMap[day].uniqueVisitors.add(s.ipAddress);
            });
            const dailyVisits = Object.entries(dailyMap)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, d]) => ({ date, visits: d.visits, uniqueVisitors: d.uniqueVisitors.size }));

            // Geography
            const countryMap: Record<string, number> = {};
            const cityMap: Record<string, { city: string; region: string; country: string; visits: number }> = {};
            sessions.forEach(s => {
                if (s.country) countryMap[s.country] = (countryMap[s.country] || 0) + 1;
                if (s.city) {
                    const key = `${s.city}-${s.region}-${s.country}`;
                    if (!cityMap[key]) cityMap[key] = { city: s.city, region: s.region || "", country: s.country || "", visits: 0 };
                    cityMap[key].visits++;
                }
            });
            const topCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([country, visits]) => ({ country, visits }));
            const topCities = Object.values(cityMap).sort((a, b) => b.visits - a.visits).slice(0, 10);

            // Devices & Browsers
            const deviceMap: Record<string, number> = {};
            const browserMap: Record<string, number> = {};
            const referrerMap: Record<string, number> = {};
            sessions.forEach(s => {
                const dev = s.device || "Desktop";
                deviceMap[dev] = (deviceMap[dev] || 0) + 1;
                if (s.browser) browserMap[s.browser] = (browserMap[s.browser] || 0) + 1;
                const ref = s.referrer || "Direct";
                referrerMap[ref] = (referrerMap[ref] || 0) + 1;
            });
            const deviceBreakdown = Object.entries(deviceMap).sort((a, b) => b[1] - a[1]).map(([device, visits]) => ({ device, visits }));
            const browserBreakdown = Object.entries(browserMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([browser, visits]) => ({ browser, visits }));
            const topReferrers = Object.entries(referrerMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([referrer, visits]) => ({ referrer, visits }));

            // Top pages
            const pageMap: Record<string, number> = {};
            sessions.forEach(s => {
                if (s.entryPage) pageMap[s.entryPage] = (pageMap[s.entryPage] || 0) + 1;
            });
            const topPages = Object.entries(pageMap).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([page, visits]) => ({ page, visits }));

            return NextResponse.json({
                totalVisitors, uniqueIPs, avgDuration, avgPages,
                cartAdds, conversions, conversionRate,
                dailyVisits, topCountries, topCities,
                deviceBreakdown, browserBreakdown, topReferrers, topPages,
            });
        }

        if (action === "sessions") {
            const where: any = { startedAt: { gte: since } };
            if (search) {
                where.OR = [
                    { ipAddress: { contains: search } },
                    { city: { contains: search, mode: "insensitive" } },
                    { country: { contains: search, mode: "insensitive" } },
                ];
            }

            const sessions = await prisma.visitorSession.findMany({
                where,
                orderBy: { startedAt: "desc" },
                take: 50,
            });

            return NextResponse.json({ sessions });
        }

        if (action === "customer-list") {
            const where: any = { role: "CUSTOMER" };
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ];
            }

            const customers = await prisma.user.findMany({
                where,
                select: {
                    id: true, name: true, email: true, createdAt: true, lastLogin: true,
                    ordersCount: true, totalSpent: true,
                },
                orderBy: { lastLogin: "desc" },
                take: 50,
            });

            return NextResponse.json({ customers });
        }

        if (action === "customer-detail" && userId) {
            const [user, orders, sessions] = await Promise.all([
                prisma.user.findUnique({
                    where: { id: userId },
                    select: { id: true, name: true, email: true, createdAt: true, lastLogin: true },
                }),
                prisma.order.findMany({
                    where: { userId },
                    select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                }),
                prisma.visitorSession.findMany({
                    where: { userId },
                    orderBy: { startedAt: "desc" },
                    take: 10,
                }),
            ]);

            if (!user) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

            const memberDays = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000);
            const totalOrders = orders.length;
            const totalSpent = orders.reduce((s: number, o: any) => s + o.total, 0);
            const avgOrderValue = totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : "0.00";
            const totalVisits = sessions.length;
            const avgVisitDuration = totalVisits > 0
                ? Math.round(sessions.reduce((s: number, v: any) => s + (v.duration || 0), 0) / totalVisits)
                : 0;

            return NextResponse.json({
                user,
                memberDays,
                orderStats: { totalOrders, totalSpent: totalSpent.toFixed(2), avgOrderValue },
                visitStats: { totalVisits, avgDuration: avgVisitDuration },
                recentOrders: orders,
                recentSessions: sessions.map(s => ({
                    id: s.id,
                    ipAddress: s.ipAddress,
                    city: s.city,
                    country: s.country,
                    pageCount: s.pageCount,
                    duration: s.duration,
                    startedAt: s.startedAt,
                })),
            });
        }

        return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    } catch (error) {
        log.admin.error("Visitor analytics error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
