import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/server/trpc/trpc";

export async function generateMetadata(): Promise<Metadata> {
    const brandCount = await prisma.brand.count();
    return {
        title: `Cannabis Brands (${brandCount || "All"}) | Mohawk Medibles — Brand Directory`,
        description: `Browse ${brandCount || "all"} premium cannabis brands at Mohawk Medibles. Discover top-quality flower, edibles, concentrates & more from Canada's best producers. Indigenous-owned dispensary.`,
        keywords: [
            "cannabis brands canada",
            "weed brands online",
            "top cannabis brands",
            "mohawk medibles brands",
            "canadian cannabis brands",
            "premium weed brands",
            "best dispensary brands canada",
        ],
        openGraph: {
            title: "Cannabis Brands | Mohawk Medibles",
            description: `Browse ${brandCount || "all"} premium cannabis brands. Top-quality products from Canada's best producers.`,
            url: "https://mohawkmedibles.co/brands",
            type: "website",
            images: ["/og-image.png"],
        },
        twitter: {
            card: "summary_large_image",
            title: "Cannabis Brands | Mohawk Medibles",
            description: "Browse premium cannabis brands at Mohawk Medibles.",
        },
        alternates: {
            canonical: "https://mohawkmedibles.co/brands",
        },
    };
}

export default async function BrandsPage() {
    const brands = await prisma.brand.findMany({
        orderBy: { name: "asc" },
    });

    // Group brands alphabetically
    const grouped: Record<string, typeof brands> = {};
    for (const brand of brands) {
        const letter = brand.name.charAt(0).toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(brand);
    }
    const letters = Object.keys(grouped).sort();

    return (
        <div className="min-h-screen pt-32 pb-20 page-glass text-foreground">
            {/* Hero */}
            <section className="container mx-auto px-6 mb-16">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground uppercase mb-6">
                        Our Brands
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        We partner with Canada&apos;s most trusted cannabis producers. Every brand meets our
                        Empire Standard&trade; for quality, testing, and consistency.
                    </p>
                </div>
            </section>

            {/* Alphabet Navigation */}
            {letters.length > 0 && (
                <nav className="container mx-auto px-6 mb-12">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {letters.map((letter) => (
                            <a
                                key={letter}
                                href={`#brand-${letter}`}
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                {letter}
                            </a>
                        ))}
                    </div>
                </nav>
            )}

            {/* Brands Grid */}
            {brands.length > 0 ? (
                <div className="container mx-auto px-6">
                    {letters.map((letter) => (
                        <section key={letter} id={`brand-${letter}`} className="mb-12 scroll-mt-32">
                            <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-3">
                                {letter}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {grouped[letter].map((brand: (typeof brands)[number]) => (
                                    <Link
                                        key={brand.id}
                                        href={`/brands/${brand.slug}`}
                                        className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                                    >
                                        <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                                            {brand.logo ? (
                                                <Image
                                                    src={brand.logo}
                                                    alt={`${brand.name} logo`}
                                                    width={80}
                                                    height={80}
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <span className="text-2xl font-bold text-muted-foreground">
                                                    {brand.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-foreground text-center group-hover:text-primary transition-colors line-clamp-2">
                                            {brand.name}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            ) : (
                <div className="container mx-auto px-6 text-center py-20">
                    <p className="text-xl text-muted-foreground">
                        Brand directory coming soon. Browse all products in our{" "}
                        <Link href="/shop" className="text-primary underline underline-offset-2 hover:opacity-80">
                            shop
                        </Link>
                        .
                    </p>
                </div>
            )}

            {/* SEO Content */}
            <section className="container mx-auto px-6 max-w-3xl mt-20">
                <div className="prose prose-invert max-w-none">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                        Premium Cannabis Brands at Mohawk Medibles
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Mohawk Medibles curates cannabis products from Canada&apos;s most reputable brands. Each
                        brand in our directory has been vetted against the Empire Standard&trade; &mdash; our
                        rigorous quality benchmark that requires third-party lab testing, consistent potency,
                        and clean cultivation practices. As an Indigenous-owned dispensary from Six Nations
                        territory, we take pride in supporting producers who share our values of quality,
                        transparency, and community.
                    </p>
                </div>
            </section>
        </div>
    );
}
