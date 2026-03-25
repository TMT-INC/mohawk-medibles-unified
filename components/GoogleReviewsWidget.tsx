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
        if (res?.result?.data) setData(res.result.data);
      })
      .catch(() => {});
  }, []);

  if (!data || data.totalReviews === 0) return null;

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
        {(data.averageRating ?? 0).toFixed(1)} ({data.totalReviews})
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
        if (res?.result?.data) setData(res.result.data);
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

  if (!data || data.totalReviews === 0) return null;

  const mapsUrl = data.placeId
    ? `https://www.google.com/maps/place/?q=place_id:${data.placeId}`
    : "https://www.google.com/maps/search/Mohawk+Medibles";

  const currentReview = data.reviews[currentIndex];

  return (
    <section
      className="py-20 px-4 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Warm ambient glow background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/8 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Google "G" logo */}
            <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-lg" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Google Reviews</h2>
          </div>

          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-500 drop-shadow-lg">{(data.averageRating ?? 0).toFixed(1)}</span>
            <div className="flex flex-col items-start gap-1">
              <StarRating rating={Math.round(data.averageRating)} size={26} />
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-medium">out of 5</span>
            </div>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/50 hover:text-amber-400 transition-colors duration-300 inline-flex items-center gap-1.5 group"
          >
            Based on {data.totalReviews} reviews on Google
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </a>
        </div>

        {/* Review Carousel */}
        {currentReview && (
          <div className="relative">
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-2xl shadow-black/40 border border-white/[0.06] min-h-[200px] flex flex-col justify-center transition-all duration-500">
              {/* Large quote mark */}
              <div className="absolute top-5 right-8 text-6xl text-amber-400/10 font-serif leading-none select-none" aria-hidden="true">&ldquo;</div>

              {/* Author */}
              <div className="flex items-center gap-4 mb-5">
                {currentReview.authorPhoto ? (
                  <img
                    src={currentReview.authorPhoto}
                    alt={currentReview.authorName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400/30 shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-base shadow-lg ring-2 ring-amber-400/30">
                    {currentReview.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-white text-base">{currentReview.authorName}</p>
                  <p className="text-xs text-white/40 mt-0.5">{currentReview.relativeTime}</p>
                </div>
                <div className="ml-auto">
                  <StarRating rating={currentReview.rating} size={16} />
                </div>
              </div>

              {/* Review text */}
              <p className="text-white/85 text-base leading-relaxed line-clamp-4 italic">
                &ldquo;{currentReview.text || "Great experience!"}&rdquo;
              </p>
            </div>

            {/* Navigation arrows */}
            {reviewCount > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-amber-400/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-4 h-4 text-white/80" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-amber-400/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-4 h-4 text-white/80" />
                </button>
              </>
            )}

            {/* Dots */}
            {reviewCount > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {data.reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      i === currentIndex
                        ? "bg-amber-400 w-8 shadow-lg shadow-amber-400/30"
                        : "bg-white/15 w-2 hover:bg-white/30"
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
