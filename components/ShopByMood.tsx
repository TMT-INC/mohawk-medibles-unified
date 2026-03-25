"use client";

import Link from "next/link";
import { Cloud, Zap, Leaf, Moon, Heart, ArrowRight } from "lucide-react";
import { INTENTS, type IntentConfig } from "@/lib/intentMapping";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Cloud,
    Zap,
    Leaf,
    Moon,
    Heart,
};

const CARD_STYLES: Record<string, {
    bg: string;
    glow: string;
    hoverGlow: string;
    iconColor: string;
    iconBg: string;
    borderHover: string;
}> = {
    relax: {
        bg: "bg-gradient-to-br from-purple-950/60 via-violet-900/30 to-purple-950/40",
        glow: "shadow-[0_8px_40px_-12px_rgba(168,85,247,0.2)]",
        hoverGlow: "hover:shadow-[0_12px_50px_-8px_rgba(168,85,247,0.45)]",
        iconColor: "text-purple-400",
        iconBg: "bg-purple-500/15",
        borderHover: "hover:border-purple-500/30",
    },
    energize: {
        bg: "bg-gradient-to-br from-amber-950/60 via-orange-900/30 to-amber-950/40",
        glow: "shadow-[0_8px_40px_-12px_rgba(245,158,11,0.2)]",
        hoverGlow: "hover:shadow-[0_12px_50px_-8px_rgba(245,158,11,0.45)]",
        iconColor: "text-amber-400",
        iconBg: "bg-amber-500/15",
        borderHover: "hover:border-amber-500/30",
    },
    balance: {
        bg: "bg-gradient-to-br from-emerald-950/60 via-teal-900/30 to-emerald-950/40",
        glow: "shadow-[0_8px_40px_-12px_rgba(16,185,129,0.2)]",
        hoverGlow: "hover:shadow-[0_12px_50px_-8px_rgba(16,185,129,0.45)]",
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-500/15",
        borderHover: "hover:border-emerald-500/30",
    },
    sleep: {
        bg: "bg-gradient-to-br from-indigo-950/60 via-blue-900/30 to-indigo-950/40",
        glow: "shadow-[0_8px_40px_-12px_rgba(99,102,241,0.2)]",
        hoverGlow: "hover:shadow-[0_12px_50px_-8px_rgba(99,102,241,0.45)]",
        iconColor: "text-indigo-400",
        iconBg: "bg-indigo-500/15",
        borderHover: "hover:border-indigo-500/30",
    },
    relief: {
        bg: "bg-gradient-to-br from-rose-950/60 via-red-900/30 to-rose-950/40",
        glow: "shadow-[0_8px_40px_-12px_rgba(244,63,94,0.2)]",
        hoverGlow: "hover:shadow-[0_12px_50px_-8px_rgba(244,63,94,0.45)]",
        iconColor: "text-rose-400",
        iconBg: "bg-rose-500/15",
        borderHover: "hover:border-rose-500/30",
    },
};

function MoodPill({ intent }: { intent: IntentConfig }) {
    const Icon = ICON_MAP[intent.icon] ?? Leaf;
    const styles = CARD_STYLES[intent.key];

    return (
        <Link
            href={`/shop?intent=${intent.key}`}
            className={`group relative flex flex-col items-center p-6 md:p-7 rounded-2xl overflow-hidden border border-white/5 transition-all duration-500 ease-out hover:scale-[1.06] hover:-translate-y-2 ${styles.bg} ${styles.glow} ${styles.hoverGlow} ${styles.borderHover}`}
        >
            {/* Hover shimmer overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-t from-white/[0.07] via-transparent to-white/[0.03]" />

            {/* Icon with background circle */}
            <div className={`relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full ${styles.iconBg} mb-4 transition-transform duration-500 group-hover:scale-110`}>
                <Icon className={`w-7 h-7 md:w-8 md:h-8 transition-all duration-300 group-hover:drop-shadow-lg ${styles.iconColor}`} />
                {/* Pulse ring on hover */}
                <div className={`absolute inset-0 rounded-full ${styles.iconBg} opacity-0 group-hover:opacity-100 group-hover:animate-ping`} style={{ animationDuration: '2s' }} />
            </div>

            <span className="relative text-sm md:text-base font-bold text-white mb-1.5 tracking-wide">{intent.label}</span>
            <span className="relative text-[11px] md:text-xs text-white/45 text-center leading-relaxed">{intent.tagline}</span>

            {/* Bottom accent line on hover */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-3/4 transition-all duration-500 rounded-full bg-gradient-to-r from-transparent ${styles.iconColor} to-transparent opacity-60`} />
        </Link>
    );
}

export default function ShopByMood() {
    return (
        <section className="py-14 md:py-20 px-4 bg-[#0a0a0f]">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
                        How Do You Want{" "}
                        <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                            to Feel?
                        </span>
                    </h2>
                    <p className="text-sm md:text-base text-white/45 max-w-md mx-auto leading-relaxed">
                        Skip the science. Shop by the experience you&apos;re looking for.
                    </p>
                </div>

                {/* Mood Cards Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
                    {INTENTS.map((intent) => (
                        <MoodPill key={intent.key} intent={intent} />
                    ))}
                </div>

                {/* Browse all moods link */}
                <div className="text-center mt-10">
                    <Link
                        href="/shop-by-mood"
                        className="group inline-flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white/80 transition-colors duration-300"
                    >
                        Explore all moods
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
