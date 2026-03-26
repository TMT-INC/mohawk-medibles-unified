"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf, ArrowRight, Sparkles, Moon, Zap, Brain, Smile, Heart, Coffee, Palette, Utensils, Eye, Shield } from "lucide-react";
import { useProducts, type ProductLite } from "@/hooks/useProducts";
import { useLocale } from "@/components/LocaleProvider";

function getShortName(p: { name: string }): string {
    return p.name.length > 25 ? p.name.substring(0, 25) + "..." : p.name;
}

// Curated top sellers — one per core category for visual variety
const TOP_SELLER_SLUGS = [
    "goat-65oz-or-1753oz-canada",                            // Flower
    "dozo-dont-trip-thc-a-trippy-diamond-cartridges-canada", // Cartridges
    "sleebd-calm-cbd-capsules-2",                            // Capsules/CBD
    "straight-goods-3g-disposable-thc-vape-canada",          // Disposables
    "pineapple-express-meds-pem-baby-jeffery-pre-roll-30-pack-canada", // Pre-Rolls
    "zillionaire-shatter-1g-canada",                         // Concentrates
];

// Gradient map by category
const gradientMap: Record<string, string> = {
    Flower: "from-green-900/50 to-charcoal-deep/60",
    Edibles: "from-pink-900/50 to-charcoal-deep/60",
    Concentrates: "from-purple-900/50 to-charcoal-deep/60",
    Vapes: "from-blue-900/50 to-charcoal-deep/60",
    Mushrooms: "from-emerald-900/50 to-charcoal-deep/60",
    CBD: "from-teal-900/50 to-charcoal-deep/60",
    Brands: "from-indigo-900/50 to-charcoal-deep/60",
    Nicotine: "from-slate-800/50 to-charcoal-deep/60",
    Accessories: "from-slate-900/50 to-charcoal-deep/60",
    "Sexual Enhancement": "from-rose-900/50 to-charcoal-deep/60",
    Hash: "from-stone-800/50 to-charcoal-deep/60",
    Wellness: "from-teal-900/50 to-charcoal-deep/60",
    Pets: "from-green-900/50 to-charcoal-deep/60",
    "Bath & Body": "from-cyan-900/50 to-charcoal-deep/60",
    Hookah: "from-slate-700/50 to-charcoal-deep/60",
    Sale: "from-lime/20 to-charcoal-deep/60",
};

/* ─── Feels / Effect Clusters ─── */

interface FeelsCluster {
    effect: string;
    label: string;
    emoji: string;
    icon: typeof Sparkles;
    description: string;
    gradient: string;
    count: number;
}

const FEELS_DATA: Omit<FeelsCluster, "count">[] = [
    { effect: "relaxed", label: "Relaxed", emoji: "🧘", icon: Moon, description: "Wind down & unwind", gradient: "from-indigo-500/20 to-purple-500/10" },
    { effect: "euphoric", label: "Euphoric", emoji: "✨", icon: Sparkles, description: "Elevated mood & bliss", gradient: "from-amber-500/20 to-orange-500/10" },
    { effect: "energetic", label: "Energetic", emoji: "⚡", icon: Zap, description: "Power through your day", gradient: "from-yellow-500/20 to-lime-500/10" },
    { effect: "focused", label: "Focused", emoji: "🎯", icon: Brain, description: "Sharp & productive", gradient: "from-cyan-500/20 to-blue-500/10" },
    { effect: "happy", label: "Happy", emoji: "😊", icon: Smile, description: "Lift your spirits", gradient: "from-pink-500/20 to-rose-500/10" },
    { effect: "pain-relief", label: "Pain Relief", emoji: "💚", icon: Heart, description: "Soothe aches & pains", gradient: "from-emerald-500/20 to-teal-500/10" },
    { effect: "sleepy", label: "Sleepy", emoji: "🌙", icon: Moon, description: "Drift off peacefully", gradient: "from-violet-500/20 to-indigo-500/10" },
    { effect: "creative", label: "Creative", emoji: "🎨", icon: Palette, description: "Unlock inspiration", gradient: "from-fuchsia-500/20 to-pink-500/10" },
    { effect: "calm", label: "Calm", emoji: "🍃", icon: Shield, description: "Peaceful & centered", gradient: "from-teal-500/20 to-green-500/10" },
    { effect: "hungry", label: "Hungry", emoji: "🍽️", icon: Utensils, description: "Appetite boost", gradient: "from-orange-500/20 to-red-500/10" },
    { effect: "uplifted", label: "Uplifted", emoji: "🌤️", icon: Coffee, description: "Bright & motivated", gradient: "from-sky-500/20 to-cyan-500/10" },
    { effect: "introspective", label: "Introspective", emoji: "🔮", icon: Eye, description: "Deep self-reflection", gradient: "from-purple-500/20 to-violet-500/10" },
];

export function BentoGrid() {
    const { t } = useLocale();
    const { products: allProducts, loading } = useProducts();

    // Build grid products from curated slugs
    const gridProducts = useMemo(() => {
        if (allProducts.length === 0) return [];
        const curated = TOP_SELLER_SLUGS
            .map(slug => allProducts.find(p => p.slug === slug))
            .filter(Boolean) as ProductLite[];
        if (curated.length < 4) {
            const rest = allProducts.filter(p => !curated.includes(p)).slice(0, 6 - curated.length);
            return [...curated, ...rest].slice(0, 6);
        }
        return curated.slice(0, 6);
    }, [allProducts]);

    // Compute feels clusters with product counts
    const feelsWithCounts: FeelsCluster[] = useMemo(() => {
        if (allProducts.length === 0) return [];
        return FEELS_DATA.map((f) => ({
            ...f,
            count: allProducts.filter((p) => p.effects?.includes(f.effect)).length,
        })).filter((f) => f.count > 0).sort((a, b) => b.count - a.count);
    }, [allProducts]);

    if (loading && gridProducts.length === 0) {
        return (
            <section className="py-12 text-foreground">
                <div className="container mx-auto px-6">
                    <div className="mb-8 text-center space-y-2">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight font-display">{t("home.theCollection")}</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("home.collectionSubtitle")}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 auto-rows-[420px]">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className="rounded-[2rem] bg-card/50 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 text-foreground">
            <div className="container mx-auto px-6">
                <div className="mb-8 text-center space-y-2">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight font-display">{t("home.theCollection")}</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("home.collectionSubtitle")}</p>
                </div>

                {/* Main Grid: Products (left 2/3) + Feels Sidebar (right 1/3) */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

                    {/* ═══ LEFT: Product Bento Grid ═══ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 auto-rows-[420px]">
                        {gridProducts.slice(0, 4).map((product, i) => (
                            <ProductCard key={product.id} product={product} index={i} t={t} />
                        ))}
                    </div>

                    {/* ═══ RIGHT: Feels Sidebar ═══ */}
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black tracking-tight font-display">Shop by Feels</h3>
                                <p className="text-muted-foreground text-xs">Find your perfect match</p>
                            </div>
                            <Link href="/shop" className="text-xs font-semibold text-lime hover:text-white flex items-center gap-0.5 transition-colors">
                                All <ArrowRight className="w-2.5 h-2.5" />
                            </Link>
                        </div>

                        {/* Feels Grid — 2 columns */}
                        <div className="grid grid-cols-2 gap-2">
                            {feelsWithCounts.slice(0, 12).map((feel, i) => {
                                const Icon = feel.icon;
                                return (
                                    <motion.div
                                        key={feel.effect}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.3, delay: i * 0.04 }}
                                    >
                                        <Link
                                            href={`/shop?effect=${feel.effect}`}
                                            className={`group block p-3 rounded-xl bg-gradient-to-br ${feel.gradient} shadow-sm hover:shadow-md hover:shadow-lime/5 hover:-translate-y-0.5 backdrop-blur-sm transition-all duration-300`}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-foreground/5 dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                    <span className="text-base">{feel.emoji}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-foreground dark:text-white leading-tight truncate group-hover:text-lime transition-colors">
                                                        {feel.label}
                                                    </p>
                                                    <p className="text-[9px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">
                                                        {feel.description}
                                                    </p>
                                                    <p className="text-[8px] text-lime-dark/80 dark:text-lime/60 font-mono mt-1">
                                                        {feel.count} products
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Trust micro-banner */}
                        <div className="rounded-xl bg-gradient-to-br from-lime/10 to-forest/5 dark:from-lime/10 dark:to-lime/5 p-3.5 text-center shadow-sm">
                            <p className="text-xs font-bold text-lime uppercase tracking-wider mb-1">Indigenous Owned & Operated</p>
                            <p className="text-[9px] text-muted-foreground leading-relaxed">
                                Proudly serving Canada from Tyendinaga Mohawk Territory since 2018. Lab-tested. Tax-free. Free shipping over $149.
                            </p>
                        </div>

                        {/* Quick CTA */}
                        <Link
                            href="/shop"
                            className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-forest dark:bg-lime text-white dark:text-charcoal font-bold text-sm shadow-lg shadow-forest/20 dark:shadow-lime/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            Browse All 360+ Products
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─── Product Card (extracted for cleanliness) ─── */

function ProductCard({ product, index, t }: { product: ProductLite; index: number; t: (k: string) => string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="group relative overflow-hidden rounded-[2rem] bg-card shadow-lg hover:shadow-2xl hover:shadow-black/15 dark:hover:shadow-lime/5 hover:-translate-y-1 transition-all duration-500"
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                {product.image && !product.image.includes("placeholder") ? (
                    <>
                        <Image
                            src={product.image}
                            alt={product.altText || `${product.name} — Buy online at Mohawk Medibles, Canada's Indigenous cannabis dispensary`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 dark:opacity-60 group-hover:opacity-90 dark:group-hover:opacity-80"
                            sizes="(max-width: 768px) 100vw, 400px"
                        />
                        <div className="absolute bottom-3 right-3 pointer-events-none z-10">
                            <Image src="/assets/logos/medibles-logo2.png" alt="" width={32} height={32} className="opacity-[0.15] select-none" aria-hidden="true" />
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-950 flex items-center justify-center">
                        <Leaf className="h-20 w-20 text-green-900/30" />
                    </div>
                )}
                <div className={`absolute inset-0 bg-gradient-to-t ${gradientMap[product.category] || "from-zinc-100/80 dark:from-zinc-900/80"} via-black/20 dark:via-transparent to-black/10 dark:to-transparent`} />
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 rounded-full bg-black/30 dark:bg-white/10 backdrop-blur-md text-[10px] font-medium tracking-wider uppercase border border-white/20 dark:border-white/10 text-white">
                        {product.category} &bull; {product.specs?.type}
                    </span>
                    {product.specs?.thc && product.specs.thc !== "TBD" && (
                    <span className="px-2.5 py-1 rounded-full bg-lime/30 dark:bg-lime/20 backdrop-blur-md text-xs font-bold text-lime dark:text-lime border border-lime/30 dark:border-lime/20">
                        {product.specs.thc} THC
                    </span>
                    )}
                </div>

                <div className="space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div>
                        <h3 className="text-2xl font-bold font-heading text-white drop-shadow-md">{getShortName(product)}</h3>
                        <p className="text-white/90 dark:text-white/80 text-sm line-clamp-2 drop-shadow-sm">{product.shortDescription}</p>
                    </div>
                    {product.specs?.terpenes && product.specs.terpenes.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {product.specs.terpenes.map((terp) => (
                                <span key={terp} className="px-2 py-0.5 rounded-full bg-black/20 dark:bg-white/5 text-[10px] text-white/90 dark:text-white/75 border border-white/20 dark:border-white/10">{terp}</span>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pt-2">
                        <span className="text-xl font-bold text-white drop-shadow-md">${(product.price ?? 0).toFixed(2)}</span>
                        <Link href={`/shop/${product.slug}`}>
                            <Button className="rounded-full bg-lime text-charcoal-deep hover:bg-lime-light font-bold text-xs px-4 py-2">{t("home.viewProduct")}</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
