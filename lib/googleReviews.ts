/**
 * Google Reviews — Sync & Query library
 * Uses Google Places API (New) to fetch reviews for Mohawk Medibles
 */
import { prisma } from "@/lib/db";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID;

interface GooglePlaceReview {
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
  };
  rating?: number;
  text?: { text?: string };
  relativePublishTimeDescription?: string;
  name?: string; // unique review resource name
}

interface GooglePlaceResponse {
  rating?: number;
  userRatingCount?: number;
  reviews?: GooglePlaceReview[];
}

/**
 * Fetch reviews from Google Places API (New) and upsert into DB.
 * Returns count of synced reviews.
 */
export async function syncGoogleReviews(): Promise<{
  synced: number;
  averageRating: number;
  totalReviews: number;
}> {
  if (!GOOGLE_PLACES_API_KEY || !GOOGLE_PLACE_ID) {
    console.warn("[googleReviews] API key or Place ID not configured — skipping sync");
    return { synced: 0, averageRating: 0, totalReviews: 0 };
  }

  // Use Places API (New) — fieldMask via header (not query param)
  const url = `https://places.googleapis.com/v1/places/${GOOGLE_PLACE_ID}`;

  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "rating,userRatingCount,reviews",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[googleReviews] API error:", res.status, errText);
    return { synced: 0, averageRating: 0, totalReviews: 0 };
  }

  const data: GooglePlaceResponse = await res.json();
  const reviews = data.reviews ?? [];
  let synced = 0;

  try {
    for (const review of reviews) {
      const googleReviewId = review.name ?? `review-${review.authorAttribution?.displayName}-${review.rating}`;
      const authorName = review.authorAttribution?.displayName ?? "Anonymous";
      const authorPhoto = review.authorAttribution?.photoUri ?? null;
      const rating = review.rating ?? 5;
      const text = review.text?.text ?? "";
      const relativeTime = review.relativePublishTimeDescription ?? "";

      await prisma.googleReview.upsert({
        where: { googleReviewId },
        create: { googleReviewId, authorName, authorPhoto, rating, text, relativeTime },
        update: { authorName, authorPhoto, rating, text, relativeTime },
      });
      synced++;
    }

    // Update meta
    const averageRating = data.rating ?? 0;
    const totalReviews = data.userRatingCount ?? 0;

    await prisma.googleReviewMeta.upsert({
      where: { id: "main" },
      create: {
        id: "main",
        placeId: GOOGLE_PLACE_ID,
        averageRating,
        totalReviews,
        lastSyncedAt: new Date(),
      },
      update: {
        averageRating,
        totalReviews,
        lastSyncedAt: new Date(),
      },
    });

    return { synced, averageRating, totalReviews };
  } catch (e) {
    console.warn("[googleReviews] Failed to sync reviews (table may not exist yet):", (e as Error).message);
    return { synced: 0, averageRating: 0, totalReviews: 0 };
  }
}

/**
 * Get review summary + recent reviews from DB.
 * Gracefully returns empty data if nothing synced yet.
 */
export async function getReviewSummary(limit = 5) {
  try {
    const meta = await prisma.googleReviewMeta.findUnique({
      where: { id: "main" },
    });

    const recentReviews = await prisma.googleReview.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return {
      averageRating: meta?.averageRating ?? 0,
      totalReviews: meta?.totalReviews ?? 0,
      lastSyncedAt: meta?.lastSyncedAt ?? null,
      placeId: meta?.placeId ?? null,
      reviews: recentReviews,
    };
  } catch (e) {
    console.warn("[googleReviews] Failed to fetch review summary (table may not exist yet):", (e as Error).message);
    return {
      averageRating: 0,
      totalReviews: 0,
      lastSyncedAt: null,
      placeId: null,
      reviews: [],
    };
  }
}
