"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Gift, ArrowRight, Copy, Check } from "lucide-react";

const COUPON_CODE = "DONTLEAVE10";

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasTriggered = useRef(false);

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (e.clientY <= 5 && !hasTriggered.current && !dismissed) {
        const alreadyShown = sessionStorage.getItem("exitIntentShown");
        if (alreadyShown) return;

        hasTriggered.current = true;
        sessionStorage.setItem("exitIntentShown", "true");
        setShow(true);
      }
    },
    [dismissed]
  );

  useEffect(() => {
    // Skip on touch devices (mobile)
    if ("ontouchstart" in window) return;
    if (sessionStorage.getItem("exitIntentShown")) return;

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [handleMouseLeave]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(COUPON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Discount offer"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleDismiss}
    >
      <div
        className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-2xl shadow-primary/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-primary via-lime to-primary" />

        <div className="p-8 text-center">
          {/* Gift icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/30">
            <Gift className="h-8 w-8 text-primary" />
          </div>

          {/* Headline */}
          <h2 className="mb-2 text-2xl font-black tracking-tight text-foreground">
            Wait!
          </h2>
          <p className="mb-1 text-lg font-bold text-primary">
            Get 10% Off Your Order
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            We don&apos;t want you to leave empty-handed. Here&apos;s an
            exclusive code:
          </p>

          {/* Coupon code */}
          <button
            onClick={handleCopyCode}
            aria-label="Copy coupon code DONTLEAVE10"
            className="group mx-auto mb-6 flex w-fit cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 px-6 py-3 transition-all hover:border-primary hover:bg-primary/10"
          >
            <span className="font-mono text-2xl font-black tracking-widest text-primary">
              {COUPON_CODE}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors group-hover:text-primary">
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Click to copy
                </>
              )}
            </span>
          </button>

          {/* CTA */}
          <a
            href="/shop"
            onClick={handleDismiss}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-bold text-primary-foreground transition-all hover:bg-primary/80 hover:shadow-lg hover:shadow-primary/20"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </a>

          <p className="mt-4 text-xs text-muted-foreground">
            Free shipping on orders over $149 &bull; Valid for 24 hours
          </p>
        </div>
      </div>
    </div>
  );
}
