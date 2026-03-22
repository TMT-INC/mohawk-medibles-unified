/**
 * Admin Coupons API — CRUD for discount codes
 * GET  /api/admin/coupons?action=list|detail|validate
 * POST /api/admin/coupons { action: "create" | "update" | "delete" | "toggle" }
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
    const action = sp.get("action") || "list";

    try {
        const { prisma } = await import("@/lib/db");

        switch (action) {
            case "validate": {
                const code = sp.get("code")?.toUpperCase();
                const cartTotal = parseFloat(sp.get("total") || "0");
                if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

                const coupon = await prisma.coupon.findUnique({ where: { code } });

                if (!coupon) return NextResponse.json({ valid: false, reason: "Invalid coupon code" });
                if (!coupon.active) return NextResponse.json({ valid: false, reason: "This coupon is no longer active" });
                if (coupon.validUntil && coupon.validUntil < new Date()) return NextResponse.json({ valid: false, reason: "This coupon has expired" });
                if (coupon.validFrom > new Date()) return NextResponse.json({ valid: false, reason: "This coupon is not yet active" });
                if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ valid: false, reason: "This coupon has reached its usage limit" });
                if (coupon.minOrderTotal && cartTotal < coupon.minOrderTotal) {
                    return NextResponse.json({ valid: false, reason: `Minimum order of $${coupon.minOrderTotal.toFixed(2)} required` });
                }

                let discount = 0;
                switch (coupon.type) {
                    case "PERCENTAGE":
                        discount = cartTotal * (coupon.value / 100);
                        break;
                    case "FIXED_AMOUNT":
                        discount = Math.min(coupon.value, cartTotal);
                        break;
                    case "FREE_SHIPPING":
                        discount = 0; // Handled at checkout level
                        break;
                }

                return NextResponse.json({
                    valid: true,
                    coupon: {
                        code: coupon.code,
                        type: coupon.type,
                        value: coupon.value,
                        description: coupon.description,
                    },
                    discount: Math.round(discount * 100) / 100,
                });
            }

            default: {
                const coupons = await prisma.coupon.findMany({
                    orderBy: { createdAt: "desc" },
                });
                return NextResponse.json({ coupons });
            }
        }
    } catch (error) {
        log.admin.error("Coupons GET error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const action = body.action as string;

    try {
        const { prisma } = await import("@/lib/db");

        switch (action) {
            case "create": {
                const { code, description, type, value, minOrderTotal, maxUses, perCustomer, validFrom, validUntil } = body as {
                    code: string; description?: string; type?: string; value: number;
                    minOrderTotal?: number; maxUses?: number; perCustomer?: number;
                    validFrom?: string; validUntil?: string;
                };

                if (!code || value === undefined) {
                    return NextResponse.json({ error: "code and value required" }, { status: 400 });
                }

                // Validate type
                const validTypes = ["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"];
                const couponType = (type || "PERCENTAGE").toUpperCase();
                if (!validTypes.includes(couponType)) {
                    return NextResponse.json({ error: `Invalid coupon type. Must be one of: ${validTypes.join(", ")}` }, { status: 400 });
                }

                // Validate value bounds
                const numValue = Number(value);
                if (isNaN(numValue) || numValue < 0) {
                    return NextResponse.json({ error: "Value must be a positive number" }, { status: 400 });
                }
                if (couponType === "PERCENTAGE" && numValue > 100) {
                    return NextResponse.json({ error: "Percentage discount cannot exceed 100" }, { status: 400 });
                }

                const coupon = await prisma.coupon.create({
                    data: {
                        code: code.toUpperCase().replace(/\s+/g, ""),
                        description: description || null,
                        type: couponType as "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING",
                        value: numValue,
                        minOrderTotal: minOrderTotal || null,
                        maxUses: maxUses || null,
                        perCustomer: perCustomer || 1,
                        validFrom: validFrom ? new Date(validFrom) : new Date(),
                        validUntil: validUntil ? new Date(validUntil) : null,
                        active: true,
                    },
                });

                return NextResponse.json({ success: true, coupon });
            }

            case "update": {
                const id = parseInt(body.id as string);
                if (!id) return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });

                const data = body.data as Record<string, unknown>;
                const updateData: Record<string, unknown> = {};
                if (data.description !== undefined) updateData.description = data.description as string | null;
                if (data.type) updateData.type = data.type as string;
                if (data.value !== undefined) {
                    const v = parseFloat(data.value as string);
                    if (!isNaN(v) && v >= 0) updateData.value = v;
                }
                if (data.minOrderTotal !== undefined) {
                    const mot = parseFloat(data.minOrderTotal as string);
                    updateData.minOrderTotal = !isNaN(mot) && mot > 0 ? mot : null;
                }
                if (data.maxUses !== undefined) {
                    const mu = parseInt(data.maxUses as string, 10);
                    updateData.maxUses = !isNaN(mu) && mu > 0 ? mu : null;
                }
                if (data.validUntil !== undefined) updateData.validUntil = data.validUntil ? new Date(data.validUntil as string) : null;
                if (data.active !== undefined) updateData.active = Boolean(data.active);

                const coupon = await prisma.coupon.update({
                    where: { id },
                    data: updateData as any,
                });

                return NextResponse.json({ success: true, coupon });
            }

            case "toggle": {
                const id = parseInt(body.id as string);
                if (!id) return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });

                const existing = await prisma.coupon.findUnique({ where: { id } });
                if (!existing) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

                const coupon = await prisma.coupon.update({
                    where: { id },
                    data: { active: !existing.active },
                });

                return NextResponse.json({ success: true, coupon });
            }

            case "delete": {
                const id = parseInt(body.id as string);
                if (!id) return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });

                await prisma.coupon.delete({ where: { id } });
                return NextResponse.json({ success: true });
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error) {
        log.admin.error("Coupons POST error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
