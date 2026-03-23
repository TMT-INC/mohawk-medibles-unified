"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductImage from "@/components/ProductImage";
import { PRODUCTS, getShortName } from "@/lib/productData";
import { useCart } from "@/hooks/useCart";

const NEW_ARRIVALS = [...PRODUCTS]
    .sort((a, b) => b.id - a.id)
    .slice(0, 8);

export default function NewArrivals() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { addItem } = useCart();

    function scroll(dir: "left" | "right") {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: dir === "left" ? -280 : 280,
            behavior: "smooth",
        });
    }

    function handleQuickAdd(p: (typeof NEW_ARRIVALS)[0]) {
        addItem({ id: String(p.id), name: p.name, price: p.price, quantity: 1 });
    }

    if (NEW_ARRIVALS.length === 0) return null;

    return (
        <section className="py-16 bg-cream/50 dark:bg-card/30">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-forest dark:text-cream flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-lime-500" />
                            New Arrivals
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Fresh drops — just added to the collection
                        </p>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => scroll("left")}
                            className="p-2 rounded-lg bg-white dark:bg-card border border-border hover:bg-muted transition-colors"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="p-2 rounded-lg bg-white dark:bg-card border border-border hover:bg-muted transition-colors"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {NEW_ARRIVALS.map((p) => (
                        <div
                            key={p.id}
                            className="w-[260px] flex-shrink-0 snap-start bg-white dark:bg-card rounded-xl border border-border overflow-hidden group hover:shadow-lg transition-all duration-300"
                        >
                            <Link href={`/shop/${p.slug}`}>
                                <div className="relative">
                                    <ProductImage
                                        src={p.image}
                                        alt={p.altText || p.name}
                                        sizes="260px"
                                    />
                                    <div className="absolute top-2 left-2 z-20 bg-lime-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        New
                                    </div>
                                </div>
                            </Link>
                            <div className="p-3">
                                <div className="text-xs text-muted-foreground mb-1">
                                    {p.category} {p.specs.thc !== "TBD" && `\u2022 ${p.specs.thc} THC`}
                                </div>
                                <Link href={`/shop/${p.slug}`}>
                                    <h3 className="font-semibold text-sm text-forest dark:text-cream line-clamp-2 hover:text-leaf transition-colors mb-2">
                                        {getShortName(p)}
                                    </h3>
                                </Link>
                                {p.specs.terpenes.length > 0 && (
                                    <div className="flex gap-1 flex-wrap mb-2">
                                        {p.specs.terpenes.slice(0, 2).map((t) => (
                                            <span key={t} className="px-1.5 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-[9px] text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-forest dark:text-cream">
                                        ${p.price.toFixed(2)}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1 text-xs h-7"
                                        onClick={(e) => { e.preventDefault(); handleQuickAdd(p); }}
                                    >
                                        <ShoppingCart className="h-3 w-3" /> Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
