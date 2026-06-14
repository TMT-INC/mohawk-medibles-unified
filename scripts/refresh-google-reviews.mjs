#!/usr/bin/env node
/**
 * One-off Google Reviews refresh — mirrors app/api/cron/google-reviews.
 * Cache tables only (googleReview + googleReviewMeta); idempotent upserts.
 *
 * Run:  node --env-file=.env.production.local scripts/refresh-google-reviews.mjs
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE = process.env.GOOGLE_PLACE_ID;
if (!KEY || !PLACE) {
    console.error("Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID");
    process.exit(1);
}

// Same driver-adapter construction as lib/db.ts (Prisma 7 requires it).
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const url = `https://places.googleapis.com/v1/places/${PLACE}?fields=rating,userRatingCount,reviews&key=${KEY}`;
const res = await fetch(url, { headers: { "X-Goog-FieldMask": "rating,userRatingCount,reviews" } });
if (!res.ok) {
    console.error("Places API error:", res.status, await res.text());
    process.exit(1);
}
const data = await res.json();
const reviews = data.reviews ?? [];
let synced = 0;
for (const r of reviews) {
    const googleReviewId = r.name ?? `review-${r.authorAttribution?.displayName}-${r.rating}`;
    await prisma.googleReview.upsert({
        where: { googleReviewId },
        create: {
            googleReviewId,
            authorName: r.authorAttribution?.displayName ?? "Anonymous",
            authorPhoto: r.authorAttribution?.photoUri ?? null,
            rating: r.rating ?? 5,
            text: r.text?.text ?? "",
            relativeTime: r.relativePublishTimeDescription ?? "",
        },
        update: {
            authorName: r.authorAttribution?.displayName ?? "Anonymous",
            authorPhoto: r.authorAttribution?.photoUri ?? null,
            rating: r.rating ?? 5,
            text: r.text?.text ?? "",
            relativeTime: r.relativePublishTimeDescription ?? "",
        },
    });
    synced++;
}
await prisma.googleReviewMeta.upsert({
    where: { id: "main" },
    create: { id: "main", placeId: PLACE, averageRating: data.rating ?? 0, totalReviews: data.userRatingCount ?? 0, lastSyncedAt: new Date() },
    update: { averageRating: data.rating ?? 0, totalReviews: data.userRatingCount ?? 0, lastSyncedAt: new Date() },
});
console.log(`Synced ${synced} reviews | avg ${data.rating} | total ${data.userRatingCount}`);
await prisma.$disconnect();
