/**
 * Buy Weed Online Canada — Pillar Landing Page
 * ═══════════════════════════════════════════════
 * Primary SEO target: "buy weed online canada" (extremely competitive)
 * Secondary: "order cannabis online", "mail order marijuana",
 *            "online dispensary canada", "cheap weed canada",
 *            "AAAA weed online", "buy edibles online canada",
 *            "cannabis delivery canada", "weed delivery canada"
 *
 * 2,500+ word pillar page with WebPage, FAQPage, and BreadcrumbList
 * structured data for maximum SERP coverage.
 */
import type { Metadata } from "next";
import Link from "next/link";
import {
    Shield,
    Leaf,
    Truck,
    FlaskRound,
    Heart,
    Star,
    Package,
    Users,
    ChevronRight,
    ArrowRight,
    CreditCard,
    Zap,
    Clock,
    MapPin,
    BadgeCheck,
    ShoppingCart,
    CheckCircle,
    Lock,
    Award,
    Globe,
} from "lucide-react";
import { faqSchema, breadcrumbSchema, buildSchemaGraph } from "@/lib/seo/schemas";

/* ─── Metadata ────────────────────────────────────────────────── */

const PAGE_URL = "https://mohawkmedibles.ca/buy-weed-online-canada";

export const metadata: Metadata = {
    title: "Buy Weed Online Canada | Mohawk Medibles — Free Shipping Over $199",
    description:
        "Buy weed online in Canada from Mohawk Medibles. 344+ lab-tested products, free shipping over $199, discreet delivery. Shop now!",
    keywords: [
        "buy weed online canada",
        "order cannabis online",
        "mail order marijuana",
        "online dispensary canada",
        "cheap weed canada",
        "AAAA weed online",
        "buy edibles online canada",
        "cannabis delivery canada",
        "weed delivery canada",
        "buy cannabis online canada",
        "online weed dispensary",
        "mail order weed canada",
        "best online dispensary canada",
        "buy marijuana online canada",
        "canadian online dispensary",
        "weed online canada",
        "order weed online",
        "buy THC online canada",
        "buy concentrates online canada",
        "buy hash online canada",
        "buy vapes online canada",
        "Indigenous dispensary canada",
        "Mohawk Medibles",
    ],
    openGraph: {
        title: "Buy Weed Online Canada | Mohawk Medibles — Free Shipping Over $199",
        description:
            "Canada's trusted online dispensary. 344+ lab-tested products, AAAA flower, edibles, concentrates & more. Free shipping over $199. Indigenous-owned since 2019.",
        url: PAGE_URL,
        type: "website",
        images: ["/og-image.png"],
        siteName: "Mohawk Medibles",
        locale: "en_CA",
    },
    twitter: {
        card: "summary_large_image",
        title: "Buy Weed Online Canada | Mohawk Medibles",
        description:
            "344+ lab-tested cannabis products. Free shipping over $199. Indigenous-owned. Shop Canada's most trusted online dispensary.",
    },
    alternates: {
        canonical: PAGE_URL,
    },
    robots: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
    },
};

/* ─── Data ────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
    {
        question: "Is it safe to buy weed online in Canada?",
        answer:
            "Yes, buying weed online from a reputable Canadian dispensary like Mohawk Medibles is safe and discreet. We use secure payment processing (credit card, Interac e-Transfer, and cryptocurrency), ship in smell-proof, unmarked packaging via Canada Post Xpresspost with full tracking, and every product is third-party lab tested for potency and contaminants. We have served over 25,000 customers since 2019 with a 4.8-star average rating across 2,847 verified reviews.",
    },
    {
        question: "How long does weed delivery take in Canada?",
        answer:
            "Delivery typically takes 2-5 business days depending on your province. Ontario and Quebec orders usually arrive in 2-3 business days, Alberta and British Columbia in 3-4 days, and Atlantic provinces and territories in 4-5 days. All orders placed before our daily cutoff are processed and shipped the same day. Every package includes Canada Post Xpresspost tracking so you can follow your order from our facility to your door.",
    },
    {
        question: "What is the best online dispensary in Canada?",
        answer:
            "Mohawk Medibles is consistently rated one of the best online dispensaries in Canada. We are Indigenous-owned and have been operating since 2019, offering 344+ lab-tested products across flower, edibles, concentrates, vapes, hash, pre-rolls, CBD, and mushrooms. Our Empire Standard\u2122 quality program ensures every product meets rigorous potency, terpene, and contaminant testing standards. With free shipping over $199, tax-free pricing, and over 25,000 satisfied customers across all 13 provinces and territories, we deliver the quality, selection, and value that Canadian cannabis buyers trust.",
    },
    {
        question: "Do you offer free shipping on online weed orders?",
        answer:
            "Yes! Mohawk Medibles offers free shipping on all orders over $199. Orders under $199 ship for a flat rate of $15. All orders are shipped via Canada Post Xpresspost with full tracking and discreet, smell-proof packaging. We ship to every province and territory in Canada, and most orders arrive within 2-5 business days.",
    },
    {
        question: "What payment methods can I use to buy weed online?",
        answer:
            "Mohawk Medibles accepts three convenient payment methods: Credit Card (Visa, Mastercard, and American Express) processed securely through our encrypted payment gateway, Interac e-Transfer (Canada's most popular direct bank payment), and Cryptocurrency for customers who prefer decentralized payment options. All transactions are processed securely and your financial information is never stored on our servers.",
    },
    {
        question: "Can I buy AAAA weed online in Canada?",
        answer:
            "Absolutely. Mohawk Medibles carries a curated selection of AAAA (quad) grade cannabis flower, which represents the highest quality tier available. Our AAAA strains are selected for exceptional potency, terpene richness, visual appeal, and overall smoking experience. Every AAAA product goes through our Empire Standard\u2122 quality program, including third-party lab testing. Browse our AAAA collection in the Flower category on our shop page.",
    },
    {
        question: "How do I buy edibles online in Canada?",
        answer:
            "Buying edibles online from Mohawk Medibles is simple: browse our Edibles category, which includes THC gummies, chocolates, baked goods, beverages, and more. Add your selections to your cart, choose your payment method (credit card, e-Transfer, or crypto), and complete checkout. Your edibles will be shipped in discreet, temperature-appropriate packaging via Canada Post Xpresspost. All edibles are precisely dosed and lab-tested for consistent, reliable experiences.",
    },
    {
        question: "Do you ship weed to all provinces in Canada?",
        answer:
            "Yes, Mohawk Medibles ships to all 13 Canadian provinces and territories: Ontario, British Columbia, Alberta, Quebec, Manitoba, Saskatchewan, Nova Scotia, New Brunswick, Newfoundland & Labrador, Prince Edward Island, Northwest Territories, Yukon, and Nunavut. Delivery times range from 2-5 business days depending on your location, and all orders ship via Canada Post Xpresspost with tracking.",
    },
    {
        question: "What makes Mohawk Medibles different from other online dispensaries?",
        answer:
            "Mohawk Medibles stands apart in several key ways: We are authentically Indigenous-owned and operated since 2019, not a corporate brand. Our Empire Standard\u2122 quality program ensures every product is lab-tested for potency, terpenes, and contaminants. We offer tax-free pricing that is more affordable than government dispensaries. We carry 344+ products across 8 categories. We offer free shipping over $199. A portion of every purchase supports Indigenous community programs. And we have maintained a 4.8-star rating across 2,847 verified reviews from over 25,000 customers.",
    },
    {
        question: "Is buying weed online legal in Canada?",
        answer:
            "Cannabis was federally legalized in Canada on October 17, 2018 under the Cannabis Act. Adults aged 19+ (18+ in Alberta and Quebec) can legally purchase and possess cannabis. Mohawk Medibles operates as an Indigenous-owned dispensary under the inherent sovereignty and self-governance rights of the Mohawk Nation, which predate Canadian confederation and are protected under Section 35 of the Constitution Act, 1982. We have been reliably serving Canadian customers since 2019.",
    },
];

const PRODUCT_CATEGORIES = [
    {
        name: "Flower",
        description: "AAAA to craft-grade dried cannabis. Indica, sativa & hybrid strains with full terpene profiles.",
        href: "/shop?category=flower",
        icon: Leaf,
        count: "100+",
    },
    {
        name: "Edibles",
        description: "THC gummies, chocolates, baked goods & beverages. Precisely dosed for consistent experiences.",
        href: "/shop?category=edibles",
        icon: Package,
        count: "80+",
    },
    {
        name: "Concentrates",
        description: "Shatter, live resin, diamonds & distillate. Extracted for maximum potency and flavour.",
        href: "/shop?category=concentrates",
        icon: FlaskRound,
        count: "50+",
    },
    {
        name: "Vapes",
        description: "Cartridges and disposable pens. Convenient, discreet, and available in dozens of strains.",
        href: "/shop?category=vapes",
        icon: Zap,
        count: "40+",
    },
    {
        name: "Hash",
        description: "Traditional and premium pressed hash. Classic consumption for experienced cannabis enthusiasts.",
        href: "/shop?category=hash",
        icon: Star,
        count: "25+",
    },
    {
        name: "Pre-Rolls",
        description: "Singles, multi-packs & infused pre-rolls. Ready to enjoy with zero preparation required.",
        href: "/shop?category=pre-rolls",
        icon: CheckCircle,
        count: "30+",
    },
    {
        name: "CBD",
        description: "Oils, tinctures, capsules & topicals. Therapeutic relief without the psychoactive high.",
        href: "/shop?category=cbd",
        icon: Heart,
        count: "20+",
    },
    {
        name: "Mushrooms",
        description: "Psilocybin microdose capsules, dried mushrooms & edibles for therapeutic and recreational use.",
        href: "/shop?category=mushrooms",
        icon: Globe,
        count: "15+",
    },
];

const PROVINCES = [
    { name: "Ontario", slug: "ontario", abbr: "ON" },
    { name: "British Columbia", slug: "british-columbia", abbr: "BC" },
    { name: "Alberta", slug: "alberta", abbr: "AB" },
    { name: "Quebec", slug: "quebec", abbr: "QC" },
    { name: "Manitoba", slug: "manitoba", abbr: "MB" },
    { name: "Saskatchewan", slug: "saskatchewan", abbr: "SK" },
    { name: "Nova Scotia", slug: "nova-scotia", abbr: "NS" },
    { name: "New Brunswick", slug: "new-brunswick", abbr: "NB" },
    { name: "Newfoundland & Labrador", slug: "newfoundland-and-labrador", abbr: "NL" },
    { name: "Prince Edward Island", slug: "prince-edward-island", abbr: "PE" },
    { name: "Northwest Territories", slug: "northwest-territories", abbr: "NT" },
    { name: "Yukon", slug: "yukon", abbr: "YT" },
    { name: "Nunavut", slug: "nunavut", abbr: "NU" },
];

const TRUST_STATS = [
    { value: "344+", label: "Lab-Tested Products" },
    { value: "25K+", label: "Happy Customers" },
    { value: "4.8\u2605", label: "Average Rating" },
    { value: "2,847", label: "Verified Reviews" },
];

/* ─── Schema Builder ──────────────────────────────────────────── */

// Static hardcoded data — safe for JSON-LD, not user input
function buildPageSchema(): string {
    const webPageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${PAGE_URL}/#webpage`,
        name: "Buy Weed Online Canada | Mohawk Medibles",
        description:
            "Buy weed online in Canada from Mohawk Medibles. 344+ lab-tested products, free shipping over $199, discreet delivery to all 13 provinces.",
        url: PAGE_URL,
        isPartOf: { "@id": "https://mohawkmedibles.ca/#website" },
        about: { "@id": "https://mohawkmedibles.ca/#organization" },
        primaryImageOfPage: {
            "@type": "ImageObject",
            url: "https://mohawkmedibles.ca/og-image.png",
        },
        datePublished: "2026-03-12",
        dateModified: "2026-03-12",
        inLanguage: "en-CA",
        breadcrumb: { "@id": "https://mohawkmedibles.ca/#breadcrumb" },
        speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".hero-description", ".trust-stats"],
        },
    };

    return buildSchemaGraph(
        webPageSchema,
        faqSchema(FAQ_ITEMS),
        breadcrumbSchema([
            { name: "Home", url: "https://mohawkmedibles.ca" },
            { name: "Buy Weed Online Canada", url: PAGE_URL },
        ])
    );
}

/* ─── Page Component ──────────────────────────────────────────── */

export default function BuyWeedOnlineCanadaPage() {
    // Static hardcoded data — safe for JSON-LD, not user input
    const schemaJsonLd = buildPageSchema();

    return (
        <div className="min-h-screen page-glass text-foreground">
            {/* JSON-LD Structured Data
                NOTE: This uses dangerouslySetInnerHTML which is the standard
                Next.js pattern for JSON-LD schema injection. The data is
                entirely static and hardcoded above — no user input flows
                into this string. This is safe and expected. */}
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: schemaJsonLd }}
            />

            {/* ═══ BREADCRUMB NAV ═══ */}
            <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-6 md:px-12 pt-6">
                <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <li>
                        <Link href="/" className="hover:text-forest dark:hover:text-lime transition-colors">
                            Home
                        </Link>
                    </li>
                    <li><ChevronRight className="w-3 h-3" /></li>
                    <li className="text-foreground font-semibold">Buy Weed Online Canada</li>
                </ol>
            </nav>

            {/* ═══ HERO SECTION ═══ */}
            <section className="py-16 md:py-24">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <div className="max-w-4xl">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/15 border border-lime/30 text-lime text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                            Indigenous-Owned &bull; Trusted Since 2019
                        </span>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter font-display leading-[0.9] mb-6">
                            Buy Weed Online Canada
                            <br />
                            <span className="text-forest dark:text-lime">&mdash; Premium Cannabis</span>
                            <br />
                            Delivered to Your Door
                        </h1>

                        <p className="hero-description text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-8">
                            <strong className="text-foreground">Mohawk Medibles</strong> is Canada&apos;s most trusted
                            Indigenous-owned <strong className="text-foreground">online cannabis dispensary</strong>.
                            Browse <strong className="text-foreground">344+ lab-tested products</strong> — from AAAA
                            flower and potent edibles to premium concentrates, vapes, and more. Enjoy{" "}
                            <strong className="text-foreground">free shipping on orders over $199</strong>, tax-free
                            pricing, and discreet delivery to every province and territory in Canada.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/shop"
                                className="inline-flex items-center justify-center gap-2 bg-lime text-charcoal-deep px-8 py-4 rounded-full font-bold text-lg hover:bg-lime-light transition-colors shadow-[0_0_40px_rgba(200,230,62,0.3)]"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Shop All Products
                            </Link>
                            <Link
                                href="/deals"
                                className="inline-flex items-center justify-center gap-2 border border-foreground/20 dark:border-white/20 text-foreground dark:text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-foreground/10 dark:hover:bg-white/10 transition-colors"
                            >
                                View Deals &amp; Specials
                            </Link>
                        </div>
                    </div>

                    {/* ─── Value Props Row ─── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                        {[
                            { icon: FlaskRound, text: "Lab-Tested Products" },
                            { icon: Truck, text: "Free Shipping $199+" },
                            { icon: Shield, text: "Indigenous-Owned" },
                            { icon: Lock, text: "Secure Checkout" },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3 glass-card backdrop-blur-xl border border-border rounded-xl p-4">
                                <Icon className="w-5 h-5 text-forest dark:text-lime flex-shrink-0" />
                                <span className="text-sm font-semibold">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TRUST STATS BAR ═══ */}
            <section className="py-12 bg-muted/50">
                <div className="trust-stats max-w-6xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {TRUST_STATS.map((stat) => (
                            <div key={stat.label} className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6 text-center">
                                <div className="text-3xl md:text-4xl font-black text-forest dark:text-lime font-display">{stat.value}</div>
                                <div className="text-xs text-muted-foreground font-bold tracking-widest uppercase mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ WHY BUY FROM MOHAWK MEDIBLES ═══ */}
            <section className="py-16 md:py-20" id="why-mohawk-medibles">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Why Buy From Us</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">
                            Why Canadians Choose Mohawk Medibles to{" "}
                            <span className="text-forest dark:text-lime">Buy Weed Online</span>
                        </h2>
                        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
                            Since 2019, over 25,000 Canadians have trusted Mohawk Medibles as their go-to{" "}
                            <strong className="text-foreground">online dispensary in Canada</strong>. Here&apos;s why.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Shield,
                                title: "Indigenous-Owned Since 2019",
                                description:
                                    "Mohawk Medibles is authentically Indigenous-owned and operated from Six Nations territory. When you buy weed online from us, you support Indigenous economic sovereignty and community programs. We are not a corporate cannabis brand — we are a community-rooted business with deep cultural heritage.",
                            },
                            {
                                icon: Award,
                                title: "Empire Standard\u2122 Quality",
                                description:
                                    "Every product in our catalogue passes the Empire Standard\u2122 — a four-point quality assurance process that includes potency verification, terpene profiling, contaminant screening, and visual inspection. We reject products that don't meet our standards so you never have to worry about what you're consuming.",
                            },
                            {
                                icon: FlaskRound,
                                title: "Third-Party Lab Tested",
                                description:
                                    "All cannabis products sold on Mohawk Medibles are tested by independent, accredited laboratories. We verify THC/CBD potency, screen for pesticides, heavy metals, mould, and microbials, and profile terpenes so you know exactly what you're getting with every order.",
                            },
                            {
                                icon: Users,
                                title: "25,000+ Satisfied Customers",
                                description:
                                    "With over 25,000 customers served across all 13 provinces and territories, a 4.8-star average rating, and 2,847 verified reviews, Mohawk Medibles has earned its reputation as one of Canada's best online dispensaries. Our repeat customer rate speaks for itself.",
                            },
                        ].map(({ icon: Icon, title, description }) => (
                            <div key={title} className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6 space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center">
                                    <Icon className="w-6 h-6 text-forest dark:text-lime" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ PRODUCT CATEGORY SHOWCASE ═══ */}
            <section className="py-16 md:py-20 bg-muted/50" id="categories">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Shop by Category</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">
                            344+ Premium Cannabis Products to{" "}
                            <span className="text-forest dark:text-lime">Order Online</span>
                        </h2>
                        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                            Whether you want to <strong className="text-foreground">buy weed online</strong>,{" "}
                            <strong className="text-foreground">order edibles</strong>, or explore concentrates and vapes,
                            Mohawk Medibles has the selection and quality you&apos;re looking for.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {PRODUCT_CATEGORIES.map(({ name, description, href, icon: Icon, count }) => (
                            <Link
                                key={name}
                                href={href}
                                className="group glass-card backdrop-blur-xl border border-border rounded-2xl p-6 hover:border-lime/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,230,62,0.1)]"
                            >
                                <div className="w-10 h-10 rounded-lg bg-lime/15 border border-lime/30 flex items-center justify-center mb-4 group-hover:bg-lime/25 transition-colors">
                                    <Icon className="w-5 h-5 text-forest dark:text-lime" />
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors">
                                        {name}
                                    </h3>
                                    <span className="text-xs text-muted-foreground font-bold bg-muted px-2 py-0.5 rounded-full">
                                        {count}
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                                <span className="inline-flex items-center gap-1 mt-3 text-forest dark:text-lime text-sm font-semibold group-hover:gap-2 transition-all">
                                    Shop {name} <ArrowRight className="w-4 h-4" />
                                </span>
                            </Link>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <Link
                            href="/shop"
                            className="inline-flex items-center justify-center gap-2 bg-lime text-charcoal-deep px-8 py-4 rounded-full font-bold text-lg hover:bg-lime-light transition-colors"
                        >
                            Browse All 344+ Products <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ HOW TO ORDER CANNABIS ONLINE ═══ */}
            <section className="py-16 md:py-20" id="how-to-order">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Simple 3-Step Process</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">
                            How to <span className="text-forest dark:text-lime">Buy Weed Online</span> From Mohawk Medibles
                        </h2>
                        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                            Ordering cannabis online has never been easier. Three simple steps and your premium products
                            are on their way to your door.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                icon: ShoppingCart,
                                title: "Browse & Add to Cart",
                                description:
                                    "Explore our curated selection of 344+ cannabis products. Use category filters, search by strain name, or browse our deals page for the best prices. Add your favourites to your cart — there is no account required to start shopping.",
                            },
                            {
                                step: "02",
                                icon: CreditCard,
                                title: "Secure Checkout",
                                description:
                                    "Choose your preferred payment method: credit card (Visa, Mastercard, Amex), Interac e-Transfer, or cryptocurrency. All payment processing is encrypted and secure. Your financial data is never stored on our servers.",
                            },
                            {
                                step: "03",
                                icon: Truck,
                                title: "Discreet Delivery",
                                description:
                                    "Your order is packed in smell-proof, unmarked packaging and shipped via Canada Post Xpresspost with full tracking. Free shipping on orders over $199, flat $15 rate for orders under $199. Delivery takes 2-5 business days.",
                            },
                        ].map(({ step, icon: Icon, title, description }) => (
                            <div key={step} className="glass-card backdrop-blur-xl border border-border rounded-2xl p-8 relative">
                                <span className="absolute top-4 right-6 text-6xl font-black text-muted-foreground/10 font-display">
                                    {step}
                                </span>
                                <div className="w-12 h-12 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center mb-5">
                                    <Icon className="w-6 h-6 text-forest dark:text-lime" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>

                    <p className="text-center mt-8 text-muted-foreground">
                        Need more details?{" "}
                        <Link href="/how-to-order" className="text-forest dark:text-lime font-semibold hover:underline">
                            Read our full ordering guide
                        </Link>.
                    </p>
                </div>
            </section>

            {/* ═══ PAYMENT METHODS ═══ */}
            <section className="py-16 md:py-20 bg-muted/50" id="payment-methods">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Flexible Payments</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">
                            Secure Payment Methods for{" "}
                            <span className="text-forest dark:text-lime">Online Cannabis Orders</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: CreditCard,
                                title: "Credit Card",
                                description:
                                    "Pay instantly with Visa, Mastercard, or American Express. Our payment gateway uses bank-level 256-bit SSL encryption to protect your card details. Transactions appear discreetly on your statement.",
                                badges: ["Visa", "Mastercard", "Amex"],
                            },
                            {
                                icon: BadgeCheck,
                                title: "Interac e-Transfer",
                                description:
                                    "Send payment directly from your bank account using Interac e-Transfer — Canada's most trusted peer-to-peer payment method. No credit card needed. Instructions are provided at checkout for a fast, seamless experience.",
                                badges: ["Interac", "All Banks"],
                            },
                            {
                                icon: Lock,
                                title: "Cryptocurrency",
                                description:
                                    "For maximum privacy, pay with cryptocurrency. We accept Bitcoin and other major cryptocurrencies through our secure payment integration. Ideal for customers who value decentralized, anonymous transactions.",
                                badges: ["Bitcoin", "Privacy"],
                            },
                        ].map(({ icon: Icon, title, description, badges }) => (
                            <div key={title} className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6">
                                <div className="w-12 h-12 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center mb-4">
                                    <Icon className="w-6 h-6 text-forest dark:text-lime" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {badges.map((badge) => (
                                        <span key={badge} className="px-2 py-0.5 rounded-full bg-lime/10 border border-lime/20 text-lime text-[10px] font-bold uppercase">
                                            {badge}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ SHIPPING & DELIVERY ═══ */}
            <section className="py-16 md:py-20" id="shipping">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Canada-Wide Delivery</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">
                            Weed Delivery Across{" "}
                            <span className="text-forest dark:text-lime">All of Canada</span>
                        </h2>
                        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                            Fast, discreet, and reliable <strong className="text-foreground">cannabis delivery</strong> to
                            every province and territory. Your order is our priority.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {[
                            {
                                icon: Truck,
                                title: "Free Shipping Over $199",
                                detail: "Orders under $199 ship for a flat $15",
                            },
                            {
                                icon: Clock,
                                title: "2-5 Business Days",
                                detail: "Canada Post Xpresspost with tracking",
                            },
                            {
                                icon: Package,
                                title: "Discreet Packaging",
                                detail: "Smell-proof, unmarked plain boxes",
                            },
                        ].map(({ icon: Icon, title, detail }) => (
                            <div key={title} className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6 text-center">
                                <Icon className="w-8 h-8 text-forest dark:text-lime mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
                                <p className="text-muted-foreground text-sm">{detail}</p>
                            </div>
                        ))}
                    </div>

                    <div className="glass-card backdrop-blur-xl border border-border rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-foreground mb-4">Estimated Delivery Times by Region</h3>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { region: "Ontario & Quebec", time: "2-3 business days" },
                                { region: "Alberta & BC", time: "3-4 business days" },
                                { region: "Manitoba & Saskatchewan", time: "3-4 business days" },
                                { region: "Atlantic Provinces", time: "4-5 business days" },
                                { region: "Northern Territories", time: "5-7 business days" },
                                { region: "Remote Areas", time: "5-7 business days" },
                            ].map(({ region, time }) => (
                                <div key={region} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm font-semibold text-foreground">{region}</span>
                                    <span className="text-sm text-forest dark:text-lime font-bold">{time}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            All times are estimates based on Canada Post Xpresspost standards.{" "}
                            <Link href="/shipping-policy" className="text-forest dark:text-lime font-semibold hover:underline">
                                Read our full shipping policy
                            </Link>.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ PROVINCE DELIVERY COVERAGE ═══ */}
            <section className="py-16 md:py-20 bg-muted/50" id="delivery-coverage">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Coast to Coast</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">
                            We Ship Cannabis to{" "}
                            <span className="text-forest dark:text-lime">Every Province &amp; Territory</span>
                        </h2>
                        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                            No matter where you live in Canada, you can <strong className="text-foreground">buy weed online</strong>{" "}
                            from Mohawk Medibles and have it delivered to your door. Click your province below for local delivery details.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {PROVINCES.map(({ name, slug, abbr }) => (
                            <Link
                                key={slug}
                                href={`/delivery/${slug}`}
                                className="group glass-card backdrop-blur-xl border border-border rounded-xl p-4 text-center hover:border-lime/50 transition-all duration-300"
                            >
                                <MapPin className="w-5 h-5 text-forest dark:text-lime mx-auto mb-2" />
                                <div className="text-sm font-bold text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors">
                                    {name}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-0.5">
                                    {abbr}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ WHY BUY WEED ONLINE — LONG-FORM CONTENT ═══ */}
            <section className="py-16 md:py-20" id="why-buy-online">
                <div className="max-w-4xl mx-auto px-6 md:px-12">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-foreground mb-8">
                        Why More Canadians Are Choosing to{" "}
                        <span className="text-forest dark:text-lime">Buy Cannabis Online</span>
                    </h2>

                    <div className="space-y-6 text-muted-foreground leading-relaxed">
                        <p className="text-lg">
                            The Canadian cannabis market has evolved dramatically since federal legalization in October 2018.
                            While brick-and-mortar dispensaries serve their purpose, a growing number of Canadians are
                            discovering the advantages of <strong className="text-foreground">buying weed online</strong> from
                            trusted dispensaries like Mohawk Medibles. The reasons are compelling: better selection, more
                            competitive pricing, lab-tested quality assurance, and the convenience of doorstep delivery.
                        </p>

                        <h3 className="text-2xl font-black font-display text-foreground pt-4">
                            Superior Selection and Quality
                        </h3>
                        <p>
                            Physical dispensaries are limited by shelf space. An <strong className="text-foreground">online dispensary</strong>{" "}
                            like Mohawk Medibles carries over 344 products across eight categories — far more than any storefront
                            can offer. From <Link href="/shop?category=flower" className="text-forest dark:text-lime font-semibold hover:underline">AAAA craft flower</Link>{" "}
                            and <Link href="/shop?category=edibles" className="text-forest dark:text-lime font-semibold hover:underline">precisely-dosed edibles</Link>{" "}
                            to <Link href="/shop?category=concentrates" className="text-forest dark:text-lime font-semibold hover:underline">potent concentrates</Link>{" "}
                            and <Link href="/shop?category=vapes" className="text-forest dark:text-lime font-semibold hover:underline">convenient vape pens</Link>,
                            our online catalogue gives you access to products that most local shops simply cannot stock.
                        </p>
                        <p>
                            Every product on Mohawk Medibles undergoes our{" "}
                            <strong className="text-foreground">Empire Standard&trade;</strong> quality assurance process.
                            This four-point program includes potency verification, terpene profiling, contaminant screening
                            (pesticides, heavy metals, mould), and visual inspection. When you{" "}
                            <strong className="text-foreground">order cannabis online</strong> from us, you know exactly
                            what you&apos;re getting — no guesswork, no surprises.
                        </p>

                        <h3 className="text-2xl font-black font-display text-foreground pt-4">
                            Better Prices and Tax-Free Savings
                        </h3>
                        <p>
                            One of the biggest advantages of buying from an Indigenous-owned online dispensary is the
                            pricing. Mohawk Medibles offers <strong className="text-foreground">tax-free cannabis</strong> on
                            every order, which can save you 13-15% compared to government-licensed retailers in provinces
                            like Ontario and British Columbia. Combined with our competitive base prices and{" "}
                            <Link href="/deals" className="text-forest dark:text-lime font-semibold hover:underline">regular deals and promotions</Link>,
                            buying weed online from Mohawk Medibles puts more money back in your pocket without
                            compromising on quality.
                        </p>

                        <h3 className="text-2xl font-black font-display text-foreground pt-4">
                            Privacy, Convenience, and Discretion
                        </h3>
                        <p>
                            Not everyone wants to walk into a physical dispensary. When you <strong className="text-foreground">mail order marijuana</strong>{" "}
                            from Mohawk Medibles, your order arrives in completely discreet, smell-proof packaging with no
                            identifying markings. The process is simple: browse from your phone or computer, check out
                            securely with your preferred payment method, and your order shows up at your door within 2-5
                            business days. No lines, no judgment, no hassle.
                        </p>

                        <h3 className="text-2xl font-black font-display text-foreground pt-4">
                            Supporting Indigenous Communities
                        </h3>
                        <p>
                            When you <strong className="text-foreground">buy weed online</strong> from Mohawk Medibles,
                            your purchase directly supports Indigenous economic sovereignty and community development.
                            We are a genuinely Indigenous-owned business operating from Six Nations territory, and a
                            portion of every order goes toward community programs, youth initiatives, and cultural
                            preservation. Learn more{" "}
                            <Link href="/indigenous-cannabis-dispensary-canada" className="text-forest dark:text-lime font-semibold hover:underline">
                                about our Indigenous heritage
                            </Link>{" "}
                            and what it means to shop with purpose.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ FAQ SECTION ═══ */}
            <section className="py-16 md:py-20 bg-muted/50" id="faq">
                <div className="max-w-4xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Common Questions</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">
                            Frequently Asked Questions About{" "}
                            <span className="text-forest dark:text-lime">Buying Weed Online in Canada</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {FAQ_ITEMS.map((faq, index) => (
                            <div key={index} className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-foreground mb-3 flex items-start gap-3">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-lime/15 border border-lime/30 text-forest dark:text-lime text-xs font-bold flex-shrink-0 mt-0.5">
                                        {index + 1}
                                    </span>
                                    {faq.question}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed pl-10">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>

                    <p className="text-center mt-8 text-muted-foreground">
                        Have more questions?{" "}
                        <Link href="/faq" className="text-forest dark:text-lime font-semibold hover:underline">
                            Visit our full FAQ page
                        </Link>{" "}
                        or{" "}
                        <Link href="/contact" className="text-forest dark:text-lime font-semibold hover:underline">
                            contact our support team
                        </Link>.
                    </p>
                </div>
            </section>

            {/* ═══ TRUST SIGNALS ═══ */}
            <section className="py-16 md:py-20" id="trust">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Trusted by Canadians</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">
                            Canada&apos;s Most Trusted{" "}
                            <span className="text-forest dark:text-lime">Online Cannabis Dispensary</span>
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: FlaskRound,
                                title: "Lab Tested",
                                detail: "Every product verified for potency, terpenes & contaminants by accredited labs",
                            },
                            {
                                icon: Star,
                                title: "4.8\u2605 Rating",
                                detail: "Consistently rated among the top online dispensaries in Canada by our customers",
                            },
                            {
                                icon: Users,
                                title: "2,847 Reviews",
                                detail: "Verified customer reviews from real Canadians across all 13 provinces & territories",
                            },
                            {
                                icon: Shield,
                                title: "Since 2019",
                                detail: "Over 6 years of reliable service, 25K+ customers, and zero data breaches",
                            },
                        ].map(({ icon: Icon, title, detail }) => (
                            <div key={title} className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6 text-center">
                                <Icon className="w-8 h-8 text-forest dark:text-lime mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                                <p className="text-muted-foreground text-sm">{detail}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Link href="/reviews" className="text-forest dark:text-lime font-semibold hover:underline inline-flex items-center gap-1">
                            Read All Customer Reviews <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ FINAL CTA ═══ */}
            <section className="py-20 md:py-28">
                <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight font-display text-foreground mb-6">
                        Ready to <span className="text-forest dark:text-lime">Buy Weed Online</span> in Canada?
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Join over 25,000 Canadians who trust Mohawk Medibles for premium, lab-tested cannabis
                        delivered discreetly to their door. Free shipping on orders over $199.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/shop"
                            className="inline-flex items-center justify-center gap-2 bg-lime text-charcoal-deep px-10 py-5 rounded-full font-bold text-xl hover:bg-lime-light transition-colors shadow-[0_0_40px_rgba(200,230,62,0.3)]"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            Shop Now
                        </Link>
                        <Link
                            href="/deals"
                            className="inline-flex items-center justify-center gap-2 border border-foreground/20 dark:border-white/20 text-foreground dark:text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-foreground/10 dark:hover:bg-white/10 transition-colors"
                        >
                            Today&apos;s Deals
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ INTERNAL LINKS FOOTER ═══ */}
            <section className="py-12 border-t border-border">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <h3 className="text-sm font-bold text-foreground mb-6 tracking-widest uppercase">Explore Mohawk Medibles</h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3 text-sm">
                        <div className="space-y-2">
                            <h4 className="font-bold text-forest dark:text-lime text-xs tracking-widest uppercase mb-3">Shop</h4>
                            <Link href="/shop" className="block text-muted-foreground hover:text-foreground transition-colors">All Products</Link>
                            <Link href="/shop?category=flower" className="block text-muted-foreground hover:text-foreground transition-colors">Flower</Link>
                            <Link href="/shop?category=edibles" className="block text-muted-foreground hover:text-foreground transition-colors">Edibles</Link>
                            <Link href="/shop?category=concentrates" className="block text-muted-foreground hover:text-foreground transition-colors">Concentrates</Link>
                            <Link href="/shop?category=vapes" className="block text-muted-foreground hover:text-foreground transition-colors">Vapes</Link>
                            <Link href="/shop?category=hash" className="block text-muted-foreground hover:text-foreground transition-colors">Hash</Link>
                            <Link href="/shop?category=pre-rolls" className="block text-muted-foreground hover:text-foreground transition-colors">Pre-Rolls</Link>
                            <Link href="/shop?category=cbd" className="block text-muted-foreground hover:text-foreground transition-colors">CBD</Link>
                            <Link href="/shop?category=mushrooms" className="block text-muted-foreground hover:text-foreground transition-colors">Mushrooms</Link>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-forest dark:text-lime text-xs tracking-widest uppercase mb-3">Information</h4>
                            <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
                            <Link href="/how-to-order" className="block text-muted-foreground hover:text-foreground transition-colors">How to Order</Link>
                            <Link href="/faq" className="block text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
                            <Link href="/blog" className="block text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
                            <Link href="/reviews" className="block text-muted-foreground hover:text-foreground transition-colors">Customer Reviews</Link>
                            <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-forest dark:text-lime text-xs tracking-widest uppercase mb-3">Policies</h4>
                            <Link href="/shipping-policy" className="block text-muted-foreground hover:text-foreground transition-colors">Shipping Policy</Link>
                            <Link href="/returns-policy" className="block text-muted-foreground hover:text-foreground transition-colors">Returns Policy</Link>
                            <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="block text-muted-foreground hover:text-foreground transition-colors">Terms of Use</Link>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-forest dark:text-lime text-xs tracking-widest uppercase mb-3">Delivery</h4>
                            <Link href="/delivery/ontario" className="block text-muted-foreground hover:text-foreground transition-colors">Ontario</Link>
                            <Link href="/delivery/british-columbia" className="block text-muted-foreground hover:text-foreground transition-colors">British Columbia</Link>
                            <Link href="/delivery/alberta" className="block text-muted-foreground hover:text-foreground transition-colors">Alberta</Link>
                            <Link href="/delivery/quebec" className="block text-muted-foreground hover:text-foreground transition-colors">Quebec</Link>
                            <Link href="/delivery/manitoba" className="block text-muted-foreground hover:text-foreground transition-colors">Manitoba</Link>
                            <Link href="/delivery/saskatchewan" className="block text-muted-foreground hover:text-foreground transition-colors">Saskatchewan</Link>
                            <Link href="/delivery/nova-scotia" className="block text-muted-foreground hover:text-foreground transition-colors">Nova Scotia</Link>
                            <Link href="/delivery" className="block text-forest dark:text-lime font-semibold hover:underline">All Provinces &rarr;</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
