"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Clock, ArrowRight, Flame } from "lucide-react";
import Link from "next/link";

function useCountdown(endDate: string | Date) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  const calculate = useCallback(() => {
    const end = new Date(endDate).getTime();
    const diff = Math.max(0, end - Date.now());
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  }, [endDate]);

  useEffect(() => {
    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [calculate]);

  return timeLeft;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl md:text-3xl font-black text-white tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-amber-300/70">{label}</span>
    </div>
  );
}

export default function ContestBanner() {
  const [contest, setContest] = useState<any>(null);

  useEffect(() => {
    fetch("/api/trpc/contest.getActive?input={}")
      .then((r) => r.json())
      .then((res) => {
        const data = res?.result?.data?.json ?? res?.result?.data;
        if (Array.isArray(data) && data.length > 0) setContest(data[0]);
      })
      .catch(() => {});
  }, []);

  if (!contest) return null;

  return <ContestBannerInner contest={contest} />;
}

function ContestBannerInner({ contest }: { contest: any }) {
  const { d, h, m, s } = useCountdown(contest.endDate);

  return (
    <section className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f00] via-[#1a1000] to-[#1a0f00]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(245,158,11,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(234,88,12,0.1),transparent_60%)]" />

      {/* Animated fire particles effect via border */}
      <div className="absolute inset-0 rounded-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.3) 25%, rgba(234,88,12,0.3) 50%, rgba(245,158,11,0.3) 75%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 3s linear infinite",
          height: "2px",
          bottom: 0,
          top: "auto",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Prize image */}
          {contest.prizeImage && (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-xl shadow-amber-500/20">
              <img src={contest.prizeImage} alt={contest.prize} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/15 rounded-full px-3 py-1 mb-2">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Active Contest</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white mb-1">{contest.title}</h3>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-amber-400 font-semibold text-sm">{contest.prize}</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3 md:gap-4">
            <CountdownUnit value={d} label="Days" />
            <span className="text-amber-500/40 text-xl font-light">:</span>
            <CountdownUnit value={h} label="Hrs" />
            <span className="text-amber-500/40 text-xl font-light">:</span>
            <CountdownUnit value={m} label="Min" />
            <span className="text-amber-500/40 text-xl font-light">:</span>
            <CountdownUnit value={s} label="Sec" />
          </div>

          {/* CTA */}
          <Link
            href="/contests"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-600/25 hover:shadow-amber-500/40 transition-all whitespace-nowrap flex-shrink-0"
          >
            Enter Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* CSS animation for shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </section>
  );
}
