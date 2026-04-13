/**
 * Mohawk Medibles — Dynamic Sitemap
 * ══════════════════════════════════
 * Next.js built-in sitemap generation for all products, blog posts, and pages.
 * Generates sitemap.xml at build time / on request.
 */
import { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products";
import { getAllBlogPosts } from "@/data/blog/posts";
import { getAllCities, getAllProvinces } from "@/lib/seo/city-delivery-data";
import { COMPETITORS } from "@/data/comparisons";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mohawkmedibles.ca";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date().toISOString();
    const PRODUCTS = await getAllProducts();

    // ─── Static Pages ───────────────────────────────────────
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/shop`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/faq`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/blog`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/privacy`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/shipping-policy`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/returns-policy`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/reviews`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/support`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/accessibility`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/deals`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/how-to-order`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/indigenous-cannabis-dispensary-canada`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/buy-weed-online-canada`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.95,
        },
        {
            url: `${BASE_URL}/indigenous-cannabis-rights-canada`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.85,
        },
        {
            url: `${BASE_URL}/cannabis-laws`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/cannabis-directory-listings`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/delivery`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.85,
        },
    ];

    // ─── Product Pages (360+ products) with images ───────────
    const productPages: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
        url: `${BASE_URL}${product.path}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images: product.image ? [product.image] : undefined,
    }));

    // ─── Category Pages ─────────────────────────────────────
    const categories = [...new Set(PRODUCTS.map((p) => p.category))];
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
        url: `${BASE_URL}/shop/${category.toLowerCase().replace(/\s+/g, "-")}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.85,
    }));

    // ─── Brand Filter Pages (Shop by Brand — AEO/GEO signals) ──
    const brandNames = [
        "Drizzle Factory", "Plant of Life", "AKI Wellness", "Stellar",
        "Euphoria Extractions", "Euphoria Psychedelics", "Wesley Tea Co.",
        "Cactus Labs", "Burn", "Diamond Concentrates", "Geek Bar",
        "Fungara", "Zoomz", "ASEND", "Backwoods", "Al Fakher",
    ];
    const brandPages: MetadataRoute.Sitemap = brandNames.map((brand) => ({
        url: `${BASE_URL}/shop?category=Brands&brand=${encodeURIComponent(brand)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    // ─── Provincial Delivery Pages (match WordPress /province-delivery/) ──
    const provincialSlugs = [
        "ontario-delivery", "alberta-delivery", "british-columbia-delivery",
        "quebec-delivery", "manitoba-delivery", "saskatchewan-delivery",
        "nova-scotia-delivery", "new-brunswick-delivery", "new-foundland-labrador-delivery",
        "prince-edward-island-delivery", "northwest-territories-delivery",
        "nunavut-delivery", "yukon-delivery",
    ];
    const provincialPages: MetadataRoute.Sitemap = provincialSlugs.map((slug) => ({
        url: `${BASE_URL}/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.85,
    }));

    // ─── New Province Delivery Pages (under /delivery/[province]) ───────────
    const provinceDeliveryPages: MetadataRoute.Sitemap = getAllProvinces().map((province) => ({
        url: `${BASE_URL}/delivery/${province.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    // ─── New City Delivery Pages (under /delivery/[province]/[city]) ────────
    const cityDeliveryPages2: MetadataRoute.Sitemap = getAllCities().map(({ province, city }) => ({
        url: `${BASE_URL}/delivery/${province.slug}/${city.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.75,
    }));

    // ─── Cannabis Law Province Pages ──────────────────────────
    const CANNABIS_LAW_PROVINCES = [
        "ontario", "british-columbia", "alberta", "quebec", "manitoba",
        "saskatchewan", "nova-scotia", "new-brunswick",
        "newfoundland-and-labrador", "prince-edward-island",
        "northwest-territories", "yukon", "nunavut",
    ];
    const cannabisLawPages: MetadataRoute.Sitemap = CANNABIS_LAW_PROVINCES.map((slug) => ({
        url: `${BASE_URL}/cannabis-laws/${slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.75,
    }));

    // ─── Blog Posts ─────────────────────────────────────────
    const blogPosts = getAllBlogPosts();
    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.dateModified || post.datePublished,
        changeFrequency: "weekly" as const,
        priority: 0.75,
    }));

    // ─── LLM Discovery File ────────────────────────────────
    const llmsEntry: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/llms.txt`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ];

    // ─── Strain Landing Pages ──────────────────────────────
    const strainPages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/strains`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
        { url: `${BASE_URL}/strains/indica`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
        { url: `${BASE_URL}/strains/sativa`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
        { url: `${BASE_URL}/strains/hybrid`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    ];

    // ─── Dispensary Comparison Pages ─────────────────────────
    const comparisonIndex: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/compare-dispensary`,
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        },
    ];
    const comparisonPages: MetadataRoute.Sitemap = COMPETITORS.map((comp) => ({
        url: `${BASE_URL}/compare-dispensary/${comp.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.75,
    }));

    return [...staticPages, ...strainPages, ...categoryPages, ...brandPages, ...provincialPages, ...provinceDeliveryPages, ...cityDeliveryPages2, ...cannabisLawPages, ...comparisonIndex, ...comparisonPages, ...blogPages, ...productPages, ...llmsEntry];
}
