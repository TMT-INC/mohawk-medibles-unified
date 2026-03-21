import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug, getShortName } from "@/lib/products";
import { getSmartRelatedProducts } from "@/lib/recommendations";
import { getProductBySlug as getProductBySlugLocal } from "@/lib/productData";
import { productSchema, breadcrumbSchema, faqSchema, speakableSchema } from "@/lib/seo/schemas";
import { generateProductFAQs } from "@/lib/seo/aeo";
import { prisma } from "@/lib/db";
import ProductDetailClient from "./ProductDetailClient";

// ─── Static Params for SSG ──────────────────────────────────
export async function generateStaticParams() {
    const products = await getAllProducts();
    return products.map((p) => ({ slug: p.slug }));
}

// ─── Dynamic Metadata ───────────────────────────────────────
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) return { title: "Product Not Found" };

    return {
        title: product.name,
        description: product.metaDescription,
        keywords: [
            product.name.toLowerCase(),
            product.category.toLowerCase(),
            ...product.specs.terpenes.map((t) => t.toLowerCase()),
            "mohawk medibles",
            "cannabis canada",
        ],
        openGraph: {
            title: `${product.name} | Mohawk Medibles`,
            description: product.metaDescription,
            url: `https://mohawkmedibles.co/shop/${slug}`,
            images: [{ url: `/api/og?type=product&slug=${slug}`, width: 1200, height: 630, alt: product.altText }],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description: product.shortDescription,
            images: [`/api/og?type=product&slug=${slug}`],
        },
        alternates: { canonical: `https://mohawkmedibles.co/shop/${slug}` },
    };
}

// ─── Server Component (SSG) ────────────────────────────────
export default async function ProductPage({ params }: PageProps) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) notFound();

    // Use terpene/effect-scored recommendations instead of simple same-category
    const localProduct = getProductBySlugLocal(slug);
    const related = localProduct
        ? getSmartRelatedProducts(localProduct, 4)
        : [];
    const shortName = getShortName(product);

    // Fetch inventory for stock status
    let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
    let stockQuantity: number | null = null;
    try {
        const inventory = await prisma.inventory.findUnique({
            where: { productId: product.id },
        });
        if (inventory) {
            stockQuantity = inventory.quantity;
            if (inventory.quantity <= 0 && !inventory.backorder) {
                stockStatus = "out_of_stock";
            } else if (inventory.quantity <= inventory.lowStockAt) {
                stockStatus = "low_stock";
            }
        }
    } catch {
        // Fallback: assume in stock if DB fails
    }

    // Fetch review stats for this product
    let reviewStats: { totalReviews: number; averageRating: number; distribution: Record<number, number> } = {
        totalReviews: 0, averageRating: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
    try {
        const approvedReviews = await prisma.review.findMany({
            where: { productId: product.id, status: "APPROVED" },
            select: { rating: true },
        });
        if (approvedReviews.length > 0) {
            const total = approvedReviews.length;
            const avg = +(approvedReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / total).toFixed(1);
            const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            for (const r of approvedReviews) dist[r.rating] = (dist[r.rating] || 0) + 1;
            reviewStats = { totalReviews: total, averageRating: avg, distribution: dist };
        }
    } catch {
        // Fallback: no reviews
    }

    // JSON-LD schemas
    const productJsonLd = productSchema({
        name: product.name,
        slug,
        description: product.metaDescription,
        image: product.image,
        price: product.price,
        sku: product.sku || `MM-${product.id}`,
        category: product.category,
        thc: product.specs.thc,
        cbd: product.specs.cbd,
        weight: product.specs.weight,
        terpenes: product.specs.terpenes,
        inStock: stockStatus !== "out_of_stock",
        rating: reviewStats.averageRating || undefined,
        reviewCount: reviewStats.totalReviews || undefined,
    });

    const breadcrumbJsonLd = breadcrumbSchema([
        { name: "Home", url: "https://mohawkmedibles.co" },
        { name: "Shop", url: "https://mohawkmedibles.co/shop" },
        { name: product.category, url: `https://mohawkmedibles.co/shop?category=${encodeURIComponent(product.category)}` },
        { name: product.name, url: `https://mohawkmedibles.co/shop/${slug}` },
    ]);

    const productFaqs = generateProductFAQs({
        name: product.name,
        category: product.category,
        thc: product.specs.thc,
        cbd: product.specs.cbd,
        terpenes: product.specs.terpenes,
        price: product.price,
    });
    const faqJsonLd = faqSchema(productFaqs.map(({ question, answer }) => ({ question, answer })));

    // Speakable schema — tells voice agents which sections to read aloud
    const speakableJsonLd = speakableSchema(
        `https://mohawkmedibles.co/shop/${slug}`,
        [".product-name", ".product-price", ".product-specs", ".product-description"]
    );

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />
            <ProductDetailClient
                product={product}
                related={related}
                shortName={shortName}
                faqs={productFaqs.map(({ question, answer }) => ({ question, answer }))}
                stockStatus={stockStatus}
                stockQuantity={stockQuantity}
                reviewStats={reviewStats}
            />
        </>
    );
}
