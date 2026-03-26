/**
 * Mohawk Medibles — Delivery Landing Page (Shared Component)
 * ═══════════════════════════════════════════════════════════
 * Reusable layout for all /delivery/[city] local SEO pages.
 */
"use client";

import Link from "next/link";
import { MapPin, Truck, Clock, Shield, ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeliveryLandingProps {
    city: string;
    region: string;
    deliveryTime: string;
    description: string;
    keywords: string[];
    nearbyAreas?: string[];
}

export default function DeliveryLanding({
    city,
    region,
    deliveryTime,
    description,
    nearbyAreas = [],
}: DeliveryLandingProps) {
    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* Hero */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-forest/10 via-transparent to-secondary/5 dark:from-forest/20 dark:via-transparent dark:to-secondary/10" />
                <div className="relative max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest/10 dark:bg-forest/20 text-forest dark:text-leaf text-xs font-bold tracking-widest uppercase mb-6">
                        <MapPin className="h-3.5 w-3.5" />
                        {region}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6">
                        Premium Cannabis Delivery
                        <br />
                        <span className="text-forest dark:text-leaf">
                            {city}
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                        {description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/shop">
                            <Button variant="brand" size="lg" className="rounded-full px-8 shadow-lg shadow-secondary/20 text-sm font-bold tracking-wider uppercase gap-2">
                                Shop Now <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/faq">
                            <Button variant="outline" size="lg" className="rounded-full px-8 text-sm font-bold tracking-wider uppercase border-border hover:bg-accent">
                                Delivery FAQ
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Value Props */}
            <section className="py-16 px-6 border-t border-border">
                <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8">
                    {[
                        {
                            icon: Truck,
                            title: deliveryTime,
                            desc: "Fast, discreet delivery right to your door",
                        },
                        {
                            icon: Shield,
                            title: "Lab Tested",
                            desc: "Every product meets the Empire Standard™",
                        },
                        {
                            icon: Leaf,
                            title: "360+ Products",
                            desc: "Flower, edibles, concentrates, vapes & more",
                        },
                        {
                            icon: Clock,
                            title: "Open 9AM–10PM",
                            desc: "Order any day of the week",
                        },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="text-center group">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-forest/10 dark:bg-forest/20 mb-4 group-hover:scale-110 transition-transform">
                                <Icon className="h-6 w-6 text-forest dark:text-leaf" />
                            </div>
                            <h3 className="font-bold text-sm tracking-wide uppercase mb-1">{title}</h3>
                            <p className="text-muted-foreground text-sm">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* About Section — local keyword density */}
            <section className="py-16 px-6 bg-accent/50 border-t border-border">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-6">
                        Why Choose Mohawk Medibles for Cannabis Delivery in {city}?
                    </h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                        <p>
                            Mohawk Medibles is an <strong>Indigenous-owned premium cannabis dispensary</strong> located
                            on Tyendinaga Mohawk Territory. We deliver lab-tested, terpene-profiled
                            cannabis products to {city} and surrounding {region} communities.
                        </p>
                        <p>
                            Every product on our shelf meets the <strong>Empire Standard™</strong> — our commitment
                            to independent verification for potency, purity, and safety. From craft flower and
                            precisely dosed edibles to premium concentrates and vapes, our 360+ product catalog
                            gives you the selection you deserve.
                        </p>
                        <p>
                            Our {city} cannabis delivery is <strong>fast, discreet, and reliable</strong>. Orders
                            are carefully packaged in unmarked containers and delivered by trusted couriers.
                            We accept E-Transfer, cash, and credit card payments.
                        </p>
                    </div>
                </div>
            </section>

            {/* Categories CTA */}
            <section className="py-16 px-6 border-t border-border">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-black tracking-tight mb-8 text-center">
                        Browse Our Cannabis Categories
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {["Flower", "Edibles", "Concentrates", "Vapes", "Pre-Rolls"].map((cat) => (
                            <Link
                                key={cat}
                                href={`/shop?category=${cat.toLowerCase()}`}
                                className="group p-6 rounded-2xl border border-border bg-card hover:bg-accent/50 text-center transition-all hover:shadow-md"
                            >
                                <Leaf className="h-6 w-6 text-forest dark:text-leaf mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-bold tracking-wide uppercase">{cat}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Nearby Areas */}
            {nearbyAreas.length > 0 && (
                <section className="py-16 px-6 bg-accent/50 border-t border-border">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-xl font-bold mb-4">Also Delivering To</h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {nearbyAreas.map((area) => (
                                <Link
                                    key={area}
                                    href={`/delivery/${area.toLowerCase().replace(/\s+/g, "-")}`}
                                    className="px-4 py-2 rounded-full border border-border text-sm hover:bg-forest/10 dark:hover:bg-forest/20 transition-colors"
                                >
                                    {area}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}
