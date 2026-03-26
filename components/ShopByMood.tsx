"use client";

import { useState } from "react";
import Link from "next/link";
import { Cloud, Zap, Leaf, Moon, Heart, ArrowRight, Sparkles } from "lucide-react";
import { INTENTS, type IntentConfig } from "@/lib/intentMapping";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Cloud, Zap, Leaf, Moon, Heart,
};

/* ── Rich visual config per mood ──────────────────────────── */
interface MoodStyle {
    bg: string;
    glow: string;
    hoverGlow: string;
    iconColor: string;
    iconBg: string;
    borderHover: string;
    orbGradient: string;
    headline: string;
    ambient: string;
}

const CARD_STYLES: Record<string, MoodStyle> = {
    relax: {
        bg: "bg-gradient-to-br from-purple-950/70 via-violet-900/40 to-fuchsia-950/50",
        glow: "shadow-[0_8px_50px_-12px_rgba(168,85,247,0.25)]",
        hoverGlow: "hover:shadow-[0_16px_70px_-8px_rgba(168,85,247,0.5)]",
        iconColor: "text-purple-400",
        iconBg: "bg-purple-500/20",
        borderHover: "hover:border-purple-500/30",
        orbGradient: "bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.2),transparent_60%)]",
        headline: "Melt the tension away",
        ambient: "\u2728",
    },
    energize: {
        bg: "bg-gradient-to-br from-amber-950/70 via-orange-900/40 to-yellow-950/50",
        glow: "shadow-[0_8px_50px_-12px_rgba(245,158,11,0.25)]",
        hoverGlow: "hover:shadow-[0_16px_70px_-8px_rgba(245,158,11,0.5)]",
        iconColor: "text-amber-400",
        iconBg: "bg-amber-500/20",
        borderHover: "hover:border-amber-500/30",
        orbGradient: "bg-[radial-gradient(circle_at_20%_80%,rgba(245,158,11,0.2),transparent_60%)]",
        headline: "Spark your day",
        ambient: "\u26a1",
    },
    balance: {
        bg: "bg-gradient-to-br from-emerald-950/70 via-teal-900/40 to-green-950/50",
        glow: "shadow-[0_8px_50px_-12px_rgba(16,185,129,0.25)]",
        hoverGlow: "hover:shadow-[0_16px_70px_-8px_rgba(16,185,129,0.5)]",
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-500/20",
        borderHover: "hover:border-emerald-500/30",
        orbGradient: "bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_60%)]",
        headline: "Find your center",
        ambient: "\ud83c\udf3f",
    },
    sleep: {
        bg: "bg-gradient-to-br from-indigo-950/70 via-blue-900/40 to-slate-950/50",
        glow: "shadow-[0_8px_50px_-12px_rgba(99,102,241,0.25)]",
        hoverGlow: "hover:shadow-[0_16px_70px_-8px_rgba(99,102,241,0.5)]",
        iconColor: "text-indigo-400",
        iconBg: "bg-indigo-500/20",
        borderHover: "hover:border-indigo-500/30",
        orbGradient: "bg-[radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.2),transparent_60%)]",
        headline: "Drift off peacefully",
        ambient: "\ud83c\udf19",
    },
    relief: {
        bg: "bg-gradient-to-br from-rose-950/70 via-red-900/40 to-amber-950/50",
        glow: "shadow-[0_8px_50px_-12px_rgba(244,63,94,0.25)]",
        hoverGlow: "hover:shadow-[0_16px_70px_-8px_rgba(244,63,94,0.5)]",
        iconColor: "text-rose-400",
        iconBg: "bg-rose-500/20",
        borderHover: "hover:border-rose-500/30",
        orbGradient: "bg-[radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.2),transparent_60%)]",
        headline: "Soothe what hurts",
        ambient: "\ud83d\udcab",
    },
};

function MoodCard({ intent, isExpanded, onHover }: {
    intent: IntentConfig;
    isExpanded: boolean;
    onHover: () => void;
}) {
    const Icon = ICON_MAP[intent.icon] ?? Leaf;
    const styles = CARD_STYLES[intent.key];

    return (
        <Link
            href={`/shop?intent=${intent.key}`}
            onMouseEnter={onHover}
            className={`group relative flex flex-col rounded-2xl overflow-hidden border border-white/[0.06] transition-all duration-500 ease-out
                ${isExpanded ? "col-span-2 row-span-2 p-8 md:p-10" : "p-6 md:p-7 hover:scale-[1.04]"}
                hover:-translate-y-1 ${styles.bg} ${styles.glow} ${styles.hoverGlow} ${styles.borderHover}`}
        >
            {/* Ambient orb */}
            <div className={`absolute inset-0 ${styles.orbGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

            {/* Hover shimmer */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-t from-white/[0.05] via-transparent to-white/[0.02] pointer-events-none" />

            {/* Icon */}
            <div className={`relative flex items-center justify-center ${isExpanded ? "w-16 h-16 md:w-20 md:h-20 rounded-2xl" : "w-14 h-14 md:w-16 md:h-16 rounded-full"} ${styles.iconBg} mb-4 transition-all duration-500 group-hover:scale-110`}>
                <Icon className={`${isExpanded ? "w-8 h-8 md:w-10 md:h-10" : "w-7 h-7 md:w-8 md:h-8"} transition-all duration-300 group-hover:drop-shadow-lg ${styles.iconColor}`} />
                {/* Pulse ring */}
                <div className={`absolute inset-0 ${isExpanded ? "rounded-2xl" : "rounded-full"} ${styles.iconBg} opacity-0 group-hover:opacity-100 group-hover:animate-ping pointer-events-none`} style={{ animationDuration: "2.5s" }} />
            </div>

            {/* Content */}
            <span className="relative text-base md:text-lg font-bold text-white mb-1 tracking-wide">
                {intent.label}
            </span>

            {isExpanded ? (
                <>
                    <p className="relative text-sm text-white/50 leading-relaxed mb-4 max-w-[280px]">
                        {styles.headline}. {intent.description}.
                    </p>
                    <div className="relative flex items-center gap-2 text-sm font-semibold text-white/60 group-hover:text-white transition-colors mt-auto">
                        Explore {intent.label}
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </div>
                </>
            ) : (
                <>
                    <span className="relative text-xs md:text-sm text-white/40 text-center leading-relaxed">
                        {styles.headline}
                    </span>
                    {/* Bottom accent line */}
                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-3/4 transition-all duration-500 rounded-full bg-gradient-to-r from-transparent ${styles.iconColor} to-transparent opacity-60`} />
                </>
            )}
        </Link>
    );
}

export default function ShopByMood() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <section className="relative py-16 md:py-24 px-4 bg-[#0a0a0f] overflow-hidden">
            {/* Section ambient background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(168,85,247,0.06),transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(245,158,11,0.04),transparent_50%)] pointer-events-none" />

            <div className="relative max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] text-white/40 text-xs font-bold tracking-[0.2em] uppercase mb-6 ring-1 ring-white/[0.08]">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Shop by mood
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 leading-[1.1]">
                        How Do You Want{" "}
                        <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                            to Feel?
                        </span>
                    </h2>
                    <p className="text-sm md:text-base text-white/40 max-w-lg mx-auto leading-relaxed">
                        Skip the strain names. Choose your vibe and we&apos;ll match you
                        with the perfect products from 360+ items.
                    </p>
                </div>

                {/* Mood Cards — responsive grid with hover expansion on desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                    {INTENTS.map((intent, i) => (
                        <MoodCard
                            key={intent.key}
                            intent={intent}
                            isExpanded={false}
                            onHover={() => setHoveredIndex(i)}
                        />
                    ))}
                </div>

                {/* Browse all moods CTA */}
                <div className="text-center mt-12">
                    <Link
                        href="/shop-by-mood"
                        className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white font-semibold text-sm border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:scale-[1.03]"
                    >
                        <Sparkles className="w-4 h-4 text-amber-400/60 group-hover:text-amber-400 transition-colors" />
                        Explore the Full Mood Experience
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
