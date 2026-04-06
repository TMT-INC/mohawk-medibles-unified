/**
 * GET /api/admin/affiliates/payouts — List all payout requests
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const payouts = await prisma.affiliatePayout.findMany({
            include: {
                affiliate: {
                    include: {
                        user: { select: { name: true, email: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
        });
        return NextResponse.json({ payouts });
    } catch (error) {
        // affiliates payouts error
        return NextResponse.json({ payouts: [] }, { status: 500 });
    }
}
