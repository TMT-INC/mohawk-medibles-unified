"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { getCategoryRepresentativeProducts, PRODUCTS } from "@/lib/productData";
import ProductImage from "@/components/ProductImage";
import { useLocale } from "@/components/LocaleProvider";

/* ══════════════════════════════════════════════════════════════════
   Mohawk Territory Tile Pattern — Haudenosaunee-inspired geometric
   SVG: interlocking diamonds + Tree of Peace center dots
   ══════════════════════════════════════════════════════════════════ */

const MOHAWK_TILE_SVG = `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='currentColor' stroke-width='0.5'%3E%3Cpath d='M40 0L60 20L40 40L20 20Z'/%3E%3Cpath d='M0 40L20 20L40 40L20 60Z'/%3E%3Cpath d='M40 40L60 20L80 40L60 60Z'/%3E%3Cpath d='M40 40L60 60L40 80L20 60Z'/%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3Ccircle cx='0' cy='0' r='2'/%3E%3Ccircle cx='80' cy='0' r='2'/%3E%3Ccircle cx='0' cy='80' r='2'/%3E%3Ccircle cx='80' cy='80' r='2'/%3E%3Cline x1='38' y1='40' x2='42' y2='40'/%3E%3Cline x1='40' y1='38' x2='40' y2='42'/%3E%3C/g%3E%3C/svg%3E")`;

/* ─── Category Data ─── */

const SHOWCASE_CATEGORIES = [
    "Flower", "Edibles", "Concentrates", "Vapes",
    "CBD", "Brands", "Disposables", "Pre-Rolls", "Hash",
];

const CATEGORY_TAGLINES: Record<string, string> = {
    Flower: "Premium AAAA craft strains",
    Edibles: "Gummies, chocolates & more",
    Concentrates: "Shatter, wax & live resin",
    Vapes: "Potent cartridges & pens",
    CBD: "Wellness oils & topicals",
    Brands: "Top Canadian brands",
    Disposables: "Ready-to-use pens",
    "Pre-Rolls": "Rolled & ready to go",
    Hash: "Premium imported & domestic",
};

const CATEGORY_GRADIENT: Record<string, string> = {
    Flower: "from-green-600/30", Edibles: "from-pink-600/30",
    Concentrates: "from-purple-600/30", Vapes: "from-blue-600/30",
    CBD: "from-teal-600/30", Brands: "from-indigo-600/30",
    Disposables: "from-sky-600/30", "Pre-Rolls": "from-amber-600/30",
    Hash: "from-orange-600/30",
};

/* ─── Brand Data ─── */

interface BrandDef {
    name: string; slug: string; search: string;
    tagline: string; accent: string; accentRgb: string;
}

const BRANDS: BrandDef[] = [
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

/* ─── Brand Card ─── */

function BrandCard({ brand, compact }: {
    brand: BrandDef & { count: number; image: string };
    compact?: boolean;
}) {
    return (
        <Link
            href={`/shop?category=Brands&brand=${encodeURIComponent(brand.name)}`}
            className="group block relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-lime/5 hover:-translate-y-1 transition-all duration-300 bg-foreground/[0.02] dark:bg-white/[0.02]"
        >
            <div className={`relative overflow-hidden bg-foreground/5 dark:bg-white/5 ${compact ? "aspect-[4/3]" : "aspect-square"}`}>
                <ProductImage src={brand.image} alt={`${brand.name} — ${brand.tagline} | Mohawk Medibles`} variant="bento" sizes={compact ? "160px" : "170px"} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 100%, rgba(${brand.accentRgb},0.25) 0%, transparent 60%)` }} />
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
                <div className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-white/90 dark:bg-charcoal/90 backdrop-blur-md flex items-center justify-center border border-white/30 dark:border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-[10px] font-black text-forest dark:text-lime leading-none">{brand.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
                </div>
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-[8px] font-bold text-white/90 tabular-nums">{brand.count}</div>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-2.5">
                <div className="flex items-end justify-between gap-1">
                    <div className="min-w-0">
                        <h3 className="text-xs font-bold text-white leading-tight truncate drop-shadow-md group-hover:text-lime transition-colors duration-300">{brand.name}</h3>
                        <p className="text-[9px] text-white/55 truncate">{brand.tagline}</p>
                    </div>
                    <ArrowRight className="w-3 h-3 flex-shrink-0 text-lime/40 group-hover:text-lime group-hover:translate-x-0.5 transition-all" />
                </div>
            </div>
        </Link>
    );
}

/* ══════════════════════════════════════════════════════════════════
   Infinite Marquee — CSS animation, duplicated children for seamless loop
   ══════════════════════════════════════════════════════════════════ */

function InfiniteMarquee({ children, speed = 40, className = "" }: {
    children: React.ReactNode;
    speed?: number;
    className?: string;
}) {
    return (
        <div className={`overflow-hidden relative group/marquee ${className}`}>
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            <div
                className="flex gap-3 w-max animate-marquee-scroll group-hover/marquee:[animation-play-state:paused]"
                style={{ animationDuration: `${speed}s` }}
            >
                {children}
                {/* Duplicate for seamless loop */}
                {children}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export function CategoryBrandShowcase() {
    const { t } = useLocale();
    const [brandView, setBrandView] = useState<ViewMode>("carousel");

    const showcaseData = getCategoryRepresentativeProducts(SHOWCASE_CATEGORIES);

    const brandData = useMemo(() => {
        return BRANDS.map((brand) => {
            const products = PRODUCTS.filter((p) => p.name.toLowerCase().includes(brand.search));
            const representative = products.find((p) => p.image) || products[0];
            return { ...brand, count: products.length, image: representative?.image || "" };
        }).filter((b) => b.count > 0);
    }, []);

    const totalBrandProducts = brandData.reduce((a, b) => a + b.count, 0);

    const cycleBrandView = () => {
        setBrandView((prev) => {
            if (prev === "carousel") return "grid-3";
            if (prev === "grid-3") return "grid-all";
            return "carousel";
        });
    };

    if (showcaseData.length === 0) return null;

    return (
        <section className="py-10 text-foreground overflow-hidden relative" aria-label="Shop by Category and Brand">
            {/* Mohawk Territory Tile Pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.05]"
                style={{ backgroundImage: MOHAWK_TILE_SVG, backgroundSize: "80px 80px", color: "currentColor" }}
                aria-hidden="true"
            />
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-lime/[0.02] dark:bg-lime/[0.03] rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[250px] bg-forest/[0.03] dark:bg-lime/[0.02] rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* ═══ CATEGORY MARQUEE ═══ */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display">{t("home.shopByCategory")}</h2>
                            <p className="text-muted-foreground text-xs md:text-sm mt-0.5">{t("home.categorySubtitle")}</p>
                        </div>
                        <Link href="/shop" className="flex items-center gap-1 text-xs font-semibold text-lime-dark dark:text-lime hover:text-lime-light transition-colors">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <InfiniteMarquee speed={45}>
                        {showcaseData.map(({ category, product, count }) => (
                            <Link
                                key={category}
                                href={`/shop?category=${encodeURIComponent(category)}`}
                                className="group block relative overflow-hidden rounded-xl bg-foreground/5 dark:bg-white/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-[150px] md:w-[180px] flex-shrink-0"
                            >
                                <div className="relative aspect-square overflow-hidden">
                                    <ProductImage src={product.image} alt={`Shop ${category} cannabis products online Canada — ${product.altText || product.name} | Mohawk Medibles`} variant="bento" sizes="180px" />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${CATEGORY_GRADIENT[category] || "from-green-600/30"} to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none`} />
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-2.5">
                                    <h3 className="text-sm font-bold font-heading text-white leading-tight drop-shadow-md">{category}</h3>
                                    <p className="text-[9px] text-white/70 line-clamp-1">{CATEGORY_TAGLINES[category]}</p>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <span className="text-[8px] text-lime-light/80 font-mono">{count} items</span>
                                        <ArrowRight className="h-3 w-3 text-lime/50 group-hover:text-lime group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-lime/20 backdrop-blur-md text-[8px] font-bold text-lime-light shadow-sm">
                                    From ${(product.price ?? 0).toFixed(0)}
                                </div>
                            </Link>
                        ))}
                    </InfiniteMarquee>
                </div>

                {/* Mohawk diamond divider */}
                <div className="flex items-center gap-3 mb-5" aria-hidden="true">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    <div className="w-3 h-3 rotate-45 border border-lime/30 bg-lime/5" />
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>

                {/* ═══ BRAND SECTION ═══ */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display">Shop by Brand</h2>
                                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-lime/10 border border-lime/20 text-[9px] font-bold text-lime uppercase tracking-wider">{brandData.length} Brands</span>
                            </div>
                            <p className="text-muted-foreground text-xs md:text-sm mt-0.5">{totalBrandProducts}+ products from Canada&apos;s top cannabis brands</p>
                        </div>
                        <button
                            onClick={cycleBrandView}
                            aria-label={brandView === "carousel" ? "Show more brands" : brandView === "grid-3" ? "Show all brands" : "Show less brands"}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md bg-white/80 dark:bg-white/5 hover:bg-lime/10 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-all duration-200"
                        >
                            {brandView === "carousel" && <>More<ChevronDown className="w-3 h-3" /></>}
                            {brandView === "grid-3" && <>All<ChevronDown className="w-3 h-3" /></>}
                            {brandView === "grid-all" && <>Less<ChevronUp className="w-3 h-3" /></>}
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Infinite marquee carousel */}
                        {brandView === "carousel" && (
                            <motion.div key="bc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                <InfiniteMarquee speed={50}>
                                    {brandData.map((brand) => (
                                        <div key={brand.slug} className="w-[135px] md:w-[165px] flex-shrink-0">
                                            <BrandCard brand={brand} />
                                        </div>
                                    ))}
                                </InfiniteMarquee>
                            </motion.div>
                        )}

                        {/* 3-row grid */}
                        {brandView === "grid-3" && (
                            <motion.div key="bg3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                                    {brandData.slice(0, 12).map((brand) => <BrandCard key={brand.slug} brand={brand} compact />)}
                                </div>
                                {brandData.length > 12 && <p className="text-center text-muted-foreground/40 text-[10px] mt-2">+{brandData.length - 12} more</p>}
                            </motion.div>
                        )}

                        {/* Full grid */}
                        {brandView === "grid-all" && (
                            <motion.div key="bga" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                                    {brandData.map((brand) => <BrandCard key={brand.slug} brand={brand} compact />)}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
