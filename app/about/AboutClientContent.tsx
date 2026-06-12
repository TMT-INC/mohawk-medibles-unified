/**
 * About Us — Client Content
 * Rich visual storytelling for Mohawk Medibles brand.
 * Uses i18n translation system for all text content.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import {
    Shield, Leaf, Truck, FlaskRound, Heart, MapPin, Phone, Mail,
    Users, Award, Sparkles, Globe, Feather, TreePine,
} from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

/* Representative product images for the showcase strip */
const SHOWCASE_IMAGES = [
    { src: "https://farluiuyvvqjbuxj.public.blob.vercel-storage.com/wp-media/2025/09/Sun-Rock-04-with-logo.png", alt: "Premium AAAA flower", href: "/shop/sun-rock-premium-aaaa-flower-2-25g-canada" },
    { src: "https://farluiuyvvqjbuxj.public.blob.vercel-storage.com/wp-media/2025/11/Rainbow-Pieces-get-wrecked-on-the-rainbow-with-logo.png", alt: "THC edible gummies", href: "/shop/rainbow-pieces-stoner-pack-1000mg-canada" },
    { src: "https://farluiuyvvqjbuxj.public.blob.vercel-storage.com/wp-media/2025/07/Zillionaire-Shatter-Photoroom.png", alt: "Premium shatter concentrate", href: "/shop/zillionaire-shatter-1g-canada" },
    { src: "https://farluiuyvvqjbuxj.public.blob.vercel-storage.com/wp-media/2025/06/Premium-Pre-Rolls-Photoroom.png", alt: "Premium pre-rolls", href: "/shop/pre-rolled-joint-canada" },
    { src: "https://farluiuyvvqjbuxj.public.blob.vercel-storage.com/wp-media/2025/05/2000mg-CBD-MCT-Oil-with-logo.png", alt: "CBD oil tincture", href: "/shop/cbd-tincture-2000mg-canada" },
    { src: "https://farluiuyvvqjbuxj.public.blob.vercel-storage.com/wp-media/2025/05/pem_gummy_bears_1200x1200-1.jpg", alt: "THC gummy bears", href: "/shop/pineapple-express-meds-pem-gummy-canada" },
];

export default function AboutClientContent() {
    const { t } = useLocale();

    const VALUES = [
        {
            title: t("about.valuesSovereigntyTitle"),
            description: t("about.valuesSovereigntyDesc"),
            Icon: Shield,
            gradient: "from-lime/20 to-transparent",
        },
        {
            title: t("about.valuesQualityTitle"),
            description: t("about.valuesQualityDesc"),
            Icon: FlaskRound,
            gradient: "from-purple-500/20 to-transparent",
        },
        {
            title: t("about.valuesCommunityTitle"),
            description: t("about.valuesCommunityDesc"),
            Icon: Heart,
            gradient: "from-rose-500/20 to-transparent",
        },
        {
            title: t("about.valuesSustainabilityTitle"),
            description: t("about.valuesSustainabilityDesc"),
            Icon: Leaf,
            gradient: "from-emerald-500/20 to-transparent",
        },
    ];

    const MILESTONES = [
        { year: "2018", event: t("about.milestone2018"), highlight: true },
        { year: "2020", event: t("about.milestone2020"), highlight: false },
        { year: "2021", event: t("about.milestone2021"), highlight: false },
        { year: "2022", event: t("about.milestone2022"), highlight: true },
        { year: "2023", event: t("about.milestone2023"), highlight: false },
        { year: "2024", event: t("about.milestone2024"), highlight: false },
        { year: "2025", event: t("about.milestone2025"), highlight: true },
    ];

    const STATS = [
        { value: "360+", label: t("about.statProducts") },
        { value: "47K+", label: t("about.statCustomers") },
        { value: "6+", label: t("about.statYears") },
        { value: "13", label: t("about.statProvinces") },
    ];

    const TEAM_VALUES = [
        {
            Icon: Users,
            title: "Family-Run",
            description: "We are a tight-knit family operation, not a faceless corporation. Every order matters to us personally.",
        },
        {
            Icon: Award,
            title: "Quality Obsessed",
            description: "Every product is hand-selected, lab-tested, and held to the highest standard before it reaches our shelves.",
        },
        {
            Icon: Sparkles,
            title: "Customer-First",
            description: "From personalized recommendations to lightning-fast shipping, your experience is our top priority.",
        },
        {
            Icon: Globe,
            title: "Canada-Wide Reach",
            description: "From our roots in Tyendinaga to every province and territory, we proudly serve all of Canada.",
        },
        {
            Icon: TreePine,
            title: "Rooted in Tradition",
            description: "Our practices honor the land and the traditions of the Mohawk people who have called this territory home for centuries.",
        },
        {
            Icon: Feather,
            title: "Giving Back",
            description: "A portion of every sale supports community programs, youth initiatives, and cultural preservation in Tyendinaga.",
        },
    ];

    return (
        <div className="min-h-screen page-glass text-foreground">

            {/* ═══ HERO — Full-bleed cinematic gradient ═══ */}
            <section className="relative min-h-[85vh] flex items-center overflow-hidden">
                {/* Layered background */}
                <div className="absolute inset-0">
                    <Image
                        src="/assets/store/storefront.jpg"
                        alt="Mohawk Medibles dispensary at 45 Dundas St, Deseronto"
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    {/* Dark cinematic overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep/95 via-charcoal-deep/80 to-charcoal-deep/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep via-transparent to-charcoal-deep/60" />
                    {/* Lime accent glow */}
                    <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-lime/8 blur-[150px]" />
                    <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-forest/10 blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-32">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime/10 border border-lime/25 text-lime text-[10px] font-bold tracking-[0.25em] uppercase mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        {t("about.heroBadge")}
                    </span>
                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter font-display leading-[0.85] mb-8 text-white">
                        {t("about.heroHeadline1")}
                        <br />
                        <span className="bg-gradient-to-r from-lime via-lime-light to-lime bg-clip-text text-transparent">
                            {t("about.heroHeadline2")}
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed mb-10">
                        {t("about.heroDescription")}
                    </p>
                    {/* Founding badge */}
                    <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                        <div className="w-12 h-12 rounded-full bg-lime/15 flex items-center justify-center">
                            <Feather className="w-5 h-5 text-lime" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Founded February 2018</p>
                            <p className="text-white/50 text-xs">Tyendinaga Mohawk Territory, Ontario</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ STATS BAR — Floating over hero ═══ */}
            <section className="relative z-10 -mt-16">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6 text-center group hover:border-lime/30 transition-all duration-300">
                                <div className="text-3xl md:text-4xl font-black text-forest dark:text-lime font-display group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                                <div className="text-xs text-muted-foreground font-bold tracking-widest uppercase mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ OUR STORY — Split layout, personal & warm ═══ */}
            <section className="py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                        {/* Image side with overlay accents */}
                        <div className="relative">
                            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                                <Image
                                    src="/assets/hero/cannabis-closeup.jpg"
                                    alt="Cannabis cultivation and heritage — Mohawk Medibles story"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/60 via-transparent to-transparent" />
                            </div>
                            {/* Floating accent card */}
                            <div className="absolute -bottom-6 -right-6 md:-right-8 bg-lime text-charcoal-deep px-6 py-4 rounded-2xl shadow-[0_20px_60px_rgba(200,230,62,0.3)]">
                                <p className="text-3xl font-black font-display">6+</p>
                                <p className="text-xs font-bold uppercase tracking-wider">Years Serving Canada</p>
                            </div>
                            {/* Decorative border glow */}
                            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-lime/20 via-transparent to-forest/20 pointer-events-none" />
                        </div>

                        {/* Text side */}
                        <div className="space-y-6">
                            <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">{t("about.missionLabel")}</span>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight font-display text-foreground leading-tight">
                                {t("about.missionHeadline1")}<br />{t("about.missionHeadline2")}
                            </h2>
                            <div className="w-16 h-1 bg-gradient-to-r from-lime to-forest rounded-full" />
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {t("about.missionDescription")}
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                What started as a small community dispensary in February 2018 has grown into one of
                                Canada&apos;s most trusted Indigenous-owned cannabis retailers. From our home base in
                                Tyendinaga Mohawk Territory near Deseronto, Ontario, we now serve customers in every
                                province and territory with over 360 premium products.
                            </p>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <span className="px-4 py-2 rounded-full bg-lime/10 border border-lime/20 text-lime text-xs font-bold">{t("about.missionTagLabTested")}</span>
                                <span className="px-4 py-2 rounded-full bg-lime/10 border border-lime/20 text-lime text-xs font-bold">{t("about.missionTagEmpireStandard")}</span>
                                <span className="px-4 py-2 rounded-full bg-lime/10 border border-lime/20 text-lime text-xs font-bold">{t("about.missionTagTaxFree")}</span>
                                <span className="px-4 py-2 rounded-full bg-lime/10 border border-lime/20 text-lime text-xs font-bold">{t("about.missionTagCanadaWide")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ PRODUCT SHOWCASE STRIP ═══ */}
            <section className="py-12 border-y border-border overflow-hidden">
                <div className="flex gap-6 animate-scroll" style={{ width: "max-content" }}>
                    {[...SHOWCASE_IMAGES, ...SHOWCASE_IMAGES].map((img, i) => (
                        <Link key={i} href={img.href} className="relative w-40 h-40 md:w-52 md:h-52 rounded-2xl overflow-hidden flex-shrink-0 border border-border glass-card group">
                            <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                sizes="208px"
                            />
                            <div className="absolute inset-0 bg-lime/0 group-hover:bg-lime/10 transition-colors duration-300" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* ═══ INDIGENOUS SOVEREIGNTY — Culturally respectful ═══ */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                {/* Earth-toned gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal-deep via-[#1a2810] to-charcoal-deep" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,230,62,0.08),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(45,80,22,0.15),transparent_60%)]" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        {/* Text content */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime/10 border border-lime/20">
                                <Feather className="w-3.5 h-3.5 text-lime" />
                                <span className="text-lime text-[10px] font-bold tracking-[0.25em] uppercase">Indigenous Sovereignty</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight font-display text-white leading-tight">
                                Proudly Operating on{" "}
                                <span className="bg-gradient-to-r from-lime to-lime-light bg-clip-text text-transparent">
                                    Sovereign Territory
                                </span>
                            </h2>
                            <div className="w-16 h-1 bg-gradient-to-r from-lime/60 to-transparent rounded-full" />
                            <p className="text-white/70 text-lg leading-relaxed">
                                Mohawk Medibles operates under the inherent sovereignty of the Mohawk Nation within
                                Tyendinaga Mohawk Territory. Our rights to trade and commerce on our own land
                                predate Confederation and are protected by treaties and inherent Indigenous rights.
                            </p>
                            <p className="text-white/50 leading-relaxed">
                                We are proud to be one of the largest Indigenous-owned cannabis operations in
                                Ontario, providing employment, economic opportunity, and cultural pride to our
                                community. Every purchase supports Indigenous self-determination and the
                                prosperity of the Mohawk people of the Bay of Quinte.
                            </p>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <Shield className="w-6 h-6 text-lime mb-2" />
                                    <p className="text-white font-bold text-sm">Treaty Rights</p>
                                    <p className="text-white/40 text-xs mt-1">Protected commerce under inherent Indigenous sovereignty</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <Heart className="w-6 h-6 text-lime mb-2" />
                                    <p className="text-white font-bold text-sm">Community Impact</p>
                                    <p className="text-white/40 text-xs mt-1">Jobs, programs, and pride for the Tyendinaga community</p>
                                </div>
                            </div>
                        </div>

                        {/* Visual side — heritage image */}
                        <div className="relative">
                            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden">
                                <Image
                                    src="/assets/hero/hero-territory-heritage.webp"
                                    alt="Tyendinaga Mohawk Territory heritage"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/80 via-transparent to-charcoal-deep/30" />
                                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
                            </div>
                            {/* Glow effect behind image */}
                            <div className="absolute -inset-8 rounded-3xl bg-lime/5 blur-3xl -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ TEAM & VALUES — Icon card grid ═══ */}
            <section className="py-24 md:py-32">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Who We Are</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight font-display mt-3 text-foreground">
                            More Than a Dispensary
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4">
                            We are a family, a community pillar, and a movement for Indigenous economic sovereignty.
                            These are the values that guide everything we do.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {TEAM_VALUES.map((v, i) => (
                            <div
                                key={v.title}
                                className="relative overflow-hidden glass-card border border-border rounded-2xl p-8 group hover:border-lime/30 transition-all duration-500"
                            >
                                {/* Hover glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-lime/0 to-forest/0 group-hover:from-lime/5 group-hover:to-forest/5 transition-all duration-500" />
                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest/10 to-lime/10 dark:from-lime/10 dark:to-forest/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                        <v.Icon className="w-7 h-7 text-forest dark:text-lime" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground font-heading mb-2">{v.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                                </div>
                                {/* Index number */}
                                <div className="absolute top-4 right-4 text-6xl font-black text-foreground/[0.03] dark:text-white/[0.03] font-display">
                                    {String(i + 1).padStart(2, "0")}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CORE VALUES — Original 4 cards ═══ */}
            <section className="py-20 md:py-28 bg-muted/30">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">{t("about.valuesLabel")}</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">{t("about.valuesHeadline")}</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {VALUES.map((v) => (
                            <div
                                key={v.title}
                                className="relative overflow-hidden glass-card border border-border rounded-2xl p-8 space-y-4 group hover:border-forest/30 dark:hover:border-lime/30 transition-all duration-300"
                            >
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${v.gradient}`} />
                                <div className="w-12 h-12 rounded-xl bg-forest/10 dark:bg-lime/10 flex items-center justify-center">
                                    <v.Icon className="w-6 h-6 text-forest dark:text-lime" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground font-heading">{v.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ JOURNEY TIMELINE — Rich visual ═══ */}
            <section className="py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
                        {/* Timeline side */}
                        <div>
                            <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">{t("about.journeyLabel")}</span>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight font-display mt-3 mb-4 text-foreground">
                                {t("about.journeyHeadline")}
                            </h2>
                            <p className="text-muted-foreground mb-10">
                                From a small storefront in Tyendinaga to serving all of Canada — here is how we got here.
                            </p>
                            <div className="space-y-0">
                                {MILESTONES.map((m, i) => (
                                    <div key={m.year} className="flex gap-5 group">
                                        {/* Line + Dot */}
                                        <div className="flex flex-col items-center">
                                            <div className={`w-4 h-4 rounded-full flex-shrink-0 border-2 ${
                                                m.highlight
                                                    ? "bg-lime border-lime shadow-[0_0_12px_rgba(200,230,62,0.5)]"
                                                    : "bg-transparent border-border group-hover:border-lime/50"
                                            } transition-all duration-300`} />
                                            {i < MILESTONES.length - 1 && (
                                                <div className="w-px flex-1 bg-gradient-to-b from-border to-border/30" />
                                            )}
                                        </div>
                                        {/* Content */}
                                        <div className="pb-10">
                                            <span className={`text-sm font-black tracking-wider ${m.highlight ? "text-forest dark:text-lime" : "text-muted-foreground"}`}>
                                                {m.year}
                                            </span>
                                            <p className="text-muted-foreground mt-1">{m.event}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image collage side */}
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/shop/sun-rock-premium-aaaa-flower-2-25g-canada" className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border group">
                                <Image
                                    src="https://farluiuyvvqjbuxj.public.blob.vercel-storage.com/wp-media/2025/09/Sun-Rock-04-with-logo.png"
                                    alt="Premium AAAA flower from Mohawk Medibles"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent dark:from-charcoal-deep/50 dark:to-transparent group-hover:from-lime/20 transition-colors duration-300" />
                            </Link>
                            <Link href="/shop/rainbow-pieces-stoner-pack-1000mg-canada" className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border mt-8 group">
                                <Image
                                    src="https://farluiuyvvqjbuxj.public.blob.vercel-storage.com/wp-media/2025/11/Rainbow-Pieces-get-wrecked-on-the-rainbow-with-logo.png"
                                    alt="Premium THC edibles from Mohawk Medibles"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent dark:from-charcoal-deep/50 dark:to-transparent group-hover:from-lime/20 transition-colors duration-300" />
                            </Link>
                            <Link href="/shop/zillionaire-shatter-1g-canada" className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border -mt-4 group">
                                <Image
                                    src="https://farluiuyvvqjbuxj.public.blob.vercel-storage.com/wp-media/2025/07/Zillionaire-Shatter-Photoroom.png"
                                    alt="Premium shatter concentrates from Mohawk Medibles"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent dark:from-charcoal-deep/50 dark:to-transparent group-hover:from-lime/20 transition-colors duration-300" />
                            </Link>
                            <Link href="/shop/pre-rolled-joint-canada" className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border mt-4 group">
                                <Image
                                    src="https://farluiuyvvqjbuxj.public.blob.vercel-storage.com/wp-media/2025/06/Premium-Pre-Rolls-Photoroom.png"
                                    alt="Premium pre-rolls from Mohawk Medibles"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent dark:from-charcoal-deep/50 dark:to-transparent group-hover:from-lime/20 transition-colors duration-300" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ QUALITY PROMISE — Full-width with image bg ═══ */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/assets/hero/abstract-haze.webp"
                        alt=""
                        fill
                        className="object-cover opacity-20"
                        sizes="100vw"
                        aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-white/80 dark:bg-charcoal-deep/80" />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">{t("about.qualityLabel")}</span>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 mb-6 text-foreground">
                        {t("about.qualityHeadline")}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed mb-10">
                        {t("about.qualityDescription")}
                    </p>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                        {[
                            { icon: FlaskRound, label: t("about.qualityLabTested"), detail: t("about.qualityLabTestedDetail") },
                            { icon: Leaf, label: t("about.qualityTerpeneProfiled"), detail: t("about.qualityTerpeneDetail") },
                            { icon: Shield, label: t("about.qualityContaminantFree"), detail: t("about.qualityContaminantDetail") },
                            { icon: Truck, label: t("about.qualityDiscreetShipping"), detail: t("about.qualityDiscreetDetail") },
                        ].map((item) => (
                            <div key={item.label} className="glass-card backdrop-blur-sm border border-border rounded-xl p-5 text-center group hover:border-lime/30 transition-all duration-300">
                                <div className="w-14 h-14 rounded-xl bg-forest/10 dark:bg-lime/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                                    <item.icon className="w-7 h-7 text-forest dark:text-lime" />
                                </div>
                                <div className="text-sm font-bold text-foreground">{item.label}</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">{item.detail}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ LOCATION / CTA — Rich final section ═══ */}
            <section className="py-24 md:py-32">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="relative glass-card border border-border rounded-3xl p-8 md:p-14 overflow-hidden">
                        {/* Background glow */}
                        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-lime/5 blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-forest/5 blur-[80px]" />

                        <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                            {/* Logo + info */}
                            <div className="space-y-6">
                                <div className="relative w-48 h-16">
                                    <Image
                                        src="/assets/logos/medibles-photoroom.png"
                                        alt="Mohawk Medibles logo"
                                        fill
                                        className="object-contain object-left"
                                    />
                                </div>
                                <div className="space-y-3 text-muted-foreground text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-forest/10 dark:bg-lime/10 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-4 h-4 text-forest dark:text-lime" />
                                        </div>
                                        <span>{t("contact.locationValue")} — {t("contact.locationDesc")}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-forest/10 dark:bg-lime/10 flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-4 h-4 text-forest dark:text-lime" />
                                        </div>
                                        <span>{t("contact.phoneValue")}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-forest/10 dark:bg-lime/10 flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-4 h-4 text-forest dark:text-lime" />
                                        </div>
                                        <span>{t("contact.emailValue")}</span>
                                    </div>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="space-y-4">
                                <h2 className="text-2xl md:text-3xl font-black font-display text-foreground">{t("about.readyToShop")}</h2>
                                <p className="text-muted-foreground">
                                    {t("about.readyToShopDesc")}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <Link
                                        href="/shop"
                                        className="inline-flex items-center justify-center bg-lime text-charcoal-deep px-8 py-4 rounded-full font-bold text-lg hover:bg-lime-light transition-colors shadow-[0_0_40px_rgba(200,230,62,0.3)] hover:shadow-[0_0_60px_rgba(200,230,62,0.4)]"
                                    >
                                        {t("about.browseCollection")}
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center justify-center border border-border text-foreground px-8 py-4 rounded-full font-bold hover:bg-muted transition-colors"
                                    >
                                        {t("about.contactUs")}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
