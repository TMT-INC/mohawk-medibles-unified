import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStrainsByLetter, getLetterCounts, terpeneNames } from "@/lib/strains";
import { breadcrumbSchema } from "@/lib/seo/schemas";

const BASE_URL = "https://mohawkmedibles.ca";

function jsonLd(obj: object): string {
    return JSON.stringify(obj).replace(/</g, "\\u003c");
}

const VALID = new Set([..."0abcdefghijklmnopqrstuvwxyz"]);

type PageProps = { params: Promise<{ letter: string }> };

export async function generateStaticParams() {
    return getLetterCounts().map(({ letter }) => ({ letter }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { letter } = await params;
    const label = letter === "0" ? "#" : letter.toUpperCase();
    return {
        title: `Cannabis Strains Starting With "${label}" — Terpene Profiles`,
        description: `Browse cannabis strains starting with "${label}": terpene profiles, type, and THC ranges for every strain. Part of the Mohawk Medibles Strain Library.`,
        alternates: { canonical: `${BASE_URL}/strains/browse/${letter}` },
    };
}

export default async function StrainsByLetterPage({ params }: PageProps) {
    const { letter } = await params;
    if (!VALID.has(letter)) notFound();
    const strains = getStrainsByLetter(letter);
    if (strains.length === 0) notFound();

    const label = letter === "0" ? "#" : letter.toUpperCase();
    const letters = getLetterCounts();

    const breadcrumbJson = breadcrumbSchema([
        { name: "Home", url: BASE_URL },
        { name: "Strain Library", url: `${BASE_URL}/strains` },
        { name: `Strains: ${label}`, url: `${BASE_URL}/strains/browse/${letter}` },
    ]);

    return (
        <main className="min-h-screen bg-background">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJson) }} />

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-green-600">Home</Link>
                    <span className="mx-1.5">/</span>
                    <Link href="/strains" className="hover:text-green-600">Strain Library</Link>
                    <span className="mx-1.5">/</span>
                    <span className="text-foreground">{label}</span>
                </nav>

                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2">
                    Strains: <span className="text-green-600">{label}</span>
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                    {strains.length.toLocaleString()} strains with terpene profiles
                </p>

                {/* Letter switcher */}
                <nav aria-label="Browse strains alphabetically" className="flex flex-wrap gap-1.5 mb-10">
                    {letters.map(({ letter: l }) => (
                        <Link
                            key={l}
                            href={`/strains/browse/${l}`}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg border font-bold text-xs uppercase transition-all ${
                                l === letter
                                    ? "bg-green-700 text-white border-green-700"
                                    : "border-border bg-card text-foreground hover:border-green-600/50 hover:text-green-600"
                            }`}
                        >
                            {l === "0" ? "#" : l}
                        </Link>
                    ))}
                </nav>

                {/* Compact strain list */}
                <div className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
                    {strains.map((s) => (
                        <Link
                            key={s.slug}
                            href={`/strains/${s.slug}`}
                            className="flex items-baseline justify-between gap-2 py-1.5 px-2 rounded-lg hover:bg-muted transition-colors group"
                        >
                            <span className="text-sm font-medium text-foreground group-hover:text-green-600 transition-colors truncate">
                                {s.name}
                                {s.products.length > 0 && (
                                    <span className="ml-1.5 text-[9px] font-bold uppercase text-green-600">● stock</span>
                                )}
                            </span>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                                {terpeneNames(s).slice(0, 2).join(", ")}
                            </span>
                        </Link>
                    ))}
                </div>

                <div className="text-center pt-10">
                    <Link href="/strains" className="text-sm font-semibold text-green-600 hover:underline">
                        ← Back to the Strain Library
                    </Link>
                </div>
            </div>
        </main>
    );
}
