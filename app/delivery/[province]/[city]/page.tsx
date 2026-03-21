/**
 * /delivery/[province]/[city] — Dynamic City-Level Delivery Page
 * ═════════════════════════════════════════════════════════════
 * Generates landing pages for 70+ Canadian cities with:
 * - Dynamic metadata & OG tags
 * - Store, BreadcrumbList, and FAQPage schemas
 * - City-specific delivery info
 * - Featured products
 * - Category showcase
 * - Local trust signals
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCity, getAllCities, getCityFaqs, isTier1City } from "@/lib/seo/city-delivery-data";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schemas";
import { getCityServiceSchema } from "@/lib/seo/local-seo";
import { getAllProducts } from "@/lib/products";
import { getCityHeroData } from "@/lib/city-hero-images";

// ─── Static Params for SSG ──────────────────────────────────
export function generateStaticParams() {
    return getAllCities().map(({ province, city }) => ({
        province: province.slug,
        city: city.slug,
    }));
}

// ─── Dynamic Metadata ───────────────────────────────────────
type PageProps = { params: Promise<{ province: string; city: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { province: provinceSlug, city: citySlug } = await params;
    const data = getCity(provinceSlug, citySlug);

    if (!data) {
        return { title: "City Not Found" };
    }

    const { province, city } = data;
    const tier1 = isTier1City(city);

    // Tier 1 capitals get enhanced SEO titles
    const title = tier1
        ? `Cannabis Delivery ${city.name} | Free Shipping Over $199 | Mohawk Medibles`
        : `Cannabis Delivery ${city.name} | Mohawk Medibles - Fast Shipping Across ${province.abbreviation}`;
    const description = tier1
        ? `Order premium cannabis online in ${city.name}, ${province.abbreviation}. ${city.deliveryEstimate}. Lab-tested flower, edibles, concentrates & hash. Free shipping over $199. Discreet packaging.`
        : `Order cannabis online in ${city.name}. Mohawk Medibles delivers premium flower, edibles, concentrates & more to ${city.name} & ${province.name}. Discreet packaging, free shipping over $199.`;
    const url = `https://mohawkmedibles.ca/delivery/${province.slug}/${city.slug}`;

    const ogImageUrl = `/delivery/${province.slug}/${city.slug}/opengraph-image`;
    const ogImageAlt = `Cannabis delivery to ${city.name}, ${province.name} - Mohawk Medibles`;

    return {
        title,
        description,
        keywords: [
            `cannabis delivery ${city.name}`,
            `buy cannabis ${city.name}`,
            `weed delivery ${city.name}`,
            `marijuana delivery ${province.name}`,
            `${city.name} dispensary`,
            `cannabis online ${city.name}`,
            `order cannabis ${city.name}`,
            "mohawk medibles",
            "canada cannabis delivery",
        ],
        openGraph: {
            title,
            description,
            url,
            type: "website",
            siteName: "Mohawk Medibles",
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: ogImageAlt,
                    type: "image/png",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: ogImageAlt,
                },
            ],
        },
        alternates: { canonical: url },
    };
}

// ─── Server Component ───────────────────────────────────────
export default async function CityDeliveryPage({ params }: PageProps) {
    const { province: provinceSlug, city: citySlug } = await params;
    const data = getCity(provinceSlug, citySlug);

    if (!data) {
        notFound();
    }

    const { province, city } = data;
    const tier1 = isTier1City(city);

    // Get featured products
    const allProducts = await getAllProducts();
    const featuredProducts = allProducts.filter((p) => p.featured).slice(0, 4);
    const fallbackProducts = allProducts.slice(0, 4);
    const products = featuredProducts.length > 0 ? featuredProducts : fallbackProducts;

    // City hero data
    const hero = getCityHeroData(city.name, province.name, province.slug);

    // City FAQs
    const faqs = getCityFaqs(city.name, province.name, province.legalAge, city.deliveryTime);

    // Nearby cities (same province, exclude current)
    const sameProvinceCities = province.cities.filter((c) => c.slug !== city.slug);

    // Use enhanced popular categories for Tier 1, fallback for others
    const categories = tier1
        ? city.popularCategories
        : [
            { name: "Flower", slug: "flower" },
            { name: "Edibles", slug: "edibles" },
            { name: "Concentrates", slug: "concentrates" },
            { name: "Hash", slug: "hash" },
            { name: "Vapes", slug: "vapes" },
            { name: "CBD", slug: "cbd" },
        ];

    // Service schema for this city (local SEO)
    const cityServiceSchema = getCityServiceSchema(city.slug);

    // Breadcrumb schema
    const breadcrumbs = [
        { name: "Home", url: "https://mohawkmedibles.ca" },
        { name: "Delivery", url: "https://mohawkmedibles.ca/delivery" },
        { name: province.name, url: `https://mohawkmedibles.ca/delivery/${province.slug}` },
        { name: city.name, url: `https://mohawkmedibles.ca/delivery/${province.slug}/${city.slug}` },
    ];

    // Store schema - built from trusted internal data
    const storeSchemaData = {
        "@context": "https://schema.org",
        "@type": "Store",
        name: "Mohawk Medibles",
        url: "https://mohawkmedibles.ca",
        image: "https://mohawkmedibles.ca/logo.png",
        description: `Indigenous-owned premium cannabis dispensary delivering to ${city.name}, ${province.name}. Lab-tested, terpene-profiled products meeting the Empire Standard™.`,
        address: {
            "@type": "PostalAddress",
            streetAddress: "Six Nations of the Grand River",
            addressLocality: "Ohsweken",
            addressRegion: "ON",
            addressCountry: "CA",
        },
        areaServed: {
            "@type": "City",
            name: city.name,
            geo: {
                "@type": "GeoCoordinates",
                latitude: city.lat,
                longitude: city.lng,
            },
        },
        priceRange: "$$",
    };

    return (
        <>
            {/* JSON-LD Schemas - using internal trusted data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchemaData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
            />
            {cityServiceSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", ...cityServiceSchema }) }}
                />
            )}

            {/* Page Content */}
            <main className="min-h-screen pt-32 pb-20 page-glass text-foreground">
                <div className="container mx-auto px-6">
                    {/* Breadcrumb Navigation */}
                    <nav className="mb-12 flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-secondary transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link
                            href="/delivery"
                            className="hover:text-secondary transition-colors"
                        >
                            Delivery
                        </Link>
                        <span>/</span>
                        <Link
                            href={`/delivery/${province.slug}`}
                            className="hover:text-secondary transition-colors"
                        >
                            {province.name}
                        </Link>
                        <span>/</span>
                        <span className="text-secondary">{city.name}</span>
                    </nav>

                    {/* Hero Section — Province-Themed Gradient */}
                    <section
                        className="relative h-72 md:h-80 overflow-hidden rounded-2xl mb-12"
                        role="img"
                        aria-label={hero.heroAlt}
                    >
                        {/* Province-specific gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${hero.theme.gradient}`} />
                        {/* Depth overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-t ${hero.theme.overlay}`} />
                        {/* Smoke/haze texture overlay for brand consistency */}
                        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[radial-gradient(ellipse_at_30%_20%,rgba(132,204,22,0.15)_0%,transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(132,204,22,0.1)_0%,transparent_50%)]" />
                        {/* Decorative pattern */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />

                        {/* Hero content */}
                        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-12">
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white uppercase mb-4 drop-shadow-lg">
                                {hero.heroTitle}
                            </h1>
                            <p className="text-base md:text-lg text-white/80 max-w-2xl leading-relaxed mb-6 drop-shadow-md">
                                {hero.heroSubtitle}
                            </p>

                            {/* Info badges */}
                            <div className="flex flex-wrap gap-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-white">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {city.deliveryTime}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-white">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                    Free Shipping $199+
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-white">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    Lab-Tested
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* City description */}
                    <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed mb-20">
                        {city.description}
                    </p>

                    {/* Tier 1: Delivery Estimate Badge + City Highlights */}
                    {tier1 && (
                        <section className="mb-20">
                            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/40">
                                <span className="text-secondary font-semibold text-sm tracking-wide">
                                    Estimated Delivery: {city.deliveryEstimate}
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-foreground tracking-tight mb-8">
                                About Cannabis Delivery in {city.name}
                            </h2>
                            <div className="glass-card p-8 rounded-2xl border border-border space-y-4">
                                {city.highlights.map((highlight, idx) => (
                                    <p key={idx} className="text-muted-foreground leading-relaxed">
                                        {highlight}
                                    </p>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Stats Row */}
                    <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                        <div className="glass-card p-6 rounded-2xl border border-border">
                            <div className="text-5xl font-bold text-foreground mb-2">{city.population}</div>
                            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                                Population
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-2xl border border-border">
                            <div className="text-5xl font-bold text-foreground mb-2">{province.legalAge}+</div>
                            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                                Legal Age
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-2xl border border-border">
                            <div className="text-5xl font-bold text-foreground mb-2">{city.deliveryTime}</div>
                            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                                Delivery Time
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-2xl border border-border">
                            <div className="text-5xl font-bold text-foreground mb-2">{city.landmark}</div>
                            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                                Landmark
                            </div>
                        </div>
                    </section>

                    {/* Tier 1: Local Facts Section */}
                    {tier1 && city.localFacts.length > 0 && (
                        <section className="mb-20">
                            <h2 className="text-3xl font-bold text-foreground tracking-tight mb-8">
                                Did You Know? {city.name} Facts
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {city.localFacts.map((fact, idx) => (
                                    <div key={idx} className="glass-card p-6 rounded-2xl border border-border">
                                        <p className="text-muted-foreground leading-relaxed text-sm">{fact}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Categories Section */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-foreground tracking-tight mb-8">
                            {tier1 ? `Top Cannabis Categories in ${city.name}` : `Popular Categories in ${city.name}`}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((category) => (
                                <Link
                                    key={category.slug}
                                    href={`/shop?category=${category.slug}`}
                                    className="glass-card p-6 rounded-2xl border border-border hover:border-secondary/40 transition-all hover:scale-105 group"
                                >
                                    <h3 className="text-xl font-bold text-secondary group-hover:text-foreground transition-colors">
                                        {category.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Premium {category.name.toLowerCase()} products shipped to {city.name}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Trust Section */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-foreground tracking-tight mb-8">
                            Why Order From Mohawk Medibles in {city.name}?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                {
                                    title: "Fast Delivery",
                                    description: `Orders to ${city.name} arrive within ${city.deliveryTime} with full Canada Post tracking.`,
                                },
                                {
                                    title: "Discreet Packaging",
                                    description:
                                        "Plain, unmarked boxes with vacuum-sealed products. No cannabis branding or indication of contents.",
                                },
                                {
                                    title: "Premium Quality",
                                    description:
                                        "Lab-tested flower, edibles, concentrates, and more meeting the Empire Standard™.",
                                },
                                {
                                    title: "Free Shipping",
                                    description: "Orders over $199 CAD ship free. Track your package every step of the way.",
                                },
                            ].map((feature) => (
                                <div
                                    key={feature.title}
                                    className="glass-card p-6 rounded-2xl border border-border"
                                >
                                    <h3 className="text-xl font-bold text-secondary mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Delivery Details Table */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-foreground tracking-tight mb-8">
                            Delivery Details
                        </h2>
                        <div className="glass-card p-8 rounded-2xl border border-border space-y-6">
                            {[
                                {
                                    label: "Delivery Method",
                                    value: "Canada Post Xpresspost",
                                },
                                {
                                    label: "Estimated Delivery",
                                    value: tier1 && city.deliveryEstimate ? city.deliveryEstimate : city.deliveryTime,
                                },
                                {
                                    label: "Free Shipping Threshold",
                                    value: "$199 CAD or more",
                                },
                                {
                                    label: "Shipping Cost",
                                    value: "$15 flat rate under $199; Free over $199",
                                },
                                {
                                    label: "Tracking",
                                    value: "Full Canada Post tracking included",
                                },
                                {
                                    label: "Packaging",
                                    value: "Plain, unmarked box with vacuum-sealed products",
                                },
                                {
                                    label: "Minimum Age",
                                    value: `${province.legalAge} years or older (ID required)`,
                                },
                                {
                                    label: "Payment Methods",
                                    value: "Interac e-Transfer, Visa, Mastercard, Crypto",
                                },
                            ].map((row) => (
                                <div key={row.label} className="flex justify-between items-start border-b border-border pb-4 last:border-b-0">
                                    <span className="text-muted-foreground font-medium">{row.label}</span>
                                    <span className="text-foreground text-right font-semibold">
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-foreground tracking-tight mb-8">
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <details
                                    key={idx}
                                    className="glass-card p-8 rounded-2xl border border-border group cursor-pointer"
                                >
                                    <summary className="flex items-center justify-between select-none">
                                        <h3 className="text-xl font-bold text-secondary group-open:text-foreground transition-colors">
                                            {faq.question}
                                        </h3>
                                        <span className="text-secondary text-2xl group-open:rotate-180 transition-transform">
                                            +
                                        </span>
                                    </summary>
                                    <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
                                        {faq.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </section>

                    {/* Tier 1: Nearby Areas (cross-province internal linking) */}
                    {tier1 && city.nearbyAreas.length > 0 && (
                        <section className="mb-20">
                            <h2 className="text-3xl font-bold text-foreground tracking-tight mb-8">
                                Also Delivering Near {city.name}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {city.nearbyAreas.map((area) => (
                                    <Link
                                        key={`${area.provinceSlug}-${area.slug}`}
                                        href={`/delivery/${area.provinceSlug}/${area.slug}`}
                                        className="glass-card p-6 rounded-2xl border border-border hover:border-secondary/40 transition-all hover:scale-105 group"
                                    >
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-secondary transition-colors">
                                            {area.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Cannabis delivery available
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Other Cities in Same Province */}
                    {sameProvinceCities.length > 0 && (
                        <section className="mb-20">
                            <h2 className="text-3xl font-bold text-foreground tracking-tight mb-8">
                                Other Cities in {province.name}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sameProvinceCities.map((nearbyCity) => (
                                    <Link
                                        key={nearbyCity.slug}
                                        href={`/delivery/${province.slug}/${nearbyCity.slug}`}
                                        className="glass-card p-6 rounded-2xl border border-border hover:border-secondary/40 transition-all hover:scale-105"
                                    >
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-secondary">
                                            {nearbyCity.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {nearbyCity.deliveryTime} delivery
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Featured Products Section */}
                    {products.length > 0 && (
                        <section className="mb-20">
                            <h2 className="text-3xl font-bold text-foreground tracking-tight mb-8">
                                Featured Products Available in {city.name}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <Link
                                        key={product.slug}
                                        href={`/shop/${product.slug}`}
                                        className="glass-card rounded-2xl border border-border overflow-hidden hover:border-secondary/40 transition-all hover:scale-105 group flex flex-col"
                                    >
                                        {product.image && (
                                            <div className="relative w-full h-48 bg-muted">
                                                <Image
                                                    src={product.image}
                                                    alt={product.altText}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="text-sm font-bold text-foreground truncate">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-secondary mt-1">
                                                {product.category}
                                            </p>
                                            <p className="text-xl font-bold text-foreground mt-auto pt-2">
                                                ${product.price}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Cannabis Guides Section */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-foreground tracking-tight mb-8">
                            Cannabis Guides for {city.name} Customers
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { title: "The Complete Terpene Guide", slug: "terpene-guide-cannabis-effects", desc: "Learn how terpenes shape cannabis effects — myrcene, limonene, pinene & more." },
                                { title: "Edible Dosing Guide", slug: "edible-dosing-guide-beginners-canada", desc: "Safe THC dosing from 2.5mg to 50mg+. Start low, go slow." },
                                { title: "Indica vs Sativa vs Hybrid", slug: "indica-vs-sativa-vs-hybrid-guide", desc: "What the science actually says about strain types in 2026." },
                                { title: "The Ultimate Hash Guide", slug: "hash-guide-types-potency-canada", desc: "Afghan, Moroccan, La Mousse, Temple Ball — types, potency & how to choose." },
                                { title: "CBD Oil Benefits & Dosing", slug: "cbd-oil-guide-benefits-dosing-canada", desc: "Full spectrum vs isolate, dosing charts, and top product picks." },
                                { title: "How to Buy Cannabis Online", slug: "buying-cannabis-online-canada-guide", desc: "Complete 2026 guide to ordering cannabis online in Canada safely." },
                            ].map((guide) => (
                                <Link
                                    key={guide.slug}
                                    href={`/blog/${guide.slug}`}
                                    className="glass-card p-5 rounded-2xl border border-border hover:border-secondary/40 transition-all group"
                                >
                                    <h3 className="text-sm font-bold text-secondary group-hover:text-foreground transition-colors mb-2">
                                        {guide.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{guide.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="text-center">
                        <h2 className="text-4xl font-bold text-foreground tracking-tight mb-6">
                            Order Cannabis in {city.name}
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                            Fast, discreet delivery of premium cannabis products to {city.name}. Free shipping on orders over $199 CAD.
                        </p>
                        <Link href="/shop">
                            <Button className="bg-secondary hover:bg-secondary/80 text-forest font-bold text-lg px-8 py-6 rounded-lg">
                                Shop Now
                            </Button>
                        </Link>
                    </section>
                </div>
            </main>
        </>
    );
}
