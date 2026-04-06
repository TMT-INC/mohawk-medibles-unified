/**
 * Admin A/B Tests API — /api/admin/ab-tests
 * GET  ?action=list|stats|detail&id=N
 * POST body: { action: "create"|"update"|"delete", ... }
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
                const tests = await prisma.aBTest.findMany({ include: { results: true } });
                const running = tests.filter((t) => t.status === "running").length;
                const completed = tests.filter((t) => t.status === "completed").length;
                const lifts = tests
                    .filter((t) => t.winnerVariant && t.results.length > 0)
                    .map((t) => {
                        const resultsA = t.results.filter((r) => r.variant === "A");
                        const resultsB = t.results.filter((r) => r.variant === "B");
                        const rateA = resultsA.length > 0 ? (resultsA.filter((r) => r.converted).length / resultsA.length) * 100 : 0;
                        const rateB = resultsB.length > 0 ? (resultsB.filter((r) => r.converted).length / resultsB.length) * 100 : 0;
                        return Math.abs(rateA - rateB);
                    });
                const avgLift = lifts.length > 0 ? lifts.reduce((a, b) => a + b, 0) / lifts.length : 0;

                return NextResponse.json({
                    total: tests.length,
                    running,
                    completed,
                    avgLift,
                });
            }

            case "detail": {
                const id = parseInt(req.nextUrl.searchParams.get("id") || "0");
                if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

                const test = await prisma.aBTest.findUnique({ where: { id }, include: { results: true } });
                if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });

                const resultsA = test.results.filter((r) => r.variant === "A");
                const resultsB = test.results.filter((r) => r.variant === "B");
                const convRateA = resultsA.length > 0 ? (resultsA.filter((r) => r.converted).length / resultsA.length) * 100 : 0;
                const convRateB = resultsB.length > 0 ? (resultsB.filter((r) => r.converted).length / resultsB.length) * 100 : 0;

                return NextResponse.json({
                    ...test,
                    computed: {
                        a: { impressions: resultsA.length, conversions: resultsA.filter((r) => r.converted).length, conversionRate: convRateA },
                        b: { impressions: resultsB.length, conversions: resultsB.filter((r) => r.converted).length, conversionRate: convRateB },
                    },
                });
            }

            default: {
                const tests = await prisma.aBTest.findMany({ orderBy: { createdAt: "desc" } });
                return NextResponse.json({ tests });
            }
        }
    } catch (err: any) {
        log.admin.error("AB Tests GET error", { error: err instanceof Error ? err.message : "Unknown" });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    const { prisma } = await import("@/lib/db");
    const body = await req.json();
    const { action, ...data } = body;

    try {
        switch (action) {
            case "create": {
                const test = await prisma.aBTest.create({
                    data: {
                        name: data.name,
                        description: data.description || null,
                        element: data.element,
                        variantA: data.variantA,
                        variantB: data.variantB,
                        trafficSplit: data.trafficSplit || 50,
                    },
                });
                return NextResponse.json(test);
            }

            case "update": {
                const updateData: any = {};
                if (data.status) updateData.status = data.status;
                if (data.winnerVariant) updateData.winnerVariant = data.winnerVariant;

                const test = await prisma.aBTest.update({
                    where: { id: data.id },
                    data: updateData,
                });
                return NextResponse.json(test);
            }

            case "delete": {
                await prisma.aBTest.delete({ where: { id: data.id } });
                return NextResponse.json({ success: true });
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (err: any) {
        log.admin.error("AB Tests POST error", { error: err instanceof Error ? err.message : "Unknown" });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
