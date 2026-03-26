/**
 * Delivery Hub — Mohawk Medibles
 * ════════════════════════════════════════════════════════════════════
 * National delivery landing page showcasing provinces, popular cities,
 * and delivery logistics across Canada.
 *
 * SEO Target: "cannabis delivery Canada", "buy cannabis online Canada",
 * regional variants ("cannabis delivery Toronto", etc.)
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Truck, Shield, FlaskRound, Gift } from "lucide-react";
import { getAllProvinces, getPopularCities, getTotalCityCount, getAllCities } from "@/lib/seo/city-delivery-data";
import { breadcrumbSchema } from "@/lib/seo/schemas";
import DeliveryMapLoader from "@/components/DeliveryMapLoader";
import PostalLookup from "@/components/PostalLookup";

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Cannabis Delivery Across Canada — All Provinces & Territories",
  description:
    "Order premium cannabis online and get it delivered to your door across Canada. Fast, discreet shipping to all provinces & territories. Lab-tested flower, edibles, concentrates & more.",
  alternates: {
    canonical: "https://mohawkmedibles.ca/delivery",
  },
  keywords: [
    "cannabis delivery Canada",
    "buy cannabis online Canada",
    "cannabis mail order Canada",
    "premium cannabis delivery",
    "discreet cannabis shipping",
  ],
  openGraph: {
    title: "Cannabis Delivery Across Canada",
    description:
      "Fast, discreet cannabis delivery to all Canadian provinces. Order premium, lab-tested products online.",
    url: "https://mohawkmedibles.ca/delivery",
    type: "website",
    images: [
      {
        url: "https://mohawkmedibles.ca/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mohawk Medibles Canada-wide cannabis delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cannabis Delivery Across Canada",
    description: "Fast, discreet delivery to all provinces. Order premium cannabis online.",
  },
};

// ─── Component ────────────────────────────────────────────────────────

export default function DeliveryPage() {
  const provinces = getAllProvinces();
  const popularCities = getPopularCities();
  const totalCities = getTotalCityCount();
  const allCities = getAllCities();

  // Map city data
  const mapCities = allCities.map(({ province, city }) => ({
    name: city.name,
    provinceName: province.name,
    provinceSlug: province.slug,
    citySlug: city.slug,
    lat: city.lat,
    lng: city.lng,
    population: city.population,
    deliveryTime: city.deliveryTime,
  }));

  // Breadcrumb JSON-LD
  const breadcrumbData = breadcrumbSchema([
    { name: "Home", url: "https://mohawkmedibles.ca" },
    { name: "Delivery", url: "https://mohawkmedibles.ca/delivery" },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />

      <main className="min-h-screen pt-32 pb-20 page-glass text-foreground">
        <div className="container mx-auto px-6">
          {/* ── Hero Section ──────────────────────────────────────── */}
          <section className="mb-20">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-[10px] font-bold tracking-widest uppercase text-forest dark:text-lime mb-4">
                Nationwide Delivery
              </p>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground uppercase mb-6">
                Cannabis Delivery Across Canada
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Mohawk Medibles ships premium, lab-tested cannabis to every province and
                territory in Canada. Fast, discreet delivery with full tracking and guaranteed
                freshness.
              </p>
              <div className="max-w-lg mx-auto">
                <PostalLookup />
              </div>
            </div>
          </section>

          {/* ── Stats Bar ─────────────────────────────────────────── */}
          <section className="mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 px-8 glass-card rounded-3xl border border-border">
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground mb-2">{totalCities}+</p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-forest dark:text-lime">
                  Cities Served
                </p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground mb-2">13</p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-forest dark:text-lime">
                  Provinces & Territories
                </p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground mb-2">1-3</p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-forest dark:text-lime">
                  Business Days
                </p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground mb-2">$149+</p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-forest dark:text-lime">
                  FREE Shipping
                </p>
              </div>
            </div>
          </section>

          {/* ── Interactive Delivery Map ────────────────────────────── */}
          <section className="mb-20">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">
                Our Delivery Coverage
              </h2>
              <p className="text-muted-foreground mt-2">
                Click any city on the map to view delivery details
              </p>
            </div>
            <DeliveryMapLoader cities={mapCities} />
          </section>

          {/* ── Province Grid ─────────────────────────────────────── */}
          <section className="mb-20">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">
                Select Your Province
              </h2>
              <p className="text-muted-foreground mt-2">
                Choose your location to see delivery times and available cities
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {provinces.map((province) => (
                <Link
                  key={province.slug}
                  href={`/delivery/${province.slug}`}
                  className="group"
                >
                  <div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all h-full flex flex-col">
                    {/* Province Name & Abbreviation */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors">
                        {province.name}
                      </h3>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-forest/70 dark:text-lime/70 mt-1">
                        {province.abbreviation}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 flex-1">
                      <div>
                        <p className="text-[9px] font-bold tracking-widest uppercase text-forest/60 dark:text-lime/60 mb-1">
                          Cities
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {province.cities.length} cities
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold tracking-widest uppercase text-forest/60 dark:text-lime/60 mb-1">
                          Legal Age
                        </p>
                        <p className="text-sm font-semibold text-foreground">{province.legalAge}+</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold tracking-widest uppercase text-forest/60 dark:text-lime/60 mb-1">
                          Delivery Time
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {province.deliveryTime}
                        </p>
                      </div>
                    </div>

                    {/* CTA Arrow */}
                    <div className="mt-6 inline-flex items-center gap-2 text-forest dark:text-lime group-hover:gap-3 transition-all">
                      <span className="text-xs font-bold tracking-widest uppercase">
                        Explore
                      </span>
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Popular Cities ────────────────────────────────────── */}
          <section className="mb-20">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">
                Popular Cities
              </h2>
              <p className="text-muted-foreground mt-2">
                Fast delivery to Canada's major hubs
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularCities.map(({ province, city }) => (
                <Link
                  key={`${province.slug}/${city.slug}`}
                  href={`/delivery/${province.slug}/${city.slug}`}
                  className="group"
                >
                  <div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all h-full flex flex-col">
                    {/* City Name */}
                    <h3 className="text-lg font-bold text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors mb-2">
                      {city.name}
                    </h3>

                    {/* Province & Population */}
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <span className="text-xs text-forest/70 dark:text-lime/70">{province.abbreviation}</span>
                      <span className="text-xs text-muted-foreground">Pop. {city.population}</span>
                    </div>

                    {/* Landmark */}
                    <p className="text-xs text-muted-foreground mb-3 flex-1">
                      <span className="font-semibold text-forest dark:text-lime">Landmark:</span> {city.landmark}
                    </p>

                    {/* Delivery Time */}
                    <div className="inline-flex items-center gap-1.5 text-forest dark:text-lime text-xs font-semibold">
                      <Truck className="w-3.5 h-3.5" />
                      {city.deliveryTime}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Trust Section ─────────────────────────────────────── */}
          <section className="mb-20">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">
                Why Choose Mohawk Medibles
              </h2>
              <p className="text-muted-foreground mt-2">
                Trusted by thousands of Canadian cannabis enthusiasts
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Truck,
                  title: "Lightning-Fast Delivery",
                  description:
                    "1–3 business days to most Canadian locations via Canada Post Xpresspost with full tracking.",
                },
                {
                  icon: Shield,
                  title: "Discreet & Secure Packaging",
                  description:
                    "Plain, unmarked boxes with no cannabis branding. Vacuum-sealed for freshness and odour control.",
                },
                {
                  icon: FlaskRound,
                  title: "Lab-Tested & Pure",
                  description:
                    "Every product tested for potency, terpenes, and contaminants. Empire Standard™ quality guaranteed.",
                },
                {
                  icon: Gift,
                  title: "FREE Shipping Over $149",
                  description:
                    "Orders over $149 CAD ship free to any Canadian address. No hidden fees or surprises.",
                },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="glass-card p-8 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-forest/10 dark:bg-lime/10 flex-shrink-0">
                        <Icon className="w-6 h-6 text-forest dark:text-lime" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-lg mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Final CTA ─────────────────────────────────────────── */}
          <section className="mb-0">
            <div className="glass-card p-12 rounded-3xl border border-border text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground tracking-tight mb-4">
                Ready to Order?
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Browse our full collection of premium, lab-tested cannabis products. Discreet
                delivery to your door, guaranteed freshness.
              </p>
              <Link href="/shop">
                <Button variant="brand" size="lg" className="gap-2">
                  Shop the Collection
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
