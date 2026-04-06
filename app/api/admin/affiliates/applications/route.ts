/**
 * GET /api/admin/affiliates/applications — List affiliate applications
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const applications = await prisma.affiliateApplication.findMany({
            include: { user: { select: { name: true, email: true, avatar: true } } },
            orderBy: { createdAt: "desc" },
            take: 100,
        });
        return NextResponse.json({ applications });
    } catch (error) {
        // affiliates applications error
        return NextResponse.json({ applications: [] }, { status: 500 });
    }
}
