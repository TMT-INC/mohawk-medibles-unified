"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    MapPin, Clock, Phone, Navigation, Store, Shield,
    ShoppingBag, Car, Leaf, Star, CheckCircle, ArrowRight,
    Sparkles, Users, Truck, Zap, Heart, Package,
} from "lucide-react";

const STORE = {
    name: "Mohawk Medibles",
    address: "45 Dundas St, Deseronto, ON K0K 1X0",
    phone: "(613) 396-6728",
    phoneTel: "+16133966728",
    hours: [
        { day: "Monday", time: "8:00 AM - 10:00 PM" },
        { day: "Tuesday", time: "8:00 AM - 10:00 PM" },
        { day: "Wednesday", time: "8:00 AM - 10:00 PM" },
        { day: "Thursday", time: "8:00 AM - 10:00 PM" },
        { day: "Friday", time: "8:00 AM - 10:00 PM" },
        { day: "Saturday", time: "8:00 AM - 10:00 PM" },
        { day: "Sunday", time: "8:00 AM - 10:00 PM" },
    ],
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&destination=45+Dundas+St+Deseronto+ON+K0K+1X0",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2862.5!2d-77.0833!3d44.2167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDTCsDEzJzAwLjAiTiA3N8KwMDUnMDAuMCJX!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca",
};

const WHAT_TO_EXPECT = [
    {
        icon: Shield,
        title: "Valid ID Required",
        description: "Bring government-issued photo ID. You must be 19+ to enter and purchase.",
    },
    {
        icon: Leaf,
        title: "Full Product Selection",
        description: "Browse our entire collection of flower, edibles, concentrates, vapes, pre-rolls, and more.",
    },
    {
        icon: Star,
        title: "Expert Staff",
        description: "Our knowledgeable budtenders can help you find the perfect product for your needs.",
    },
    {
        icon: ShoppingBag,
        title: "Click & Collect",
        description: "Order online and pick up in store. Your order will be ready when you arrive.",
    },
    {
        icon: Car,
        title: "Free Parking",
        description: "Ample free parking right in front of our store. Easy in, easy out.",
    },
    {
        icon: CheckCircle,
        title: "Cash & Card Accepted",
        description: "We accept cash, Visa, Mastercard, and Interac debit for in-store purchases.",
    },
];

const LANDMARKS = [
    "Located on Dundas St in Deseronto, Tyendinaga Mohawk Territory",
    "Between Belleville and Napanee, just off the 401",
    "10 minutes east of Belleville, 15 minutes west of Napanee",
    "Look for the Mohawk Medibles sign on Dundas St",
];

const DELIVERY_AREAS = [
    { area: "Tyendinaga Mohawk Territory", time: "Same day" },
    { area: "Deseronto", time: "Same day" },
    { area: "Belleville", time: "Next day" },
    { area: "Napanee", time: "Next day" },
    { area: "Kingston", time: "1-2 days" },
    { area: "Rest of Canada", time: "2-5 business days" },
];

export default function LocationsClient() {
    const today = new Date().getDay(); // 0=Sun, 1=Mon...
    const todayIndex = today === 0 ? 6 : today - 1; // Convert to Mon=0 index

    return (
        <div className="min-h-screen page-glass">

            {/* ═══ HERO — Cinematic destination header ═══ */}
            <section className="relative min-h-[80vh] flex items-end overflow-hidden">
                {/* Background image with gradient overlays */}
                <div className="absolute inset-0">
                    <Image
                        src="/assets/store/storefront.jpg"
                        alt="Mohawk Medibles store — premium cannabis dispensary"
                        fill
                        priority
                        className="object-cover opacity-50"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep via-charcoal-deep/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep/60 to-transparent" />
                    {/* Lime accent glow */}
                    <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px] rounded-full bg-lime/8 blur-[150px]" />
                </div>

                {/* Hero content */}
                <div className="relative z-10 w-full">
                    <div className="max-w-6xl mx-auto px-6 md:px-12 pb-20 pt-40">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime/10 border border-lime/25 mb-6">
                                <Store className="h-3.5 w-3.5 text-lime" />
                                <span className="text-lime text-[10px] font-bold tracking-[0.25em] uppercase">
                                    Visit Our Store
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight font-display leading-[0.9] mb-5">
                                Your Destination for{" "}
                                <span className="bg-gradient-to-r from-lime via-lime-light to-lime bg-clip-text text-transparent">
                                    Premium Cannabis
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-8 leading-relaxed">
                                Indigenous-owned dispensary in the heart of Tyendinaga Mohawk Territory.
                                360+ products, expert staff, and the best prices in Canada.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                    <Button variant="brand" size="lg" className="gap-2 shadow-[0_0_40px_rgba(200,230,62,0.3)]">
                                        <Navigation className="h-4 w-4" /> Get Directions
                                    </Button>
                                </a>
                                <a href={`tel:${STORE.phoneTel}`}>
                                    <Button variant="outline" size="lg" className="gap-2 text-white border-white/20 hover:bg-white/10">
                                        <Phone className="h-4 w-4" /> Call Now
                                    </Button>
                                </a>
                            </div>
                        </motion.div>

                        {/* Quick info strip */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="mt-10 flex flex-wrap gap-6 text-white/60 text-sm"
                        >
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-lime" />
                                <span>Open Today 9 AM - 9 PM</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-lime" />
                                <span>45 Dundas St, Deseronto</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Car className="w-4 h-4 text-lime" />
                                <span>Free Parking Available</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══ STORE INFO CARDS — Floating over sections ═══ */}
            <section className="relative z-10 -mt-8">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid md:grid-cols-3 gap-6"
                    >
                        {/* Location Card */}
                        <div className="glass-card backdrop-blur-xl border border-border rounded-2xl p-7 relative overflow-hidden group hover:border-lime/30 transition-all duration-300">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime via-lime-light to-transparent" />
                            <h2 className="font-bold text-lg text-foreground font-heading mb-5 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-forest dark:text-lime" /> Location
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium text-foreground text-sm">{STORE.address}</p>
                                </div>
                                <a href={`tel:${STORE.phoneTel}`} className="flex items-center gap-2 text-sm font-medium text-forest dark:text-lime hover:underline">
                                    <Phone className="h-4 w-4" />
                                    {STORE.phone}
                                </a>
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                        <Button variant="brand" size="sm" className="gap-2">
                                            <Navigation className="h-4 w-4" /> Directions
                                        </Button>
                                    </a>
                                    <a href={`tel:${STORE.phoneTel}`}>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Phone className="h-4 w-4" /> Call
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Hours Card */}
                        <div className="glass-card backdrop-blur-xl border border-border rounded-2xl p-7 relative overflow-hidden group hover:border-lime/30 transition-all duration-300">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-forest via-lime/50 to-transparent" />
                            <h2 className="font-bold text-lg text-foreground font-heading mb-5 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-forest dark:text-lime" /> Store Hours
                            </h2>
                            <div className="space-y-1">
                                {STORE.hours.map((h, i) => (
                                    <div
                                        key={h.day}
                                        className={`flex justify-between text-sm py-2 px-3 rounded-lg transition-colors ${
                                            i === todayIndex
                                                ? "bg-lime/10 font-bold text-forest dark:text-lime"
                                                : "text-foreground hover:bg-muted/50"
                                        }`}
                                    >
                                        <span>{h.day}</span>
                                        <span className="tabular-nums">{h.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Click & Collect Card */}
                        <div className="glass-card backdrop-blur-xl border border-border rounded-2xl p-7 relative overflow-hidden group hover:border-lime/30 transition-all duration-300">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-light via-lime to-transparent" />
                            <h2 className="font-bold text-lg text-foreground font-heading mb-5 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-forest dark:text-lime" /> Click &amp; Collect
                            </h2>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                                Order online and skip the wait. Choose &ldquo;Pick up in store&rdquo; at checkout
                                and your order will be ready when you arrive.
                            </p>
                            <Link href="/shop">
                                <Button variant="brand" className="w-full gap-2">
                                    <ShoppingBag className="h-4 w-4" /> Shop Now
                                </Button>
                            </Link>
                            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider mt-3">
                                Free pickup — no shipping cost
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs text-lime">
                                <Zap className="w-3.5 h-3.5" />
                                <span className="font-medium">Most orders ready in under 15 minutes</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══ MAP SECTION — Full width embedded ═══ */}
            <section className="mt-16 mb-16">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <div className="rounded-2xl overflow-hidden border border-border shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                        <iframe
                            src={STORE.embedUrl}
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Mohawk Medibles Location Map"
                        />
                    </div>
                </div>
            </section>

            {/* ═══ WHAT TO EXPECT — Rich card grid ═══ */}
            <section className="py-20 md:py-28">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">The In-Store Experience</span>
                        <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight font-display mt-3 mb-4">
                            What to Expect When You Visit
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            From the moment you walk in, you will feel the difference. Friendly faces, premium products,
                            and an atmosphere built around making your experience exceptional.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {WHAT_TO_EXPECT.map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="glass-card border border-border rounded-2xl p-7 group hover:border-lime/30 transition-all duration-300 relative overflow-hidden"
                            >
                                {/* Hover glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-lime/0 to-forest/0 group-hover:from-lime/5 group-hover:to-forest/3 transition-all duration-500" />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forest/10 to-lime/10 dark:from-lime/10 dark:to-forest/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <item.icon className="h-6 w-6 text-forest dark:text-lime" />
                                    </div>
                                    <h3 className="font-bold text-lg text-foreground font-heading mb-2">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                                </div>
                                {/* Index number watermark */}
                                <div className="absolute top-3 right-4 text-5xl font-black text-foreground/[0.03] dark:text-white/[0.03] font-display">
                                    {String(i + 1).padStart(2, "0")}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ HOW TO FIND US — Directions with visual flair ═══ */}
            <section className="py-20 md:py-28 bg-muted/30">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        {/* Directions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Getting Here</span>
                            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight font-display mt-3 mb-4">
                                How to Find Us
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                We are easy to find, right on the main highway. Here are some helpful landmarks.
                            </p>

                            <div className="space-y-4">
                                {LANDMARKS.map((landmark, i) => (
                                    <div key={i} className="flex items-start gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest/10 to-lime/10 dark:from-lime/10 dark:to-forest/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            <span className="text-sm font-black text-forest dark:text-lime">{i + 1}</span>
                                        </div>
                                        <p className="text-foreground pt-2">{landmark}</p>
                                    </div>
                                ))}
                            </div>

                            <a
                                href={STORE.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-8 inline-block"
                            >
                                <Button variant="brand" size="lg" className="gap-2">
                                    <Navigation className="h-4 w-4" /> Open in Google Maps
                                </Button>
                            </a>
                        </motion.div>

                        {/* Delivery Areas */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.15 }}
                        >
                            <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Delivery Zones</span>
                            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight font-display mt-3 mb-4">
                                We Also Deliver
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                Cannot make it in person? No problem. We ship to every province and territory in Canada,
                                with express options for nearby areas.
                            </p>

                            <div className="glass-card border border-border rounded-2xl overflow-hidden">
                                {DELIVERY_AREAS.map((area, i) => (
                                    <div
                                        key={area.area}
                                        className={`flex items-center justify-between px-6 py-4 ${
                                            i < DELIVERY_AREAS.length - 1 ? "border-b border-border" : ""
                                        } hover:bg-lime/5 transition-colors`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Truck className="w-4 h-4 text-forest dark:text-lime" />
                                            <span className="text-sm font-medium text-foreground">{area.area}</span>
                                        </div>
                                        <span className="text-xs font-bold text-forest dark:text-lime bg-lime/10 px-3 py-1 rounded-full">
                                            {area.time}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                                <Package className="w-4 h-4 text-lime" />
                                <span>Free shipping on orders over $150</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══ WHY VISIT — Compelling reasons ═══ */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                {/* Dark gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal-deep via-[#1a2810] to-charcoal-deep" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,230,62,0.06),transparent_70%)]" />

                <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <span className="text-lime text-xs font-bold tracking-[0.2em] uppercase">The Mohawk Medibles Difference</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight font-display mt-3 mb-4">
                            Why People Drive Hours to Shop Here
                        </h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            It is not just about the products. It is the experience, the prices, and knowing
                            you are supporting an Indigenous-owned business.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Sparkles, title: "360+ Products", desc: "The largest selection of flower, edibles, concentrates, and accessories in the region" },
                            { icon: Heart, title: "Tax-Free Pricing", desc: "As a sovereign Indigenous business, we pass the savings directly to you" },
                            { icon: Users, title: "Expert Budtenders", desc: "Friendly, knowledgeable staff who genuinely care about finding you the right product" },
                            { icon: Shield, title: "Lab Tested", desc: "Every product is verified for potency and purity, so you know exactly what you are getting" },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-7 rounded-2xl bg-white/5 border border-white/10 hover:border-lime/30 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                    <item.icon className="w-6 h-6 text-lime" />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA — Final compelling section ═══ */}
            <section className="py-24 md:py-32">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime/10 border border-lime/20 mb-6">
                            <Zap className="w-3.5 h-3.5 text-lime" />
                            <span className="text-lime text-xs font-bold tracking-wider uppercase">Ready to Experience It?</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight font-display mb-4">
                            Come See What Everyone&apos;s Talking About
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                            Whether you shop online or visit in person, you are getting premium cannabis
                            at the best prices in Canada. Period.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/shop">
                                <Button variant="brand" size="lg" className="gap-2 px-8 shadow-[0_0_40px_rgba(200,230,62,0.3)] hover:shadow-[0_0_60px_rgba(200,230,62,0.4)]">
                                    Shop Online <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="lg" className="gap-2 px-8">
                                    <Navigation className="h-4 w-4" /> Get Directions
                                </Button>
                            </a>
                        </div>
                        {/* Trust strip */}
                        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-lime" />
                                <span>Indigenous-Owned</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-lime" />
                                <span>Since February 2018</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-lime" />
                                <span>47,000+ Customers</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
