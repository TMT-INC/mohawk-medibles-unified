"use client";

import { useRef, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import ProductImage from "@/components/ProductImage";

/* ─── Brand Definitions ─── */

interface Brand {
    name: string;
    slug: string;
    search: string;
    tagline: string;
    accent: string;
    accentRgb: string; // for glow effects
}

const BRANDS: Brand[] = [
    { name: "Drizzle Factory", slug: "drizzle-factory", search: "drizzle factory", tagline: "Premium Concentrates & Vapes", accent: "from-violet-500/40", accentRgb: "139,92,246" },
    { name: "Plant of Life", slug: "plant-of-life", search: "plant of life", tagline: "Organic CBD Wellness", accent: "from-emerald-500/40", accentRgb: "16,185,129" },
    { name: "AKI Wellness", slug: "aki", search: "aki", tagline: "Indigenous Crafted CBD", accent: "from-amber-500/40", accentRgb: "245,158,11" },
    { name: "Stellar", slug: "stellar", search: "stellar", tagline: "Gourmet THC Edibles", accent: "from-pink-500/40", accentRgb: "236,72,153" },
    { name: "Euphoria Extractions", slug: "euphoria-extractions", search: "euphoria extractions", tagline: "Shatter Bars & Chews", accent: "from-orange-500/40", accentRgb: "249,115,22" },
    { name: "Euphoria Psychedelics", slug: "euphoria-psychedelics", search: "euphoria psychedelics", tagline: "Psilocybin Microdose", accent: "from-fuchsia-500/40", accentRgb: "217,70,239" },
    { name: "Wesley Tea Co.", slug: "wesley-tea", search: "wesley tea", tagline: "CBD-Infused Teas", accent: "from-lime-500/40", accentRgb: "132,204,22" },
    { name: "Cactus Labs", slug: "cactus-labs", search: "cactus labs", tagline: "D9 THC Gummies", accent: "from-green-500/40", accentRgb: "34,197,94" },
    { name: "Burn", slug: "burn", search: "burn", tagline: "Live Resin Disposables", accent: "from-red-500/40", accentRgb: "239,68,68" },
    { name: "Diamond Concentrates", slug: "diamond-concentrates", search: "diamond concentrates", tagline: "Disposable THC Vapes", accent: "from-cyan-500/40", accentRgb: "6,182,212" },
    { name: "Geek Bar", slug: "geek-bar", search: "geek", tagline: "Premium Nicotine Vapes", accent: "from-blue-500/40", accentRgb: "59,130,246" },
    { name: "Fungara", slug: "fungara", search: "fungara", tagline: "Nicotine Pod Systems", accent: "from-teal-500/40", accentRgb: "20,184,166" },
    { name: "Zoomz", slug: "zoomz", search: "zoomz", tagline: "THC Infused Snacks", accent: "from-yellow-500/40", accentRgb: "234,179,8" },
    { name: "ASEND", slug: "asend", search: "asend", tagline: "Live Resin Vape Pens", accent: "from-indigo-500/40", accentRgb: "99,102,241" },
    { name: "Backwoods", slug: "backwoods", search: "backwoods", tagline: "Classic Cigars", accent: "from-stone-500/40", accentRgb: "120,113,108" },
    { name: "Al Fakher", slug: "al-fakher", search: "al fakher", tagline: "Hookah & Crown Bar", accent: "from-rose-500/40", accentRgb: "244,63,94" },
];

type ViewMode = "carousel" | "grid-3" | "grid-all";

/* ─── Brand Card (shared between carousel & grid) ─── */

function BrandCard({ brand, index, compact }: {
    brand: { name: string; slug: string; tagline: string; accent: string; accentRgb: string; count: number; image: string };
    index: number;
    compact?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: index * 0.03 }}
        >
            <Link
                href={`/shop?category=Brands&brand=${encodeURIComponent(brand.name)}`}
                className="group block relative overflow-hidden rounded-2xl border border-border/60 hover:border-lime/40 transition-all duration-300 bg-foreground/[0.02] dark:bg-white/[0.02] hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-lime/5"
            >
                {/* Image */}
                <div className={`relative overflow-hidden bg-foreground/5 dark:bg-white/5 ${compact ? "aspect-[4/3]" : "aspect-square"}`}>
                    <ProductImage
                        src={brand.image}
                        alt={`${brand.name} — ${brand.tagline} | Mohawk Medibles`}
                        variant="bento"
                        sizes={compact ? "160px" : "200px"}
                    />
                    {/* Brand accent glow */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: `radial-gradient(circle at 50% 100%, rgba(${brand.accentRgb},0.25) 0%, transparent 60%)` }}
                    />
                    {/* Bottom gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                    {/* Brand monogram */}
                    <div className="absolute top-2.5 left-2.5 w-9 h-9 rounded-xl bg-white/90 dark:bg-charcoal/90 backdrop-blur-md flex items-center justify-center border border-white/30 dark:border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xs font-black text-forest dark:text-lime leading-none">
                            {brand.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                        </span>
                    </div>

                    {/* Product count pill */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-[9px] font-bold text-white/90 tabular-nums">
                        {brand.count} items
                    </div>
                </div>

                {/* Label area */}
                <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-white leading-tight truncate drop-shadow-md group-hover:text-lime transition-colors duration-300">
                                {brand.name}
                            </h3>
                            <p className="text-[10px] text-white/60 truncate mt-0.5">
                                {brand.tagline}
                            </p>
                        </div>
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-lime/15 backdrop-blur-sm flex items-center justify-center border border-lime/20 group-hover:bg-lime/30 group-hover:scale-110 transition-all duration-300">
                            <ArrowRight className="w-3.5 h-3.5 text-lime group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

/* ─── Main Component ─── */

export function BrandShowcase() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("carousel");
    const { products: allProducts, loading } = useProducts();

    const brandData = useMemo(() => {
        if (allProducts.length === 0) return [];
        return BRANDS.map((brand) => {
            const products = allProducts.filter((p) =>
                p.name.toLowerCase().includes(brand.search)
            );
            const representative = products.find((p) => p.image) || products[0];
            return {
                ...brand,
                count: products.length,
                image: representative?.image || "",
            };
        }).filter((b) => b.count > 0);
    }, [allProducts]);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: direction === "left" ? -300 : 300,
            behavior: "smooth",
        });
    };

    const cycleView = () => {
        setViewMode((prev) => {
            if (prev === "carousel") return "grid-3";
            if (prev === "grid-3") return "grid-all";
            return "carousel";
        });
    };

    const totalProducts = brandData.reduce((a, b) => a + b.count, 0);

    if (loading || brandData.length === 0) return null;

    // For grid-3 mode, show 3 rows x responsive columns (roughly 12-15 brands)
    const grid3Brands = brandData.slice(0, 12);

    return (
        <section className="py-12 page-glass text-foreground overflow-hidden relative">
            {/* Ambient glow accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-lime/[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-forest/[0.04] dark:bg-lime/[0.02] rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display">
                                Shop by Brand
                            </h2>
                            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-lime/10 border border-lime/20 text-[10px] font-bold text-lime uppercase tracking-wider">
                                {brandData.length} Brands
                            </span>
                        </div>
                        <p className="text-muted-foreground text-xs md:text-sm">
                            {totalProducts}+ products from Canada&apos;s top cannabis brands
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Scroll arrows — only in carousel mode */}
                        {viewMode === "carousel" && (
                            <>
                                <button
                                    onClick={() => scroll("left")}
                                    className="w-8 h-8 rounded-full border border-border hover:border-lime/40 hover:bg-lime/10 flex items-center justify-center transition-all"
                                    aria-label="Scroll brands left"
                                >
                                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <button
                                    onClick={() => scroll("right")}
                                    className="w-8 h-8 rounded-full border border-border hover:border-lime/40 hover:bg-lime/10 flex items-center justify-center transition-all"
                                    aria-label="Scroll brands right"
                                >
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </>
                        )}
                        {/* Expand / Collapse toggle */}
                        <button
                            onClick={cycleView}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:border-lime/40 hover:bg-lime/10 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                            aria-label={viewMode === "grid-all" ? "Collapse brands" : "Expand brands"}
                        >
                            {viewMode === "carousel" && (
                                <>
                                    <span className="hidden sm:inline">Show More</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </>
                            )}
                            {viewMode === "grid-3" && (
                                <>
                                    <span className="hidden sm:inline">Show All</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </>
                            )}
                            {viewMode === "grid-all" && (
                                <>
                                    <span className="hidden sm:inline">Collapse</span>
                                    <ChevronUp className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* ═══ View: Carousel (default) ═══ */}
                <AnimatePresence mode="wait">
                    {viewMode === "carousel" && (
                        <motion.div
                            key="carousel"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div
                                ref={scrollRef}
                                className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                {brandData.map((brand, i) => (
                                    <div key={brand.slug} className="flex-shrink-0 snap-start w-[155px] md:w-[190px]">
                                        <BrandCard brand={brand} index={i} />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ View: 3-Row Grid ═══ */}
                    {viewMode === "grid-3" && (
                        <motion.div
                            key="grid-3"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                        >
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                {grid3Brands.map((brand, i) => (
                                    <BrandCard key={brand.slug} brand={brand} index={i} compact />
                                ))}
                            </div>
                            {brandData.length > 12 && (
                                <p className="text-center text-muted-foreground/50 text-xs mt-3">
                                    +{brandData.length - 12} more brands
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* ═══ View: Full Grid (All Brands) ═══ */}
                    {viewMode === "grid-all" && (
                        <motion.div
                            key="grid-all"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                        >
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                {brandData.map((brand, i) => (
                                    <BrandCard key={brand.slug} brand={brand} index={i} compact />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
