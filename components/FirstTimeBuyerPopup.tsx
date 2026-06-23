"use client";

import { useState, useEffect } from "react";
import { X, Gift, Copy, Check, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiClient";

const STORAGE_KEY = "mohawk_ftb_dismissed";
const COUPON_CODE = "WELCOME15";

export function FirstTimeBuyerPopup() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (window.location.pathname.startsWith("/admin")) return;

    // Show immediately — delay is handled by LazyWidgets stagger system
    setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(COUPON_CODE);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setPending(true);
    try {
      await apiFetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "first_time_popup" }),
      });
    } catch {
      // Silent fail — still show success
    }
    setPending(false);
    setSubmitted(true);
    toast.success("Thanks! Check your inbox for exclusive deals.");
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={dismiss}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        role="dialog"
        aria-label="First time buyer offer"
        aria-modal="true"
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top gradient banner */}
        <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-black p-8 pb-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(202,248,128,0.15)_0%,_transparent_60%)] pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Gift className="w-3.5 h-3.5" />
              Special Offer
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
              15% OFF
            </h2>
            <p className="text-primary font-bold text-lg">
              Your First Order!
            </p>
          </div>
          <Sparkles className="absolute top-6 left-6 w-5 h-5 text-primary/40 animate-pulse" />
          <Sparkles
            className="absolute bottom-8 right-8 w-4 h-4 text-primary/30 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        {/* Content */}
        <div className="bg-card p-6 -mt-4 rounded-t-3xl relative">
          {!submitted ? (
            <>
              {/* Coupon code box */}
              <div className="mb-5">
                <p className="text-muted-foreground text-xs text-center mb-3">
                  Use this code at checkout:
                </p>
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-primary/10 border-2 border-dashed border-primary/40 hover:border-primary/60 transition-colors group"
                >
                  <span className="text-primary font-black text-xl tracking-[0.15em]">
                    {COUPON_CODE}
                  </span>
                  <span className="flex items-center gap-1.5 text-primary text-xs font-bold">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Copy
                      </>
                    )}
                  </span>
                </button>
              </div>

              {/* Email signup */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-muted-foreground text-xs text-center">
                  Sign up for exclusive deals &amp; updates:
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    aria-label="Email address"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    Join
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Skip link */}
              <button
                onClick={dismiss}
                className="w-full text-center text-muted-foreground text-xs mt-4 hover:text-foreground transition-colors"
              >
                No thanks, I&apos;ll pay full price
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-foreground font-bold text-lg mb-2">
                Welcome to the Family!
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Use code {COUPON_CODE} for 15% off your first order.
              </p>
              <button
                onClick={dismiss}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Start Shopping
                <ArrowRight className="w-3.5 h-3.5 inline ml-1.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
