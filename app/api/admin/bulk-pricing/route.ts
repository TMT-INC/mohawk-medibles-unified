/**
 * Admin Bulk Pricing API
 * GET    /api/admin/bulk-pricing?productId=X — get tiers for a product
 * POST   /api/admin/bulk-pricing — set tiers for a product
 * DELETE /api/admin/bulk-pricing?productId=X — remove all tiers
 */
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const productId = Number(req.nextUrl.searchParams.get("productId"));

        if (productId) {
            const tiers = await prisma.bulkPricingTier.findMany({
                where: { productId, isActive: true },
                orderBy: { minQuantity: "asc" },
            });
            return NextResponse.json({ tiers });
        }

        // Return products list for selector
        const products = await prisma.product.findMany({
            where: { status: "ACTIVE" },
            select: { id: true, name: true, price: true },
            orderBy: { name: "asc" },
            take: 200,
        });

        return NextResponse.json({ products });
    } catch (error) {
        log.admin.error("Bulk pricing GET error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ tiers: [], products: [] });
    }
}

export async function POST(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const { productId, tiers } = await req.json();

        if (!productId || !Array.isArray(tiers)) {
            return NextResponse.json({ error: "productId and tiers required" }, { status: 400 });
        }

        // Deactivate existing tiers
        await prisma.bulkPricingTier.updateMany({
            where: { productId },
            data: { isActive: false },
        });

        // Create new tiers
        for (const tier of tiers) {
            await prisma.bulkPricingTier.create({
                data: {
                    productId,
                    minQuantity: tier.minQuantity,
                    maxQuantity: tier.maxQuantity || null,
                    discountPercent: tier.discountPercent,
                    priceOverride: tier.priceOverride || null,
                    isActive: true,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        log.admin.error("Bulk pricing POST error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Failed to save bulk pricing" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    try {
        const productId = Number(req.nextUrl.searchParams.get("productId"));
        if (!productId) {
            return NextResponse.json({ error: "productId required" }, { status: 400 });
        }

        await prisma.bulkPricingTier.updateMany({
            where: { productId },
            data: { isActive: false },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        log.admin.error("Bulk pricing DELETE error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Failed to remove bulk pricing" }, { status: 500 });
    }
}
