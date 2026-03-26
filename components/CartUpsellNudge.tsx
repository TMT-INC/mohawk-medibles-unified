"use client";

import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";

interface CartUpsellNudgeProps {
  subtotal: number;
}

const FREE_SHIPPING_THRESHOLD = 149;

function formatPrice(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function CartUpsellNudge({ subtotal }: CartUpsellNudgeProps) {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  if (remaining <= 0) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-400">
              FREE Shipping Unlocked!
            </p>
            <p className="text-xs text-muted-foreground">
              Your order qualifies for free shipping anywhere in Canada.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-lime-400" />
          Add {formatPrice(remaining)} more for FREE shipping!
        </p>
        <span className="text-xs text-lime-400 font-bold">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-lime-500 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
        </p>
        <Link
          href="/shop"
          className="text-xs text-lime-400 font-bold hover:text-lime-300 transition-colors"
        >
          Keep Shopping &rarr;
        </Link>
      </div>

      {/* Suggested categories when close to threshold */}
      {remaining > 0 && remaining < 80 && (
        <div className="mt-3 pt-3 border-t border-primary/10">
          <p className="text-xs text-muted-foreground mb-2">Popular add-ons:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/shop?category=edibles", label: "Edibles" },
              { href: "/shop?category=pre-rolls", label: "Pre-Rolls" },
              { href: "/shop?category=accessories", label: "Accessories" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-card border border-border rounded-full text-muted-foreground hover:text-lime-400 hover:border-lime-500/30 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
