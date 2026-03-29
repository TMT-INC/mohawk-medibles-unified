"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import FreeShippingBar from "@/components/FreeShippingBar";
import { CartUpsellNudge } from "@/components/CartUpsellNudge";

function formatPrice(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, total, isOpen, closeCart, itemCount } = useCart();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart();
      }
    },
    [closeCart]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 z-[70] h-full w-full sm:w-[400px] bg-[#1e1e26] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#c8e63e]" />
            <h2 className="text-lg font-bold text-foreground">
              Your Cart ({itemCount})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">Your cart is empty</p>
            <button
              onClick={closeCart}
              className="text-sm font-medium text-[#c8e63e] hover:underline"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* ── Free Shipping Progress ── */}
            <div className="px-5 py-3 border-b border-border">
              <FreeShippingBar />
            </div>

            {/* ── Cart Items (scrollable) ── */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-card rounded-xl p-3 border border-border"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-md bg-white/5 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-foreground tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, Math.min(10, item.quantity + 1))
                          }
                          disabled={item.quantity >= 10}
                          className="w-7 h-7 rounded-md bg-white/5 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-bold text-[#c8e63e]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Upsell Nudge ── */}
            <div className="px-5 py-3 border-t border-border">
              <CartUpsellNudge subtotal={total} />
            </div>

            {/* ── Summary + CTA ── */}
            <div className="px-5 py-4 border-t border-border space-y-3">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-base font-bold text-foreground">
                  {formatPrice(total)}
                </span>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full text-center py-3.5 rounded-xl bg-[#c8e63e] text-[#1e1e26] font-bold text-sm tracking-wide hover:brightness-110 transition-all"
              >
                CHECKOUT &mdash; {formatPrice(total)}
              </Link>

              {/* Continue Shopping */}
              <button
                onClick={closeCart}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
