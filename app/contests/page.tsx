"use client";

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import {
  Trophy, Clock, Gift, Users, Flame, Star, Lock, Coins, ShoppingCart, UserPlus,
  Zap, Sparkles, Crown, PartyPopper, Timer, Award, Target, Ticket,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function useCountdown(endDate: string | Date) {
  const [timeLeft, setTimeLeft] = useState("");

  const calculate = useCallback(() => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return "Ended";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  }, [endDate]);

  useEffect(() => {
    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [calculate]);

  return timeLeft;
}

function CountdownBlock({ endDate }: { endDate: string | Date }) {
  const [parts, setParts] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const end = new Date(endDate).getTime();
      const diff = Math.max(0, end - Date.now());
      setParts({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex gap-2 justify-center">
      {[
        { val: parts.d, label: "Days" },
        { val: parts.h, label: "Hours" },
        { val: parts.m, label: "Mins" },
        { val: parts.s, label: "Secs" },
      ].map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-1">
            <span className="text-xl font-black text-amber-400 font-mono">{String(unit.val).padStart(2, "0")}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

function EntryMethodBadge({ method, minPurchase, pointsCost }: { method: string; minPurchase?: number | null; pointsCost?: number | null }) {
  const config: Record<string, { icon: typeof Gift; label: string; color: string; bg: string }> = {
    FREE: { icon: Gift, label: "Free Entry", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    PURCHASE: { icon: ShoppingCart, label: minPurchase ? `Spend $${minPurchase}+` : "Any Purchase", color: "text-amber-400", bg: "bg-amber-500/10" },
    SIGNUP: { icon: UserPlus, label: "New Signup", color: "text-blue-400", bg: "bg-blue-500/10" },
    POINTS: { icon: Coins, label: `${pointsCost || 100} Points`, color: "text-purple-400", bg: "bg-purple-500/10" },
  };
  const c = config[method] || config.FREE;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${c.color} ${c.bg} px-3 py-1 rounded-full`}>
      <Icon className="w-4 h-4" /> {c.label}
    </span>
  );
}

function ContestCard({ contest, onEnter, entering }: {
  contest: {
    id: number;
    title: string;
    description: string;
    prize: string;
    prizeImage?: string | null;
    entryMethod: string;
    minPurchaseAmount?: number | null;
    pointsCost?: number | null;
    endDate: string | Date;
    _count: { entries: number };
    totalEntries: number;
  };
  onEnter: (id: number) => void;
  entering: boolean;
}) {
  const countdown = useCountdown(contest.endDate);
  const canDirectEnter = contest.entryMethod === "FREE" || contest.entryMethod === "POINTS";

  return (
    <div className="bg-[#141420] rounded-2xl overflow-hidden shadow-xl shadow-black/40 hover:shadow-amber-500/10 transition-all duration-300 group">
      {/* Prize Image */}
      {contest.prizeImage && (
        <div className="relative h-52 overflow-hidden">
          <img
            src={contest.prizeImage}
            alt={contest.prize}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141420] via-[#141420]/30 to-transparent" />
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-amber-300">{countdown}</span>
          </div>
          <div className="absolute top-3 left-3">
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Live
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        {!contest.prizeImage && (
          <div className="flex items-center justify-between mb-4">
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Live
            </span>
            <div className="flex items-center gap-1.5 bg-black/40 rounded-full px-3 py-1.5">
              <Timer className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-amber-300">{countdown}</span>
            </div>
          </div>
        )}

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
          {contest.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-amber-400 font-semibold">{contest.prize}</span>
        </div>

        <p className="text-gray-400 text-sm mb-5 line-clamp-2 leading-relaxed">{contest.description}</p>

        <div className="flex items-center justify-between mb-5">
          <EntryMethodBadge method={contest.entryMethod} minPurchase={contest.minPurchaseAmount} pointsCost={contest.pointsCost} />
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <Ticket className="w-4 h-4" />
            <span>{contest._count.entries} {contest._count.entries === 1 ? "entry" : "entries"}</span>
          </div>
        </div>

        {canDirectEnter ? (
          <button
            onClick={() => onEnter(contest.id)}
            disabled={entering}
            className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {entering ? (
              <><Sparkles className="w-4 h-4 animate-spin" /> Entering...</>
            ) : (
              <><Zap className="w-4 h-4" /> Enter Now</>
            )}
          </button>
        ) : contest.entryMethod === "PURCHASE" ? (
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider text-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/20 transition-all"
          >
            <ShoppingCart className="w-4 h-4" /> Shop to Enter
          </Link>
        ) : (
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/20 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Sign Up to Enter
          </Link>
        )}
      </div>
    </div>
  );
}

function PastContestCard({ contest }: {
  contest: {
    id: number;
    title: string;
    prize: string;
    prizeImage?: string | null;
    endDate: string | Date;
    winnerAnnouncedAt?: string | Date | null;
    winner?: { id: string; name: string } | null;
    _count: { entries: number };
  };
}) {
  return (
    <div className="bg-[#141420]/60 rounded-xl p-5 shadow-lg shadow-black/20 hover:bg-[#141420]/80 transition-colors">
      <div className="flex items-start gap-4">
        {contest.prizeImage && (
          <img
            src={contest.prizeImage}
            alt={contest.prize}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate">{contest.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-amber-400 text-sm font-medium">{contest.prize}</p>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Ticket className="w-3 h-3" /> {contest._count.entries} entries</span>
            <span>Ended {new Date(contest.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      {contest.winner && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-sm text-gray-300">
            Winner: <span className="text-amber-300 font-bold">{contest.winner.name}</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default function ContestsPage() {
  const [enteringId, setEnteringId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeQuery = trpc.contest.getActive.useQuery();
  const pastQuery = trpc.contest.getPast.useQuery();
  const enterMutation = trpc.contest.enter.useMutation({
    onSuccess: () => {
      setMessage({ type: "success", text: "You're entered! Good luck!" });
      activeQuery.refetch();
      setEnteringId(null);
    },
    onError: (err) => {
      setMessage({ type: "error", text: err.message });
      setEnteringId(null);
    },
  });

  function handleEnter(contestId: number) {
    setMessage(null);
    setEnteringId(contestId);
    enterMutation.mutate({ contestId });
  }

  const activeContests = activeQuery.data ?? [];
  const pastContests = pastQuery.data ?? [];
  const featuredContest = activeContests[0];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden">
        <Image
          src="/assets/pages/contests-hero.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-[#0a0a0f] to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/8 rounded-full blur-[150px]" />
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-red-500/5 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-5 py-2 mb-6">
            <Flame className="w-5 h-5 text-amber-400" />
            <span className="text-amber-300 text-sm font-bold uppercase tracking-widest">Contests & Giveaways</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Win{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
              Premium Prizes
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Enter our exclusive contests for a chance to win premium cannabis products, gift cards,
            and more. The more you shop, the more entries you earn.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { value: activeContests.length.toString(), label: "Active Contests", icon: Flame },
              { value: String(activeContests.reduce((sum, c: any) => sum + (c._count?.entries || 0), 0)), label: "Total Entries", icon: Ticket },
              { value: String(pastContests.filter((c: any) => c.winner).length) + "+", label: "Winners So Far", icon: Trophy },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-amber-400" />
                  <span className="text-3xl font-black text-white">{stat.value}</span>
                </div>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Entry Methods Showcase */}
      <section className="max-w-5xl mx-auto px-4 -mt-4 mb-16 relative z-10">
        <div className="bg-white/[0.03] border border-white/5 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-center text-sm font-bold text-zinc-500 uppercase tracking-widest mb-5">
            How to Enter
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Gift, label: "Free Entry", desc: "Some contests are completely free", color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { icon: ShoppingCart, label: "Shop & Enter", desc: "Earn entries when you purchase", color: "text-amber-400", bg: "bg-amber-500/10" },
              { icon: UserPlus, label: "Sign Up", desc: "New members get automatic entries", color: "text-blue-400", bg: "bg-blue-500/10" },
              { icon: Coins, label: "Use Points", desc: "Spend reward points for entries", color: "text-purple-400", bg: "bg-purple-500/10" },
            ].map((method) => (
              <div key={method.label} className="text-center p-4 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${method.bg} flex items-center justify-center`}>
                  <method.icon className={`w-6 h-6 ${method.color}`} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{method.label}</h4>
                <p className="text-xs text-zinc-500">{method.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Status message */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            {message.type === "success" ? <PartyPopper className="w-5 h-5 shrink-0" /> : <Lock className="w-5 h-5 shrink-0" />}
            {message.text}
          </div>
        )}

        {/* Featured Contest (first active contest gets special treatment) */}
        {featuredContest && !activeQuery.isLoading && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Featured Contest</h2>
            </div>
            <div className="bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 border border-amber-500/10 rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {(featuredContest as any).prizeImage && (
                  <div className="relative rounded-xl overflow-hidden aspect-video">
                    <img
                      src={(featuredContest as any).prizeImage}
                      alt={(featuredContest as any).prize}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <div className={(featuredContest as any).prizeImage ? "" : "md:col-span-2 text-center"}>
                  <h3 className="text-3xl font-black text-white mb-3">{(featuredContest as any).title}</h3>
                  <div className="flex items-center gap-2 mb-4 justify-start">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span className="text-xl text-amber-400 font-bold">{(featuredContest as any).prize}</span>
                  </div>
                  <p className="text-gray-400 mb-6 leading-relaxed">{(featuredContest as any).description}</p>

                  <div className="mb-6">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Time Remaining</p>
                    <CountdownBlock endDate={(featuredContest as any).endDate} />
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <EntryMethodBadge
                      method={(featuredContest as any).entryMethod}
                      minPurchase={(featuredContest as any).minPurchaseAmount}
                      pointsCost={(featuredContest as any).pointsCost}
                    />
                    <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                      <Ticket className="w-4 h-4" />
                      {(featuredContest as any)._count.entries} entries so far
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Contests */}
        {activeQuery.isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#141420] rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        ) : activeContests.length > 0 ? (
          <div className="mb-20">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                All Active Contests
              </h2>
              <span className="ml-2 px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full">
                {activeContests.length}
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeContests.map((contest: any) => (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  onEnter={handleEnter}
                  entering={enteringId === contest.id}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 mb-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
              <Lock className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No Active Contests Right Now</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              We run contests regularly with prizes like free ounces, gift cards, and exclusive drops. Sign up for our newsletter to get notified first!
            </p>
            <p className="text-sm text-amber-400/80 mb-6">Tip: Every purchase earns you automatic contest entries</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-600/20"
              >
                <ShoppingCart className="w-4 h-4" /> Shop &amp; Earn Entries
              </Link>
              <Link
                href="/rewards"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 font-bold text-sm uppercase tracking-wider rounded-xl hover:border-gray-500 transition-all"
              >
                View Rewards Program
              </Link>
            </div>
          </div>
        )}

        {/* Past Winners */}
        {pastContests.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Past Winners</h2>
              <span className="ml-2 px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full">
                {pastContests.length}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {pastContests.map((contest: any) => (
                <PastContestCard key={contest.id} contest={contest} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <section className="mt-20 relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/30 via-orange-900/20 to-red-900/30" />
          <div className="relative z-10 text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Increase Your Chances
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
              Every purchase earns you automatic contest entries. The more you shop,
              the better your odds. Plus, earn reward points you can use for even more entries.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25"
              >
                <ShoppingCart className="w-4 h-4" /> Shop Now
              </Link>
              <Link
                href="/rewards"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-white/10 transition-colors"
              >
                <Star className="w-4 h-4" /> Earn Points
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
