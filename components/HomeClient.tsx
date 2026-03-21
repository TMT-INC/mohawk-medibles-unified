"use client";

import { useState, useEffect } from "react";
import SmokeCursor from "@/components/canvas/SmokeCursor";

// ─── Hero Carousel — .cc multi-slide with .ca photography ───
import { HeroCarousel } from "@/components/HeroCarousel";

// ─── Existing Vercel Components (kept) ───────────────────
import { BentoGrid } from "@/components/BentoGrid";

// ─── New Blended Components (.cc + .ca + Conversion Psychology) ───
import { DealTicker } from "@/components/DealTicker";
import { EffectFilter } from "@/components/EffectFilter";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { TrustPillars } from "@/components/TrustPillars";
import { DealsSection } from "@/components/DealsSection";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { StickyMobileNav } from "@/components/StickyMobileNav";
import { CategoryBrandShowcase } from "@/components/CategoryBrandShowcase";
import { PageSmokeEffect } from "@/components/PageSmokeEffect";

// ─── .cc Design Elements (Ian's preferred) ───
import { BenefitsBar } from "@/components/BenefitsBar";
import { MonthlyDeals } from "@/components/MonthlyDeals";
import { HowItWorks } from "@/components/HowItWorks";
import { CustomerTestimonials } from "@/components/CustomerTestimonials";

export default function HomeClient() {
  // Only enable smoke cursor on non-touch devices
  const [hasMouse, setHasMouse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setHasMouse(mq.matches);
    const handler = (e: MediaQueryListEvent) => setHasMouse(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Page-level ambient smoke/haze — drifts behind all sections */}
      <PageSmokeEffect />

      {/* Smoke Cursor Effect — joint + smoke trail + click puff */}
      <SmokeCursor enabled={hasMouse} />

      {/* ═══════════════════════════════════════════════════════════
          HERO CAROUSEL — .cc 4-slide rotating banners + .ca photography
          Conversion: Anchoring ($5/G), Visual Hierarchy, Cognitive Ease
          Auto-advances every 6s, pause on hover, crossfade transitions
          ═══════════════════════════════════════════════════════════ */}
      <HeroCarousel />

      {/* ═══════════════════════════════════════════════════════════
          BENEFITS BAR — .cc 5-column trust signals
          Free Shipping, Discreet Packaging, Indigenous Owned, Delivery, Since 2018
          ═══════════════════════════════════════════════════════════ */}
      <BenefitsBar />

      {/* ═══════════════════════════════════════════════════════════
          DEAL TICKER — .cc scrolling marquee with live deals
          Conversion: Scarcity, Urgency, Loss Aversion
          ═══════════════════════════════════════════════════════════ */}
      <DealTicker />

      {/* ═══════════════════════════════════════════════════════════
          SOCIAL PROOF STRIP — Stats bar
          Conversion: Social Proof, Authority, Commitment
          ═══════════════════════════════════════════════════════════ */}
      <SocialProofStrip />

      {/* ═══════════════════════════════════════════════════════════
          EFFECT-BASED FILTER — "What are you looking for?"
          Conversion: Cognitive Ease, Fogg Model (simplify action)
          ═══════════════════════════════════════════════════════════ */}
      <EffectFilter />

      {/* ═══════════════════════════════════════════════════════════
          CATEGORY + BRAND SHOWCASE — Unified section with Mohawk
          Territory tile pattern. Category carousel + auto-scrolling
          Brand carousel with expand to 3-row / full grid.
          Conversion: Authority, Brand Trust, Product Discovery
          ═══════════════════════════════════════════════════════════ */}
      <CategoryBrandShowcase />

      {/* ═══════════════════════════════════════════════════════════
          MONTHLY DEALS — .cc gradient deal cards (green/amber/purple)
          Conversion: Anchoring, Category Entry Points
          ═══════════════════════════════════════════════════════════ */}
      <MonthlyDeals />

      {/* ═══════════════════════════════════════════════════════════
          DEALS SECTION — Bento deals with countdown + anchor pricing
          Conversion: Anchoring, Scarcity (countdown), Loss Aversion
          ═══════════════════════════════════════════════════════════ */}
      <DealsSection />

      {/* ═══════════════════════════════════════════════════════════
          FEATURED PRODUCTS — Bento Grid (kept from Vercel)
          ═══════════════════════════════════════════════════════════ */}
      <BentoGrid />

      {/* ═══════════════════════════════════════════════════════════
          TRUST PILLARS — Why choose Mohawk Medibles
          Conversion: Authority, Reciprocity, Risk Reversal
          ═══════════════════════════════════════════════════════════ */}
      <TrustPillars />

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — .cc 3-step process (Browse → Pay → Deliver)
          Conversion: Cognitive Ease, Friction Reduction
          ═══════════════════════════════════════════════════════════ */}
      <HowItWorks />

      {/* ═══════════════════════════════════════════════════════════
          CUSTOMER TESTIMONIALS — .cc review cards with avatars
          Conversion: Social Proof, Trust
          ═══════════════════════════════════════════════════════════ */}
      <CustomerTestimonials />

      {/* ═══════════════════════════════════════════════════════════
          REVIEW CAROUSEL — Social proof scrolling reviews
          Conversion: Social Proof, Commitment/Consistency
          ═══════════════════════════════════════════════════════════ */}
      <ReviewCarousel />

      {/* ═══════════════════════════════════════════════════════════
          STICKY MOBILE NAV — Bottom bar for mobile (md:hidden)
          Conversion: Fogg Model (reduce friction on mobile)
          ═══════════════════════════════════════════════════════════ */}
      <StickyMobileNav />
    </div>
  );
}
