import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/lib/products";
import { MASTER_FAQ_DATABASE } from "@/lib/seo/aeo";
import { enhanceContentForGEO, generateGEOMetaTags } from "@/lib/seo/geo";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schemas";

// Load pages from seed data
import pagesData from "@/data/seed/pages.json";

// Slugs that should permanently redirect elsewhere
const SLUG_REDIRECTS: Record<string, string> = {
    "territory-grown": "/shop",
    "our-story": "/about",
    "about-us": "/about",
    "privacy-policy": "/privacy",
    "terms-of-use": "/terms",
    "return-policy": "/returns-policy",
    "medibles-blog": "/blog",
    "knowledgebase": "/faq",
    "medibles-support": "/support",
    "mohawk-medibles-support": "/support",
    "contact-medibles-wholesale": "/wholesale",
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return pagesData.map((page: { slug: string; title: string }) => ({
        slug: page.slug,
    }));
}

// Map legacy delivery slugs → new /delivery/[province] canonical URLs
const LEGACY_TO_NEW_DELIVERY: Record<string, string> = {
    "ontario-delivery": "/delivery/ontario",
    "alberta-delivery": "/delivery/alberta",
    "british-columbia-delivery": "/delivery/british-columbia",
    "quebec-delivery": "/delivery/quebec",
    "manitoba-delivery": "/delivery/manitoba",
    "saskatchewan-delivery": "/delivery/saskatchewan",
    "nova-scotia-delivery": "/delivery/nova-scotia",
    "new-brunswick-delivery": "/delivery/new-brunswick",
    "new-foundland-labrador-delivery": "/delivery/newfoundland-and-labrador",
    "prince-edward-island-delivery": "/delivery/prince-edward-island",
    "northwest-territories-delivery": "/delivery/northwest-territories",
    "nunavut-delivery": "/delivery/nunavut",
    "yukon-delivery": "/delivery/yukon",
};

// Province-specific meta descriptions for delivery pages
const PROVINCE_META: Record<string, string> = {
    "ontario-delivery": "Buy cannabis online in Ontario with fast Xpresspost delivery. 360+ lab-tested products from Mohawk Medibles — flower, edibles, concentrates, vapes. Same-day processing, discreet shipping to Toronto, Ottawa, Hamilton & all ON cities.",
    "alberta-delivery": "Order premium cannabis online in Alberta. Mohawk Medibles ships 360+ lab-tested products — flower, edibles, vapes — via Xpresspost to Calgary, Edmonton & all AB locations. Empire Standard™ quality.",
    "british-columbia-delivery": "Cannabis delivery to British Columbia from Mohawk Medibles. 360+ lab-tested products shipped via Xpresspost to Vancouver, Victoria & all BC cities. Indigenous-owned, Empire Standard™ quality.",
    "quebec-delivery": "Livraison de cannabis au Québec. Mohawk Medibles ships 360+ premium lab-tested products to Montreal, Quebec City & all QC locations via Canada Post Xpresspost.",
    "manitoba-delivery": "Cannabis delivery to Manitoba. Mohawk Medibles ships 360+ lab-tested flower, edibles & concentrates to Winnipeg, Brandon & all MB locations. Fast Xpresspost, discreet packaging.",
    "saskatchewan-delivery": "Buy cannabis online in Saskatchewan. Mohawk Medibles delivers 360+ lab-tested products to Regina, Saskatoon & all SK locations via Xpresspost. Empire Standard™ quality.",
    "nova-scotia-delivery": "Cannabis delivery to Nova Scotia. 360+ premium lab-tested products shipped to Halifax, Cape Breton & all NS locations. Mohawk Medibles — Indigenous-owned, Xpresspost shipping.",
    "new-brunswick-delivery": "Order cannabis online in New Brunswick. Mohawk Medibles ships 360+ lab-tested products to Moncton, Saint John, Fredericton & all NB cities via Canada Post Xpresspost.",
    "new-foundland-labrador-delivery": "Cannabis delivery to Newfoundland & Labrador. 360+ lab-tested products shipped to St. John's, Corner Brook & all NL locations. Fast Xpresspost from Mohawk Medibles.",
    "prince-edward-island-delivery": "Buy cannabis online in Prince Edward Island. Mohawk Medibles delivers 360+ lab-tested products to Charlottetown & all PEI locations. Empire Standard™ quality, Xpresspost shipping.",
    "northwest-territories-delivery": "Cannabis delivery to the Northwest Territories. Mohawk Medibles ships 360+ lab-tested products to Yellowknife & all NWT communities via Canada Post Xpresspost.",
    "nunavut-delivery": "Order cannabis online in Nunavut. Mohawk Medibles delivers 360+ lab-tested products to Iqaluit & all NU communities. Canada-wide Xpresspost shipping, discreet packaging.",
    "yukon-delivery": "Cannabis delivery to Yukon. 360+ premium lab-tested products shipped to Whitehorse & all YT communities via Xpresspost. Mohawk Medibles — Indigenous-owned dispensary.",
};

export const dynamicParams = true;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    if (SLUG_REDIRECTS[slug]) return {};
    const page = pagesData.find((p: { slug: string; title: string }) => p.slug === slug);

    if (!page) return {};

    const isDelivery = slug.includes("-delivery");
    const provinceName = page.title.replace(" Delivery", "");

    // Use province-specific description for delivery pages, generic for others
    const description = PROVINCE_META[slug]
        || `Premium cannabis delivery in ${provinceName}. Indigenous-owned, lab-tested products meet the Empire Standard™. Ships via Canada Post Xpresspost.`;

    const title = isDelivery
        ? `Cannabis Delivery to ${provinceName} — Buy Weed Online`
        : `${page.title}`;

    const geoMeta = generateGEOMetaTags({
        title,
        description,
        url: `https://mohawkmedibles.ca/${slug}`,
    });

    return {
        title,
        description,
        openGraph: {
            title: geoMeta["og:title"],
            description,
            url: geoMeta["og:url"],
            siteName: "Mohawk Medibles",
            images: [{ url: "/og-image.png" }],
            locale: "en_CA",
            type: "website",
        },
        alternates: {
            canonical: LEGACY_TO_NEW_DELIVERY[slug]
                ? `https://mohawkmedibles.ca${LEGACY_TO_NEW_DELIVERY[slug]}`
                : `https://mohawkmedibles.ca/${slug}`,
        },
        other: {
            ...geoMeta
        }
    };
}

export default async function DynamicPage({ params }: PageProps) {
    const { slug } = await params;

    // Handle legacy slugs with permanent redirect
    const redirectTo = SLUG_REDIRECTS[slug];
    if (redirectTo) {
        redirect(redirectTo);
    }

    const page = pagesData.find((p: { slug: string; title: string }) => p.slug === slug);

    if (!page) {
        notFound();
    }

    const isDeliveryPage = slug.includes("-delivery");
    const provinceName = page.title.replace(" Delivery", "");

    // Generate AEO/GEO content
    const baseContent = `Mohawk Medibles provides premium, lab-tested cannabis products to ${provinceName}. Our Indigenous-owned dispensary ensures every product meets the Empire Standard™ for quality and safety. We offer discreet, fast shipping via Canada Post Xpresspost to all major cities and rural areas in ${provinceName}.`;

    const enhanced = enhanceContentForGEO(baseContent, provinceName, {
        maxStatistics: 2,
        maxQuotations: 1,
        addAuthority: true,
        addTechnicalTerms: true,
    });

    // Get relevant FAQs
    const relevantFaqs = MASTER_FAQ_DATABASE.filter(f =>
        f.category === "shipping" || f.category === "quality" || f.category === "general"
    ).slice(0, 4);

    // Get featured products — wrap in try/catch so DB errors don't cause 500
    let featuredProducts: Awaited<ReturnType<typeof getAllProducts>> = [];
    try {
        const allProducts = await getAllProducts();
        featuredProducts = allProducts.filter(p => p.featured).slice(0, 4);
        if (featuredProducts.length === 0) {
            featuredProducts = allProducts.slice(0, 4);
        }
    } catch {
        // DB unavailable — render page without products rather than crashing
        featuredProducts = [];
    }

    // JSON-LD schemas — trusted static content from our own data files, not user input
    const breadcrumbJsonLd = breadcrumbSchema([
        { name: "Home", url: "https://mohawkmedibles.ca" },
        ...(isDeliveryPage
            ? [{ name: `${provinceName} Delivery`, url: `https://mohawkmedibles.ca/${slug}` }]
            : [{ name: page.title, url: `https://mohawkmedibles.ca/${slug}` }]
        ),
    ]);
    const faqJsonLd = faqSchema(relevantFaqs.map((f) => ({ question: f.question, answer: f.answer })));
    const storeJsonLd = isDeliveryPage ? {
        "@context": "https://schema.org",
        "@type": "Store",
        "name": "Mohawk Medibles",
        "url": "https://mohawkmedibles.ca",
        "image": "https://mohawkmedibles.ca/logo.png",
        "description": `Indigenous-owned premium cannabis dispensary delivering to ${provinceName}. Lab-tested, terpene-profiled products meeting the Empire Standard™.`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Tyendinaga Mohawk Territory",
            "addressLocality": "Deseronto",
            "addressRegion": "ON",
            "postalCode": "K0K 1X0",
            "addressCountry": "CA"
        },
        "areaServed": {
            "@type": "AdministrativeArea",
            "name": provinceName
        },
        "priceRange": "$$",
        "currenciesAccepted": "CAD",
        "paymentAccepted": "Cash, Credit Card, E-Transfer, Cryptocurrency"
    } : null;

    return (
        <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        {storeJsonLd && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }} />
        )}
        <main className="min-h-screen pt-32 pb-20 bg-forest text-cream">
            <div className="container mx-auto px-6">
                {/* Hero Section */}
                <header className="max-w-4xl mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 uppercase">
                        {page.title}
                    </h1>
                    <div className="prose prose-invert prose-lg max-w-none text-cream/80 leading-relaxed italic border-l-4 border-secondary pl-6 py-2">
                        {enhanced.enhanced}
                    </div>
                </header>

                {/* Product Showcase - Integrating Assets */}
                <section className="mb-24">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">Curated for {provinceName}</h2>
                            <p className="text-cream/50 text-sm">Top-tier picks, tested to the Empire Standard™.</p>
                        </div>
                        <Link href="/shop">
                            <Button variant="outline" size="sm" className="hidden md:flex">View Full Catalog</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={`/shop/${product.slug}`}
                                className="group relative h-[400px] rounded-2xl overflow-hidden glass border border-white/10 hover:border-secondary/50 transition-all duration-500"
                            >
                                <div className="absolute inset-x-0 top-0 p-6 z-20 flex justify-between items-start">
                                    <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">{product.category}</span>
                                    <span className="text-secondary font-bold font-mono">${product.price.toFixed(2)}</span>
                                </div>

                                <div className="relative h-full w-full">
                                    <Image
                                        src={product.image}
                                        alt={product.altText}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                    {/* Brand watermark */}
                                    <div className="absolute bottom-16 right-3 pointer-events-none z-10">
                                        <Image
                                            src="/assets/logos/medibles-logo2.png"
                                            alt=""
                                            width={28}
                                            height={28}
                                            className="opacity-[0.2] select-none"
                                            aria-hidden="true"
                                        />
                                    </div>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 p-6 z-20">
                                    <h3 className="text-lg font-bold text-white group-hover:text-secondary transition-colors line-clamp-1">{product.name}</h3>
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-cream/40 uppercase">THC</span>
                                            <span className="text-sm font-mono">{product.specs.thc}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-cream/40 uppercase">CBD</span>
                                            <span className="text-sm font-mono">{product.specs.cbd}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* FAQ Section - AEO */}
                <section className="max-w-4xl mx-auto border-t border-white/10 pt-20">
                    <h2 className="text-4xl font-bold text-white tracking-tighter mb-12 text-center uppercase">Common Questions in {provinceName}</h2>
                    <div className="space-y-8">
                        {relevantFaqs.map((faq, i) => (
                            <div key={i} className="glass p-8 rounded-2xl border border-white/5 space-y-4">
                                <h3 className="text-xl font-bold text-secondary">Q: {faq.question}</h3>
                                <p className="text-cream/70 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Trust Stats - GEO Strategy */}
                <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="glass p-8 rounded-3xl border border-white/5">
                        <div className="text-5xl font-bold text-white bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent mb-2">360+</div>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-cream/50">Premium Products</div>
                    </div>
                    <div className="glass p-8 rounded-3xl border border-white/5">
                        <div className="text-5xl font-bold text-white bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent mb-2">100%</div>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-cream/50">Lab Verified</div>
                    </div>
                    <div className="glass p-8 rounded-3xl border border-white/5">
                        <div className="text-5xl font-bold text-white bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent mb-2">24H</div>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-cream/50">Fast Fulfillment</div>
                    </div>
                </section>

                <div className="mt-32 text-center">
                    <Link href="/shop">
                        <Button size="lg" variant="brand" className="h-16 px-12 text-lg rounded-full shadow-[0_0_50px_rgba(22,163,74,0.3)]">
                            Shop the Collection
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
        </>
    );
}
