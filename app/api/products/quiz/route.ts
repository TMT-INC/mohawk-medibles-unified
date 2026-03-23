/**
 * Quiz Products API — Returns all products with fields needed for quiz matching.
 * GET /api/products/quiz
 * Returns a lightweight projection: id, slug, name, category, price, image, altText,
 * path, shortDescription, metaDescription, specs, effects, eeatNarrative.
 */

import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products";

export async function GET() {
    try {
        const all = await getAllProducts();
        const products = all.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            category: p.category,
            price: p.price,
            image: p.image,
            altText: p.altText,
            path: p.path,
            shortDescription: p.shortDescription,
            metaDescription: p.metaDescription,
            specs: p.specs,
            effects: p.effects,
            eeatNarrative: p.eeatNarrative,
        }));

        return NextResponse.json(
            { products },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
                },
            }
        );
    } catch (err) {
        return NextResponse.json(
            { error: "Failed to load products" },
            { status: 500 }
        );
    }
}
