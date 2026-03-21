import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/server/trpc/trpc";

interface BrandPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
    const { slug } = await params;
    const brand = await prisma.brand.findUnique({ where: { slug } });

    if (!brand) {
        return { title: "Brand Not Found | Mohawk Medibles" };
    }

    return {
        title: `${brand.name} Products | Buy ${brand.name} Online | Mohawk Medibles`,
        description: `Shop ${brand.name} cannabis products at Mohawk Medibles. Lab-tested, premium quality. Indigenous-owned dispensary. Free shipping over $199. Ships Canada-wide.`,
        openGraph: {
            title: `${brand.name} | Mohawk Medibles`,
            description: `Shop ${brand.name} cannabis products. Lab-tested, premium quality. Free shipping over $199.`,
            url: `https://mohawkmedibles.ca/brands/${slug}`,
            type: "website",
            images: brand.logo ? [brand.logo] : ["/og-image.png"],
        },
        alternates: {
            canonical: `https://mohawkmedibles.ca/brands/${slug}`,
        },
    };
}

export default async function BrandPage({ params }: BrandPageProps) {
    const { slug } = await params;
    const brand = await prisma.brand.findUnique({ where: { slug } });

    if (!brand) {
        notFound();
    }

    // Find products whose name contains the brand name (common pattern for branded products)
    const products = await prisma.product.findMany({
        where: {
            status: "ACTIVE",
            name: { contains: brand.name, mode: "insensitive" },
        },
        orderBy: { name: "asc" },
        include: { specs: true },
    });

    return (
        <div className="min-h-screen pt-32 pb-20 page-glass text-foreground">
            {/* Breadcrumb */}
            <nav className="container mx-auto px-6 mb-8" aria-label="Breadcrumb">
                <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                    <li>
                        <Link href="/" className="hover:text-foreground transition-colors">
                            Home
                        </Link>
                    </li>
                    <li>/</li>
                    <li>
                        <Link href="/brands" className="hover:text-foreground transition-colors">
                            Brands
                        </Link>
                    </li>
                    <li>/</li>
                    <li className="text-foreground font-medium">{brand.name}</li>
                </ol>
            </nav>

            {/* Brand Header */}
            <section className="container mx-auto px-6 mb-16">
                <div className="flex flex-col items-center text-center">
                    {brand.logo && (
                        <div className="w-28 h-28 rounded-2xl bg-card border border-border flex items-center justify-center overflow-hidden mb-6">
                            <Image
                                src={brand.logo}
                                alt={`${brand.name} logo`}
                                width={112}
                                height={112}
                                className="object-contain"
                            />
                        </div>
                    )}
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground uppercase mb-4">
                        {brand.name}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl">
                        Browse all {brand.name} products available at Mohawk Medibles. Premium quality,
                        lab-tested, and backed by the Empire Standard&trade;.
                    </p>
                </div>
            </section>

            {/* Products Grid */}
            {products.length > 0 ? (
                <section className="container mx-auto px-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-foreground">
                            {products.length} Product{products.length !== 1 ? "s" : ""}
                        </h2>
                        <Link
                            href={`/shop?brand=${slug}`}
                            className="text-sm text-primary hover:underline underline-offset-2"
                        >
                            View in Shop &rarr;
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product: (typeof products)[number]) => (
                            <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                className="group rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                            >
                                <div className="aspect-square relative overflow-hidden bg-muted">
                                    <Image
                                        src={product.image}
                                        alt={product.altText || product.name}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {product.salePrice && product.salePrice < product.price && (
                                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                            SALE
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                        {product.category}
                                    </p>
                                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                        {product.name}
                                    </h3>
                                    {(product as any).specs && (
                                        <p className="text-xs text-muted-foreground mb-2">
                                            {[(product as any).specs.thc && `THC: ${(product as any).specs.thc}`, (product as any).specs.type]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2">
                                        {product.salePrice && product.salePrice < product.price ? (
                                            <>
                                                <span className="text-lg font-bold text-primary">
                                                    ${product.salePrice.toFixed(2)}
                                                </span>
                                                <span className="text-sm text-muted-foreground line-through">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-lg font-bold text-foreground">
                                                ${product.price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            ) : (
                <section className="container mx-auto px-6 text-center py-16">
                    <p className="text-lg text-muted-foreground mb-6">
                        No products currently listed for {brand.name}. Check back soon or browse our full
                        catalogue.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
                    >
                        Browse All Products
                    </Link>
                </section>
            )}
        </div>
    );
}
