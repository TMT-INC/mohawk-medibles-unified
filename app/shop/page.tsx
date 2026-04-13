import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllProducts } from "@/lib/products";
import { getCurrentTenant } from "@/lib/tenant";
import { itemListSchema, breadcrumbSchema, buildSchemaGraph } from "@/lib/seo/schemas";
import ShopClient from "./ShopClient";
import TopStrainsSection from "@/components/TopStrainsSection";

// ─── Category SEO Metadata Map ──────────────────────────────────
// Optimized titles and descriptions for each cannabis category.

const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
    Flower: {
        title: "Premium Cannabis Flower | Buy AAAA Weed Online",
        description:
            "Shop premium AAAA cannabis flower at Mohawk Medibles. Indica, Sativa & Hybrid strains. Lab-tested, terpene-profiled, Indigenous-owned. Free shipping over $149. Ships Canada-wide via Xpresspost.",
    },
    Edibles: {
        title: "Cannabis Edibles | THC Gummies, Chocolates & More",
        description:
            "Browse THC gummies, chocolates, beverages and cannabis edibles at Mohawk Medibles. Lab-tested dosing, premium ingredients. Indigenous-owned. Free shipping over $149 Canada-wide.",
    },
    Concentrates: {
        title: "Cannabis Concentrates | Shatter, Wax, Live Resin",
        description:
            "Shop premium cannabis concentrates including shatter, wax, live resin, diamonds and budder. Lab-tested potency. Indigenous-owned. Free shipping over $149 Canada-wide.",
    },
    Vapes: {
        title: "Cannabis Vapes & Cartridges | 510 Thread & Disposable",
        description:
            "Shop 510 thread cartridges, disposable vape pens and cannabis vaporizers at Mohawk Medibles. Lab-tested, solvent-free. Indigenous-owned. Free shipping over $149 Canada-wide.",
    },
    Hash: {
        title: "Premium Hash | Imported & Domestic",
        description:
            "Shop premium imported and domestic hash at Mohawk Medibles. Hand-pressed, bubble hash, temple balls and more. Lab-tested. Indigenous-owned. Free shipping over $149 Canada-wide.",
    },
    "Pre-Rolls": {
        title: "Pre-Rolled Joints | Cannabis Pre-Rolls Canada",
        description:
            "Shop pre-rolled joints and cannabis pre-rolls at Mohawk Medibles. Singles, multi-packs, infused pre-rolls. Lab-tested flower. Indigenous-owned. Free shipping over $149 Canada-wide.",
    },
    CBD: {
        title: "CBD Products | Oils, Topicals & Edibles",
        description:
            "Shop CBD oils, topicals, edibles and capsules at Mohawk Medibles. Third-party lab-tested, full-spectrum and isolate options. Indigenous-owned. Free shipping over $149 Canada-wide.",
    },
    Mushrooms: {
        title: "Magic Mushrooms & Psilocybin | Microdose to Macro",
        description:
            "Shop 9+ mushroom products at Mohawk Medibles. Microdose capsules, dried shrooms, chocolate bars. Lab-tested. Discreet packaging. Canada-wide delivery.",
    },
    Disposables: {
        title: "Disposable Vape Pens | Premium Cannabis Vapes",
        description:
            "Shop 19+ premium disposable vape pens at Mohawk Medibles. High-potency, solvent-free, lab-tested. Indigenous-owned. Free shipping over $149 Canada-wide.",
    },
    "Enhancement Pills": {
        title: "Enhancement Pills & Supplements",
        description:
            "Shop enhancement pills and natural supplements at Mohawk Medibles. Discreet packaging, fast shipping. Indigenous-owned. Ships Canada-wide.",
    },
    Nicotine: {
        title: "Nicotine Vapes & E-Cigarettes",
        description:
            "Shop nicotine vapes, disposable e-cigarettes, and pods at Mohawk Medibles. Top brands like Geek Bar, Elf Bar, and more. Fast Canada-wide shipping.",
    },
    Accessories: {
        title: "Cannabis Accessories | Pipes, Papers & Gear",
        description:
            "Shop cannabis accessories at Mohawk Medibles. Rolling papers, pipes, grinders, batteries, and more. Fast Canada-wide shipping. Indigenous-owned.",
    },
    Capsules: {
        title: "Cannabis Capsules | THC & CBD Pills",
        description:
            "Shop THC and CBD capsules at Mohawk Medibles. Precise dosing, lab-tested potency. Discreet and convenient. Free shipping over $149 Canada-wide.",
    },
};

const DEFAULT_SEO = {
    title: "Shop Premium Cannabis Products | 360+ Items",
    description:
        "Browse 360+ premium cannabis products at Mohawk Medibles. Lab-tested flower, edibles, concentrates, vapes, and accessories. Indigenous-owned, Empire Standard\u2122 quality. Ships Canada-wide via Xpresspost.",
};

// ─── generateMetadata (reads searchParams for category filtering) ──

interface ShopPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
    const params = await searchParams;
    const tenant = await getCurrentTenant();
    const category = typeof params.category === "string" ? params.category : undefined;
    const categorySeo = category ? CATEGORY_SEO[category] : undefined;

    const title = categorySeo?.title ?? DEFAULT_SEO.title;
    const description = categorySeo?.description ?? DEFAULT_SEO.description;
    const canonicalUrl = category
        ? `https://${tenant.domain}/shop?category=${encodeURIComponent(category)}`
        : `https://${tenant.domain}/shop`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            type: "website",
            ...(tenant.ogImage ? { images: [tenant.ogImage] } : {}),
        },
        alternates: {
            canonical: canonicalUrl,
        },
    };
}

export const revalidate = 60;

// ─── Server Component (JSON-LD schemas + client shell) ──────────

export default async function ShopPage({ searchParams }: ShopPageProps) {
    const params = await searchParams;
    const tenant = await getCurrentTenant();
    const allProducts = await getAllProducts();
    const category = typeof params.category === "string" ? params.category : undefined;

    // Filter products by category for schemas (mirrors what client displays initially)
    const filteredProducts = category
        ? allProducts.filter((p) => p.category === category)
        : allProducts;

    // Use featured products first for the ItemList, then fill to 50 items max
    const featured = filteredProducts.filter((p) => p.featured);
    const schemaProducts = featured.length > 0
        ? [...featured, ...filteredProducts.filter((p) => !p.featured)].slice(0, 50)
        : filteredProducts.slice(0, 50);

    const categoryLabel = category ?? "All Cannabis Products";
    const baseUrl = `https://${tenant.domain}`;
    const pageUrl = category
        ? `${baseUrl}/shop?category=${encodeURIComponent(category)}`
        : `${baseUrl}/shop`;

    // ── ItemList Schema ──
    const itemList = itemListSchema(
        schemaProducts.map((p) => ({ name: p.name, slug: p.slug, image: p.image })),
        category ? `${category} \u2014 Mohawk Medibles` : "Mohawk Medibles \u2014 Full Cannabis Collection"
    );

    // ── BreadcrumbList Schema ──
    const breadcrumbItems = [
        { name: "Home", url: baseUrl },
        { name: "Shop", url: `${baseUrl}/shop` },
    ];
    if (category) {
        breadcrumbItems.push({
            name: category,
            url: `${baseUrl}/shop?category=${encodeURIComponent(category)}`,
        });
    }
    const breadcrumbs = breadcrumbSchema(breadcrumbItems);

    // ── CollectionPage Schema ──
    const collectionPage = {
        "@context": "https://schema.org" as const,
        "@type": "CollectionPage" as const,
        "@id": `${pageUrl}/#collectionpage`,
        name: category
            ? `${category} \u2014 Mohawk Medibles`
            : "Mohawk Medibles \u2014 Full Cannabis Collection",
        description: category
            ? `Browse ${filteredProducts.length} ${category.toLowerCase()} products at Mohawk Medibles. Lab-tested, Indigenous-owned cannabis.`
            : `Browse ${allProducts.length}+ premium cannabis products at Mohawk Medibles. Lab-tested, Indigenous-owned cannabis.`,
        url: pageUrl,
        isPartOf: { "@id": `${baseUrl}/#website` },
        about: { "@id": `${baseUrl}/#organization` },
        mainEntity: {
            "@type": "ItemList" as const,
            numberOfItems: filteredProducts.length,
            itemListElement: schemaProducts.map((p, i) => ({
                "@type": "ListItem" as const,
                position: i + 1,
                item: {
                    "@type": "Product" as const,
                    name: p.name,
                    url: `${baseUrl}/shop/${p.slug}`,
                    image: p.image.startsWith("http") ? p.image : `${baseUrl}${p.image}`,
                    offers: {
                        "@type": "Offer" as const,
                        price: p.price,
                        priceCurrency: "CAD",
                        availability: "https://schema.org/InStock",
                    },
                },
            })),
        },
    };

    // Build a single @graph with all three schemas
    // buildSchemaGraph strips individual @context and wraps in one top-level @context
    const graphJson = buildSchemaGraph(
        breadcrumbs as Record<string, unknown>,
        itemList as Record<string, unknown>,
        collectionPage as unknown as Record<string, unknown>
    );

    /* JSON-LD uses trusted server-generated schema data (not user input). */
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: graphJson }}
            />
            <Suspense>
                <ShopClient />
            </Suspense>
            <TopStrainsSection />
        </>
    );
}
