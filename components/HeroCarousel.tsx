"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SmokeEffect } from "@/components/SmokeEffect";

/* ─── Ken Burns animation classes — each slide gets a unique motion ─── */
const kenBurnsClasses = [
  "animate-ken-burns-pan-right",   // Slide 1 (Deal): pan right for urgency
  "animate-ken-burns-zoom-in",     // Slide 2: slow zoom in
  "animate-ken-burns-pan-right",   // Slide 3: pan left to right
  "animate-ken-burns-zoom-out",    // Slide 4: slow zoom out with drift
  "animate-ken-burns-pan-left",    // Slide 5: pan right to left
] as const;

/* ─── E-E-A-T Optimized Slide Data ─── */
const SLIDES = [
  {
    id: 0,
    bg: "/assets/hero/hero-deals-ounces.webp",
    alt: "Mohawk Medibles $40 ounce deal — premium cannabis ounces starting at $40 or 3 for $100, while supplies last at Indigenous-owned dispensary on Tyendinaga Mohawk Territory",
    badge: "🔥 WHILE SUPPLIES LAST",
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
    highlight: "SHATTER • WAX • HASH",
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
    highlight: "TYENDINAGA • EST. 2019",
    description:
      "Proudly Indigenous-owned & operated on Tyendinaga Mohawk Territory since 2019. 344+ lab-tested products shipped discreetly Canada-wide. Tax-free. Free shipping over $199.",
    cta: { label: "Shop All Products", href: "/shop" },
    ctaSecondary: { label: "Our Story", href: "/about" },
  },
];

const INTERVAL = 6000;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(mq.matches);
    const handler = (e: MediaQueryListEvent) => setCanHover(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, next]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused) {
      timerRef.current = setInterval(next, INTERVAL);
    }
  }, [isPaused, next]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const threshold = 50;
      if (info.offset.x < -threshold) {
        next();
        resetTimer();
      } else if (info.offset.x > threshold) {
        prev();
        resetTimer();
      }
    },
    [next, prev, resetTimer]
  );

  const slide = SLIDES[current];

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
  };

  return (
    <section
      className="relative h-dvh min-h-[560px] max-h-[900px] w-full overflow-hidden grain-overlay"
      onMouseEnter={canHover ? () => setIsPaused(true) : undefined}
      onMouseLeave={canHover ? () => setIsPaused(false) : undefined}
      itemScope
      itemType="https://schema.org/ImageGallery"
    >
      {/* ═══ SSR-safe first slide — paints instantly before JS hydration ═══ */}
      {current === 0 && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-[-8%]">
            <Image
              src={SLIDES[0].bg}
              alt={SLIDES[0].alt}
              fill
              priority
              fetchPriority="high"
              className="object-cover"
              sizes="100vw"
              quality={85}
              itemProp="image"
            />
          </div>
        </div>
      )}

      {/* ═══ Background Image with Ken Burns Motion ═══ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          {/* Ken Burns animated wrapper — scale(1.15) base ensures no edge gaps during pan */}
          <div className={`absolute inset-[-8%] ${kenBurnsClasses[current]}`}>
            <Image
              src={slide.bg}
              alt={slide.alt}
              fill
              priority={current === 0}
              className="object-cover"
              sizes="100vw"
              quality={85}
            />
          </div>

          {/* Haudenosaunee diamond tile pattern overlay — cultural heritage E-E-A-T signal */}
          {current === 3 && (
            <div
              className="absolute inset-0 z-[1] pointer-events-none opacity-[0.06]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5 L45 30 L30 55 L15 30Z' fill='none' stroke='%23C8E63E' stroke-width='1'/%3E%3Ccircle cx='30' cy='30' r='2' fill='%23C8E63E' opacity='0.5'/%3E%3C/svg%3E")`,
                backgroundSize: "60px 60px",
              }}
              aria-hidden="true"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ═══ Mohawk Medibles Watermark — every slide ═══ */}
      <div
        className="absolute z-[12] pointer-events-none select-none"
        aria-hidden="true"
        style={{
          bottom: "5rem",
          right: "2rem",
          opacity: 0.08,
        }}
      >
        <Image
          src="/assets/logos/medibles-logo2.png"
          alt=""
          width={120}
          height={120}
          className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
          aria-hidden="true"
        />
      </div>

      {/* ═══ Corner watermark — smaller, top-right ═══ */}
      <div
        className="absolute top-6 right-6 z-[12] pointer-events-none select-none hidden md:block"
        aria-hidden="true"
        style={{ opacity: 0.06 }}
      >
        <Image
          src="/assets/logos/medibles-logo.png"
          alt=""
          width={60}
          height={60}
        />
      </div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep/95 via-charcoal/70 to-charcoal/40 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/80 via-transparent to-charcoal/30 z-10" />

      {/* Smoke drift overlay */}
      <SmokeEffect />

      {/* Floating lime glow blobs */}
      <div className="hidden md:block absolute top-1/3 -left-20 w-80 h-80 bg-lime/8 rounded-full blur-[100px] animate-float z-10 pointer-events-none" />
      <div
        className="hidden md:block absolute bottom-1/4 right-0 w-64 h-64 bg-lime/5 rounded-full blur-[80px] animate-float z-10 pointer-events-none"
        style={{ animationDelay: "4s" }}
      />

      {/* ═══ Swipeable Slide Content ═══ */}
      <motion.div
        className="relative z-20 h-full flex items-center touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl space-y-3 sm:space-y-5"
              itemScope
              itemType="https://schema.org/ImageObject"
            >
              {/* Schema.org meta for each slide image */}
              <meta itemProp="name" content={`${slide.headline} — Mohawk Medibles`} />
              <meta itemProp="description" content={slide.alt} />
              <meta itemProp="contentUrl" content={slide.bg} />
              <meta itemProp="creditText" content="Mohawk Medibles — Indigenous-Owned Cannabis Dispensary, Tyendinaga Mohawk Territory" />
              <meta itemProp="copyrightHolder" content="Mohawk Medibles" />
              <meta itemProp="acquireLicensePage" content="https://mohawkmedibles.co/terms" />

              {/* Badge */}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/15 border border-lime/30 text-lime text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse shadow-[0_0_8px_#C8E63E]" />
                {slide.badge}
              </motion.span>

              {/* Headline — h1 for SEO on first slide */}
              {current === 0 ? (
                <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white font-display leading-[0.9] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                  {slide.headline}
                  <br />
                  <span className="text-lime animate-neon-glow">
                    {slide.highlight}
                  </span>
                </h1>
              ) : (
                <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white font-display leading-[0.9] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                  {slide.headline}
                  <br />
                  <span className="text-lime animate-neon-glow">
                    {slide.highlight}
                  </span>
                </h2>
              )}

              {/* Description */}
              <p className="text-sm sm:text-base md:text-xl text-white/80 max-w-lg leading-relaxed line-clamp-3 sm:line-clamp-none">
                {slide.description}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2 sm:pt-4">
                <Link href={slide.cta.href}>
                  <Button
                    size="lg"
                    className="rounded-full text-sm sm:text-base md:text-lg h-11 sm:h-12 md:h-14 px-6 sm:px-8 md:px-10 bg-lime hover:bg-lime-light text-charcoal-deep font-bold hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(200,230,62,0.4)] border-none w-full sm:w-auto"
                  >
                    {slide.cta.label}
                  </Button>
                </Link>
                <Link href={slide.ctaSecondary.href}>
                  <Button
                    size="lg"
                    className="rounded-full text-sm sm:text-base md:text-lg h-11 sm:h-12 md:h-14 px-6 sm:px-8 md:px-10 glass border-lime/20 text-white hover:bg-lime/10 font-semibold w-full sm:w-auto"
                  >
                    {slide.ctaSecondary.label}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Micro trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-24 sm:bottom-20 left-4 sm:left-6 md:left-12 flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-white/50 text-[9px] sm:text-[10px] md:text-xs tracking-widest uppercase"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-lime" />{" "}
              Lab Tested
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-lime" />{" "}
              Free Shipping $199+
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime" /> Same Day
              Delivery
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime" /> Tax Free
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* ═══ Slide Tab Navigation — "All" + category tabs ═══ */}
      <div className="absolute bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-charcoal-deep/60 backdrop-blur-md rounded-full px-1.5 py-1 border border-white/10">
        {SLIDES.map((s, i) => {
          const tabLabels = ["Deals", "Flower", "Edibles", "Concentrates", "Heritage"];
          return (
            <button
              key={i}
              onClick={() => {
                goTo(i);
                resetTimer();
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide transition-all duration-300 ${
                i === current
                  ? "bg-lime text-charcoal-deep shadow-[0_0_12px_rgba(200,230,62,0.4)]"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              aria-label={`View ${tabLabels[i]} slide`}
            >
              {tabLabels[i]}
            </button>
          );
        })}
      </div>

      {/* Slide dot indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              goTo(i);
              resetTimer();
            }}
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

      {/* Progress bar */}
      {!isPaused && (
        <motion.div
          key={`progress-${current}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: INTERVAL / 1000, ease: "linear" }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime/60 origin-left z-30"
        />
      )}
    </section>
  );
}
