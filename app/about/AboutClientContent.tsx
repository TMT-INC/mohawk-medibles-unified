/**
 * About Us — Client Content
 * Uses i18n translation system for all text content.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { Shield, Leaf, Truck, FlaskRound, Heart, MapPin, Phone, Mail } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

/* Representative product images for the showcase strip */
const SHOWCASE_IMAGES = [
    { src: "https://mohawkmedibles.ca/wp-content/uploads/2025/09/Sun-Rock-04-with-logo.png", alt: "Premium AAAA flower", href: "/shop/sun-rock-premium-aaaa-flower-2-25g-canada" },
    { src: "https://mohawkmedibles.ca/wp-content/uploads/2025/11/Rainbow-Pieces-get-wrecked-on-the-rainbow-with-logo.png", alt: "THC edible gummies", href: "/shop/rainbow-pieces-stoner-pack-1000mg-canada" },
    { src: "https://mohawkmedibles.ca/wp-content/uploads/2025/07/Zillionaire-Shatter-Photoroom.png", alt: "Premium shatter concentrate", href: "/shop/zillionaire-shatter-1g-canada" },
    { src: "https://mohawkmedibles.ca/wp-content/uploads/2025/06/Premium-Pre-Rolls-Photoroom.png", alt: "Premium pre-rolls", href: "/shop/pre-rolled-joint-canada" },
    { src: "https://mohawkmedibles.ca/wp-content/uploads/2025/05/2000mg-CBD-MCT-Oil-with-logo.png", alt: "CBD oil tincture", href: "/shop/cbd-tincture-2000mg-canada" },
    { src: "https://mohawkmedibles.ca/wp-content/uploads/2025/05/pem_gummy_bears_1200x1200-1.jpg", alt: "THC gummy bears", href: "/shop/pineapple-express-meds-pem-gummy-canada" },
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

    return (
        <div className="min-h-screen page-glass text-foreground">

            {/* ═══ HERO — Full-bleed cinematic ═══ */}
            <section className="relative min-h-[70vh] flex items-center overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0">
                    <Image
                        src="/assets/hero/cannabis-closeup.jpg"
                        alt="Premium cannabis flower macro shot — Mohawk Medibles"
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/75 to-white/40 dark:from-charcoal-deep/95 dark:via-charcoal-deep/80 dark:to-charcoal-deep/50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/30 dark:from-charcoal-deep dark:via-transparent dark:to-charcoal-deep/40" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-32">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/15 border border-lime/30 text-lime text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        {t("about.heroBadge")}
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter font-display leading-[0.9] mb-6">
                        {t("about.heroHeadline1")}
                        <br />
                        <span className="text-lime">{t("about.heroHeadline2")}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-foreground/70 dark:text-white/70 max-w-2xl leading-relaxed">
                        {t("about.heroDescription")}
                    </p>
                </div>
            </section>

            {/* ═══ STATS BAR ═══ */}
            <section className="relative z-10 -mt-12">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6 text-center">
                                <div className="text-3xl md:text-4xl font-black text-forest dark:text-lime font-display">{stat.value}</div>
                                <div className="text-xs text-muted-foreground font-bold tracking-widest uppercase mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ MISSION — Split layout with image ═══ */}
            <section className="py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                        {/* Image side */}
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-border">
                            <Image
                                src="/assets/hero/abstract-haze.webp"
                                alt="Cannabis cultivation and heritage — Mohawk Medibles story"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent dark:from-charcoal-deep/60 dark:to-transparent" />
                            {/* Watermark */}
                            <div className="absolute bottom-4 right-4 pointer-events-none">
                                <Image
                                    src="/assets/logos/medibles-logo2.png"
                                    alt=""
                                    width={48}
                                    height={48}
                                    className="opacity-20 select-none"
                                    aria-hidden="true"
                                />
                            </div>
                        </div>

                        {/* Text side */}
                        <div className="space-y-6">
                            <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">{t("about.missionLabel")}</span>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-foreground">
                                {t("about.missionHeadline1")}<br />{t("about.missionHeadline2")}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {t("about.missionDescription")}
                            </p>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <span className="px-3 py-1.5 rounded-full bg-lime/10 border border-lime/20 text-lime text-xs font-bold">{t("about.missionTagLabTested")}</span>
                                <span className="px-3 py-1.5 rounded-full bg-lime/10 border border-lime/20 text-lime text-xs font-bold">{t("about.missionTagEmpireStandard")}</span>
                                <span className="px-3 py-1.5 rounded-full bg-lime/10 border border-lime/20 text-lime text-xs font-bold">{t("about.missionTagTaxFree")}</span>
                                <span className="px-3 py-1.5 rounded-full bg-lime/10 border border-lime/20 text-lime text-xs font-bold">{t("about.missionTagCanadaWide")}</span>
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

            {/* ═══ VALUES GRID — Cards with icons ═══ */}
            <section className="py-20 md:py-28">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">{t("about.valuesLabel")}</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">{t("about.valuesHeadline")}</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {VALUES.map((v) => (
                            <div
                                key={v.title}
                                className={`relative overflow-hidden glass-card border border-border rounded-2xl p-8 space-y-4 group hover:border-forest/30 dark:hover:border-lime/30 transition-all duration-300`}
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

            {/* ═══ JOURNEY TIMELINE — With side image ═══ */}
            <section className="py-20 md:py-28 bg-muted/50">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
                        {/* Timeline side */}
                        <div>
                            <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">{t("about.journeyLabel")}</span>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 mb-10 text-foreground">
                                {t("about.journeyHeadline")}
                            </h2>
                            <div className="space-y-0">
                                {MILESTONES.map((m, i) => (
                                    <div key={m.year} className="flex gap-5 group">
                                        {/* Line + Dot */}
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${m.highlight ? "bg-forest dark:bg-lime shadow-[0_0_10px_rgba(200,230,62,0.5)]" : "bg-border"}`} />
                                            {i < MILESTONES.length - 1 && (
                                                <div className="w-px flex-1 bg-border" />
                                            )}
                                        </div>
                                        {/* Content */}
                                        <div className="pb-8">
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
                                    src="https://mohawkmedibles.ca/wp-content/uploads/2025/09/Sun-Rock-04-with-logo.png"
                                    alt="Premium AAAA flower from Mohawk Medibles"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent dark:from-charcoal-deep/50 dark:to-transparent group-hover:from-lime/20 transition-colors duration-300" />
                            </Link>
                            <Link href="/shop/rainbow-pieces-stoner-pack-1000mg-canada" className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border mt-8 group">
                                <Image
                                    src="https://mohawkmedibles.ca/wp-content/uploads/2025/11/Rainbow-Pieces-get-wrecked-on-the-rainbow-with-logo.png"
                                    alt="Premium THC edibles from Mohawk Medibles"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent dark:from-charcoal-deep/50 dark:to-transparent group-hover:from-lime/20 transition-colors duration-300" />
                            </Link>
                            <Link href="/shop/zillionaire-shatter-1g-canada" className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border -mt-4 group">
                                <Image
                                    src="https://mohawkmedibles.ca/wp-content/uploads/2025/07/Zillionaire-Shatter-Photoroom.png"
                                    alt="Premium shatter concentrates from Mohawk Medibles"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent dark:from-charcoal-deep/50 dark:to-transparent group-hover:from-lime/20 transition-colors duration-300" />
                            </Link>
                            <Link href="/shop/pre-rolled-joint-canada" className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border mt-4 group">
                                <Image
                                    src="https://mohawkmedibles.ca/wp-content/uploads/2025/06/Premium-Pre-Rolls-Photoroom.png"
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
            <section className="relative py-20 md:py-28 overflow-hidden">
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
                            <div key={item.label} className="glass-card backdrop-blur-sm border border-border rounded-xl p-5 text-center">
                                <item.icon className="w-8 h-8 text-forest dark:text-lime mx-auto mb-3" />
                                <div className="text-sm font-bold text-foreground">{item.label}</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">{item.detail}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ LOCATION / CTA ═══ */}
            <section className="py-20 md:py-28">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="glass-card border border-border rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center">
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
                                    <MapPin className="w-4 h-4 text-forest dark:text-lime flex-shrink-0" />
                                    <span>{t("contact.locationValue")} — {t("contact.locationDesc")}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-forest dark:text-lime flex-shrink-0" />
                                    <span>{t("contact.phoneValue")}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-forest dark:text-lime flex-shrink-0" />
                                    <span>{t("contact.emailValue")}</span>
                                </div>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black font-display text-foreground">{t("about.readyToShop")}</h2>
                            <p className="text-muted-foreground text-sm">
                                {t("about.readyToShopDesc")}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center justify-center bg-lime text-charcoal-deep px-6 py-3.5 rounded-full font-bold hover:bg-lime-light transition-colors shadow-[0_0_30px_rgba(200,230,62,0.3)]"
                                >
                                    {t("about.browseCollection")}
                                </Link>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center justify-center border border-border text-foreground px-6 py-3.5 rounded-full font-bold hover:bg-muted transition-colors"
                                >
                                    {t("about.contactUs")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
