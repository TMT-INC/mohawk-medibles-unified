/**
 * Indigenous Cannabis Dispensary Canada — Pillar Page
 * ═══════════════════════════════════════════════════
 * Primary SEO target: "Indigenous cannabis dispensary Canada"
 * Secondary: "Indigenous owned dispensary", "First Nations cannabis",
 *            "Mohawk Territory cannabis", "Native cannabis online"
 *
 * 3,000+ word pillar page with FAQPage, Article, and BreadcrumbList
 * structured data for maximum SERP coverage.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
    Shield,
    Leaf,
    Truck,
    FlaskRound,
    Heart,
    MapPin,
    Star,
    Package,
    Users,
    ChevronRight,
    ArrowRight,
    Globe,
    CheckCircle,
} from "lucide-react";
import { faqSchema, breadcrumbSchema, articleSchema, buildSchemaGraph } from "@/lib/seo/schemas";

/* ─── Metadata ────────────────────────────────────────────────── */

const PAGE_URL = "https://mohawkmedibles.ca/indigenous-cannabis-dispensary-canada";

export const metadata: Metadata = {
    title: "Indigenous Cannabis Dispensary Canada — Tyendinaga Mohawk Territory",
    description:
        "Canada's trusted Indigenous-owned online cannabis dispensary. Shop 360+ premium products with free shipping over $149. Proudly serving all 13 provinces from Tyendinaga Mohawk Territory since 2018.",
    keywords: [
        "Indigenous cannabis dispensary",
        "Indigenous owned dispensary Canada",
        "First Nations cannabis",
        "Mohawk Territory cannabis",
        "Native cannabis online",
        "Indigenous dispensary Canada",
        "Mohawk Medibles",
        "Tyendinaga cannabis",
        "Tyendinaga dispensary",
        "Indigenous cannabis shop",
        "buy cannabis Indigenous dispensary",
        "First Nations online dispensary",
        "Native owned cannabis store Canada",
    ],
    openGraph: {
        title: "Indigenous Cannabis Dispensary Canada",
        description:
            "Canada's trusted Indigenous-owned online cannabis dispensary. 360+ premium products, free shipping over $149, proudly serving from Tyendinaga Mohawk Territory since 2018.",
        url: PAGE_URL,
        type: "article",
        images: ["/og-image.png"],
        siteName: "Mohawk Medibles",
        locale: "en_CA",
    },
    twitter: {
        card: "summary_large_image",
        title: "Indigenous Cannabis Dispensary Canada",
        description:
            "Canada's trusted Indigenous-owned online cannabis dispensary. 360+ products from Tyendinaga Mohawk Territory.",
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
        question: "What is an Indigenous cannabis dispensary?",
        answer:
            "An Indigenous cannabis dispensary is a cannabis retail business owned and operated by Indigenous peoples, typically located on or connected to First Nations, Métis, or Inuit territories. These dispensaries operate under the inherent sovereignty of Indigenous nations and their right to self-governance and economic self-determination. Mohawk Medibles is an Indigenous-owned cannabis dispensary operating from Tyendinaga Mohawk Territory, serving customers across all 13 Canadian provinces and territories with 360+ premium, lab-tested cannabis products.",
    },
    {
        question: "Is it legal to buy from an Indigenous dispensary in Canada?",
        answer:
            "Indigenous cannabis dispensaries like Mohawk Medibles operate under the inherent sovereignty and self-governance rights of Indigenous nations, which predate Canadian confederation. The Mohawk Nation and the broader Haudenosaunee Confederacy have a long history of trade and commerce that is protected under Section 35 of the Constitution Act, 1982. Mohawk Medibles has been serving Canadian customers reliably since 2018, shipping discreetly via Canada Post Xpresspost to all provinces and territories. All products meet our rigorous Empire Standard\u2122 quality program, including third-party lab testing.",
    },
    {
        question: "How does Mohawk Medibles ship across Canada?",
        answer:
            "Mohawk Medibles ships to all 13 Canadian provinces and territories via Canada Post Xpresspost. Orders are processed same-day when placed before our daily cutoff, and typical delivery takes 2\u20135 business days depending on your location. All packages are shipped in discreet, smell-proof packaging with no identifying markings. Shipping is free on orders over $149, and a flat rate of $15 applies to orders under that threshold. Every shipment includes tracking so you can follow your package from our facility in Tyendinaga Mohawk Territory to your door.",
    },
    {
        question: "What products does Mohawk Medibles carry?",
        answer:
            "Mohawk Medibles carries over 360 premium cannabis products across seven main categories: Flower (including AAAA, AAA+, and craft strains), Edibles (gummies, chocolates, baked goods, and beverages), Concentrates (shatter, live resin, diamonds, and distillate), Vapes (cartridges and disposable pens), Hash (traditional and premium pressed), Pre-Rolls (singles, multi-packs, and infused), and CBD products (oils, tinctures, capsules, and topicals). Every product meets our Empire Standard\u2122 quality requirements, including third-party lab testing for potency, terpene profiling, and contaminant screening.",
    },
    {
        question: "How does buying from Indigenous dispensaries support communities?",
        answer:
            "When you purchase from an Indigenous cannabis dispensary like Mohawk Medibles, your dollars directly support Indigenous economic sovereignty and community development. A significant portion of our revenue is reinvested into Mohawk Territory community programs, youth initiatives, cultural preservation projects, and local employment. Unlike purchasing from large corporate cannabis retailers, buying from Indigenous-owned businesses helps close the economic gap, creates jobs within Indigenous communities, and supports the broader movement toward Indigenous self-determination and economic independence. Every order from Mohawk Medibles is an investment in Indigenous futures.",
    },
    {
        question: "What makes Mohawk Medibles different from other online dispensaries?",
        answer:
            "Mohawk Medibles stands apart in several key ways: First, we are authentically Indigenous-owned and operated from Tyendinaga Mohawk Territory — not a corporate brand using Indigenous imagery. Second, our Empire Standard\u2122 quality program ensures every product is lab-tested, terpene-profiled, and contaminant-screened before it reaches our shelves. Third, we offer tax-free pricing, making our products more affordable than government dispensaries. Fourth, we have been operating since 2018 with over 47,000 satisfied customers across Canada. Fifth, a portion of every purchase supports Mohawk Territory community programs. And sixth, we offer free shipping on orders over $149 with discreet, same-day processing.",
    },
    {
        question: "Does Mohawk Medibles offer same-day delivery?",
        answer:
            "Mohawk Medibles offers same-day order processing for all orders placed before our daily cutoff time. While we do not offer same-day delivery to your door (as we ship Canada-wide via Canada Post Xpresspost), orders are packed and shipped the same day they are placed. Typical delivery times are 2\u20133 business days for Ontario and Quebec, 3\u20134 days for Manitoba, Saskatchewan, Alberta, and British Columbia, and 4\u20135 days for Atlantic provinces, the Territories, and remote areas. All shipments include full tracking.",
    },
    {
        question: "What payment methods does Mohawk Medibles accept?",
        answer:
            "Mohawk Medibles accepts three convenient payment methods: Credit Card (Visa, Mastercard, and American Express) processed securely through our payment gateway, Interac e-Transfer (Canada\u2019s most trusted direct bank payment method), and Cryptocurrency for customers who prefer decentralized payment. All transactions are processed securely, and your financial information is never stored on our servers.",
    },
];

const PRODUCT_CATEGORIES = [
    {
        name: "Flower",
        description: "AAAA to craft-grade dried cannabis flower. Indica, sativa, and hybrid strains with full terpene profiles.",
        href: "/shop?category=flower",
        icon: Leaf,
        count: "100+",
    },
    {
        name: "Edibles",
        description: "THC gummies, chocolates, baked goods, and beverages. Precisely dosed for consistent experiences.",
        href: "/shop?category=edibles",
        icon: Package,
        count: "80+",
    },
    {
        name: "Concentrates",
        description: "Shatter, live resin, diamonds, distillate, and more. Extracted for maximum potency and flavour.",
        href: "/shop?category=concentrates",
        icon: FlaskRound,
        count: "50+",
    },
    {
        name: "Vapes",
        description: "Cartridges and disposable vape pens. Convenient, discreet, and available in dozens of strains.",
        href: "/shop?category=vapes",
        icon: Globe,
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
        description: "Singles, multi-packs, and infused pre-rolls. Ready to enjoy with no preparation required.",
        href: "/shop?category=pre-rolls",
        icon: CheckCircle,
        count: "30+",
    },
    {
        name: "CBD",
        description: "Oils, tinctures, capsules, and topicals. Therapeutic relief without the psychoactive high.",
        href: "/shop?category=cbd",
        icon: Heart,
        count: "20+",
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

const TESTIMONIALS = [
    {
        name: "Sarah M.",
        location: "Toronto, ON",
        rating: 5,
        text: "I switched to Mohawk Medibles two years ago and never looked back. The quality is consistently better than anything from the government stores, and I love knowing my money supports an Indigenous-owned business.",
    },
    {
        name: "James T.",
        location: "Vancouver, BC",
        rating: 5,
        text: "Fast shipping to BC, always discreet, always on point. The Empire Standard is real — every product I\u2019ve ordered has been fire. Best online dispensary in Canada, period.",
    },
    {
        name: "Michelle R.",
        location: "Calgary, AB",
        rating: 5,
        text: "As someone who uses CBD daily for pain management, finding Mohawk Medibles was a game-changer. Great prices, tax-free, and the products are lab-tested. Plus I\u2019m supporting Indigenous communities. Win-win.",
    },
    {
        name: "David K.",
        location: "Halifax, NS",
        rating: 5,
        text: "Even out here on the East Coast, my orders arrive in 4 days like clockwork. The selection is incredible — over 300 products to choose from. Mohawk Medibles is the real deal.",
    },
];

/* ─── Schema Builder ──────────────────────────────────────────── */

function buildPageSchema(): string {
    return buildSchemaGraph(
        articleSchema({
            title: "Indigenous Cannabis Dispensary Canada",
            slug: "../indigenous-cannabis-dispensary-canada",
            description:
                "Canada's trusted Indigenous-owned online cannabis dispensary. Shop 360+ premium products with free shipping over $149 from Tyendinaga Mohawk Territory.",
            datePublished: "2026-03-11",
            dateModified: "2026-03-11",
            image: "https://mohawkmedibles.ca/og-image.png",
            authorName: "Mohawk Medibles Team",
            authorCredentials:
                "Indigenous-owned cannabis dispensary operating from Tyendinaga Mohawk Territory since 2018, serving 47,000+ customers across Canada.",
            keywords: [
                "Indigenous cannabis dispensary",
                "Indigenous owned dispensary Canada",
                "First Nations cannabis",
                "Mohawk Territory cannabis",
                "Native cannabis online",
            ],
            wordCount: 3200,
        }),
        faqSchema(FAQ_ITEMS),
        breadcrumbSchema([
            { name: "Home", url: "https://mohawkmedibles.ca" },
            { name: "Indigenous Cannabis Dispensary Canada", url: PAGE_URL },
        ])
    );
}

/* ─── Page Component ──────────────────────────────────────────── */

export default function IndigenousCannabisDispensaryPage() {
    const schemaJsonLd = buildPageSchema();

    return (
        <div className="min-h-screen page-glass text-foreground">
            {/* JSON-LD Structured Data — static schema, no user input */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: schemaJsonLd }}
            />

            {/* ═══ BREADCRUMB NAV ═══ */}
            <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-6 md:px-12 pt-6">
                <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <li>
                        <Link href="/" className="hover:text-forest dark:hover:text-lime transition-colors">
                            Home
                        </Link>
                    </li>
                    <li><ChevronRight className="w-3 h-3" /></li>
                    <li className="text-foreground font-semibold">Indigenous Cannabis Dispensary Canada</li>
                </ol>
            </nav>

            {/* ═══ HERO ═══ */}
            <section className="relative min-h-[75vh] flex items-center overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/assets/hero/cannabis-closeup.jpg"
                        alt="Premium cannabis flower from Mohawk Medibles — Canada's trusted Indigenous cannabis dispensary"
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/90 dark:from-charcoal-deep/95 via-white/75 dark:via-charcoal-deep/85 to-white/50 dark:to-charcoal-deep/60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-charcoal-deep via-transparent dark:via-transparent to-white/30 dark:to-charcoal-deep/40" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-32">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/15 border border-lime/30 text-lime text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        Indigenous-Owned &bull; Tyendinaga Mohawk Territory
                    </span>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter font-display leading-[0.9] mb-6">
                        Canada&apos;s Trusted
                        <br />
                        <span className="text-lime">Indigenous Cannabis</span>
                        <br />
                        Dispensary
                    </h1>

                    <p className="text-lg md:text-xl text-foreground/70 dark:text-white/70 max-w-2xl leading-relaxed mb-8">
                        Mohawk Medibles is an <strong className="text-foreground/90 dark:text-white/90">Indigenous-owned online cannabis dispensary</strong> proudly
                        operating from Tyendinaga Mohawk Territory. Since 2018, we&apos;ve served over 47,000 Canadians
                        with 360+ premium, lab-tested products backed by the{" "}
                        <strong className="text-foreground/90 dark:text-white/90">Empire Standard&trade;</strong> quality program.
                        Free shipping on orders over $149. Tax-free. Always.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/shop"
                            className="inline-flex items-center justify-center gap-2 bg-lime text-charcoal-deep px-8 py-4 rounded-full font-bold text-lg hover:bg-lime-light transition-colors shadow-[0_0_40px_rgba(200,230,62,0.3)]"
                        >
                            Shop Now <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex items-center justify-center gap-2 border border-foreground/20 dark:border-white/20 text-foreground dark:text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-foreground/10 dark:hover:bg-white/10 transition-colors"
                        >
                            Our Story
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ STATS BAR ═══ */}
            <section className="relative z-10 -mt-12">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { value: "360+", label: "Premium Products" },
                            { value: "47K+", label: "Canadians Served" },
                            { value: "6+", label: "Years Trusted" },
                            { value: "13", label: "Provinces & Territories" },
                        ].map((stat) => (
                            <div key={stat.label} className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6 text-center">
                                <div className="text-3xl md:text-4xl font-black text-forest dark:text-lime font-display">{stat.value}</div>
                                <div className="text-xs text-muted-foreground font-bold tracking-widest uppercase mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ OUR STORY ═══ */}
            <section className="py-20 md:py-28" id="our-story">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-border">
                            <Image
                                src="/assets/hero/abstract-haze.webp"
                                alt="Mohawk Medibles — Indigenous cannabis dispensary founded on Tyendinaga Mohawk Territory"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/50 dark:from-charcoal-deep/60 to-transparent" />
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

                        <div className="space-y-6">
                            <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Our Story</span>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-foreground">
                                Founded on Mohawk Territory.<br />
                                <span className="text-forest dark:text-lime">Built for All of Canada.</span>
                            </h2>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                Mohawk Medibles was founded in February 2018 on <strong>Tyendinaga Mohawk Territory</strong> in
                                southeastern Ontario, near the town of Deseronto. What began as a small, community-focused
                                cannabis shop has grown into one of Canada&apos;s most trusted Indigenous-owned online
                                dispensaries, serving customers in every province and territory.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Our roots are in the Mohawk Nation of the Haudenosaunee (Iroquois) Confederacy — one of the
                                oldest continuously operating democracies in the world. The Haudenosaunee have a long tradition
                                of trade, agriculture, and medicinal plant knowledge that stretches back thousands of years.
                                Mohawk Medibles carries that tradition forward, combining ancestral wisdom with modern quality
                                standards to bring Canadians the best cannabis products available.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                From our facility at <strong>45 Dundas Street, Deseronto</strong>, we curate, quality-test,
                                and ship over 360 premium cannabis products to every corner of Canada. Every product meets
                                our <Link href="/about" className="text-forest dark:text-lime font-semibold hover:underline">Empire Standard&trade;</Link> —
                                a rigorous four-point quality check covering potency verification,
                                terpene profiling, contaminant screening, and visual inspection.
                            </p>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <span className="px-3 py-1.5 rounded-full bg-lime/10 border border-lime/20 text-lime text-xs font-bold">Est. 2018</span>
                                <span className="px-3 py-1.5 rounded-full bg-lime/10 border border-lime/20 text-lime text-xs font-bold">Tyendinaga Mohawk Territory</span>
                                <span className="px-3 py-1.5 rounded-full bg-lime/10 border border-lime/20 text-lime text-xs font-bold">Haudenosaunee Heritage</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ INDIGENOUS CANNABIS SOVEREIGNTY ═══ */}
            <section className="py-20 md:py-28 bg-muted/50" id="sovereignty">
                <div className="max-w-4xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Sovereignty & Heritage</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">
                            Indigenous Cannabis Sovereignty in Canada
                        </h2>
                    </div>

                    <div className="space-y-6 text-muted-foreground leading-relaxed">
                        <p className="text-lg">
                            The relationship between Indigenous peoples and cannabis in Canada is deeply intertwined with
                            broader questions of <strong className="text-foreground">sovereignty, self-determination, and economic independence</strong>.
                            Long before European contact, Indigenous nations across Turtle Island cultivated, traded, and
                            used medicinal plants as part of their healing traditions. Today, Indigenous cannabis dispensaries
                            represent a modern expression of these ancient rights.
                        </p>

                        <h3 className="text-2xl font-black font-display text-foreground pt-4">
                            The Haudenosaunee Tradition of Trade
                        </h3>
                        <p>
                            The Haudenosaunee Confederacy — of which the Mohawk Nation is a founding member — established
                            one of the world&apos;s first constitutional democracies through the Great Law of Peace
                            (Kaianere&apos;kó:wa). This governance structure, which predates the Canadian Constitution by
                            centuries, includes provisions for trade, commerce, and economic sovereignty that remain in
                            effect today. The Mohawk people have always been known as traders and entrepreneurs — the
                            &quot;Keepers of the Eastern Door&quot; of the Haudenosaunee Confederacy.
                        </p>
                        <p>
                            Mohawk Medibles operates within this rich tradition. Our dispensary is not merely a retail
                            business — it is an expression of Mohawk economic sovereignty and the continuation of
                            centuries-old trade practices. We source products from Indigenous and Canadian growers who
                            share our commitment to quality and community, and we apply rigorous testing standards
                            that honour both modern science and traditional knowledge.
                        </p>

                        <h3 className="text-2xl font-black font-display text-foreground pt-4">
                            Section 35 and Indigenous Rights
                        </h3>
                        <p>
                            Section 35 of the <em>Constitution Act, 1982</em> recognizes and affirms existing Aboriginal and
                            treaty rights of the Indigenous peoples of Canada. These rights include the inherent right to
                            self-governance and economic self-determination. Indigenous-operated cannabis businesses like
                            Mohawk Medibles exercise these rights while maintaining rigorous quality and safety standards
                            that often exceed those of government-regulated dispensaries.
                        </p>
                        <p>
                            The history of cannabis prohibition in Canada disproportionately affected Indigenous communities.
                            As the country has moved toward legalization, Indigenous nations have asserted their right to
                            participate in the cannabis economy on their own terms — not as licensees of the federal or
                            provincial governments, but as sovereign nations exercising their inherent jurisdiction over
                            commerce within their territories.
                        </p>

                        <h3 className="text-2xl font-black font-display text-foreground pt-4">
                            Tyendinaga Mohawk Territory: A Hub for Indigenous Enterprise
                        </h3>
                        <p>
                            <Link href="/about" className="text-forest dark:text-lime font-semibold hover:underline">Tyendinaga Mohawk Territory</Link> (also
                            known as the Mohawks of the Bay of Quinte) is located along the north shore of the Bay of Quinte
                            in southeastern Ontario. The territory has a population of over 10,000 registered members and has
                            become a hub for Indigenous entrepreneurship, including cannabis retail. The community&apos;s
                            embrace of cannabis commerce has created jobs, funded community programs, and demonstrated that
                            Indigenous economic sovereignty and responsible business practices go hand in hand.
                        </p>
                        <p>
                            Mohawk Medibles is proud to operate from this vibrant community. Our physical location at
                            45 Dundas Street in Deseronto sits within the traditional territory of the Mohawk Nation,
                            and our online presence at <Link href="/" className="text-forest dark:text-lime font-semibold hover:underline">mohawkmedibles.ca</Link> extends
                            our reach to every corner of Canada — from Victoria to St. John&apos;s, from Windsor to Iqaluit.
                        </p>

                        <h3 className="text-2xl font-black font-display text-foreground pt-4">
                            Economic Sovereignty Through Cannabis
                        </h3>
                        <p>
                            For many Indigenous communities, cannabis has become an important vehicle for economic
                            development and self-sufficiency. Revenue generated by Indigenous cannabis dispensaries
                            stays within the community — funding education, healthcare, cultural preservation, youth
                            programs, and infrastructure. When Canadians choose to purchase from an Indigenous-owned
                            dispensary like Mohawk Medibles, they are making a direct investment in Indigenous economic
                            sovereignty and community wellbeing.
                        </p>
                        <p>
                            This is not just about cannabis. It is about <strong className="text-foreground">Indigenous peoples
                            exercising their inherent right to participate in the economy on their own terms</strong>,
                            build generational wealth, and create opportunities for future generations — something the
                            Haudenosaunee have done for over a thousand years.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ WHY CHOOSE AN INDIGENOUS DISPENSARY ═══ */}
            <section className="py-20 md:py-28" id="why-choose">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Why Mohawk Medibles</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">
                            Why Choose an Indigenous Cannabis Dispensary?
                        </h2>
                        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                            Buying from an Indigenous-owned dispensary is more than a transaction — it&apos;s a statement of
                            support for Indigenous sovereignty, quality, and community impact.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Shield,
                                title: "Indigenous Sovereignty",
                                description:
                                    "We operate under the inherent sovereignty of the Haudenosaunee Confederacy and the Mohawk Nation. Your purchase supports Indigenous self-determination and the right to economic independence.",
                                gradient: "from-lime/20 to-transparent",
                            },
                            {
                                icon: FlaskRound,
                                title: "Empire Standard\u2122 Quality",
                                description:
                                    "Every product passes a rigorous 4-point quality check: potency verification, terpene profiling, contaminant screening, and visual inspection. We never compromise on quality.",
                                gradient: "from-purple-500/20 to-transparent",
                            },
                            {
                                icon: Heart,
                                title: "Community Reinvestment",
                                description:
                                    "A significant portion of our revenue flows back into Mohawk Territory community programs, youth initiatives, cultural preservation, and local employment.",
                                gradient: "from-rose-500/20 to-transparent",
                            },
                            {
                                icon: Star,
                                title: "Tax-Free Pricing",
                                description:
                                    "As an Indigenous-operated business on Mohawk Territory, our products are tax-free — saving you 13\u201315% compared to government-licensed dispensaries on every order.",
                                gradient: "from-amber-500/20 to-transparent",
                            },
                            {
                                icon: Truck,
                                title: "Free Canada-Wide Shipping",
                                description:
                                    "Free shipping on orders over $149 via Canada Post Xpresspost. Same-day processing, discreet smell-proof packaging, and full tracking to all 13 provinces and territories.",
                                gradient: "from-blue-500/20 to-transparent",
                            },
                            {
                                icon: Users,
                                title: "47,000+ Customers Trust Us",
                                description:
                                    "Since 2018, over 47,000 Canadians have chosen Mohawk Medibles. Our reputation is built on consistent quality, reliable shipping, and genuine customer care.",
                                gradient: "from-emerald-500/20 to-transparent",
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="relative overflow-hidden glass-card border border-border rounded-2xl p-8 space-y-4 group hover:border-forest/30 dark:hover:border-lime/30 transition-all duration-300"
                            >
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.gradient}`} />
                                <div className="w-12 h-12 rounded-xl bg-forest/10 dark:bg-lime/10 flex items-center justify-center">
                                    <item.icon className="w-6 h-6 text-forest dark:text-lime" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground font-heading">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ OUR PRODUCTS ═══ */}
            <section className="py-20 md:py-28 bg-muted/50" id="products">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Shop Our Collection</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">
                            360+ Premium Cannabis Products
                        </h2>
                        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                            From AAAA craft flower to precisely-dosed edibles, every product in our collection meets the
                            Empire Standard&trade;. Browse by category to find exactly what you&apos;re looking for.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {PRODUCT_CATEGORIES.map((cat) => (
                            <Link
                                key={cat.name}
                                href={cat.href}
                                className="glass-card border border-border rounded-2xl p-6 space-y-3 group hover:border-forest/30 dark:hover:border-lime/30 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-forest/10 dark:bg-lime/10 flex items-center justify-center">
                                        <cat.icon className="w-5 h-5 text-forest dark:text-lime" />
                                    </div>
                                    <span className="text-xs font-bold text-forest dark:text-lime bg-forest/10 dark:bg-lime/10 px-2 py-1 rounded-full">
                                        {cat.count}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-foreground font-heading group-hover:text-forest dark:group-hover:text-lime transition-colors">
                                    {cat.name}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                                <div className="flex items-center gap-1 text-xs font-bold text-forest dark:text-lime pt-1">
                                    Browse {cat.name} <ArrowRight className="w-3 h-3" />
                                </div>
                            </Link>
                        ))}

                        {/* "View All" card */}
                        <Link
                            href="/shop"
                            className="glass-card border border-forest/30 dark:border-lime/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 group hover:bg-forest/5 dark:hover:bg-lime/5 transition-all duration-300"
                        >
                            <div className="w-12 h-12 rounded-full bg-forest/10 dark:bg-lime/10 flex items-center justify-center">
                                <ArrowRight className="w-6 h-6 text-forest dark:text-lime group-hover:translate-x-1 transition-transform" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground font-heading">View All Products</h3>
                            <p className="text-xs text-muted-foreground">Browse our full collection of 360+ items</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ SERVING ALL OF CANADA ═══ */}
            <section className="py-20 md:py-28" id="delivery">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Canada-Wide Delivery</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">
                            Serving All 13 Provinces & Territories
                        </h2>
                        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                            From Victoria to St. John&apos;s, from Toronto to Iqaluit — Mohawk Medibles ships premium
                            cannabis to every corner of Canada via Canada Post Xpresspost. Free shipping on orders over $149.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {PROVINCES.map((prov) => (
                            <Link
                                key={prov.slug}
                                href={`/delivery/${prov.slug}`}
                                className="glass-card border border-border rounded-xl p-4 text-center group hover:border-forest/30 dark:hover:border-lime/30 transition-all duration-300"
                            >
                                <div className="text-2xl font-black font-display text-forest dark:text-lime mb-1">
                                    {prov.abbr}
                                </div>
                                <div className="text-xs text-muted-foreground font-semibold group-hover:text-foreground transition-colors">
                                    {prov.name}
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-10 glass-card border border-border rounded-2xl p-8 grid md:grid-cols-3 gap-6 text-center">
                        <div>
                            <Truck className="w-8 h-8 text-forest dark:text-lime mx-auto mb-3" />
                            <div className="font-bold text-foreground">Free Over $149</div>
                            <div className="text-xs text-muted-foreground mt-1">$15 flat rate under $149</div>
                        </div>
                        <div>
                            <Package className="w-8 h-8 text-forest dark:text-lime mx-auto mb-3" />
                            <div className="font-bold text-foreground">Same-Day Processing</div>
                            <div className="text-xs text-muted-foreground mt-1">Orders ship the day they&apos;re placed</div>
                        </div>
                        <div>
                            <MapPin className="w-8 h-8 text-forest dark:text-lime mx-auto mb-3" />
                            <div className="font-bold text-foreground">2-5 Business Days</div>
                            <div className="text-xs text-muted-foreground mt-1">Canada Post Xpresspost with tracking</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CUSTOMER TESTIMONIALS ═══ */}
            <section className="py-20 md:py-28 bg-muted/50" id="testimonials">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Customer Reviews</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">
                            What Our Customers Say
                        </h2>
                        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                            Over 47,000 Canadians trust Mohawk Medibles for premium cannabis.
                            Here&apos;s what they have to say about Canada&apos;s leading Indigenous cannabis dispensary.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {TESTIMONIALS.map((review) => (
                            <div
                                key={review.name}
                                className="glass-card border border-border rounded-2xl p-8 space-y-4"
                            >
                                <div className="flex gap-1">
                                    {Array.from({ length: review.rating }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-lime text-lime" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground leading-relaxed italic">
                                    &quot;{review.text}&quot;
                                </p>
                                <div className="flex items-center gap-3 pt-2">
                                    <div className="w-10 h-10 rounded-full bg-forest/10 dark:bg-lime/10 flex items-center justify-center">
                                        <span className="text-sm font-bold text-forest dark:text-lime">
                                            {review.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-foreground">{review.name}</div>
                                        <div className="text-xs text-muted-foreground">{review.location}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <Link
                            href="/reviews"
                            className="inline-flex items-center gap-2 text-forest dark:text-lime font-bold hover:underline"
                        >
                            Read All Customer Reviews <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ FAQ SECTION ═══ */}
            <section className="py-20 md:py-28" id="faq">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Frequently Asked Questions</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display mt-3 text-foreground">
                            Indigenous Cannabis Dispensary FAQ
                        </h2>
                        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                            Everything you need to know about buying cannabis from Canada&apos;s trusted
                            Indigenous-owned dispensary.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {FAQ_ITEMS.map((faq, index) => (
                            <details
                                key={index}
                                className="glass-card border border-border rounded-2xl overflow-hidden group"
                            >
                                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none font-bold text-foreground hover:text-forest dark:hover:text-lime transition-colors">
                                    <h3 className="text-left font-bold text-base md:text-lg">{faq.question}</h3>
                                    <ChevronRight className="w-5 h-5 flex-shrink-0 text-muted-foreground group-open:rotate-90 transition-transform duration-200" />
                                </summary>
                                <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FINAL CTA ═══ */}
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
                    <span className="text-forest dark:text-lime text-xs font-bold tracking-[0.2em] uppercase">Ready to Order?</span>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight font-display mt-3 mb-6 text-foreground">
                        Support Indigenous Business.<br />
                        <span className="text-lime">Shop Premium Cannabis.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed mb-10">
                        Browse 360+ lab-tested, Empire Standard&trade; cannabis products from Canada&apos;s
                        trusted Indigenous-owned dispensary. Tax-free pricing. Free shipping over $149.
                        Same-day processing. Discreet delivery to all 13 provinces and territories.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/shop"
                            className="inline-flex items-center justify-center gap-2 bg-lime text-charcoal-deep px-10 py-4 rounded-full font-bold text-lg hover:bg-lime-light transition-colors shadow-[0_0_40px_rgba(200,230,62,0.3)]"
                        >
                            Browse Our Collection <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/delivery"
                            className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-10 py-4 rounded-full font-bold text-lg hover:bg-muted transition-colors"
                        >
                            Check Delivery Times
                        </Link>
                    </div>

                    <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-lime" />
                            <span>Lab Tested</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-lime" />
                            <span>Tax-Free</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-lime" />
                            <span>Free Shipping Over $149</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-lime" />
                            <span>Indigenous-Owned</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ BOTTOM INTERNAL LINKS — SEO CRAWL DEPTH ═══ */}
            <section className="py-12 border-t border-border">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                        <div>
                            <h4 className="font-bold text-foreground mb-3 font-heading">Shop by Category</h4>
                            <ul className="space-y-2 text-muted-foreground">
                                <li><Link href="/shop?category=flower" className="hover:text-forest dark:hover:text-lime transition-colors">Cannabis Flower</Link></li>
                                <li><Link href="/shop?category=edibles" className="hover:text-forest dark:hover:text-lime transition-colors">THC Edibles</Link></li>
                                <li><Link href="/shop?category=concentrates" className="hover:text-forest dark:hover:text-lime transition-colors">Concentrates</Link></li>
                                <li><Link href="/shop?category=vapes" className="hover:text-forest dark:hover:text-lime transition-colors">Vape Cartridges</Link></li>
                                <li><Link href="/shop?category=hash" className="hover:text-forest dark:hover:text-lime transition-colors">Hash</Link></li>
                                <li><Link href="/shop?category=pre-rolls" className="hover:text-forest dark:hover:text-lime transition-colors">Pre-Rolls</Link></li>
                                <li><Link href="/shop?category=cbd" className="hover:text-forest dark:hover:text-lime transition-colors">CBD Products</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground mb-3 font-heading">Popular Provinces</h4>
                            <ul className="space-y-2 text-muted-foreground">
                                <li><Link href="/delivery/ontario" className="hover:text-forest dark:hover:text-lime transition-colors">Cannabis Delivery Ontario</Link></li>
                                <li><Link href="/delivery/british-columbia" className="hover:text-forest dark:hover:text-lime transition-colors">Cannabis Delivery BC</Link></li>
                                <li><Link href="/delivery/alberta" className="hover:text-forest dark:hover:text-lime transition-colors">Cannabis Delivery Alberta</Link></li>
                                <li><Link href="/delivery/quebec" className="hover:text-forest dark:hover:text-lime transition-colors">Cannabis Delivery Quebec</Link></li>
                                <li><Link href="/delivery/manitoba" className="hover:text-forest dark:hover:text-lime transition-colors">Cannabis Delivery Manitoba</Link></li>
                                <li><Link href="/delivery/nova-scotia" className="hover:text-forest dark:hover:text-lime transition-colors">Cannabis Delivery Nova Scotia</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground mb-3 font-heading">About Us</h4>
                            <ul className="space-y-2 text-muted-foreground">
                                <li><Link href="/about" className="hover:text-forest dark:hover:text-lime transition-colors">Our Story</Link></li>
                                <li><Link href="/reviews" className="hover:text-forest dark:hover:text-lime transition-colors">Customer Reviews</Link></li>
                                <li><Link href="/blog" className="hover:text-forest dark:hover:text-lime transition-colors">Cannabis Blog</Link></li>
                                <li><Link href="/faq" className="hover:text-forest dark:hover:text-lime transition-colors">FAQ</Link></li>
                                <li><Link href="/contact" className="hover:text-forest dark:hover:text-lime transition-colors">Contact Us</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground mb-3 font-heading">Policies</h4>
                            <ul className="space-y-2 text-muted-foreground">
                                <li><Link href="/shipping-policy" className="hover:text-forest dark:hover:text-lime transition-colors">Shipping Policy</Link></li>
                                <li><Link href="/returns-policy" className="hover:text-forest dark:hover:text-lime transition-colors">Returns Policy</Link></li>
                                <li><Link href="/privacy" className="hover:text-forest dark:hover:text-lime transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-forest dark:hover:text-lime transition-colors">Terms of Service</Link></li>
                                <li><Link href="/how-to-order" className="hover:text-forest dark:hover:text-lime transition-colors">How to Order</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
