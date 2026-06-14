import type { Metadata } from "next";
import Link from "next/link";
import {
    getAllSiteStrains,
    getFeaturedStrains,
    getTopStrainsByType,
    getLetterCounts,
    strainTypeLabel,
    terpeneNames,
} from "@/lib/strains";
import { getTerpeneColor } from "@/lib/terpenes";
import { breadcrumbSchema } from "@/lib/seo/schemas";

const BASE_URL = "https://mohawkmedibles.ca";

function jsonLd(obj: object): string {
    return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export const metadata: Metadata = {
    title: "Cannabis Strain Library — Terpene Profiles for 10,000+ Strains",
    description:
        "Terpene profiles, THC ranges & reported effects for 10,000+ cannabis strains. Match strains by dominant terpenes, browse A–Z, and shop matching products — ships Canada-wide.",
    keywords: [
        "cannabis strain library",
        "terpene profiles",
        "strain terpenes canada",
        "indica strains",
        "sativa strains",
        "hybrid strains",
        "mohawk medibles",
    ],
    alternates: { canonical: `${BASE_URL}/strains` },
    openGraph: {
        title: "Cannabis Strain Library — Terpene Profiles for 10,000+ Strains",
        description:
            "Terpene profiles, THC ranges & effects for 10,000+ strains, matched to products in stock.",
        url: `${BASE_URL}/strains`,
        type: "website",
    },
};

const TYPE_ORDER = ["INDICA", "SATIVA", "HYBRID"] as const;
const TYPE_BLURB: Record<string, string> = {
    INDICA: "Typically associated with relaxed, body-forward experiences.",
    SATIVA: "Typically associated with uplifted, energetic experiences.",
    HYBRID: "Balanced crosses drawing character from both lineages.",
};

function StrainCard({ s }: { s: ReturnType<typeof getAllSiteStrains>[number] }) {
    return (
        <Link
            href={`/strains/${s.slug}`}
            className="rounded-xl border border-border bg-card p-4 hover:border-green-600/40 hover:shadow-md transition-all group"
        >
            <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-sm text-foreground group-hover:text-green-600 transition-colors">
                    {s.name}
                </p>
                {s.products.length > 0 && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300 shrink-0">
                        In stock
                    </span>
                )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
                {strainTypeLabel(s)}
                {s.thcMax ? ` · THC ≤ ${s.thcMax}%` : ""}
            </p>
            <div className="flex flex-wrap gap-1 mt-2.5">
                {terpeneNames(s).slice(0, 3).map((t) => (
                    <span
                        key={t}
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${getTerpeneColor(t)}`}
                    >
                        {t}
                    </span>
                ))}
            </div>
        </Link>
    );
}

export default function StrainsIndexPage() {
    const total = getAllSiteStrains().length;
    const featured = getFeaturedStrains();
    const letters = getLetterCounts();

    const itemListJson = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Mohawk Medibles Cannabis Strain Library",
        numberOfItems: total,
        // Full 10k list would bloat the page — feature the in-stock strains.
        itemListElement: featured.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.name,
            url: `${BASE_URL}/strains/${s.slug}`,
        })),
    };

    const breadcrumbJson = breadcrumbSchema([
        { name: "Home", url: BASE_URL },
        { name: "Strain Library", url: `${BASE_URL}/strains` },
    ]);

    return (
        <main className="min-h-screen bg-background">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListJson) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJson) }} />

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Hero */}
                <header className="text-center mb-10">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-green-600 mb-3">
                        The Empire Standard™ · Terpene-Profiled
                    </p>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                        Cannabis Strain Library
                    </h1>
                    <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Lab-aggregated terpene profiles, THC ranges, and reported effects for{" "}
                        <strong className="text-foreground">{total.toLocaleString()} strains</strong> — every one
                        matched to its closest aromatic neighbours. {featured.length} are in stock right now.
                    </p>
                </header>

                {/* A–Z browse */}
                <nav aria-label="Browse strains alphabetically" className="mb-12">
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {letters.map(({ letter, count }) => (
                            <Link
                                key={letter}
                                href={`/strains/browse/${letter}`}
                                title={`${count.toLocaleString()} strains`}
                                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-card font-bold text-sm uppercase text-foreground hover:border-green-600/50 hover:text-green-600 transition-all"
                            >
                                {letter === "0" ? "#" : letter}
                            </Link>
                        ))}
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-2">
                        Browse all {total.toLocaleString()} strains A–Z
                    </p>
                </nav>

                {/* In stock now */}
                {featured.length > 0 && (
                    <section className="mb-12" aria-labelledby="featured-heading">
                        <div className="flex items-baseline gap-3 mb-1.5">
                            <h2 id="featured-heading" className="text-xl md:text-2xl font-bold text-foreground">
                                In Stock Now
                            </h2>
                            <span className="text-xs text-muted-foreground">{featured.length}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-5">
                            Strains you can order today — each links to its products.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {featured.map((s) => (
                                <StrainCard key={s.slug} s={s} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Top strains by type */}
                {TYPE_ORDER.map((type) => {
                    const group = getTopStrainsByType(type, 12);
                    if (group.length === 0) return null;
                    return (
                        <section key={type} className="mb-12" aria-labelledby={`type-${type}`}>
                            <div className="flex items-baseline gap-3 mb-1.5">
                                <h2 id={`type-${type}`} className="text-xl md:text-2xl font-bold text-foreground">
                                    Popular {type.charAt(0) + type.slice(1).toLowerCase()} Strains
                                </h2>
                            </div>
                            <p className="text-sm text-muted-foreground mb-5">{TYPE_BLURB[type]}</p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {group.map((s) => (
                                    <StrainCard key={s.slug} s={s} />
                                ))}
                            </div>
                        </section>
                    );
                })}

                {/* AEO context block */}
                <section className="rounded-2xl border border-border bg-card p-6 md:p-8 max-w-3xl mx-auto">
                    <h2 className="text-lg font-bold text-foreground mb-2">Why terpenes matter</h2>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                        Terpenes are the aromatic compounds that give every cannabis strain its signature smell and
                        flavour — the same molecules found in pine needles, citrus peel, lavender, and black pepper.
                        Two strains with similar terpene profiles tend to smell, taste, and feel related, which is why
                        each strain page lists its closest aromatic neighbours. Read the full{" "}
                        <Link href="/blog/terpene-guide-cannabis-effects" className="text-green-600 font-semibold hover:underline">
                            terpene guide
                        </Link>{" "}
                        or browse{" "}
                        <Link href="/shop" className="text-green-600 font-semibold hover:underline">
                            everything in stock
                        </Link>
                        .
                    </p>
                </section>
            </div>
        </main>
    );
}
