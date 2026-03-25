"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Flame, ShoppingCart, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import CountdownTimer from "@/components/CountdownTimer";
import { useCart } from "@/hooks/useCart";

interface DealData {
  title: string;
  description?: string;
  productSlug: string;
  dealPrice: number;
  originalPrice: number;
  savingsPercent: number;
  endDate: string;
}

export default function DealOfTheDay() {
  const [deal, setDeal] = useState<DealData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [product, setProduct] = useState<{
    name: string;
    image: string;
    slug: string;
    altText: string;
  } | null>(null);

  const { addItem } = useCart();

  // Fetch the featured deal via API (no tRPC dependency)
  useEffect(() => {
    fetch("/api/trpc/dailyDeals.getFeatured?input={}")
      .then((r) => r.json())
      .then((res) => {
        // tRPC with superjson wraps data as result.data.json
        const data = res?.result?.data?.json ?? res?.result?.data;
        if (data && data.dealPrice != null) setDeal(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch the product data for the deal
  useEffect(() => {
    if (!deal?.productSlug) return;
    fetch(`/api/products/${deal.productSlug}`)
      .then((r) => r.json())
      .then((p) => {
        if (p && p.name) {
          setProduct({
            name: p.name,
            image: p.image || "/placeholder.webp",
            slug: p.slug,
            altText: p.altText || p.name,
          });
        }
      })
      .catch(() => {});
  }, [deal?.productSlug]);

  if (isLoading || !deal || deal.dealPrice == null || deal.originalPrice == null) return null;

  const savings = deal.originalPrice - deal.dealPrice;

  function handleAddToCart() {
    if (!product) return;
    addItem({
      id: deal!.productSlug,
      name: product.name,
      price: deal!.dealPrice,
      quantity: 1,
      image: product.image,
    });
  }

  return (
    <section className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Animated gradient border wrapper */}
        <div className="relative rounded-3xl p-[2px] overflow-hidden">
          {/* Animated gradient border — now with working keyframes */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 animate-gradient-shift" />

          {/* Inner content */}
          <div className="relative rounded-3xl bg-card overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Product Image Side */}
              <div className="relative aspect-square md:aspect-auto min-h-[320px] overflow-hidden bg-muted group">
                {product ? (
                  <Image
                    src={product.image}
                    alt={product.altText}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 border-4 border-forest/30 border-t-forest rounded-full animate-spin" />
                  </div>
                )}

                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Savings badge — larger, pulsing */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-500 text-white px-5 py-2 rounded-full text-sm font-extrabold shadow-lg shadow-red-500/30 animate-glow-pulse" style={{ '--tw-shadow-color': 'rgba(239,68,68,0.3)' } as React.CSSProperties}>
                  <Zap className="w-3.5 h-3.5" />
                  Save ${(savings ?? 0).toFixed(2)}
                </div>

                {/* Deal of the Day badge */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/10">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  DEAL OF THE DAY
                </div>

                {/* Percent badge — bottom left */}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-2xl border border-white/10">
                  <span className="text-3xl font-black text-red-400">{deal.savingsPercent}%</span>
                  <span className="text-xs text-white/60 block -mt-1">OFF</span>
                </div>
              </div>

              {/* Info Side */}
              <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-400" />
                  </span>
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-bold text-orange-400 uppercase tracking-wider">
                    Today Only
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 leading-tight">
                  {deal.title}
                </h2>

                {deal.description && (
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-2 leading-relaxed">
                    {deal.description}
                  </p>
                )}

                {/* Pricing — bigger, bolder */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-5xl md:text-6xl font-black text-forest dark:text-lime leading-none">
                    ${(deal.dealPrice ?? 0).toFixed(2)}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-lg text-muted-foreground line-through decoration-2">
                      ${(deal.originalPrice ?? 0).toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full w-fit mt-0.5">
                      -{deal.savingsPercent}%
                    </span>
                  </div>
                </div>

                {/* Countdown */}
                <div className="mb-8 p-4 rounded-2xl bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-orange-500" />
                    Ends in
                  </p>
                  <CountdownTimer endDate={deal.endDate} size="md" />
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    className="flex-1 bg-forest hover:bg-forest/90 text-white dark:bg-lime dark:text-charcoal-deep dark:hover:bg-lime/90 font-bold rounded-full text-base py-6 shadow-lg shadow-forest/20 dark:shadow-lime/20 hover:shadow-xl hover:shadow-forest/30 dark:hover:shadow-lime/30 transition-all duration-300 hover:scale-[1.02] active:scale-100"
                    disabled={!product}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Grab This Deal
                  </Button>
                  {product && (
                    <Link href={`/product/${product.slug}`}>
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full border-forest/30 text-forest dark:border-lime/30 dark:text-lime py-6 hover:bg-forest/5 dark:hover:bg-lime/5 transition-all duration-300"
                      >
                        View Details
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
