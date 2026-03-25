"use client";

import Link from "next/link";
import { Leaf, ArrowRight } from "lucide-react";
import { PRODUCTS, getShortName } from "@/lib/productData";
import { isTerritoryGrown } from "@/lib/territoryGrown";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

export default function TerritoryGrownSection() {
  const { addItem } = useCart();

  // Get territory-grown products, limit to 6
  const territoryProducts = PRODUCTS.filter((p) => isTerritoryGrown(p)).slice(0, 6);

  // Don't render if no qualifying products
  if (territoryProducts.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/10 dark:via-[#0f0f18] dark:to-[#0f0f18] relative overflow-hidden">
      {/* Subtle territorial pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.03]" aria-hidden="true"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23b45309' stroke-width='0.5'%3E%3Cpath d='M30 0L45 15L30 30L15 15Z'/%3E%3Cpath d='M0 30L15 15L30 30L15 45Z'/%3E%3Cpath d='M30 30L45 15L60 30L45 45Z'/%3E%3Cpath d='M30 30L45 45L30 60L15 45Z'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: "60px 60px" }}
      />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-700/15 to-amber-600/10 dark:from-amber-600/20 dark:to-amber-500/10 flex items-center justify-center shadow-sm">
                <Leaf className="h-4.5 w-4.5 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-700 dark:text-amber-400">
                  From Our Territory
                </span>
                <span className="hidden sm:inline-block w-8 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-forest dark:text-cream tracking-tight">
              Tyendinaga Territory Grown
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg leading-relaxed">
              Proudly cultivated on Mohawk Territory. Supporting Indigenous sovereignty through cannabis.
            </p>
          </div>
          <Link
            href="/territory-grown"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 px-4 py-2 rounded-lg bg-amber-700/5 dark:bg-amber-500/10 hover:bg-amber-700/10 dark:hover:bg-amber-500/15 shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            View All Territory Grown
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {territoryProducts.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="group bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-amber-900/10 dark:hover:shadow-amber-500/5 hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <div className="transition-transform duration-500 group-hover:scale-105">
                <ProductImage
                  src={product.image}
                  alt={product.altText || product.name}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                >
                  <div className="absolute top-2 left-2 z-20">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-700 to-amber-600 text-white px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wide uppercase shadow-lg shadow-amber-900/20">
                      <Leaf className="h-2.5 w-2.5" />
                      Territory
                    </span>
                  </div>
                </ProductImage>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                  {product.category}
                </p>
                <h3 className="font-bold text-sm text-forest dark:text-cream line-clamp-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  {getShortName(product)}
                </h3>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mt-1.5 tracking-tight">
                  ${(product.price ?? 0).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
