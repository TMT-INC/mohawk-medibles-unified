"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Cloud, Zap, Leaf, Moon, Heart, ArrowRight, Sparkles, Star,
} from "lucide-react";
import { INTENTS, filterByIntent, type IntentConfig, type ShoppingIntent } from "@/lib/intentMapping";

/* ── Icon map ─────────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Cloud, Zap, Leaf, Moon, Heart,
};

/* ── Rich visual identity per mood ────────────────────────── */
interface MoodVisual {
    /** Full-section gradient background */
    sectionBg: string;
    /** Card inner gradient */
    cardGradient: string;
    /** Glowing ring + shadow on hover */
    glow: string;
    /** Icon container */
    iconBg: string;
    iconColor: string;
    /** Accent for CTAs */
    accent: string;
    accentHover: string;
    /** Decorative floating orbs (CSS radial gradients) */
    orb1: string;
    orb2: string;
    /** Copy: what this mood means */
    headline: string;
    subtext: string;
    benefits: string[];
    /** Ambient emoji / symbol */
    ambient: string;
}

const MOOD_VISUALS: Record<string, MoodVisual> = {
    relax: {
        sectionBg: "bg-gradient-to-br from-[#1a0a2e] via-[#12071f] to-[#0d0618]",
        cardGradient: "bg-gradient-to-br from-purple-900/60 via-violet-800/30 to-fuchsia-900/20",
        glow: "shadow-[0_0_80px_-10px_rgba(168,85,247,0.4)] hover:shadow-[0_0_120px_-5px_rgba(168,85,247,0.6)]",
        iconBg: "bg-purple-500/20",
        iconColor: "text-purple-300",
        accent: "bg-purple-600 text-white",
        accentHover: "hover:bg-purple-500",
        orb1: "bg-[radial-gradient(ellipse_at_20%_50%,rgba(168,85,247,0.15),transparent_70%)]",
        orb2: "bg-[radial-gradient(ellipse_at_80%_20%,rgba(139,92,246,0.1),transparent_60%)]",
        headline: "Melt Away the Tension",
        subtext: "Indica-dominant strains, CBD blends, and calming edibles curated for deep relaxation. Let your worries dissolve into a lavender mist of tranquility.",
        benefits: ["Stress relief", "Muscle relaxation", "Evening wind-down", "Anxiety ease"],
        ambient: "\u2728",
    },
    energize: {
        sectionBg: "bg-gradient-to-br from-[#2a1800] via-[#1a0e00] to-[#120a00]",
        cardGradient: "bg-gradient-to-br from-amber-900/60 via-orange-800/30 to-yellow-900/20",
        glow: "shadow-[0_0_80px_-10px_rgba(245,158,11,0.4)] hover:shadow-[0_0_120px_-5px_rgba(245,158,11,0.6)]",
        iconBg: "bg-amber-500/20",
        iconColor: "text-amber-300",
        accent: "bg-amber-600 text-white",
        accentHover: "hover:bg-amber-500",
        orb1: "bg-[radial-gradient(ellipse_at_30%_60%,rgba(245,158,11,0.15),transparent_70%)]",
        orb2: "bg-[radial-gradient(ellipse_at_70%_30%,rgba(234,88,12,0.1),transparent_60%)]",
        headline: "Ignite Your Day",
        subtext: "Sativa-forward strains and uplifting blends that spark creativity, fuel focus, and bring the energy of a golden sunrise to your session.",
        benefits: ["Creative boost", "Social energy", "Morning motivation", "Mental clarity"],
        ambient: "\u26a1",
    },
    balance: {
        sectionBg: "bg-gradient-to-br from-[#0a1f1a] via-[#071510] to-[#050e0b]",
        cardGradient: "bg-gradient-to-br from-emerald-900/60 via-teal-800/30 to-green-900/20",
        glow: "shadow-[0_0_80px_-10px_rgba(16,185,129,0.4)] hover:shadow-[0_0_120px_-5px_rgba(16,185,129,0.6)]",
        iconBg: "bg-emerald-500/20",
        iconColor: "text-emerald-300",
        accent: "bg-emerald-600 text-white",
        accentHover: "hover:bg-emerald-500",
        orb1: "bg-[radial-gradient(ellipse_at_25%_45%,rgba(16,185,129,0.15),transparent_70%)]",
        orb2: "bg-[radial-gradient(ellipse_at_75%_25%,rgba(20,184,166,0.1),transparent_60%)]",
        headline: "Find Your Center",
        subtext: "Perfectly balanced hybrids and versatile products for any time of day. The zen sweet-spot between energy and calm \u2014 harmony in every hit.",
        benefits: ["All-day use", "Smooth highs", "Functional focus", "Mood stability"],
        ambient: "\ud83c\udf3f",
    },
    sleep: {
        sectionBg: "bg-gradient-to-br from-[#0a0a2e] via-[#070720] to-[#050514]",
        cardGradient: "bg-gradient-to-br from-indigo-900/60 via-blue-800/30 to-slate-900/20",
        glow: "shadow-[0_0_80px_-10px_rgba(99,102,241,0.4)] hover:shadow-[0_0_120px_-5px_rgba(99,102,241,0.6)]",
        iconBg: "bg-indigo-500/20",
        iconColor: "text-indigo-300",
        accent: "bg-indigo-600 text-white",
        accentHover: "hover:bg-indigo-500",
        orb1: "bg-[radial-gradient(ellipse_at_20%_40%,rgba(99,102,241,0.15),transparent_70%)]",
        orb2: "bg-[radial-gradient(ellipse_at_80%_60%,rgba(67,56,202,0.1),transparent_60%)]",
        headline: "Drift Into Deep Rest",
        subtext: "Heavy indicas, sleep-targeted edibles, and knockout strains designed to carry you into deep, starry slumber. Your midnight escape awaits.",
        benefits: ["Fall asleep faster", "Deep sleep cycles", "Insomnia relief", "Nighttime calm"],
        ambient: "\ud83c\udf19",
    },
    relief: {
        sectionBg: "bg-gradient-to-br from-[#2a0a0a] via-[#1a0505] to-[#120303]",
        cardGradient: "bg-gradient-to-br from-rose-900/60 via-red-800/30 to-amber-900/20",
        glow: "shadow-[0_0_80px_-10px_rgba(244,63,94,0.4)] hover:shadow-[0_0_120px_-5px_rgba(244,63,94,0.6)]",
        iconBg: "bg-rose-500/20",
        iconColor: "text-rose-300",
        accent: "bg-rose-600 text-white",
        accentHover: "hover:bg-rose-500",
        orb1: "bg-[radial-gradient(ellipse_at_30%_50%,rgba(244,63,94,0.15),transparent_70%)]",
        orb2: "bg-[radial-gradient(ellipse_at_70%_70%,rgba(217,70,39,0.1),transparent_60%)]",
        headline: "Soothe What Hurts",
        subtext: "Therapeutic CBD blends, topicals, tinctures, and high-CBD strains crafted for pain management, recovery, and healing comfort.",
        benefits: ["Pain management", "Anti-inflammation", "Muscle recovery", "Therapeutic comfort"],
        ambient: "\ud83d\udcab",
    },
};

/* ── Lightweight product type for cards ───────────────────── */
interface LiteProduct {
    id: number;
    slug: string;
    name: string;
    category: string;
    price: number;
    image: string;
    altText: string;
    specs: { thc: string; type: string } | null;
    effects: string[];
    shortDescription: string;
}

/* ── Product Card (mini) ──────────────────────────────────── */
function MiniProductCard({ product, accentColor }: { product: LiteProduct; accentColor: string }) {
    return (
        <Link
            href={`/product/${product.slug}`}
            className="group relative flex flex-col rounded-xl overflow-hidden bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-400"
        >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-black/20">
                <Image
                    src={product.image}
                    alt={product.altText || product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 200px"
                />
                {/* Price badge */}
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-sm font-bold">
                    ${product.price}
                </div>
            </div>
            {/* Info */}
            <div className="p-3">
                <h4 className="text-sm font-semibold text-white/90 line-clamp-2 leading-snug mb-1 group-hover:text-white transition-colors">
                    {product.name}
                </h4>
                <p className="text-xs text-white/40">{product.category}</p>
            </div>
        </Link>
    );
}

/* ── Full-width Mood Section ──────────────────────────────── */
function MoodSection({
    intent,
    products,
    index,
}: {
    intent: IntentConfig;
    products: LiteProduct[];
    index: number;
}) {
    const Icon = ICON_MAP[intent.icon] ?? Leaf;
    const v = MOOD_VISUALS[intent.key];
    const isEven = index % 2 === 0;

    return (
        <section className={`relative overflow-hidden ${v.sectionBg}`}>
            {/* Ambient orbs */}
            <div className={`absolute inset-0 ${v.orb1} pointer-events-none`} />
            <div className={`absolute inset-0 ${v.orb2} pointer-events-none`} />

            {/* Floating particles (CSS only) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-white/10 animate-pulse"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${10 + (i * 17) % 80}%`,
                            animationDelay: `${i * 0.7}s`,
                            animationDuration: `${3 + i * 0.5}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative container mx-auto px-6 py-20 md:py-28">
                <div className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} gap-10 lg:gap-16 items-center`}>

                    {/* Left/Right: Mood Identity Card */}
                    <div className="flex-shrink-0 w-full lg:w-[420px]">
                        <div className={`relative rounded-3xl overflow-hidden p-8 md:p-10 ${v.cardGradient} ${v.glow} border border-white/[0.08] transition-all duration-700`}>
                            {/* Decorative corner accent */}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${v.orb1} rounded-bl-full opacity-60`} />

                            {/* Icon */}
                            <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center mb-6 ${v.iconBg} backdrop-blur-sm`}>
                                <Icon className={`w-10 h-10 md:w-12 md:h-12 ${v.iconColor}`} />
                            </div>

                            {/* Mood label */}
                            <div className={`inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase mb-3 ${v.iconColor}`}>
                                <span>{v.ambient}</span> {intent.key} mood
                            </div>

                            {/* Headline */}
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
                                {v.headline}
                            </h2>

                            {/* Description */}
                            <p className="text-base text-white/55 leading-relaxed mb-6">
                                {v.subtext}
                            </p>

                            {/* Benefits pills */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                {v.benefits.map((b) => (
                                    <span
                                        key={b}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${v.iconBg} ${v.iconColor} border border-white/[0.06]`}
                                    >
                                        {b}
                                    </span>
                                ))}
                            </div>

                            {/* CTA */}
                            <Link
                                href={`/shop?intent=${intent.key}`}
                                className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${v.accent} ${v.accentHover} hover:scale-[1.03] active:scale-[0.98]`}
                            >
                                Shop {intent.label} Products
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Right/Left: Product Grid */}
                    <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-white/80">
                                Top {intent.label} Picks
                            </h3>
                            <Link
                                href={`/shop?intent=${intent.key}`}
                                className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
                            >
                                View all <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {products.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                {products.slice(0, 8).map((p) => (
                                    <MiniProductCard key={p.id} product={p} accentColor={intent.accentColor} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="aspect-square rounded-xl bg-white/[0.03] animate-pulse" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Section divider */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </section>
    );
}

/* ── Quick-Jump Nav ───────────────────────────────────────── */
function MoodNav({ activeKey, onJump }: { activeKey: string | null; onJump: (key: string) => void }) {
    return (
        <nav className="sticky top-16 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
            <div className="container mx-auto px-6">
                <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
                    {INTENTS.map((intent) => {
                        const Icon = ICON_MAP[intent.icon] ?? Leaf;
                        const v = MOOD_VISUALS[intent.key];
                        const isActive = activeKey === intent.key;
                        return (
                            <button
                                key={intent.key}
                                onClick={() => onJump(intent.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                                    isActive
                                        ? `${v.iconBg} ${v.iconColor} ring-1 ring-current`
                                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {intent.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

/* ── Main Page Component ──────────────────────────────────── */
export default function ShopByMoodClient() {
    const [products, setProducts] = useState<LiteProduct[]>([]);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    // Fetch all products once for client-side intent filtering
    useEffect(() => {
        fetch("/api/products/")
            .then((r) => r.json())
            .then((data: LiteProduct[]) => setProducts(data))
            .catch(() => {});
    }, []);

    // Intersection observer for sticky nav highlight
    useEffect(() => {
        const sections = INTENTS.map((i) => document.getElementById(`mood-${i.key}`));
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id.replace("mood-", ""));
                    }
                }
            },
            { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
        );
        sections.forEach((s) => s && observer.observe(s));
        return () => observer.disconnect();
    }, []);

    function jumpTo(key: string) {
        const el = document.getElementById(`mood-${key}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Filter products by intent (client-side)
    function getProductsForMood(key: ShoppingIntent): LiteProduct[] {
        if (!products.length) return [];
        // We need full Product type for filterByIntent, but we have lite products
        // Use a simplified matching approach that mirrors the intent mapping logic
        return products.filter((p) => {
            const type = (p.specs?.type ?? "").toLowerCase();
            const effects = (p.effects ?? []).map((e: string) => e.toLowerCase());
            const text = `${p.name} ${p.shortDescription ?? ""} ${p.category}`.toLowerCase();

            switch (key) {
                case "relax":
                    return type.includes("indica") || effects.includes("relaxed") || effects.includes("calm") ||
                        /relax|calm|chill|mellow|unwind|sooth|tranquil|stress/.test(text);
                case "energize":
                    return type.includes("sativa") || effects.includes("energetic") || effects.includes("uplifted") || effects.includes("creative") ||
                        /energy|energiz|uplift|creative|focus|motivat|active|daytime|euphori/.test(text);
                case "balance":
                    return type.includes("hybrid") || effects.includes("happy") ||
                        /balance|hybrid|versatile|moderate|well-rounded|smooth|functional/.test(text);
                case "sleep":
                    return type.includes("indica") && (effects.includes("sleepy") || effects.includes("sedated") ||
                        /sleep|insomnia|bedtime|nighttime|drowsy|sedat|drift off|knockout|couch-lock/.test(text));
                case "relief":
                    return effects.includes("pain-relief") || effects.includes("therapeutic") ||
                        /pain|relief|therapeutic|inflam|discomfort|sore|ache|muscle|joint|medicin|healing|cbd|topical|tincture/.test(text);
                default:
                    return false;
            }
        }).slice(0, 8);
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* ── Hero Section ─────────────────────────────────── */}
            <section className="relative overflow-hidden bg-[#0a0a0f] pt-28 pb-16 md:pt-32 md:pb-20">
                {/* Hero ambient background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(168,85,247,0.08),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(245,158,11,0.05),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(16,185,129,0.05),transparent_50%)]" />

                <div className="relative container mx-auto px-6 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.04] text-white/50 text-xs font-bold tracking-[0.2em] uppercase mb-8 ring-1 ring-white/[0.08] backdrop-blur-sm">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Intent-Based Shopping
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 leading-[1.05]">
                        How Do You Want{" "}
                        <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                            to Feel?
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-white/45 leading-relaxed max-w-2xl mx-auto mb-12">
                        Forget strain names and THC percentages. Choose your desired experience
                        and we&apos;ll match you with the perfect products from our collection of 360+ items.
                    </p>

                    {/* Quick-jump mood pills in hero */}
                    <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
                        {INTENTS.map((intent) => {
                            const Icon = ICON_MAP[intent.icon] ?? Leaf;
                            const v = MOOD_VISUALS[intent.key];
                            return (
                                <button
                                    key={intent.key}
                                    onClick={() => jumpTo(intent.key)}
                                    className={`group flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all duration-500 hover:scale-[1.05] ${v.cardGradient} ${v.glow} border border-white/[0.08] hover:border-white/[0.15]`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${v.iconBg}`}>
                                        <Icon className={`w-5 h-5 ${v.iconColor}`} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-bold text-white">{intent.label}</div>
                                        <div className="text-xs text-white/40">{intent.tagline}</div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-all duration-300 group-hover:translate-x-1 ml-1" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
            </section>

            {/* ── Sticky Mood Nav ──────────────────────────────── */}
            <MoodNav activeKey={activeSection} onJump={jumpTo} />

            {/* ── Mood Sections (full-width immersive) ─────────── */}
            {INTENTS.map((intent, i) => (
                <div key={intent.key} id={`mood-${intent.key}`}>
                    <MoodSection
                        intent={intent}
                        products={getProductsForMood(intent.key)}
                        index={i}
                    />
                </div>
            ))}

            {/* ── Bottom CTA ──────────────────────────────────── */}
            <section className="relative bg-[#0a0a0f] py-20 md:py-28">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(168,85,247,0.06),transparent_60%)]" />
                <div className="relative container mx-auto px-6 text-center">
                    <Star className="w-8 h-8 text-amber-400/60 mx-auto mb-6" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Not Sure What You&apos;re Looking For?
                    </h2>
                    <p className="text-white/40 mb-8 max-w-lg mx-auto">
                        Browse our full collection of 360+ premium cannabis products.
                        Filter by category, price, potency, or just explore.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold text-sm border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.03]"
                    >
                        Browse Full Collection
                        <ArrowRight className="w-4 h-4" />
                    </Link>

                    <p className="text-xs text-white/20 mt-12 max-w-xl mx-auto leading-relaxed">
                        Products are matched to moods based on strain type, terpene profiles,
                        effects data, and product characteristics. A single product can appear
                        under multiple moods.
                    </p>
                </div>
            </section>
        </div>
    );
}
