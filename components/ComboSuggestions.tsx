"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Sparkles, Truck, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";

interface SuggestedProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  image: string;
  category: string;
  reason: "freeShipping" | "complementary" | "sameCategory" | "popular";
}

interface SuggestionsResponse {
  suggestions: SuggestedProduct[];
  freeShippingRemaining: number;
}

const FREE_SHIPPING_THRESHOLD = 149;

const REASON_LABELS: Record<string, string> = {
  freeShipping: "Get free shipping",
  complementary: "Goes great with your order",
  sameCategory: "More like what you love",
  popular: "Customer favorite",
};

export function ComboSuggestions() {
  const { items, addItem, total } = useCart();
  const [suggestions, setSuggestions] = useState<SuggestedProduct[]>([]);
  const [freeShippingRemaining, setFreeShippingRemaining] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  // Check session dismissal
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("combo-suggestions-dismissed");
    if (wasDismissed === "true") setDismissed(true);
  }, []);

  // Fetch suggestions when cart changes
  useEffect(() => {
    if (dismissed || items.length === 0) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        // Extract categories from item names (heuristic: category is often in the product data)
        // Since useCart only stores id/name/price/quantity, we fetch categories from the API
        const categorySlugs = extractCategoriesFromItems(items);
        const cartProductIds = items.map((i) => parseInt(i.id) || 0).filter(Boolean);

        const params = new URLSearchParams({
          categorySlugs: JSON.stringify(categorySlugs),
          cartProductIds: JSON.stringify(cartProductIds),
          cartTotal: String(total),
        });

        const res = await fetch(`/api/product-suggestions?${params}`);
        if (res.ok) {
          const data: SuggestionsResponse = await res.json();
          // Filter out products already in cart
          const cartIds = new Set(items.map((i) => parseInt(i.id)));
          const filtered = data.suggestions.filter((s) => !cartIds.has(s.id));
          setSuggestions(filtered.slice(0, 3));
          setFreeShippingRemaining(data.freeShippingRemaining);
        }
      } catch {
        // Silent fail — suggestions are nice-to-have
      }
      setLoading(false);
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [items, total, dismissed]);

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem("combo-suggestions-dismissed", "true");
  }

  function handleAddToCart(product: SuggestedProduct) {
    addItem({
      id: String(product.id),
      name: product.name,
      price: product.salePrice || product.price,
      quantity: 1,
      image: product.image,
    });
    setAddedIds((prev) => new Set(prev).add(product.id));
    // Remove from suggestions after a short delay
    setTimeout(() => {
      setSuggestions((prev) => prev.filter((s) => s.id !== product.id));
    }, 600);
  }

  if (dismissed || suggestions.length === 0 || items.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 rounded-2xl p-5 relative overflow-hidden"
      style={{ boxShadow: "0 4px 24px rgba(251, 146, 60, 0.08)" }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors z-10"
        aria-label="Dismiss suggestions"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-amber-500/10">
          <Sparkles className="h-4 w-4 text-amber-400" />
        </div>
        <h3 className="text-sm font-bold text-amber-400">
          Complete Your Order
        </h3>
        {freeShippingRemaining > 0 && (
          <span className="ml-auto text-xs text-amber-300/80 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            ${(freeShippingRemaining ?? 0).toFixed(2)} from free shipping
          </span>
        )}
      </div>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {suggestions.map((product) => {
            const isAdded = addedIds.has(product.id);
            const displayPrice = product.salePrice || product.price;
            const wouldUnlockFreeShipping =
              total < FREE_SHIPPING_THRESHOLD &&
              total + displayPrice >= FREE_SHIPPING_THRESHOLD;

            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/5 rounded-xl p-3 flex flex-col gap-2 group hover:bg-white/8 transition-colors"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
              >
                {/* Product image */}
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-zinc-900/50 flex-shrink-0">
                  <Image
                    src={product.image || "/placeholder-product.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, 200px"
                  />
                  {wouldUnlockFreeShipping && (
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-green-500 rounded-full text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                      <Truck className="h-2.5 w-2.5" /> Free Ship
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-500 truncate">
                    {REASON_LABELS[product.reason] || "Recommended"}
                  </p>
                  <h4 className="text-sm font-semibold text-white truncate mt-0.5">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-amber-400">
                      ${(displayPrice ?? 0).toFixed(2)}
                    </span>
                    {product.salePrice && product.salePrice < product.price && (
                      <span className="text-xs text-zinc-500 line-through">
                        ${(product.price ?? 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={isAdded}
                  className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    isAdded
                      ? "bg-green-500/20 text-green-400 cursor-default"
                      : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 active:scale-95"
                  }`}
                >
                  {isAdded ? (
                    <>Added!</>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" /> Add to Cart
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────

function extractCategoriesFromItems(
  items: { id: string; name: string }[]
): string[] {
  // Heuristic: try to guess categories from product names
  const categories = new Set<string>();
  const namePatterns: [RegExp, string][] = [
    [/\b(flower|bud|nug|oz|ounce|quarter|half)\b/i, "flower"],
    [/\b(indica)\b/i, "indica"],
    [/\b(sativa)\b/i, "sativa"],
    [/\b(hybrid)\b/i, "hybrid"],
    [/\b(edible|gumm|chocolate|candy|brownie|cookie)\b/i, "edibles"],
    [/\b(vape|cart|cartridge|pen|pod)\b/i, "vape"],
    [/\b(concentrate|shatter|wax|resin|rosin|budder|distillate|diamond)\b/i, "concentrates"],
    [/\b(pre.?roll|joint|blunt)\b/i, "pre-rolls"],
    [/\b(drink|beverage|tea|soda|water)\b/i, "drinks"],
    [/\b(accessori|grinder|paper|pipe|bong|lighter|tray|stash)\b/i, "accessories"],
  ];

  for (const item of items) {
    for (const [pattern, cat] of namePatterns) {
      if (pattern.test(item.name)) {
        categories.add(cat);
      }
    }
  }

  // Fallback: if no category detected, add generic
  if (categories.size === 0) {
    categories.add("flower"); // Most common default
  }

  return Array.from(categories);
}
