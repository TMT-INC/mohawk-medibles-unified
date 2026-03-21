/**
 * Product Reviews API — Mohawk Medibles
 * GET  /api/reviews?productId=123           — List approved reviews for a product
 * GET  /api/reviews?productId=123&all=true  — List all reviews (admin only)
 * POST /api/reviews { productId, rating, title?, content } — Submit a review (auth required)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { verifyCsrf } from "@/lib/csrf";
import { log } from "@/lib/logger";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    try {
        const { searchParams } = new URL(req.url);
        const productId = parseInt(searchParams.get("productId") || "0");

        if (!productId) {
            return NextResponse.json({ error: "productId is required" }, { status: 400 });
        }

        // Check if admin requesting all reviews
        const showAll = searchParams.get("all") === "true";
        const userRole = req.headers.get("x-user-role");
        const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

        const reviews = await prisma.review.findMany({
            where: {
                productId,
                ...(showAll && isAdmin ? {} : { status: "APPROVED" }),
            },
            include: {
                user: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        // Calculate aggregate stats
        const approvedReviews = showAll && isAdmin
            ? reviews.filter((r: any) => r.status === "APPROVED")
            : reviews;

        const totalReviews = approvedReviews.length;
        const averageRating = totalReviews > 0
            ? +(approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews).toFixed(1)
            : 0;

        // Rating distribution (1-5)
        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const r of approvedReviews) {
            distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        }

        return NextResponse.json({
            reviews: reviews.map((r: any) => ({
                id: r.id,
                rating: r.rating,
                title: r.title,
                content: r.content,
                verified: r.verified,
                status: r.status,
                authorName: r.user.name || "Anonymous",
                createdAt: r.createdAt.toISOString(),
            })),
            stats: {
                totalReviews,
                averageRating,
                distribution,
            },
        });
    } catch (e) {
        log.admin.error("Reviews fetch failed", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    // CSRF protection
    const csrfError = verifyCsrf(req);
    if (csrfError) return csrfError;

    try {
        // Auth check
        const userId = req.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ error: "Sign in to leave a review" }, { status: 401 });
        }

        const body = await req.json();
        const { productId, rating, title, content } = body as {
            productId: number;
            rating: number;
            title?: string;
            content: string;
        };

        // Validation
        if (!productId || !rating || !content) {
            return NextResponse.json({ error: "productId, rating, and content are required" }, { status: 400 });
        }
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return NextResponse.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
        }
        if (content.length < 10) {
            return NextResponse.json({ error: "Review must be at least 10 characters" }, { status: 400 });
        }
        if (content.length > 2000) {
            return NextResponse.json({ error: "Review must be under 2000 characters" }, { status: 400 });
        }
        if (title && title.length > 150) {
            return NextResponse.json({ error: "Title must be under 150 characters" }, { status: 400 });
        }

        // Check product exists
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Check if user already reviewed this product
        const existing = await prisma.review.findFirst({
            where: { productId, userId },
        });
        if (existing) {
            return NextResponse.json({ error: "You have already reviewed this product" }, { status: 409 });
        }

        // Check if user has purchased this product (verified review)
        const hasPurchased = await prisma.orderItem.findFirst({
            where: {
                productId,
                order: { userId, paymentStatus: "PAID" },
            },
        });

        const review = await prisma.review.create({
            data: {
                productId,
                userId,
                rating,
                title: title?.trim() || null,
                content: content.trim(),
                verified: !!hasPurchased,
                status: "PENDING",
            },
        });

        log.admin.info("Review submitted", { reviewId: review.id, productId, userId, rating });

        return NextResponse.json({
            message: "Review submitted! It will appear after moderation.",
            review: {
                id: review.id,
                rating: review.rating,
                title: review.title,
                content: review.content,
                verified: review.verified,
                status: review.status,
            },
        }, { status: 201 });
    } catch (e) {
        log.admin.error("Review submission failed", { error: e instanceof Error ? e.message : "Unknown" });
        return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }
}
