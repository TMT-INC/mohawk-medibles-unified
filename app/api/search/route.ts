/**
 * Mohawk Medibles — Enhanced Predictive Search API
 * =================================================
 * Returns grouped results: products, categories, blog posts.
 * Used by the enhanced SearchAutocomplete component.
 */

import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { searchProducts } from "@/lib/gemini";
import { getAllCategories } from "@/lib/products";
import { prisma } from "@/lib/db";

interface CategoryResult {
    name: string;
    slug: string;
}

interface BlogResult {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
}

export async function GET(request: NextRequest) {
    const limited = await applyRateLimit(request, RATE_LIMITS.api);
    if (limited) return limited;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
        return NextResponse.json(
            { error: "Query parameter 'q' is required and must be at least 2 characters." },
            { status: 400 }
        );
    }

    const q = query.toLowerCase();

    // 1. Product results (max 5)
    const productResults = await searchProducts(query, 5);

    // 2. Category results (max 3)
    const allCategories = await getAllCategories();
    const categoryResults: CategoryResult[] = allCategories
        .filter((cat) => cat.toLowerCase().includes(q))
        .slice(0, 3)
        .map((cat) => ({
            name: cat,
            slug: encodeURIComponent(cat),
        }));

    // 3. Blog results (max 2) — try DB, fallback gracefully
    let blogResults: BlogResult[] = [];
    try {
        const blogPosts = await prisma.blogPost.findMany({
            where: {
                status: "published",
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { excerpt: { contains: query, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                featuredImage: true,
            },
            take: 2,
            orderBy: { publishedAt: "desc" },
        });
        blogResults = blogPosts;
    } catch {
        // Blog table may not exist or be empty — that's fine
        blogResults = [];
    }

    const totalCount = productResults.length + categoryResults.length + blogResults.length;

    return NextResponse.json({
        query,
        totalCount,
        products: productResults,
        categories: categoryResults,
        blog: blogResults,
    });
}
