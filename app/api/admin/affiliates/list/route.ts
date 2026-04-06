/**
 * GET /api/admin/affiliates/list — List all affiliates
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const affiliates = await prisma.affiliate.findMany({
            include: {
                user: { select: { name: true, email: true, avatar: true } },
                _count: { select: { conversions: true, clicks: true, payouts: true } },
            },
            orderBy: { totalEarnings: "desc" },
            take: 100,
        });
        return NextResponse.json({ affiliates });
    } catch (error) {
        // affiliates list error
        return NextResponse.json({ affiliates: [] }, { status: 500 });
    }
}
