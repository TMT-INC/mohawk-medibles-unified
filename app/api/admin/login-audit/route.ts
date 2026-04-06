/**
 * Admin Login Audit API — /api/admin/login-audit
 * GET ?email=X&limit=N&offset=N
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";
import { log } from "@/lib/logger";

export async function GET(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    const { prisma } = await import("@/lib/db");
    const email = req.nextUrl.searchParams.get("email") || "";
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "25");
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

    try {
        const where: any = {};
        if (email) {
            where.email = { contains: email, mode: "insensitive" };
        }

        const [attempts, total] = await Promise.all([
            prisma.loginAttempt.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset,
            }),
            prisma.loginAttempt.count({ where }),
        ]);

        return NextResponse.json({
            attempts,
            total,
        });
    } catch (err: any) {
        log.admin.error("Login audit GET error", { error: err instanceof Error ? err.message : String(err) });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
