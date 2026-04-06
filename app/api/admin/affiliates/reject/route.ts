/**
 * POST /api/admin/affiliates/reject — Reject an affiliate application
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
    const auth = requireAdmin(request);
    if (isAuthError(auth)) return auth;

    try {
        const { applicationId, note } = await request.json();

        const updated = await prisma.affiliateApplication.update({
            where: { id: applicationId },
            data: {
                status: "REJECTED",
                adminNote: note || null,
            },
        });

        return NextResponse.json({ application: updated });
    } catch (error) {
        // affiliates reject error
        return NextResponse.json({ error: "Failed to reject" }, { status: 500 });
    }
}
