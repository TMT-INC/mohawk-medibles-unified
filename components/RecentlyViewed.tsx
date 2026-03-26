"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { useProducts } from "@/hooks/useProducts";

export default function RecentlyViewed() {
    const [slugs, setSlugs] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("mm-recently-viewed");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setSlugs(parsed.slice(0, 12));
                }
            }
        } catch {
            /* ignore */
        }
    }, []);

    // Only fetch when we have slugs to look up
    const { products: fetchedProducts, loading } = useProducts(
        slugs.length > 0 ? { slugs } : undefined
    );

    // Preserve the order from localStorage (most recently viewed first)
    const products = slugs
        .map((slug) => fetchedProducts.find((p) => p.slug === slug))
        .filter(Boolean) as typeof fetchedProducts;

    function scroll(dir: "left" | "right") {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: dir === "left" ? -280 : 280,
            behavior: "smooth",
        });
    }

    if (loading || products.length === 0) return null;

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-forest dark:text-cream">Recently Viewed</h2>
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
                {products.map((p) => (
                    <Link
                        key={p.id}
                        href={`/shop/${p.slug}`}
                        className="w-[220px] flex-shrink-0 snap-start bg-white dark:bg-card rounded-xl border border-border overflow-hidden group hover:shadow-lg transition-all duration-300"
                    >
                        <ProductImage
                            src={p.image}
                            alt={p.altText || p.name}
                            sizes="220px"
                        />
                        <div className="p-3">
                            <h3 className="font-semibold text-sm text-forest dark:text-cream line-clamp-2 group-hover:text-leaf transition-colors mb-1">
                                {p.name}
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-forest dark:text-cream">
                                    ${p.price.toFixed(2)}
                                </span>
                                <span className="text-xs text-lime-600 dark:text-lime-400 font-medium">
                                    View
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
