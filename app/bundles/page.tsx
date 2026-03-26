import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getAllProducts, type Product } from "@/lib/products";
import BundlesClient from "./BundlesClient";

export const metadata: Metadata = {
    title: "Cannabis Bundles & Combo Deals — Save Up to 25%",
    description:
        "Save up to 25% with curated cannabis bundles from Mohawk Medibles. Starter packs, edible samplers, hash bundles & premium combos. Indigenous-owned dispensary, free shipping over $149.",
    keywords: [
        "cannabis bundles canada",
        "weed bundle deals",
        "cannabis combo deals",
        "bulk cannabis canada",
        "cannabis starter pack",
        "edibles bundle canada",
        "hash bundle deal",
        "mohawk medibles bundles",
        "dispensary bundle deals",
        "cannabis variety pack",
    ],
    openGraph: {
        title: "Cannabis Bundles & Combo Deals",
        description:
            "Save up to 25% with curated cannabis bundles. Starter packs, edible samplers, hash bundles & premium combos.",
        url: "https://mohawkmedibles.ca/bundles",
        type: "website",
        images: ["/og-image.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Cannabis Bundles",
        description:
            "Curated cannabis bundles — save up to 25%. Free shipping over $149 Canada-wide.",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/bundles",
    },
};

// ─── Types ──────────────────────────────────────────────────

interface BundleItem {
    productId: number;
    quantity: number;
}

interface PosBundle {
    id: number;
    name: string;
    description: string | null;
    bundlePrice: number;
    items: BundleItem[];
    regularPrice: number;
    active: boolean;
    imageUrl: string | null;
}

export interface ResolvedBundle {
    id: number;
    name: string;
    description: string;
    bundlePrice: number;
    regularPrice: number;
    savingsAmount: number;
    savingsPercent: number;
    imageUrl: string | null;
    products: {
        id: number;
        name: string;
        slug: string;
        price: number;
        image: string;
        category: string;
        quantity: number;
    }[];
}

// ─── Curated bundle definitions (fallback when PosBundle table is empty) ────

interface CuratedBundleDef {
    name: string;
    description: string;
    categories: { category: string; count: number }[];
    discountPercent: number;
    badge: string | null;
}

const CURATED_BUNDLE_DEFS: CuratedBundleDef[] = [
    {
        name: "Starter Pack",
        description:
            "Perfect for first-time buyers. A curated mix of flower, edibles, and pre-rolls to explore our best sellers.",
        categories: [
            { category: "Flower", count: 1 },
            { category: "Edibles", count: 1 },
            { category: "Pre-Rolls", count: 1 },
        ],
        discountPercent: 15,
        badge: "POPULAR",
    },
    {
        name: "Edibles Sampler",
        description:
            "Try a variety of our most popular edibles. Great for sharing or stocking up on your favourites.",
        categories: [{ category: "Edibles", count: 4 }],
        discountPercent: 20,
        badge: "BEST VALUE",
    },
    {
        name: "Hash Connoisseur",
        description:
            "For the hash lover. A curated selection of our finest imported and domestic hash varieties.",
        categories: [{ category: "Hash", count: 3 }],
        discountPercent: 15,
        badge: null,
    },
    {
        name: "Weekend Special",
        description:
            "Everything you need for a relaxing weekend. Premium quality flower and concentrates at a great price.",
        categories: [
            { category: "Flower", count: 2 },
            { category: "Concentrates", count: 1 },
        ],
        discountPercent: 18,
        badge: null,
    },
    {
        name: "Party Pack",
        description:
            "Hosting a party? This bundle has everything covered with pre-rolls and edibles for a great time.",
        categories: [
            { category: "Pre-Rolls", count: 2 },
            { category: "Edibles", count: 2 },
        ],
        discountPercent: 20,
        badge: "NEW",
    },
    {
        name: "Premium Experience",
        description:
            "Our top-shelf selection for discerning customers who want the very best cannabis money can buy.",
        categories: [
            { category: "Flower", count: 1 },
            { category: "Concentrates", count: 1 },
            { category: "Hash", count: 1 },
            { category: "Edibles", count: 1 },
        ],
        discountPercent: 15,
        badge: "PREMIUM",
    },
];

// ─── Data fetching ──────────────────────────────────────────

async function getPosBundles(): Promise<ResolvedBundle[]> {
    try {
        const bundles = (await prisma.posBundle.findMany({
            where: { active: true },
            orderBy: { createdAt: "desc" },
        })) as unknown as PosBundle[];

        if (bundles.length === 0) return [];

        // Collect all product IDs referenced
        const allProductIds = bundles.flatMap((b) =>
            Array.isArray(b.items)
                ? b.items.map((i: BundleItem) => i.productId)
                : []
        );

        const products = await prisma.product.findMany({
            where: { id: { in: allProductIds } },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                image: true,
                category: true,
            },
        });

        const productMap = new Map(products.map((p) => [p.id, p]));

        return bundles
            .map((bundle) => {
                const items = Array.isArray(bundle.items) ? bundle.items : [];
                const resolvedProducts = items
                    .map((item: BundleItem) => {
                        const product = productMap.get(item.productId);
                        if (!product) return null;
                        return { ...product, quantity: item.quantity || 1 };
                    })
                    .filter(Boolean) as ResolvedBundle["products"];

                if (resolvedProducts.length === 0) return null;

                const savingsAmount = bundle.regularPrice - bundle.bundlePrice;
                const savingsPercent = Math.round(
                    (savingsAmount / bundle.regularPrice) * 100
                );

                return {
                    id: bundle.id,
                    name: bundle.name,
                    description: bundle.description || "",
                    bundlePrice: bundle.bundlePrice,
                    regularPrice: bundle.regularPrice,
                    savingsAmount,
                    savingsPercent,
                    imageUrl: bundle.imageUrl,
                    products: resolvedProducts,
                };
            })
            .filter(Boolean) as ResolvedBundle[];
    } catch (err) {
        console.error("[bundles] Failed to load PosBundle data:", err);
        return [];
    }
}

async function buildCuratedBundles(
    allProducts: Product[]
): Promise<ResolvedBundle[]> {
    // Group products by category
    const byCategory = new Map<string, Product[]>();
    for (const product of allProducts) {
        if (product.price <= 0) continue;
        const cat = product.category;
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        byCategory.get(cat)!.push(product);
    }

    // Shuffle helper for variety
    function shuffle<T>(arr: T[]): T[] {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    const bundles: ResolvedBundle[] = [];
    let idCounter = 1000;

    for (const def of CURATED_BUNDLE_DEFS) {
        const products: ResolvedBundle["products"] = [];
        let canBuild = true;

        for (const req of def.categories) {
            // Try exact match first, then fuzzy match on category name
            let pool = byCategory.get(req.category);
            if (!pool || pool.length === 0) {
                // Try case-insensitive partial match
                for (const [cat, prods] of byCategory) {
                    if (cat.toLowerCase().includes(req.category.toLowerCase())) {
                        pool = prods;
                        break;
                    }
                }
            }

            if (!pool || pool.length < req.count) {
                canBuild = false;
                break;
            }

            const picked = shuffle(pool).slice(0, req.count);
            for (const p of picked) {
                products.push({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    price: p.price,
                    image: p.image,
                    category: p.category,
                    quantity: 1,
                });
            }
        }

        if (!canBuild || products.length === 0) continue;

        const regularPrice = products.reduce(
            (sum, p) => sum + p.price * p.quantity,
            0
        );
        const bundlePrice = Math.round(
            regularPrice * (1 - def.discountPercent / 100)
        );
        const savingsAmount = regularPrice - bundlePrice;
        const savingsPercent = def.discountPercent;

        bundles.push({
            id: idCounter++,
            name: def.name,
            description: def.description,
            bundlePrice,
            regularPrice,
            savingsAmount,
            savingsPercent,
            imageUrl: products[0]?.image || null,
            products,
        });
    }

    return bundles;
}

// ─── Page Component ─────────────────────────────────────────

export default async function BundlesPage() {
    // Try PosBundle table first; fall back to curated bundles from product catalog
    let bundles = await getPosBundles();

    if (bundles.length === 0) {
        const allProducts = await getAllProducts();
        bundles = await buildCuratedBundles(allProducts);
    }

    // JSON-LD structured data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Cannabis Bundles & Combo Deals",
        description:
            "Curated cannabis product bundles with savings up to 25%. Starter packs, edible samplers, hash bundles and more.",
        url: "https://mohawkmedibles.ca/bundles",
        mainEntity: {
            "@type": "ItemList",
            numberOfItems: bundles.length,
            itemListElement: bundles.map((b, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                    "@type": "Product",
                    name: b.name,
                    description: b.description,
                    offers: {
                        "@type": "Offer",
                        price: b.bundlePrice.toFixed(2),
                        priceCurrency: "CAD",
                        availability: "https://schema.org/InStock",
                    },
                },
            })),
        },
        breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://mohawkmedibles.ca",
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: "Bundles",
                    item: "https://mohawkmedibles.ca/bundles",
                },
            ],
        },
    };

    return (
        <div className="min-h-screen pt-32 pb-20 page-glass text-foreground">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BundlesClient bundles={bundles} />
        </div>
    );
}
