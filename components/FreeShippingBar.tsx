"use client";

import { useCart } from "@/hooks/useCart";
import { Truck } from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 149;

export default function FreeShippingBar() {
    const { total } = useCart();

    if (total <= 0) return null;

    const remaining = FREE_SHIPPING_THRESHOLD - total;
    const progress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const qualified = remaining <= 0;

    return (
        <div className="w-full bg-lime/10 dark:bg-forest-light/50 backdrop-blur-sm border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
                <Truck className={`h-4 w-4 ${qualified ? "text-secondary" : "text-muted-foreground"}`} />
                {qualified ? (
                    <span className="text-sm font-medium text-secondary">
                        You qualify for FREE shipping!
                    </span>
                ) : (
                    <span className="text-sm text-foreground/70 dark:text-cream/70">
                        Add <span className="font-bold text-foreground dark:text-white">${(remaining ?? 0).toFixed(2)}</span> more for free shipping
                    </span>
                )}
            </div>
            <div className="w-full bg-foreground/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${
                        qualified
                            ? "bg-secondary"
                            : "bg-gradient-to-r from-cream/40 to-secondary/70"
                    }`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground/60">${(total ?? 0).toFixed(2)}</span>
                <span className="text-[10px] text-muted-foreground/60">${FREE_SHIPPING_THRESHOLD}</span>
            </div>
        </div>
    );
}
