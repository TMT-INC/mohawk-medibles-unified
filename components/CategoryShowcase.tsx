"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getCategoryRepresentativeProducts } from "@/lib/productData";
import ProductImage from "@/components/ProductImage";
import { useLocale } from "@/components/LocaleProvider";

// Only categories that actually exist in productData with meaningful product counts
const SHOWCASE_CATEGORIES = [
    "Flower",
    "Edibles",
    "Concentrates",
    "Vapes",
    "CBD",
    "Brands",
    "Disposables",
    "Pre-Rolls",
    "Hash",
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
    Flower: "from-green-600/30",
    Edibles: "from-pink-600/30",
    Concentrates: "from-purple-600/30",
    Vapes: "from-blue-600/30",
    CBD: "from-teal-600/30",
    Brands: "from-indigo-600/30",
    Disposables: "from-sky-600/30",
    "Pre-Rolls": "from-amber-600/30",
    Hash: "from-orange-600/30",
};

export function CategoryShowcase() {
    const { t } = useLocale();
    const showcaseData = getCategoryRepresentativeProducts(SHOWCASE_CATEGORIES);
    const scrollRef = useRef<HTMLDivElement>(null);

    if (showcaseData.length === 0) return null;

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: direction === "left" ? -320 : 320,
            behavior: "smooth",
        });
    };

    return (
        <section className="py-12 page-glass text-foreground overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6">
                {/* Compact header with arrows inline */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display">
                            {t("home.shopByCategory")}
                        </h2>
                        <p className="text-muted-foreground text-xs md:text-sm mt-1">
                            {t("home.categorySubtitle")}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            className="w-8 h-8 rounded-full border border-border hover:border-lime/40 hover:bg-lime/10 flex items-center justify-center transition-all"
                            aria-label="Scroll categories left"
                        >
                            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="w-8 h-8 rounded-full border border-border hover:border-lime/40 hover:bg-lime/10 flex items-center justify-center transition-all"
                            aria-label="Scroll categories right"
                        >
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Horizontal scroll — compact cards */}
                <div className="relative">
                    <div
                        ref={scrollRef}
                        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        {showcaseData.map(({ category, product, count }, i) => (
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className="flex-shrink-0 snap-start"
                            >
                                <Link
                                    href={`/shop?category=${encodeURIComponent(category)}`}
                                    className="group block relative overflow-hidden rounded-xl bg-foreground/5 dark:bg-white/5 border border-border hover:border-lime/30 transition-all duration-300 w-[160px] md:w-[200px]"
                                >
                                    {/* Product Image — compact square */}
                                    <div className="relative aspect-square overflow-hidden">
                                        <ProductImage
                                            src={product.image}
                                            alt={`${category} — ${product.altText || product.name}`}
                                            variant="bento"
                                            sizes="200px"
                                        />
                                        <div className={`absolute inset-0 bg-gradient-to-t ${CATEGORY_GRADIENT[category] || "from-green-600/30"} to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none`} />
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                                    </div>

                                    {/* Label overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-3">
                                        <h3 className="text-sm md:text-base font-bold font-heading text-foreground dark:text-white leading-tight">{category}</h3>
                                        <p className="text-[10px] text-muted-foreground line-clamp-1">{CATEGORY_TAGLINES[category]}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[9px] text-lime/70 font-mono">{count} items</span>
                                            <ArrowRight className="h-3 w-3 text-lime/50 group-hover:text-lime group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </div>

                                    {/* Price badge */}
                                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-lime/15 backdrop-blur-sm text-[9px] font-bold text-lime border border-lime/20">
                                        From ${product.price.toFixed(0)}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}

                        {/* View All at end */}
                        <div className="flex-shrink-0 snap-start">
                            <Link
                                href="/shop"
                                className="group flex flex-col items-center justify-center w-[160px] md:w-[200px] aspect-square rounded-xl border border-dashed border-border hover:border-lime/30 bg-foreground/3 dark:bg-white/3 hover:bg-lime/5 transition-all"
                            >
                                <div className="w-10 h-10 rounded-full bg-lime/10 group-hover:bg-lime/20 flex items-center justify-center mb-2 transition-colors">
                                    <ArrowRight className="w-5 h-5 text-lime" />
                                </div>
                                <span className="text-foreground dark:text-white font-bold text-sm">{t("home.viewAllProducts")}</span>
                                <span className="text-muted-foreground/60 text-[10px]">{t("home.productsCount")}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
