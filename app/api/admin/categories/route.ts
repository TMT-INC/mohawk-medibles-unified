/**
 * Admin Categories API — Product category breakdown with counts
 * GET /api/admin/categories
 */
import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(_req: NextRequest) {
    const auth = requireAdmin(_req);
    if (isAuthError(auth)) return auth;

    try {
        // Get all products with category and status fields
        const products = await prisma.product.findMany({
            select: { category: true, status: true },
        });

        // Aggregate by category
        const categoryMap: Record<string, { total: number; active: number; draft: number; outOfStock: number }> = {};
        for (const p of products) {
            const cat = p.category || "Uncategorized";
            if (!categoryMap[cat]) {
                categoryMap[cat] = { total: 0, active: 0, draft: 0, outOfStock: 0 };
            }
            categoryMap[cat].total++;
            if (p.status === "ACTIVE") categoryMap[cat].active++;
            else if (p.status === "DRAFT") categoryMap[cat].draft++;
            else if (p.status === "OUT_OF_STOCK") categoryMap[cat].outOfStock++;
        }

        const result = Object.entries(categoryMap)
            .map(([name, counts]) => ({
                name,
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                productCount: counts.total,
                activeCount: counts.active,
                draftCount: counts.draft,
                outOfStockCount: counts.outOfStock,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return NextResponse.json({
            categories: result,
            totalCategories: result.length,
            totalProducts: products.length,
        });
    } catch (error) {
        log.admin.error("Admin categories error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            { error: "Failed to load categories", categories: [], totalCategories: 0, totalProducts: 0 },
            { status: 500 }
        );
    }
}
