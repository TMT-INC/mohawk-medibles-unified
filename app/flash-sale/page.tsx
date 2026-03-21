import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/server/trpc/trpc";
import FlashSaleCountdown from "./FlashSaleCountdown";

export async function generateMetadata(): Promise<Metadata> {
    const now = new Date();
    const activeSale = await prisma.flashSale.findFirst({
        where: {
            isActive: true,
            startTime: { lte: now },
            endTime: { gte: now },
        },
        orderBy: { endTime: "asc" },
    });

    const saleName = activeSale?.name ?? "Flash Sale";

    return {
        title: `${saleName} | Mohawk Medibles — Limited-Time Deals`,
        description: activeSale?.description
            ? activeSale.description.slice(0, 155)
            : "Grab limited-time flash sale deals on premium cannabis at Mohawk Medibles. Huge discounts on flower, edibles, concentrates & more. Ships Canada-wide.",
        openGraph: {
            title: `${saleName} | Mohawk Medibles`,
            description:
                "Limited-time flash sale on premium cannabis products. Massive savings at Mohawk Medibles.",
            url: "https://mohawkmedibles.co/flash-sale",
            type: "website",
            images: ["/og-image.png"],
        },
        alternates: {
            canonical: "https://mohawkmedibles.co/flash-sale",
        },
    };
}

export default async function FlashSalePage() {
    const now = new Date();

    // Fetch active flash sales with their products
    const activeSales = await prisma.flashSale.findMany({
        where: {
            isActive: true,
            startTime: { lte: now },
            endTime: { gte: now },
        },
        include: {
            products: {
                include: {
                    product: {
                        include: {
                            images: true,
                        },
                    },
                },
            },
        },
        orderBy: { endTime: "asc" },
    });

    // Fetch upcoming sales (start within next 7 days)
    const upcomingSales = await prisma.flashSale.findMany({
        where: {
            isActive: true,
            startTime: { gt: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { startTime: "asc" },
        take: 3,
    });

    const hasActiveSales = activeSales.length > 0;

    return (
        <div className="min-h-screen pt-32 pb-20 page-glass text-foreground">
            {/* Hero Section */}
            <section className="container mx-auto px-6 mb-16">
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold mb-6">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                        </span>
                        {hasActiveSales ? "LIVE NOW" : "NO ACTIVE SALES"}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground uppercase mb-6">
                        Flash Sale
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        Limited-time deals on premium, lab-tested cannabis. When they&apos;re gone, they&apos;re gone.
                        Indigenous-owned. Empire Standard&trade; quality.
                    </p>
                </div>
            </section>

            {/* Active Sales */}
            {hasActiveSales ? (
                activeSales.map((sale: (typeof activeSales)[number]) => (
                    <section key={sale.id} className="container mx-auto px-6 mb-20">
                        {/* Sale Header with Countdown */}
                        <div
                            className="rounded-2xl p-8 mb-10 text-center"
                            style={{
                                background: `linear-gradient(135deg, ${sale.bannerColor ?? "#ef4444"}22, ${sale.bannerColor ?? "#ef4444"}08)`,
                                border: `1px solid ${sale.bannerColor ?? "#ef4444"}33`,
                            }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase mb-3">
                                {sale.bannerText ?? sale.name}
                            </h2>
                            {sale.description && (
                                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                                    {sale.description}
                                </p>
                            )}
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                                <span>Ends in:</span>
                            </div>
                            <FlashSaleCountdown endTime={sale.endTime.toISOString()} />
                            <p className="mt-4 text-sm text-muted-foreground">
                                Save{" "}
                                <span className="font-bold text-foreground">
                                    {sale.discountType === "percentage"
                                        ? `${sale.discountValue}%`
                                        : `$${sale.discountValue.toFixed(2)}`}
                                </span>{" "}
                                on select products
                            </p>
                        </div>

                        {/* Sale Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {sale.products.map((sp: (typeof sale.products)[number]) => {
                                const product = sp.product;
                                const discount = ((sp.originalPrice - sp.salePrice) / sp.originalPrice) * 100;

                                return (
                                    <Link
                                        key={sp.id}
                                        href={`/product/${product.slug}`}
                                        className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                                    >
                                        {/* Discount Badge */}
                                        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                            -{Math.round(discount)}%
                                        </div>

                                        {/* Product Image */}
                                        <div className="aspect-square relative overflow-hidden bg-muted">
                                            <Image
                                                src={product.image}
                                                alt={product.altText || product.name}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                                {product.category}
                                            </p>
                                            <h3 className="font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-bold text-primary">
                                                    ${sp.salePrice.toFixed(2)}
                                                </span>
                                                <span className="text-sm text-muted-foreground line-through">
                                                    ${sp.originalPrice.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                ))
            ) : (
                /* No Active Sales State */
                <section className="container mx-auto px-6 mb-20">
                    <div className="text-center py-20 rounded-2xl border border-border bg-card/50">
                        <div className="text-6xl mb-6">&#128293;</div>
                        <h2 className="text-2xl font-bold text-foreground mb-4">
                            No Active Flash Sales Right Now
                        </h2>
                        <p className="text-muted-foreground max-w-md mx-auto mb-8">
                            Flash sales happen fast. Check back soon or browse our everyday deals for great prices
                            on premium cannabis.
                        </p>
                        <Link
                            href="/deals"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
                        >
                            Browse Deals
                        </Link>
                    </div>
                </section>
            )}

            {/* Upcoming Sales Preview */}
            {upcomingSales.length > 0 && (
                <section className="container mx-auto px-6 mb-20">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight mb-10 uppercase">
                        Coming Soon
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {upcomingSales.map((sale: (typeof upcomingSales)[number]) => (
                            <div
                                key={sale.id}
                                className="rounded-2xl p-6 border border-border bg-card/50"
                            >
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                                    Starts{" "}
                                    {sale.startTime.toLocaleDateString("en-CA", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                </p>
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    {sale.name}
                                </h3>
                                {sale.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {sale.description}
                                    </p>
                                )}
                                <p className="mt-3 text-sm font-semibold text-primary">
                                    {sale.discountType === "percentage"
                                        ? `${sale.discountValue}% off`
                                        : `$${sale.discountValue.toFixed(2)} off`}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* SEO Content */}
            <section className="container mx-auto px-6 max-w-3xl">
                <div className="prose prose-invert max-w-none">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                        Cannabis Flash Sales at Mohawk Medibles
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Flash sales at Mohawk Medibles offer limited-time discounts on our premium, lab-tested
                        cannabis products. As an Indigenous-owned dispensary operating from Six Nations territory,
                        we bring Empire Standard&trade; quality to every product we sell. Our flash sales feature
                        deep discounts on flower, edibles, concentrates, vapes, and more &mdash; all shipped
                        discreetly across Canada with same-day processing on orders placed before 2 PM EST.
                    </p>
                </div>
            </section>
        </div>
    );
}
