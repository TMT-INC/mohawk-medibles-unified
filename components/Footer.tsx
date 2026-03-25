"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CreditCard, Bitcoin, ShieldCheck, Zap, Loader2, Check } from "lucide-react";
import { GoogleReviewsBadge } from "@/components/GoogleReviewsWidget";

const provinces = [
    { name: "Alberta", slug: "alberta" },
    { name: "British Columbia", slug: "british-columbia" },
    { name: "Manitoba", slug: "manitoba" },
    { name: "New Brunswick", slug: "new-brunswick" },
    { name: "Newfoundland & Labrador", slug: "newfoundland-and-labrador" },
    { name: "Northwest Territories", slug: "northwest-territories" },
    { name: "Nova Scotia", slug: "nova-scotia" },
    { name: "Nunavut", slug: "nunavut" },
    { name: "Ontario", slug: "ontario" },
    { name: "Prince Edward Island", slug: "prince-edward-island" },
    { name: "Quebec", slug: "quebec" },
    { name: "Saskatchewan", slug: "saskatchewan" },
    { name: "Yukon", slug: "yukon" },
];

export default function Footer() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    async function handleSubscribe() {
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setStatus("error");
            setMessage("Please enter a valid email.");
            return;
        }
        setStatus("loading");
        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, source: "footer" }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setStatus("success");
                setMessage(data.message || "Welcome to the Empire!");
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.error || "Something went wrong.");
            }
        } catch {
            setStatus("error");
            setMessage("Network error. Please try again.");
        }
    }

    return (
        <footer className="bg-forest dark:bg-charcoal-deep text-cream py-20 border-t-2 border-lime/15 dark:border-white/5 relative z-40">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                {/* Brand & Mission */}
                <div className="lg:col-span-2 space-y-6">
                    <Link href="/" className="relative block h-16 w-64 transition-opacity hover:opacity-80">
                        <Image
                            src="/assets/logos/medibles-photoroom.png"
                            alt="Mohawk Medibles Logo"
                            fill
                            className="object-contain object-left"
                        />
                    </Link>
                    <p className="text-cream/90 text-sm max-w-sm leading-relaxed">
                        Indigenous-owned cannabis dispensary serving Canada since 2019.
                        Premium edibles, vapes, concentrates, and flower with fast,
                        discreet shipping from Tyendinaga Mohawk Territory, Ontario.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-3">
                        <span className="text-[9px] uppercase tracking-widest px-3 py-1.5 bg-lime/10 border border-lime/20 rounded-full text-lime font-bold hover:bg-lime/20 transition-colors duration-200">Fast Delivery</span>
                        <span className="text-[9px] uppercase tracking-widest px-3 py-1.5 bg-lime/10 border border-lime/20 rounded-full text-lime font-bold hover:bg-lime/20 transition-colors duration-200">Quality Assurance</span>
                        <span className="text-[9px] uppercase tracking-widest px-3 py-1.5 bg-lime/10 border border-lime/20 rounded-full text-lime font-bold hover:bg-lime/20 transition-colors duration-200">Customer Support</span>
                    </div>
                </div>

                {/* Shop Links */}
                <div className="space-y-4">
                    <p className="font-bold text-sm tracking-widest uppercase text-white">Shop</p>
                    <ul className="space-y-2 text-sm text-cream/80">
                        <li><Link href="/shop" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">All Collections</Link></li>
                        <li><Link href="/shop?category=Flower" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Flower</Link></li>
                        <li><Link href="/shop?category=Edibles" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Edibles</Link></li>
                        <li><Link href="/shop?category=Concentrates" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Concentrates</Link></li>
                        <li><Link href="/shop?category=Vapes" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Vapes</Link></li>
                        <li><Link href="/shop?category=Hash" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Hash</Link></li>
                        <li><Link href="/shop?category=Pre-Rolls" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Pre-Rolls</Link></li>
                        <li><Link href="/shop?category=CBD" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">CBD</Link></li>
                    </ul>
                </div>

                {/* Support & Legal */}
                <div className="space-y-4">
                    <p className="font-bold text-sm tracking-widest uppercase text-white">Support</p>
                    <ul className="space-y-2 text-sm text-cream/80">
                        <li><Link href="/faq" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">FAQ & Knowledgebase</Link></li>
                        <li><Link href="/contact" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Contact Us</Link></li>
                        <li><Link href="/shipping-policy" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Shipping Policy</Link></li>
                        <li><Link href="/returns-policy" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Returns Policy</Link></li>
                        <li><Link href="/privacy" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Terms of Service</Link></li>
                        <li><Link href="/price-match" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Price Match Guarantee</Link></li>
                    </ul>
                </div>

                {/* Quick Links + Delivery */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <p className="font-bold text-sm tracking-widest uppercase text-white">Quick Links</p>
                        <ul className="space-y-2 text-sm text-cream/80">
                            <li><Link href="/deals" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Deals</Link></li>
                            <li><Link href="/how-to-order" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">How to Order</Link></li>
                            <li><Link href="/buy-weed-online-canada" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Buy Weed Online</Link></li>
                            <li><Link href="/cannabis-laws" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Cannabis Laws</Link></li>
                            <li><Link href="/blog" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Blog</Link></li>
                            <li><Link href="/locations" className="hover:text-lime hover:translate-x-0.5 transition-all duration-200 inline-block">Visit Our Store</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <p className="font-bold text-sm tracking-widest uppercase text-white">Delivery</p>
                        <Link href="/delivery" className="text-sm text-cream/80 hover:text-lime transition-colors block">All Locations</Link>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                            <ul className="space-y-2 text-xs text-cream/70">
                                {provinces.slice(0, 7).map((p) => (
                                    <li key={p.slug}>
                                        <Link href={`/delivery/${p.slug}`} className="hover:text-lime transition-colors inline-block py-0.5">
                                            {p.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <ul className="space-y-2 text-xs text-cream/70">
                                {provinces.slice(7).map((p) => (
                                    <li key={p.slug}>
                                        <Link href={`/delivery/${p.slug}`} className="hover:text-lime transition-colors inline-block py-0.5">
                                            {p.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust & Newsletter */}
            <div className="container mx-auto px-6 mt-16 pt-12 border-t border-white/10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-wrap gap-4 sm:gap-6 items-center justify-center">
                        {[
                            { icon: Zap, label: "INTERAC", sub: "Instant Pay", color: "text-yellow-400" },
                            { icon: CreditCard, label: "VISA / MC", sub: "Global Credit", color: "text-blue-400" },
                            { icon: Bitcoin, label: "BITCOIN", sub: "Crypto Ready", color: "text-orange-400" },
                            { icon: ShieldCheck, label: "SSL SECURE", sub: "256-bit AES", color: "text-lime" },
                        ].map((badge) => (
                            <div key={badge.label} className="flex flex-col items-center gap-1.5 group">
                                <div className="bg-white/5 hover:bg-white/10 p-2.5 px-4 rounded-xl border border-white/10 hover:border-lime/20 flex items-center justify-center transition-all duration-300 hover:scale-105">
                                    <badge.icon className={`h-4 w-4 ${badge.color} group-hover:scale-110 transition-transform duration-300`} />
                                    <span className="ml-2 text-[9px] font-bold text-cream tracking-widest">{badge.label}</span>
                                </div>
                                <span className="text-[8px] uppercase tracking-[0.2em] text-cream/60 group-hover:text-lime/80 transition-colors duration-300">{badge.sub}</span>
                            </div>
                        ))}
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3">
                        {status === "success" ? (
                            <div className="flex items-center gap-2 text-lime text-sm">
                                <Check className="h-4 w-4" />
                                <span>{message}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center md:items-end gap-2">
                                <div className="flex gap-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
                                        onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                                        placeholder="Join the Empire... (Email)"
                                        className="bg-white/5 border border-white/10 focus:border-lime/50 rounded-full px-6 py-3 text-sm text-white w-64 focus:outline-none focus:ring-2 focus:ring-lime/20 transition-all duration-300 placeholder:text-cream/30 hover:border-white/20"
                                    />
                                    <Button
                                        variant="brand"
                                        size="sm"
                                        className="rounded-full glow-lime"
                                        onClick={handleSubscribe}
                                        disabled={status === "loading"}
                                    >
                                        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
                                    </Button>
                                </div>
                                {status === "error" && (
                                    <p className="text-red-400 text-[10px]">{message}</p>
                                )}
                            </div>
                        )}
                        <p className="text-xs text-cream/70 uppercase tracking-widest">Subscriber Perk: Free 1:1 consultation & special drops</p>
                    </div>
                </div>
            </div>

            {/* Indigenous sovereignty callout */}
            <div className="container mx-auto px-6 mt-14 pt-8 border-t border-white/10">
                <div className="text-center mb-8">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-amber-400/90 mb-1.5">Proudly Indigenous-Owned</p>
                    <p className="text-xs text-cream/60 max-w-lg mx-auto leading-relaxed">Operating under the inherent sovereignty of the Mohawk Nation at Tyendinaga. Supporting Indigenous communities with every order.</p>
                </div>
            </div>

            {/* Copyright */}
            <div className="container mx-auto px-6 mt-4 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-cream/50 uppercase tracking-widest">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    <span>45 Dundas Street Deseronto, Ontario</span>
                    <span className="hidden md:inline text-cream/20">|</span>
                    <span>(613) 396 6728</span>
                    <span className="hidden md:inline text-cream/20">|</span>
                    <span>info@mohawkmedibles.ca</span>
                </div>
                <GoogleReviewsBadge />
                <div>
                    &copy; 2026 Mohawk Medibles &bull; Indigenous Sovereignty &bull; 19+ Only
                </div>
            </div>
        </footer>
    );
}
