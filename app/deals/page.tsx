import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/lib/products";
import DealsClient from "./DealsClient";

export const metadata: Metadata = {
    title: "Cannabis Deals & Promotions — Save on Premium Weed",
    description:
        "Save on premium lab-tested cannabis with active deals from Mohawk Medibles. Daily deals with countdown timers, free shipping over $149, bulk discounts, staff picks & best sellers. Indigenous-owned dispensary.",
    keywords: [
        "cannabis deals canada",
        "weed deals online",
        "cheap weed canada",
        "cannabis promotions",
        "mohawk medibles deals",
        "bulk cannabis discount",
        "free shipping cannabis canada",
        "dispensary deals",
        "cannabis sale canada",
        "best weed deals online",
        "daily deals cannabis",
    ],
    openGraph: {
        title: "Cannabis Deals & Promotions",
        description:
            "Save on 360+ premium cannabis products. Daily deals with countdown timers, free shipping over $149, bulk discounts, and more.",
        url: "https://mohawkmedibles.ca/deals",
        type: "website",
        images: ["/og-image.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Cannabis Deals",
        description: "Premium cannabis deals. Free shipping over $149 Canada-wide.",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/deals",
    },
};

export default async function DealsPage() {
    const products = await getAllProducts();

    const featuredProducts = products
        .filter((p) => p.featured)
        .slice(0, 4);

    const staffPicks = featuredProducts.length > 0
        ? featuredProducts
        : products.slice(0, 4);

    const bestSellers = products.slice(4, 8);

    return (
        <div className="min-h-screen pt-32 pb-20 page-glass text-foreground">
            {/* Hero Section */}
            <section className="container mx-auto px-6 mb-20">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground uppercase mb-6">
                        Cannabis Deals & Promotions
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                        Save on premium, lab-tested cannabis with our active offers. From daily deals to bulk discounts,
                        we&apos;re committed to making Empire Standard&trade; quality accessible to all Canadians.
                    </p>
                </div>
            </section>

            {/* Daily Deals Section with Countdown Timers */}
            <section className="container mx-auto px-6 mb-20">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <span className="text-2xl">&#128293;</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-foreground tracking-tight uppercase">
                            Daily Deals
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Limited-time offers with countdown timers — grab them before they expire
                        </p>
                    </div>
                </div>
                <DealsClient />
            </section>

            {/* Active Offers Section */}
            <section className="container mx-auto px-6 mb-20">
                <h2 className="text-3xl font-bold text-foreground tracking-tight mb-10 uppercase">
                    Active Offers
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: "Free Shipping", desc: <>Free shipping on all orders over <span className="font-bold text-forest dark:text-lime">$149 CAD</span> — Canada-wide via Xpresspost. Fast, discreet, secure delivery.</>, href: "/shop", image: "/assets/cards/deals-shipping.webp" },
                        { title: "Mix & Match", desc: <>Buy any <span className="font-bold text-forest dark:text-lime">3 edibles</span>, get <span className="font-bold text-forest dark:text-lime">10% off</span> your edible total. Mix flavors, strains, and potencies — your choice.</>, href: "/shop?category=Edibles", image: "/assets/cards/deals-mixmatch.webp" },
                        { title: "Bulk Savings", desc: <>Ounce deals starting at <span className="font-bold text-forest dark:text-lime">$40</span> — premium flower at unbeatable prices. Perfect for serious enthusiasts.</>, href: "/shop?category=Flower", image: "/assets/cards/deals-bulk.webp" },
                    ].map((offer) => (
                        <div key={offer.title} className="group relative overflow-hidden rounded-2xl border border-secondary/20">
                            <div className="absolute inset-0">
                                <Image src={offer.image} alt={offer.title} fill className="object-cover opacity-20 dark:opacity-15 group-hover:opacity-30 dark:group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw" />
                            </div>
                            <div className="relative z-10 p-8 backdrop-blur-sm">
                                <h3 className="text-2xl font-bold text-forest dark:text-lime mb-3 uppercase tracking-wide">
                                    {offer.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed mb-6">
                                    {offer.desc}
                                </p>
                                <Link href={offer.href}>
                                    <Button variant="brand" size="lg">
                                        Shop Now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Staff Picks Section */}
            <section className="container mx-auto px-6 mb-20">
                <h2 className="text-3xl font-bold text-foreground tracking-tight mb-10 uppercase">
                    Staff Picks
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {staffPicks.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/${product.slug}`}
                            className="group relative h-[300px] rounded-2xl overflow-hidden glass-card border border-border hover:border-secondary/50 transition-all duration-500"
                        >
                            {product.image && (
                                <Image
                                    src={product.image}
                                    alt={product.altText || product.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent" />
                            <div className="absolute top-4 left-4 bg-secondary/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                                {product.category}
                            </div>
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border border-border px-3 py-1 rounded-full text-sm font-bold text-forest dark:text-lime">
                                ${product.price.toFixed(2)}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-lg font-bold text-white line-clamp-2">
                                    {product.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Best Sellers Section */}
            <section className="container mx-auto px-6 mb-20">
                <h2 className="text-3xl font-bold text-foreground tracking-tight mb-10 uppercase">
                    Best Sellers
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bestSellers.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/${product.slug}`}
                            className="group relative h-[300px] rounded-2xl overflow-hidden glass-card border border-border hover:border-secondary/50 transition-all duration-500"
                        >
                            {product.image && (
                                <Image
                                    src={product.image}
                                    alt={product.altText || product.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent" />
                            <div className="absolute top-4 left-4 bg-secondary/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                                {product.category}
                            </div>
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border border-border px-3 py-1 rounded-full text-sm font-bold text-forest dark:text-lime">
                                ${product.price.toFixed(2)}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-lg font-bold text-white line-clamp-2">
                                    {product.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-6 text-center">
                <div className="glass-card p-12 rounded-2xl border border-secondary/20 backdrop-blur-md max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-foreground mb-4 uppercase">
                        Browse All 360+ Products
                    </h2>
                    <p className="text-muted-foreground mb-8 text-lg">
                        Discover our complete selection of premium cannabis products, all meeting the Empire Standard&trade;.
                    </p>
                    <Link href="/shop">
                        <Button variant="brand" size="lg">
                            Explore Full Shop
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
