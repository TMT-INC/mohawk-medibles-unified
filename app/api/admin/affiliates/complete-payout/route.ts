/**
 * POST /api/admin/affiliates/complete-payout — Mark a payout as completed
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
    const auth = requireAdmin(request);
    if (isAuthError(auth)) return auth;

    try {
        const { payoutId } = await request.json();

        const payout = await prisma.affiliatePayout.findUnique({
            where: { id: payoutId },
        });

        if (!payout) {
            return NextResponse.json({ error: "Payout not found" }, { status: 404 });
        }
        if (payout.status === "COMPLETED") {
            return NextResponse.json({ error: "Already completed" }, { status: 400 });
        }

        const updated = await prisma.affiliatePayout.update({
            where: { id: payoutId },
            data: { status: "COMPLETED", completedAt: new Date() },
        });

        return NextResponse.json({ payout: updated });
    } catch (error) {
        // affiliates complete-payout error
        return NextResponse.json({ error: "Failed to complete payout" }, { status: 500 });
    }
}
