/**
 * Cannabis Directory Listings — Mohawk Medibles
 * SEO page listing all directories where Mohawk Medibles is/should be listed.
 * All data is static hardcoded content — safe for JSON-LD, not user input.
 */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Find Mohawk Medibles | Cannabis Directory Listings Across Canada",
    description:
        "Find Mohawk Medibles on top cannabis directories across Canada. Weedmaps, Leafly, AllBud, Yelp, and more. Indigenous-owned dispensary on Tyendinaga Mohawk Territory.",
    keywords: [
        "mohawk medibles weedmaps",
        "mohawk medibles leafly",
        "mohawk medibles reviews",
        "find mohawk medibles",
        "cannabis dispensary listings",
        "indigenous dispensary directory",
        "mohawk medibles location",
        "cannabis directory canada",
    ],
    openGraph: {
        title: "Find Mohawk Medibles | Cannabis Directory Listings",
        description: "Find us on Weedmaps, Leafly, and more. Indigenous-owned cannabis dispensary.",
        url: "https://mohawkmedibles.ca/cannabis-directory-listings",
        type: "website",
    },
    alternates: { canonical: "https://mohawkmedibles.ca/cannabis-directory-listings" },
};

const DIRECTORIES = [
    { name: "Weedmaps", category: "Cannabis Directory", description: "The world's largest cannabis platform with 8.55M+ monthly visits. Find dispensaries, delivery services, and cannabis products.", status: "Submit Listing", priority: "Critical" },
    { name: "Leafly", category: "Cannabis Directory", description: "Leading cannabis resource with 10M+ monthly visits. Strain reviews, dispensary finder, and cannabis education.", status: "Submit Listing", priority: "Critical" },
    { name: "Google Business Profile", category: "Local Business", description: "Essential for Local Pack visibility. Cannabis store primary category, 72 service area cities, hours, photos, and reviews.", status: "Optimize", priority: "Critical" },
    { name: "AllBud", category: "Cannabis Directory", description: "Cannabis strain database and dispensary directory. Popular with medical cannabis patients researching strains.", status: "Submit Listing", priority: "High" },
    { name: "Yelp Canada", category: "Business Directory", description: "Major business review platform. Strong domain authority backlink. Cannabis dispensary category available.", status: "Submit Listing", priority: "High" },
    { name: "Yellow Pages Canada", category: "Business Directory", description: "Canada's largest online business directory. Verified business listing with NAP consistency for local SEO.", status: "Submit Listing", priority: "High" },
    { name: "Stratcann", category: "Cannabis News", description: "Canadian cannabis industry news. Guest posting and PR opportunity for Indigenous cannabis sovereignty content.", status: "Guest Post", priority: "High" },
    { name: "Cannabis.net", category: "Cannabis Directory", description: "Cannabis industry news and dispensary directory. Submit for industry backlink and exposure.", status: "Submit Listing", priority: "Medium" },
    { name: "PotGuide", category: "Cannabis Directory", description: "Cannabis guide and dispensary directory serving North America. Product reviews and strain info.", status: "Submit Listing", priority: "Medium" },
    { name: "Dutchie", category: "Cannabis Platform", description: "Cannabis e-commerce and ordering platform. Powers online menus for dispensaries across North America.", status: "Submit Listing", priority: "Medium" },
    { name: "CannaPages", category: "Cannabis Directory", description: "The original cannabis yellow pages. Directory of dispensaries, doctors, and cannabis businesses.", status: "Submit Listing", priority: "Medium" },
    { name: "TikTok", category: "Social Media", description: "@mediblesdeseronto — Product showcases, strain reviews, and behind-the-scenes content.", status: "Active", priority: "Active" },
    { name: "YouTube", category: "Social Media", description: "@MohawkMedibles — Product reviews, strain guides, and cannabis education videos.", status: "Active", priority: "Active" },
    { name: "Facebook", category: "Social Media", description: "@mohawkmediblesofficial — Community engagement, updates, and promotions.", status: "Active", priority: "Active" },
    { name: "X (Twitter)", category: "Social Media", description: "@mohawkmedibles — Real-time updates, deals, and cannabis industry commentary.", status: "Active", priority: "Active" },
];

// Static breadcrumb schema — safe for injection
const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://mohawkmedibles.ca" },
        { "@type": "ListItem", position: 2, name: "Directory Listings", item: "https://mohawkmedibles.ca/cannabis-directory-listings" },
    ],
};

export default function DirectoryListingsPage() {
    const critical = DIRECTORIES.filter((d) => d.priority === "Critical");
    const high = DIRECTORIES.filter((d) => d.priority === "High");
    const medium = DIRECTORIES.filter((d) => d.priority === "Medium");
    const active = DIRECTORIES.filter((d) => d.priority === "Active");

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <div className="min-h-screen pt-32 pb-20 page-glass text-foreground">
                <div className="container mx-auto px-6 max-w-5xl">
                    <header className="mb-16 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase font-heading mb-4">
                            Find Mohawk Medibles
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Mohawk Medibles is listed across Canada&apos;s top cannabis directories and platforms.
                            Find us, leave a review, and help support Indigenous-owned cannabis.
                        </p>
                    </header>

                    <section className="mb-16">
                        <h2 className="text-2xl font-bold text-forest dark:text-lime uppercase tracking-wide mb-6">Essential Platforms</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {critical.map((dir) => (
                                <div key={dir.name} className="glass-card border border-forest/30 dark:border-lime/30 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl font-bold text-foreground">{dir.name}</h3>
                                        <span className="px-3 py-1 rounded-full bg-forest/10 dark:bg-lime/10 text-forest dark:text-lime text-xs font-bold">{dir.status}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{dir.description}</p>
                                    <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">{dir.category}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mb-16">
                        <h2 className="text-2xl font-bold text-foreground uppercase tracking-wide mb-6">High-Value Directories</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {high.map((dir) => (
                                <div key={dir.name} className="glass-card border border-border rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-foreground">{dir.name}</h3>
                                        <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold">{dir.status}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{dir.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mb-16">
                        <h2 className="text-2xl font-bold text-foreground uppercase tracking-wide mb-6">Additional Directories</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {medium.map((dir) => (
                                <div key={dir.name} className="glass-card border border-border rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-foreground mb-2">{dir.name}</h3>
                                    <p className="text-sm text-muted-foreground">{dir.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mb-16">
                        <h2 className="text-2xl font-bold text-foreground uppercase tracking-wide mb-6">Active Social Platforms</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {active.map((dir) => (
                                <div key={dir.name} className="glass-card border border-border rounded-xl p-5 text-center">
                                    <h3 className="text-lg font-bold text-foreground mb-1">{dir.name}</h3>
                                    <span className="inline-block px-2 py-0.5 rounded bg-forest/10 dark:bg-lime/10 text-forest dark:text-lime text-xs font-bold">Active</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="glass-card border border-forest/20 dark:border-lime/20 rounded-2xl p-8 md:p-12 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Your Reviews Help Us Grow</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                            As an Indigenous-owned business, every review helps us reach more Canadians and support our community.
                            If you&apos;ve had a great experience, please leave a review on any of our directory listings above.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/shop" className="px-6 py-3 rounded-xl bg-forest dark:bg-lime text-white dark:text-charcoal-deep font-bold hover:opacity-90 transition">
                                Shop Now
                            </Link>
                            <Link href="/reviews" className="px-6 py-3 rounded-xl border border-forest dark:border-lime text-forest dark:text-lime font-bold hover:bg-forest/5 dark:hover:bg-lime/5 transition">
                                Read Our Reviews
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
