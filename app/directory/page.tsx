import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DispensaryCard } from "@/components/directory/DispensaryCard";
import { SearchFilters } from "@/components/directory/SearchFilters";

export const metadata: Metadata = {
    title: "Canadian Cannabis Directory | Find Dispensaries Near You | Mohawk Medibles",
    description:
        "Explore Canada's most comprehensive cannabis directory. Find licensed dispensaries, Indigenous-owned retailers, and delivery services in every province and territory.",
    keywords: [
        "cannabis directory canada",
        "find dispensary near me",
        "canadian dispensary list",
        "indigenous dispensary directory",
        "cannabis delivery service canada",
        "licensed dispensary finder",
        "weed dispensary map canada",
        "ontario dispensary",
        "BC dispensary",
        "cannabis store locator",
    ],
    openGraph: {
        title: "Canadian Cannabis Directory | Find Dispensaries Near You",
        description:
            "Canada's most comprehensive cannabis directory. Find licensed dispensaries, Indigenous-owned retailers, and delivery services.",
        url: "https://mohawkmedibles.co/directory",
        type: "website",
        images: ["/og-image.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Canadian Cannabis Directory | Mohawk Medibles",
        description: "Find dispensaries, retailers, and delivery services across Canada.",
    },
    alternates: {
        canonical: "https://mohawkmedibles.co/directory",
    },
};

async function getDispensaries() {
    const dispensaries = await prisma.dispensary.findMany({
        include: {
            images: {
                where: { isPrimary: true },
                take: 1,
            },
            hours: true,
        },
        orderBy: [
            { dataQualityScore: "desc" },
            { averageRating: "desc" },
        ],
        take: 50,
    });

    return dispensaries;
}

async function getProvinces() {
    const provinces = await prisma.dispensary.groupBy({
        by: ["province"],
        _count: {
            id: true,
        },
    });

    return provinces;
}

export default async function DirectoryPage() {
    const dispensaries = await getDispensaries();
    const provinces = await getProvinces();

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white py-16">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Canadian Cannabis Directory
                    </h1>
                    <p className="text-xl text-emerald-100 mb-8">
                        Discover licensed dispensaries, Indigenous-owned retailers, and delivery services across Canada
                    </p>
                    
                    {/* Quick Stats */}
                    <div className="flex justify-center gap-8 text-sm">
                        <div className="text-center">
                            <div className="text-3xl font-bold">{dispensaries.length}+</div>
                            <div className="text-emerald-200">Listings</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">{provinces.length}</div>
                            <div className="text-emerald-200">Provinces</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">24/7</div>
                            <div className="text-emerald-200">AI Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="container mx-auto px-4 py-12 max-w-7xl">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1">
                        <SearchFilters provinces={provinces} />
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-3">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-foreground">
                                Featured Dispensaries
                            </h2>
                            <span className="text-muted-foreground">
                                Showing {dispensaries.length} results
                            </span>
                        </div>

                        {dispensaries.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {dispensaries.map((dispensary: (typeof dispensaries)[number]) => (
                                    <DispensaryCard 
                                        key={dispensary.id} 
                                        dispensary={dispensary} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-xl shadow">
                                <p className="text-muted-foreground mb-4">
                                    Our directory is growing. Check back soon for more listings!
                                </p>
                                <Link
                                    href="/shop"
                                    className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                                >
                                    Shop Mohawk Medibles
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-emerald-900 text-white py-16">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Own a Dispensary?
                    </h2>
                    <p className="text-emerald-100 mb-8">
                        List your business in our directory and reach thousands of potential customers. 
                        Premium listings include AI-powered voice recommendations.
                    </p>
                    <Link
                        href="/register"
                        className="inline-block bg-white text-emerald-900 hover:bg-emerald-50 font-bold py-3 px-8 rounded-lg transition-colors"
                    >
                        List Your Business
                    </Link>
                </div>
            </section>
        </div>
    );
}
