"use client";

import Link from "next/link";
import { MapPin, Clock, Phone, ArrowRight, Store, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StorePromo() {
    return (
        <section className="py-16 px-4 sm:px-6">
            <div className="container mx-auto max-w-6xl">
                <div className="relative overflow-hidden rounded-3xl border border-forest/10 dark:border-white/5 bg-gradient-to-br from-forest/5 via-transparent to-leaf/5 dark:from-forest/15 dark:via-charcoal/50 dark:to-leaf/10 shadow-xl shadow-black/5 dark:shadow-black/20">
                    {/* Decorative glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-forest/10 dark:bg-lime/5 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-leaf/10 dark:bg-forest/10 rounded-full blur-[60px]" />

                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Map embed */}
                        <div className="h-64 md:h-full min-h-[320px] relative group">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2862.5!2d-77.0833!3d44.2167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDTCsDEzJzAwLjAiTiA3N8KwMDUnMDAuMCJX!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Mohawk Medibles Store Location"
                                className="absolute inset-0 transition-opacity duration-300"
                            />
                            {/* Gradient fade into info panel */}
                            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--card)] to-transparent hidden md:block pointer-events-none" />
                        </div>

                        {/* Store info */}
                        <div className="relative p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-forest/10 dark:bg-lime/10">
                                    <Store className="h-4 w-4 text-forest dark:text-lime" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-forest dark:text-lime">
                                    Visit Our Store
                                </span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-forest dark:text-cream mb-3 tracking-tight">
                                Mohawk Medibles
                            </h2>

                            <p className="text-muted-foreground text-sm md:text-base mb-8 leading-relaxed max-w-md">
                                Order online, pick up in store — skip the wait! Visit our location in
                                Tyendinaga Mohawk Territory for an in-person shopping experience.
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-3.5 text-sm group/item">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-forest/5 dark:bg-white/5 group-hover/item:bg-forest/10 dark:group-hover/item:bg-lime/10 transition-colors duration-300 shrink-0">
                                        <MapPin className="h-4 w-4 text-forest dark:text-lime" />
                                    </div>
                                    <div className="pt-1.5">
                                        <span className="text-foreground font-medium">
                                            1738 York Road, Tyendinaga Mohawk Territory, ON K0K 3A0
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 text-sm group/item">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-forest/5 dark:bg-white/5 group-hover/item:bg-forest/10 dark:group-hover/item:bg-lime/10 transition-colors duration-300 shrink-0">
                                        <Clock className="h-4 w-4 text-forest dark:text-lime" />
                                    </div>
                                    <div>
                                        <span className="text-foreground font-medium">Open Daily: 9AM - 9PM</span>
                                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            OPEN NOW
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 text-sm group/item">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-forest/5 dark:bg-white/5 group-hover/item:bg-forest/10 dark:group-hover/item:bg-lime/10 transition-colors duration-300 shrink-0">
                                        <Phone className="h-4 w-4 text-forest dark:text-lime" />
                                    </div>
                                    <a href="tel:+16133961738" className="text-foreground font-medium hover:text-forest dark:hover:text-lime transition-colors duration-200">
                                        (613) 396-1738
                                    </a>
                                </div>
                            </div>

                            {/* Trust signal */}
                            <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-xl bg-forest/5 dark:bg-white/5 w-fit text-xs text-muted-foreground">
                                <ShieldCheck className="h-3.5 w-3.5 text-forest dark:text-lime" />
                                Indigenous-owned & operated in Tyendinaga Mohawk Territory
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link href="/locations">
                                    <Button variant="brand" className="gap-2 rounded-full px-6 shadow-lg shadow-forest/10 dark:shadow-lime/10 hover:shadow-xl hover:shadow-forest/20 dark:hover:shadow-lime/20 transition-all duration-300 hover:scale-[1.02]">
                                        Learn More <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <a
                                    href="https://www.google.com/maps/dir/?api=1&destination=1738+York+Road+Tyendinaga+Mohawk+Territory+ON+K0K+3A0"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" className="gap-2 rounded-full px-6 hover:bg-forest/5 dark:hover:bg-lime/5 transition-all duration-300">
                                        Get Directions <MapPin className="h-4 w-4" />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
