"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Flame, Sparkles, ShoppingCart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import CountdownTimer from "@/components/CountdownTimer";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/hooks/useCart";

interface ProductInfo {
  name: string;
  image: string;
  slug: string;
  altText: string;
  category: string;
}

export default function DealsClient() {
  const { data: deals, isLoading } = trpc.dailyDeals.getActive.useQuery(
    undefined,
    { refetchInterval: 30000 }
  );

  const [products, setProducts] = useState<Record<string, ProductInfo>>({});
  const { addItem } = useCart();

  // Fetch product info for each deal
  useEffect(() => {
    if (!deals || deals.length === 0) return;

    const slugs = deals.map((d) => d.productSlug);
    const unique = [...new Set(slugs)];

    unique.forEach((slug) => {
      if (products[slug]) return;
      fetch(`/api/products/${slug}`)
        .then((r) => r.json())
        .then((p) => {
          if (p && p.name) {
            setProducts((prev) => ({
              ...prev,
              [slug]: {
                name: p.name,
                image: p.image || "/placeholder.webp",
                slug: p.slug,
                altText: p.altText || p.name,
                category: p.category || "",
              },
            }));
          }
        })
        .catch(() => {});
    });
  }, [deals]);

  function handleAddToCart(deal: NonNullable<typeof deals>[0]) {
    const prod = products[deal.productSlug];
    if (!prod) return;
    addItem({
      id: deal.productSlug,
      name: prod.name,
      price: deal.dealPrice,
      quantity: 1,
      image: prod.image,
    });
  }

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="h-10 w-10 border-4 border-forest/30 border-t-forest rounded-full animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Loading daily deals...</p>
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-border bg-gradient-to-b from-card/80 to-card/30">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <Tag className="h-10 w-10 text-amber-500" />
        </div>
        <h3 className="text-2xl font-bold mb-2">New Deals Drop Daily</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Our deal rotation picks a new product every morning at 5 AM. Check back tomorrow for fresh savings on premium cannabis.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/shop?sort=price-asc">
            <Button variant="brand" className="rounded-full">
              Browse Sale Items
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" className="rounded-full">
              Shop All Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {deals.map((deal) => {
        const prod = products[deal.productSlug];

        return (
          <div
            key={deal.id}
            className="relative rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <div className="grid md:grid-cols-[280px_1fr] gap-0">
              {/* Product Image */}
              <div className="relative aspect-square md:aspect-auto md:min-h-[220px] bg-muted overflow-hidden">
                {prod ? (
                  <Link href={`/product/${prod.slug}`}>
                    <Image
                      src={prod.image}
                      alt={prod.altText}
                      fill
                      sizes="(max-width: 768px) 100vw, 280px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="h-8 w-8 border-3 border-forest/30 border-t-forest rounded-full animate-spin" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    -{deal.savingsPercent}%
                  </span>
                  {deal.isEndingSoon && (
                    <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Ending Soon!
                    </span>
                  )}
                  {deal.isNew && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> New!
                    </span>
                  )}
                </div>
              </div>

              {/* Deal Info */}
              <div className="p-6 flex flex-col justify-center">
                {prod && (
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {prod.category}
                  </p>
                )}

                <h3 className="text-xl font-bold text-foreground mb-1">
                  {deal.title}
                </h3>
                {deal.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {deal.description}
                  </p>
                )}

                {/* Pricing */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-black text-forest dark:text-lime">
                    ${deal.dealPrice.toFixed(2)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    ${deal.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-red-500">
                    Save ${(deal.originalPrice - deal.dealPrice).toFixed(2)}
                  </span>
                </div>

                {/* Countdown */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Time remaining:
                  </p>
                  <CountdownTimer endDate={deal.endDate} size="sm" />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAddToCart(deal)}
                    className="bg-forest hover:bg-forest/90 text-white dark:bg-lime dark:text-charcoal-deep dark:hover:bg-lime/90 font-bold rounded-full"
                    disabled={!prod}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  {prod && (
                    <Link href={`/product/${prod.slug}`}>
                      <Button
                        variant="outline"
                        className="rounded-full border-forest/30 dark:border-lime/30"
                      >
                        View Product
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Featured indicator */}
            {deal.featured && (
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-orange-500 to-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-6 py-1 rotate-45 translate-x-6 translate-y-3 shadow">
                Featured
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
