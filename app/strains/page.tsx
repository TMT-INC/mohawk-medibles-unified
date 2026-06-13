import type { Metadata } from "next";
import Link from "next/link";
import { getAllSiteStrains, strainTypeLabel } from "@/lib/strains";
import { getTerpeneColor } from "@/lib/terpenes";
import { breadcrumbSchema } from "@/lib/seo/schemas";

const BASE_URL = "https://mohawkmedibles.ca";

function jsonLd(obj: object): string {
    return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export const metadata: Metadata = {
    title: "Cannabis Strain Library — Terpene Profiles for 70+ Strains",
    description:
        "Explore terpene profiles, THC ranges & reported effects for 70+ cannabis strains. Match strains by dominant terpenes and shop matching products — ships Canada-wide.",
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
        title: "Cannabis Strain Library — Terpene Profiles",
        description:
            "Terpene profiles, THC ranges & effects for 70+ strains, matched to products in stock.",
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

export default function StrainsIndexPage() {
    const strains = getAllSiteStrains();
    const inStock = strains.filter((s) => s.products.length > 0);

    const itemListJson = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Mohawk Medibles Cannabis Strain Library",
        numberOfItems: strains.length,
        itemListElement: strains.map((s, i) => ({
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
                <header className="text-center mb-12">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-green-600 mb-3">
                        The Empire Standard™ · Terpene-Profiled
                    </p>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                        Cannabis Strain Library
                    </h1>
                    <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Terpene profiles, THC ranges, and reported effects for {strains.length} strains —{" "}
                        {inStock.length} matched to products you can order today. Find your strain, then find its
                        aromatic neighbours.
                    </p>
                </header>

                {/* Sections by type */}
                {TYPE_ORDER.map((type) => {
                    const group = strains.filter((s) => s.type === type);
                    if (group.length === 0) return null;
                    return (
                        <section key={type} className="mb-12" aria-labelledby={`type-${type}`}>
                            <div className="flex items-baseline gap-3 mb-1.5">
                                <h2 id={`type-${type}`} className="text-xl md:text-2xl font-bold text-foreground">
                                    {type.charAt(0) + type.slice(1).toLowerCase()} Strains
                                </h2>
                                <span className="text-xs text-muted-foreground">{group.length}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-5">{TYPE_BLURB[type]}</p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {group.map((s) => (
                                    <Link
                                        key={s.slug}
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
                                        <p className="text-[11px] text-muted-foreground mt-0.5">{strainTypeLabel(s)}{s.thcMax ? ` · THC ≤ ${s.thcMax}%` : ""}</p>
                                        <div className="flex flex-wrap gap-1 mt-2.5">
                                            {s.terpenes.slice(0, 3).map((t) => (
                                                <span
                                                    key={t}
                                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${getTerpeneColor(t)}`}
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </Link>
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
