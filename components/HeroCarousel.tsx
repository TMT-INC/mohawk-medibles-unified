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
      "Proudly Indigenous-owned & operated on Tyendinaga Mohawk Territory since 2019. 360+ lab-tested products shipped discreetly Canada-wide. Tax-free. Free shipping over $199.",
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
      {/* ═══ Background Images — all preloaded, CSS opacity crossfade ═══ */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 z-0 transition-opacity duration-[1400ms] ease-in-out ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <div className={`absolute inset-[-8%] transition-transform duration-[8000ms] ease-out ${i === current ? "scale-105" : "scale-100"}`}>
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

      {/* Dark gradient overlays — cinematic vignette */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep/95 via-charcoal/65 to-charcoal/30 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/90 via-transparent to-charcoal/20 z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)] z-10" />

      {/* ═══ Slide Content — CSS transition ═══ */}
      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full">
          <div className="max-w-2xl space-y-3 sm:space-y-5">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime/10 border border-lime/25 text-lime text-[11px] font-bold tracking-[0.2em] uppercase backdrop-blur-md shadow-[0_0_20px_rgba(200,230,62,0.15),inset_0_1px_0_rgba(200,230,62,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse shadow-[0_0_10px_#C8E63E,0_0_20px_rgba(200,230,62,0.3)]" />
              {slide.badge}
            </span>

            {/* Headline */}
            {current === 0 ? (
              <h1
                className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white font-display leading-[0.9]"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 8px 32px rgba(0,0,0,0.5), 0 0 80px rgba(0,0,0,0.3)" }}
              >
                {slide.headline}
                <br />
                <span className="text-lime drop-shadow-[0_0_24px_rgba(200,230,62,0.4)]">{slide.highlight}</span>
              </h1>
            ) : (
              <h2
                className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white font-display leading-[0.9]"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 8px 32px rgba(0,0,0,0.5), 0 0 80px rgba(0,0,0,0.3)" }}
              >
                {slide.headline}
                <br />
                <span className="text-lime drop-shadow-[0_0_24px_rgba(200,230,62,0.4)]">{slide.highlight}</span>
              </h2>
            )}

            {/* Description */}
            <p
              className="text-sm sm:text-base md:text-xl text-white/85 max-w-lg leading-relaxed line-clamp-3 sm:line-clamp-none"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.3)" }}
            >
              {slide.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2 sm:pt-4">
              <Link href={slide.cta.href}>
                <Button
                  size="lg"
                  className="group rounded-full text-sm sm:text-base md:text-lg h-11 sm:h-12 md:h-14 px-6 sm:px-8 md:px-10 bg-lime hover:bg-lime-light text-charcoal-deep font-bold hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 shadow-[0_0_30px_rgba(200,230,62,0.4)] hover:shadow-[0_0_50px_rgba(200,230,62,0.6),0_0_80px_rgba(200,230,62,0.2)] border-none w-full sm:w-auto"
                >
                  {slide.cta.label}
                  <span className="ml-1.5 inline-block transition-transform duration-300 group-hover:translate-x-0.5">&rarr;</span>
                </Button>
              </Link>
              <Link href={slide.ctaSecondary.href}>
                <Button
                  size="lg"
                  className="rounded-full text-sm sm:text-base md:text-lg h-11 sm:h-12 md:h-14 px-6 sm:px-8 md:px-10 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] font-semibold w-full sm:w-auto transition-all duration-300"
                >
                  {slide.ctaSecondary.label}
                </Button>
              </Link>
            </div>
          </div>

          {/* Micro trust badges */}
          <div className="absolute bottom-24 sm:bottom-20 left-4 sm:left-6 md:left-12 flex flex-wrap items-center gap-3 sm:gap-5 md:gap-6 text-white/40 text-[10px] sm:text-[11px] tracking-[0.18em] uppercase font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-lime/70" /> Lab Tested
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-lime/70" /> Free Shipping $199+
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-lime/70" /> Same Day Delivery
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-lime/70" /> Tax Free
            </span>
          </div>
        </div>
      </div>

      {/* ═══ Tab Navigation ═══ */}
      <div className="absolute bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 bg-charcoal-deep/50 backdrop-blur-xl rounded-full px-1.5 py-1 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {TAB_LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); resetTimer(); }}
            className={`relative px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide transition-all duration-300 ${
              i === current
                ? "bg-lime text-charcoal-deep shadow-[0_0_16px_rgba(200,230,62,0.5),0_2px_8px_rgba(0,0,0,0.3)]"
                : "text-white/50 hover:text-white/90 hover:bg-white/[0.08]"
            }`}
            aria-label={`View ${label} slide`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); resetTimer(); }}
            className="py-3 px-0.5 cursor-pointer group"
            aria-label={`Go to slide ${i + 1}`}
          >
            <span className={`block h-[3px] rounded-full transition-all duration-500 ease-out ${
              i === current
                ? "w-8 sm:w-10 bg-lime shadow-[0_0_12px_rgba(200,230,62,0.7)]"
                : "w-3 sm:w-4 bg-white/25 group-hover:bg-white/50 group-hover:w-5"
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
