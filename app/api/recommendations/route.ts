import { NextRequest, NextResponse } from "next/server";
import { getSmartRelatedProducts, getFrequentlyBoughtTogether, getPersonalizedRecommendations } from "@/lib/recommendations";
import { getProductBySlug, type Product } from "@/lib/products";
import { getVisitorProfile } from "@/lib/visitorStore";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "related";
    const slug = searchParams.get("slug");
    const limit = Math.min(parseInt(searchParams.get("limit") || "8", 10), 20);

    if (type === "related" && slug) {
        const product = await getProductBySlug(slug);
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        const products = await getSmartRelatedProducts(product, limit);
        return NextResponse.json({ products: serializeProducts(products) });
    }

    if (type === "bought-together" && slug) {
        const product = await getProductBySlug(slug);
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        const products = await getFrequentlyBoughtTogether(product, limit);
        return NextResponse.json({ products: serializeProducts(products) });
    }

    if (type === "personalized") {
        const visitorId = req.cookies.get("mm-visitor")?.value;
        const profile = visitorId ? getVisitorProfile(visitorId) : null;
        const products = await getPersonalizedRecommendations(profile, limit);
        return NextResponse.json({ products: serializeProducts(products) });
    }

    return NextResponse.json({ error: "Invalid type. Use: related, bought-together, personalized" }, { status: 400 });
}

/** Slim product shape for API response (no huge HTML/narratives) */
function serializeProducts(products: Product[]) {
    return products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        price: p.price,
        image: p.image,
        altText: p.altText,
        specs: {
            thc: p.specs.thc,
            type: p.specs.type,
            terpenes: p.specs.terpenes,
        },
        effects: p.effects,
        featured: p.featured,
    }));
}
