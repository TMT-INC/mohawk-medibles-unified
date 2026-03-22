/**
 * Admin Products API — CRUD + Inventory Management
 * GET  /api/admin/products?action=list|detail|search|low-stock
 * POST /api/admin/products { action: "create" | "update" | "delete" | "update-inventory" | "bulk-status" }
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
    const limit = Math.min(parseInt(sp.get("limit") || "50"), 200);
    const offset = parseInt(sp.get("offset") || "0");
    const search = sp.get("q") || "";
    const category = sp.get("category") || "";
    const status = sp.get("status") || "";

    try {
        const { prisma } = await import("@/lib/db");

        switch (action) {
            case "detail": {
                const id = parseInt(sp.get("id") || "0");
                if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });
                const product = await prisma.product.findUnique({
                    where: { id },
                    include: { specs: true, inventory: true, images: true },
                });
                if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
                return NextResponse.json(product);
            }

            case "categories": {
                const cats = await prisma.product.groupBy({
                    by: ["category"],
                    _count: { id: true },
                    orderBy: { _count: { id: "desc" } },
                });
                return NextResponse.json(cats.map((c: any) => ({ name: c.category, count: c._count.id })));
            }

            case "low-stock": {
                const lowStock = await prisma.inventory.findMany({
                    where: { quantity: { lte: 5 } },
                    include: { product: { select: { id: true, name: true, slug: true, price: true, image: true, category: true } } },
                    orderBy: { quantity: "asc" },
                    take: limit,
                });
                return NextResponse.json({ items: lowStock, total: lowStock.length });
            }

            default: {
                // Build where clause
                const where: Record<string, unknown> = {};
                if (search) {
                    where.OR = [
                        { name: { contains: search, mode: "insensitive" } },
                        { slug: { contains: search, mode: "insensitive" } },
                        { sku: { contains: search, mode: "insensitive" } },
                    ];
                }
                if (category) where.category = category;
                if (status) where.status = status;

                const [products, total] = await Promise.all([
                    prisma.product.findMany({
                        where,
                        include: {
                            inventory: { select: { quantity: true, lowStockAt: true } },
                        },
                        orderBy: { updatedAt: "desc" },
                        take: limit,
                        skip: offset,
                    }),
                    prisma.product.count({ where }),
                ]);

                return NextResponse.json({ products, total, limit, offset });
            }
        }
    } catch (error) {
        log.admin.error("Products GET error", { error: error instanceof Error ? error.message : "Unknown" });
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
                const data = body.product as Record<string, unknown>;
                if (!data?.name || !data?.slug || !data?.category) {
                    return NextResponse.json({ error: "name, slug, and category are required" }, { status: 400 });
                }

                const product = await prisma.product.create({
                    data: {
                        name: data.name as string,
                        slug: data.slug as string,
                        category: data.category as string,
                        subcategory: (data.subcategory as string) || null,
                        price: parseFloat(data.price as string) || 0,
                        salePrice: data.salePrice ? parseFloat(data.salePrice as string) : null,
                        sku: (data.sku as string) || null,
                        canonicalUrl: (data.canonicalUrl as string) || `/shop/${data.slug}`,
                        path: (data.path as string) || `/shop/${data.slug}`,
                        image: (data.image as string) || "/images/placeholder.png",
                        altText: (data.altText as string) || (data.name as string),
                        metaDescription: (data.metaDescription as string) || "",
                        shortDescription: (data.shortDescription as string) || "",
                        longDescription: (data.longDescription as string) || null,
                        featured: Boolean(data.featured),
                        status: (data.status as "ACTIVE" | "DRAFT") || "DRAFT",
                    },
                });

                // Create inventory record
                await prisma.inventory.create({
                    data: {
                        productId: product.id,
                        quantity: parseInt(data.quantity as string) || 0,
                        lowStockAt: parseInt(data.lowStockAt as string) || 5,
                    },
                });

                // Create specs if provided
                if (data.specs) {
                    const specs = data.specs as Record<string, string>;
                    await prisma.productSpec.create({
                        data: {
                            productId: product.id,
                            thc: specs.thc || null,
                            cbd: specs.cbd || null,
                            type: specs.type || null,
                            weight: specs.weight || null,
                            terpenes: specs.terpenes || null,
                            lineage: specs.lineage || null,
                        },
                    });
                }

                return NextResponse.json({ success: true, product });
            }

            case "update": {
                const id = parseInt(body.id as string);
                const data = body.product as Record<string, unknown>;
                if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

                // Build update payload, only including fields that were provided
                const updateData: Record<string, unknown> = {};
                if (data.name) updateData.name = data.name as string;
                if (data.slug) updateData.slug = data.slug as string;
                if (data.category) updateData.category = data.category as string;
                if (data.subcategory !== undefined) updateData.subcategory = data.subcategory as string | null;
                if (data.price !== undefined) updateData.price = parseFloat(data.price as string);
                if (data.salePrice !== undefined) updateData.salePrice = data.salePrice ? parseFloat(data.salePrice as string) : null;
                if (data.sku !== undefined) updateData.sku = data.sku as string | null;
                if (data.image) updateData.image = data.image as string;
                if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription as string;
                if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription as string;
                if (data.longDescription !== undefined) updateData.longDescription = data.longDescription as string | null;
                if (data.featured !== undefined) updateData.featured = Boolean(data.featured);
                if (data.status) updateData.status = data.status as string;

                const product = await prisma.product.update({
                    where: { id },
                    data: updateData as any,
                });

                return NextResponse.json({ success: true, product });
            }

            case "update-inventory": {
                const productId = parseInt(body.productId as string);
                const quantity = parseInt(body.quantity as string);
                const lowStockAt = body.lowStockAt !== undefined ? parseInt(body.lowStockAt as string) : undefined;

                if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

                const inventory = await prisma.inventory.upsert({
                    where: { productId },
                    update: {
                        ...(quantity !== undefined && !isNaN(quantity) && { quantity }),
                        ...(lowStockAt !== undefined && !isNaN(lowStockAt) && { lowStockAt }),
                    },
                    create: {
                        productId,
                        quantity: quantity || 0,
                        lowStockAt: lowStockAt || 5,
                    },
                });

                return NextResponse.json({ success: true, inventory });
            }

            case "bulk-status": {
                const ids = body.productIds as number[];
                const status = body.status as string;
                if (!ids?.length || !status) {
                    return NextResponse.json({ error: "productIds and status required" }, { status: 400 });
                }

                const result = await prisma.product.updateMany({
                    where: { id: { in: ids } },
                    data: { status: status as "ACTIVE" | "DRAFT" | "OUT_OF_STOCK" | "DISCONTINUED" },
                });

                return NextResponse.json({ success: true, updated: result.count });
            }

            case "delete": {
                const id = parseInt(body.id as string);
                if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

                // Soft delete: set to DISCONTINUED
                await prisma.product.update({
                    where: { id },
                    data: { status: "DISCONTINUED" },
                });

                return NextResponse.json({ success: true });
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error) {
        log.admin.error("Products POST error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
