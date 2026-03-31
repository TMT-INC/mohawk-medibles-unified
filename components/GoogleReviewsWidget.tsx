"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface GoogleReview {
  id: string;
  authorName: string;
  authorPhoto: string | null;
  rating: number;
  text: string;
  relativeTime: string;
}

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  reviews: GoogleReview[];
  placeId: string | null;
}

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${i <= rating ? "text-amber-400 fill-amber-400" : "text-zinc-600"}`}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

/**
 * Compact badge for footer — just shows stars + count
 */
export function GoogleReviewsBadge() {
  const [data, setData] = useState<ReviewSummary | null>(null);

  useEffect(() => {
    fetch("/api/trpc/googleReviews.getSummary?input={}")
      .then((r) => r.json())
      .then((res) => {
        const d = res?.result?.data?.json ?? res?.result?.data;
        if (d && d.averageRating) setData(d);
      })
      .catch(() => {});
  }, []);

  if (!data || !data.averageRating || data.totalReviews === 0) return null;

  const mapsUrl = data.placeId
    ? `https://www.google.com/maps/place/?q=place_id:${data.placeId}`
    : "https://www.google.com/maps/search/Mohawk+Medibles";

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
    >
      {/* Google "G" logo */}
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      <StarRating rating={Math.round(data.averageRating)} size={12} />
      <span className="text-xs text-white/70 group-hover:text-white transition-colors">
        {data.averageRating.toFixed(1)} ({data.totalReviews})
      </span>
    </a>
  );
}

/**
 * Full Google Reviews Widget — carousel of recent reviews
 */
export default function GoogleReviewsWidget() {
  const [data, setData] = useState<ReviewSummary | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetch("/api/trpc/googleReviews.getSummary?input={}")
      .then((r) => r.json())
      .then((res) => {
        const d = res?.result?.data?.json ?? res?.result?.data;
        if (d && d.averageRating) setData(d);
      })
      .catch(() => {});
  }, []);

  const reviewCount = data?.reviews?.length ?? 0;

  const next = useCallback(() => {
    if (reviewCount > 0) {
      setCurrentIndex((prev) => (prev + 1) % reviewCount);
    }
  }, [reviewCount]);

  const prev = useCallback(() => {
    if (reviewCount > 0) {
      setCurrentIndex((prev) => (prev - 1 + reviewCount) % reviewCount);
    }
  }, [reviewCount]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (isPaused || reviewCount <= 1) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [isPaused, reviewCount, next]);

  if (!data || !data.averageRating || !data.reviews || data.totalReviews === 0) return null;

  const mapsUrl = data.placeId
    ? `https://www.google.com/maps/place/?q=place_id:${data.placeId}`
    : "https://www.google.com/maps/search/Mohawk+Medibles";

  const currentReview = data.reviews?.[currentIndex];
  if (!currentReview) return null;

  return (
    <section
      className="py-16 px-4 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle fire glow background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/5 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            {/* Google "G" logo */}
            <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Google Reviews</h2>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-black text-amber-400">{data.averageRating.toFixed(1)}</span>
            <StarRating rating={Math.round(data.averageRating)} size={24} />
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/60 hover:text-amber-400 transition-colors inline-flex items-center gap-1"
          >
            {data.totalReviews} reviews on Google
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Review Carousel */}
        {currentReview && (
          <div className="relative">
            <div className="bg-white/[0.03] rounded-2xl p-8 shadow-2xl shadow-black/30 min-h-[180px] flex flex-col justify-center">
              {/* Author */}
              <div className="flex items-center gap-3 mb-4">
                {currentReview.authorPhoto ? (
                  <img
                    src={currentReview.authorPhoto}
                    alt={currentReview.authorName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                    {currentReview.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white text-sm">{currentReview.authorName}</p>
                  <p className="text-xs text-white/40">{currentReview.relativeTime}</p>
                </div>
                <div className="ml-auto">
                  <StarRating rating={currentReview.rating} size={14} />
                </div>
              </div>

              {/* Review text */}
              <p className="text-white/80 text-sm leading-relaxed line-clamp-4">
                {currentReview.text || "Great experience!"}
              </p>
            </div>

            {/* Navigation arrows */}
            {reviewCount > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </>
            )}

            {/* Dots */}
            {reviewCount > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {data.reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentIndex
                        ? "bg-amber-400 w-6"
                        : "bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to review ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
