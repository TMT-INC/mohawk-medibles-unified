"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Flame, ShoppingCart, Sparkles } from "lucide-react";
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
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 animate-gradient-shift" />

          {/* Inner content */}
          <div className="relative rounded-3xl bg-card overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Product Image Side */}
              <div className="relative aspect-square md:aspect-auto min-h-[300px] overflow-hidden bg-muted">
                {product ? (
                  <Image
                    src={product.image}
                    alt={product.altText}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 border-4 border-forest/30 border-t-forest rounded-full animate-spin" />
                  </div>
                )}

                {/* Savings badge */}
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  Save ${savings.toFixed(2)}
                </div>

                {/* Deal of the Day badge */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  DEAL OF THE DAY
                </div>
              </div>

              {/* Info Side */}
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-orange-400" />
                  <span className="text-sm font-bold text-orange-400 uppercase tracking-wider">
                    Today Only
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {deal.title}
                </h2>

                {deal.description && (
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
                    {deal.description}
                  </p>
                )}

                {/* Pricing */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl md:text-5xl font-black text-forest dark:text-lime">
                    ${deal.dealPrice.toFixed(2)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    ${deal.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                    -{deal.savingsPercent}%
                  </span>
                </div>

                {/* Countdown */}
                <div className="mb-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Ends in
                  </p>
                  <CountdownTimer endDate={deal.endDate} size="md" />
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    className="flex-1 bg-forest hover:bg-forest/90 text-white dark:bg-lime dark:text-charcoal-deep dark:hover:bg-lime/90 font-bold rounded-full"
                    disabled={!product}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Grab This Deal
                  </Button>
                  {product && (
                    <Link href={`/product/${product.slug}`}>
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full border-forest/30 text-forest dark:border-lime/30 dark:text-lime"
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
