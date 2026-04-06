/**
 * POST /api/admin/affiliates/approve — Approve an affiliate application
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
    const auth = requireAdmin(request);
    if (isAuthError(auth)) return auth;

    try {
        const { applicationId, commissionRate = 10 } = await request.json();

        const app = await prisma.affiliateApplication.findUnique({
            where: { id: applicationId },
            include: { user: true },
        });

        if (!app) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }
        if (app.status !== "PENDING") {
            return NextResponse.json({ error: "Application already processed" }, { status: 400 });
        }

        // Generate affiliate code
        const firstName = app.name.split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "");
        const suffix = Math.floor(1000 + Math.random() * 9000);
        let code = `MOHAWK-${firstName || "AFF"}-${suffix}`;

        // Check uniqueness
        const existing = await prisma.affiliate.findUnique({ where: { code } });
        if (existing) {
            code = `MOHAWK-${firstName || "AFF"}-${suffix + 1}`;
        }

        const [updatedApp, affiliate] = await prisma.$transaction([
            prisma.affiliateApplication.update({
                where: { id: applicationId },
                data: { status: "APPROVED" },
            }),
            prisma.affiliate.create({
                data: {
                    userId: app.userId,
                    code,
                    commissionRate,
                },
            }),
        ]);

        return NextResponse.json({ application: updatedApp, affiliate });
    } catch (error) {
        // affiliates approve error
        return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
    }
}
