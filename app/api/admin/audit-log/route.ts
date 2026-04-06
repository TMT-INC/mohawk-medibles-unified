/**
 * Admin Audit / Activity Log API — /api/admin/audit-log
 * GET ?limit=N&offset=N&resource=X&search=X
 */
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    const { prisma } = await import("@/lib/db");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "25");
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");
    const resource = req.nextUrl.searchParams.get("resource") || "";
    const search = req.nextUrl.searchParams.get("search") || "";

    try {
        const where: any = {};

        if (resource) {
            where.entity = resource;
        }

        if (search) {
            where.OR = [
                { action: { contains: search, mode: "insensitive" } },
                { details: { contains: search, mode: "insensitive" } },
            ];
        }

        const [entries, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset,
            }),
            prisma.auditLog.count({ where }),
        ]);

        return NextResponse.json({
            entries: entries.map((e) => ({
                id: e.id,
                userId: e.userId,
                action: e.action,
                resource: e.entity?.toLowerCase() || "unknown",
                resourceId: e.entityId,
                details: e.details,
                ipAddress: e.ipAddress,
                createdAt: e.createdAt,
            })),
            total,
        });
    } catch (err: any) {
        log.admin.error("Audit Log GET error", { error: err instanceof Error ? err.message : "Unknown" });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
