"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Flame, X } from "lucide-react";
interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(endDate: string): TimeLeft & { expired: boolean } {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

/**
 * Announcement bar for the featured deal of the day.
 * Shows in the site header when there's an active featured deal.
 */
export default function DealOfTheDayBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft & { expired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: true,
  });

  const [deal, setDeal] = useState<any>(null);

  useEffect(() => {
    fetch("/api/trpc/dailyDeals.getFeatured?input={}")
      .then((r) => r.json())
      .then((res) => {
        const data = res?.result?.data?.json ?? res?.result?.data;
        if (data && data.dealPrice != null) setDeal(data);
      })
      .catch(() => {});
  }, []);

  const tick = useCallback(() => {
    if (deal?.endDate) {
      setTimeLeft(calcTimeLeft(deal.endDate));
    }
  }, [deal?.endDate]);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  if (!deal || dismissed || timeLeft.expired) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white text-xs md:text-sm py-2 px-4 relative z-[61]">
      <div className="flex items-center justify-center gap-3 max-w-4xl mx-auto">
        <Flame className="h-4 w-4 text-yellow-300 shrink-0 animate-pulse" />

        <Link
          href="/deals"
          className="flex items-center gap-2 hover:underline truncate"
        >
          <span className="font-bold">Deal of the Day:</span>
          <span className="truncate">{deal.title}</span>
          <span className="font-black">
            &mdash; {deal.savingsPercent}% OFF!
          </span>
        </Link>

        <span className="font-mono font-bold text-yellow-200 shrink-0">
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>

        <button
          onClick={() => setDismissed(true)}
          className="p-0.5 rounded hover:bg-white/20 transition-colors shrink-0 ml-1"
          aria-label="Dismiss deal banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
