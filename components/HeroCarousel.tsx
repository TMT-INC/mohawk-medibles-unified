"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/* ─── Slide Data ─── */
const SLIDES = [
  {
    id: 0,
    bg: "/assets/hero/hero-deals-ounces.webp",
    alt: "Mohawk Medibles $40 ounce deal — premium cannabis ounces starting at $40 or 3 for $100, while supplies last at Indigenous-owned dispensary on Tyendinaga Mohawk Territory",
    badge: "WHILE SUPPLIES LAST",
    headline: "$40 OUNCES",
    highlight: "OR 3 FOR $100",
    description:
      "Unbeatable deals on premium ounces — $40 each or grab 3 for $100. Lab-tested, tax-free, shipped discreetly from Tyendinaga Mohawk Territory. These deals sell out FAST.",
    cta: { label: "Shop Ounce Deals", href: "/shop?category=flower&sort=price-asc" },
    ctaSecondary: { label: "All Deals", href: "/deals" },
  },
  {
    id: 1,
    bg: "/assets/hero/hero-flower-premium.webp",
    alt: "Premium AAAA+ cannabis flower hand-trimmed at Mohawk Medibles dispensary on Tyendinaga Mohawk Territory — lab-tested organic living soil grown buds available for delivery across Canada",
    badge: "MOST POPULAR",
    headline: "PREMIUM FLOWER",
    highlight: "STARTING AT $5/G",
    description:
      "Hand-trimmed, lab-tested AAAA+ cannabis grown in organic living soil. From $5 grams to premium ounces — proudly Indigenous-owned on Tyendinaga Mohawk Territory.",
    cta: { label: "Shop Flower", href: "/shop?category=flower" },
    ctaSecondary: { label: "View Deals", href: "/deals" },
  },
  {
    id: 2,
    bg: "/assets/hero/hero-edibles-gummies.webp",
    alt: "Stellar Edibles strawberry kiwi THC gummies — precisely dosed cannabis edibles from Mohawk Medibles, Indigenous-owned dispensary shipping lab-tested edibles across Canada from Tyendinaga Mohawk Territory",
    badge: "HOT DEALS",
    headline: "EDIBLES & GUMMIES",
    highlight: "FROM $10",
    description:
      "Precisely dosed edibles from 10mg to 2000mg THC. Gummies, chocolates, capsules & drinks from trusted brands like Stellar, Drizzle Factory & Euphoria.",
    cta: { label: "Shop Edibles", href: "/shop?category=edibles" },
    ctaSecondary: { label: "Best Sellers", href: "/shop?sort=popular" },
  },
  {
    id: 3,
    bg: "/assets/hero/hero-concentrates-hash.webp",
    alt: "Tequila Sunrise premium hash concentrate 75-80% THC — artisan cannabis concentrates available at Mohawk Medibles on Tyendinaga Mohawk Territory, lab-tested shatter wax and live resin shipped Canada-wide",
    badge: "PREMIUM GRADE",
    headline: "CONCENTRATES",
    highlight: "SHATTER \u2022 WAX \u2022 HASH",
    description:
      "Lab-tested concentrates up to 90% THC. Full melt hash, live resin, diamonds & shatter — crafted by top extractors and delivered tax-free from Six Nations.",
    cta: { label: "Shop Concentrates", href: "/shop?category=concentrates" },
    ctaSecondary: { label: "New Arrivals", href: "/shop?sort=newest" },
  },
  {
    id: 4,
    bg: "/assets/hero/hero-territory-heritage.webp",
    alt: "Mohawk Medibles Indigenous-owned cannabis dispensary — Tyendinaga Mohawk Territory heritage, Haudenosaunee culture, premium vape cartridges and disposables shipped discreetly across Canada",
    badge: "INDIGENOUS HERITAGE",
    headline: "MOHAWK TERRITORY",
    highlight: "TYENDINAGA \u2022 EST. 2019",
    description:
      "Proudly Indigenous-owned & operated on Tyendinaga Mohawk Territory since 2019. 344+ lab-tested products shipped discreetly Canada-wide. Tax-free. Free shipping over $199.",
    cta: { label: "Shop All Products", href: "/shop" },
    ctaSecondary: { label: "Our Story", href: "/about" },
  },
];

const TAB_LABELS = ["Deals", "Flower", "Edibles", "Concentrates", "Heritage"];
const INTERVAL = 6000;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStart = useRef(0);

  const next = useCallback(() => setCurrent((p) => (p + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length), []);
  const goTo = useCallback((i: number) => setCurrent(i), []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, next, current]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused) timerRef.current = setInterval(next, INTERVAL);
  }, [isPaused, next]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative h-dvh min-h-[560px] max-h-[900px] w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const diff = touchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); resetTimer(); }
      }}
      itemScope
      itemType="https://schema.org/ImageGallery"
    >
      {/* ═══ Background Images — all preloaded, CSS opacity transition ═══ */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 z-0 transition-opacity duration-1000 ease-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <div className="absolute inset-[-8%]">
            <Image
              src={s.bg}
              alt={s.alt}
              fill
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              quality={75}
              itemProp={i === current ? "image" : undefined}
            />
          </div>
        </div>
      ))}

      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep/95 via-charcoal/70 to-charcoal/40 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/80 via-transparent to-charcoal/30 z-10" />

      {/* ═══ Slide Content — CSS transition ═══ */}
      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full">
          <div className="max-w-2xl space-y-3 sm:space-y-5">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/15 border border-lime/30 text-lime text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse shadow-[0_0_8px_#C8E63E]" />
              {slide.badge}
            </span>

            {/* Headline */}
            {current === 0 ? (
              <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white font-display leading-[0.9] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                {slide.headline}
                <br />
                <span className="text-lime">{slide.highlight}</span>
              </h1>
            ) : (
              <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white font-display leading-[0.9] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                {slide.headline}
                <br />
                <span className="text-lime">{slide.highlight}</span>
              </h2>
            )}

            {/* Description */}
            <p className="text-sm sm:text-base md:text-xl text-white/80 max-w-lg leading-relaxed line-clamp-3 sm:line-clamp-none">
              {slide.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2 sm:pt-4">
              <Button
                asChild
                size="lg"
                className="rounded-full text-sm sm:text-base md:text-lg h-11 sm:h-12 md:h-14 px-6 sm:px-8 md:px-10 bg-lime hover:bg-lime-light text-charcoal-deep font-bold hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(200,230,62,0.4)] border-none w-full sm:w-auto"
              >
                <Link href={slide.cta.href}>
                  {slide.cta.label}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="rounded-full text-sm sm:text-base md:text-lg h-11 sm:h-12 md:h-14 px-6 sm:px-8 md:px-10 bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/25 font-semibold w-full sm:w-auto"
              >
                <Link href={slide.ctaSecondary.href}>
                  {slide.ctaSecondary.label}
                </Link>
              </Button>
            </div>
          </div>

          {/* Micro trust badges */}
          <div className="absolute bottom-24 sm:bottom-20 left-4 sm:left-6 md:left-12 flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-white/50 text-[10px] sm:text-xs tracking-widest uppercase">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime" /> Lab Tested
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime" /> Free Shipping $199+
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime" /> Same Day Delivery
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime" /> Tax Free
            </span>
          </div>
        </div>
      </div>

      {/* ═══ Tab Navigation ═══ */}
      <div className="absolute bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-charcoal-deep/60 backdrop-blur-md rounded-full px-1.5 py-1 border border-white/10">
        {TAB_LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); resetTimer(); }}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide transition-all duration-300 ${
              i === current
                ? "bg-lime text-charcoal-deep shadow-[0_0_12px_rgba(200,230,62,0.4)]"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
            aria-label={`View ${label} slide`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); resetTimer(); }}
            className="py-3 px-1 cursor-pointer"
            aria-label={`Go to slide ${i + 1}`}
          >
            <span className={`block h-1.5 rounded-full transition-all duration-500 ${
              i === current
                ? "w-8 sm:w-10 bg-lime shadow-[0_0_10px_rgba(200,230,62,0.6)]"
                : "w-4 sm:w-5 bg-white/30 hover:bg-white/50"
            }`} />
          </button>
        ))}
      </div>

      {/* Progress bar — pure CSS animation */}
      {!isPaused && (
        <div
          key={`progress-${current}`}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime/60 origin-left z-30 animate-progress"
          style={{ animationDuration: `${INTERVAL}ms` }}
        />
      )}
    </section>
  );
}
