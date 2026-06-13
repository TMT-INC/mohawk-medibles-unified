import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    getAllSiteStrains,
    getSiteStrainBySlug,
    getSimilarStrains,
    strainTypeLabel,
    type SiteStrain,
} from "@/lib/strains";
import { getTerpeneInfo } from "@/lib/terpenes";
import { breadcrumbSchema } from "@/lib/seo/schemas";

const BASE_URL = "https://mohawkmedibles.ca";

// JSON-LD serializer hardened against </script> breakout — strain names
// originate from a scraped dataset, so don't trust them inside <script>.
function jsonLd(obj: object): string {
    return JSON.stringify(obj).replace(/</g, "\\u003c");
}

// ─── SSG ─────────────────────────────────────────────────────

export async function generateStaticParams() {
    return getAllSiteStrains().map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

// ─── Metadata ────────────────────────────────────────────────

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const strain = getSiteStrainBySlug(slug);
    if (!strain) return { title: "Strain Not Found" };

    const terps = strain.terpenes.slice(0, 3).join(", ");
    const title = `${strain.name} Strain — Terpene Profile, THC % & Effects`;
    const description = `${strain.name} terpene profile: ${terps}. ${strainTypeLabel(strain)}${
        strain.thcMax ? `, up to ${strain.thcMax}% THC` : ""
    }. Reported effects, similar strains & where to buy online in Canada.`.slice(0, 155);

    return {
        title,
        description,
        keywords: [
            `${strain.name.toLowerCase()} strain`,
            `${strain.name.toLowerCase()} terpenes`,
            `${strain.name.toLowerCase()} canada`,
            ...strain.terpenes.map((t) => t.toLowerCase()),
            "terpene profile",
            "mohawk medibles",
        ],
        alternates: { canonical: `${BASE_URL}/strains/${strain.slug}` },
        openGraph: {
            title,
            description,
            url: `${BASE_URL}/strains/${strain.slug}`,
            type: "article",
        },
    };
}

// ─── FAQ content (also emitted as FAQPage JSON-LD) ──────────

function buildFaqs(strain: SiteStrain) {
    const faqs: { q: string; a: string }[] = [];

    faqs.push({
        q: `What terpenes are in ${strain.name}?`,
        a: `${strain.name}'s dominant terpenes are ${strain.terpenes.join(", ")}. ${
            strain.terpenes[0]
                ? `${strain.terpenes[0]} leads the profile — ${getTerpeneInfo(strain.terpenes[0]).aroma.toLowerCase()}, the same terpene found in ${getTerpeneInfo(strain.terpenes[0]).foundIn}.`
                : ""
        }`,
    });

    faqs.push({
        q: `Is ${strain.name} an indica or sativa?`,
        a: `${strain.name} is ${
            strain.indicaPercent && strain.sativaPercent
                ? `a ${strain.type.toLowerCase()} (${strain.indicaPercent}% indica / ${strain.sativaPercent}% sativa)`
                : `classified as ${strain.type.toLowerCase()}`
        }.`,
    });

    if (strain.thcMax) {
        faqs.push({
            q: `How strong is ${strain.name}?`,
            a: `${strain.name} flower typically tests ${
                strain.thcMin ? `between ${strain.thcMin}% and ${strain.thcMax}%` : `up to ${strain.thcMax}%`
            } THC${strain.cbdMax ? ` with CBD up to ${strain.cbdMax}%` : ""}. Potency varies by harvest — check the product page for the current batch.`,
        });
    }

    if (strain.effects.length > 0) {
        faqs.push({
            q: `What does ${strain.name} feel like?`,
            a: `Customers most often describe ${strain.name} as ${strain.effects
                .slice(0, 4)
                .join(", ")
                .toLowerCase()}. Individual experiences vary — start low and go slow.`,
        });
    }

    faqs.push({
        q: `Where can I buy ${strain.name} online in Canada?`,
        a:
            strain.products.length > 0
                ? `Mohawk Medibles carries ${strain.products.length} ${strain.name} product${strain.products.length > 1 ? "s" : ""} (${strain.products
                      .slice(0, 3)
                      .map((p) => p.category)
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .join(", ")}) with Canada-wide shipping from Tyendinaga Mohawk Territory.`
                : `Mohawk Medibles ships comparable ${strain.type.toLowerCase()} strains Canada-wide from Tyendinaga Mohawk Territory — browse the shop for current availability.`,
    });

    return faqs;
}

// ─── Page ────────────────────────────────────────────────────

export default async function StrainPage({ params }: PageProps) {
    const { slug } = await params;
    const strain = getSiteStrainBySlug(slug);
    if (!strain) notFound();

    const similar = getSimilarStrains(strain);
    const faqs = buildFaqs(strain);
    const dominant = strain.terpenes[0] ? getTerpeneInfo(strain.terpenes[0]) : null;

    const faqSchemaJson = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
    };

    const articleSchemaJson = {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${BASE_URL}/strains/${strain.slug}#article`,
        headline: `${strain.name} Strain — Terpene Profile & Effects`,
        about: { "@type": "Thing", name: `${strain.name} cannabis strain` },
        author: { "@id": `${BASE_URL}/#organization` },
        publisher: { "@id": `${BASE_URL}/#organization` },
        mainEntityOfPage: `${BASE_URL}/strains/${strain.slug}`,
        keywords: [`${strain.name} terpenes`, ...strain.terpenes].join(", "),
    };

    const breadcrumbJson = breadcrumbSchema([
        { name: "Home", url: BASE_URL },
        { name: "Strain Library", url: `${BASE_URL}/strains` },
        { name: strain.name, url: `${BASE_URL}/strains/${strain.slug}` },
    ]);

    return (
        <main className="min-h-screen bg-background">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchemaJson) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchemaJson) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJson) }} />

            <div className="container mx-auto px-4 py-10 max-w-5xl">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-green-600">Home</Link>
                    <span className="mx-1.5">/</span>
                    <Link href="/strains" className="hover:text-green-600">Strain Library</Link>
                    <span className="mx-1.5">/</span>
                    <span className="text-foreground">{strain.name}</span>
                </nav>

                {/* Header */}
                <header className="mb-10">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span
                            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                strain.type === "INDICA"
                                    ? "bg-purple-100 text-purple-800 border-purple-300"
                                    : strain.type === "SATIVA"
                                      ? "bg-orange-100 text-orange-800 border-orange-300"
                                      : "bg-green-100 text-green-800 border-green-300"
                            }`}
                        >
                            {strainTypeLabel(strain)}
                        </span>
                        {strain.thcMax && (
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted text-foreground border border-border">
                                THC {strain.thcMin ? `${strain.thcMin}–${strain.thcMax}` : `up to ${strain.thcMax}`}%
                            </span>
                        )}
                        {strain.cbdMax ? (
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted text-foreground border border-border">
                                CBD ≤ {strain.cbdMax}%
                            </span>
                        ) : null}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                        {strain.name} <span className="text-green-600">Strain Profile</span>
                    </h1>
                    {strain.aliases.length > 0 && (
                        <p className="mt-2 text-sm text-muted-foreground">
                            Also known as: {strain.aliases.join(", ")}
                        </p>
                    )}
                    <p className="mt-4 text-base md:text-lg text-foreground/80 max-w-3xl leading-relaxed">
                        {strain.name} is a {strain.type.toLowerCase()} cannabis strain
                        {dominant
                            ? ` led by ${strain.terpenes[0]} — ${dominant.aroma.toLowerCase()}, the same aromatic compound found in ${dominant.foundIn}`
                            : ""}
                        {strain.effects.length > 0
                            ? `. Customers most often report feeling ${strain.effects.slice(0, 3).join(", ").toLowerCase()}`
                            : ""}
                        . Profile data is aggregated from lab-tested batches and published strain research.
                    </p>
                </header>

                {/* Terpene profile */}
                <section className="mb-12" aria-labelledby="terpene-heading">
                    <h2 id="terpene-heading" className="text-xl md:text-2xl font-bold text-foreground mb-5">
                        Terpene Profile
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {strain.terpenes.map((t, i) => {
                            const info = getTerpeneInfo(t);
                            return (
                                <div key={t} className={`rounded-xl border p-4 ${info.color}`}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="font-bold text-sm">{t}</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                                            {i === 0 ? "Dominant" : `#${i + 1}`}
                                        </span>
                                    </div>
                                    <p className="text-xs leading-relaxed opacity-90">{info.aroma}.</p>
                                    <p className="text-[11px] mt-1 opacity-70">Also found in {info.foundIn}.</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Effects */}
                {strain.effects.length > 0 && (
                    <section className="mb-12" aria-labelledby="effects-heading">
                        <h2 id="effects-heading" className="text-xl md:text-2xl font-bold text-foreground mb-4">
                            Reported Effects
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {strain.effects.map((e) => (
                                <span
                                    key={e}
                                    className="px-3 py-1.5 rounded-full bg-muted border border-border text-sm font-medium text-foreground"
                                >
                                    {e}
                                </span>
                            ))}
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground max-w-2xl">
                            Effects are customer-reported experiences and vary by individual, dose, and format. Not
                            medical advice — start low and go slow.
                        </p>
                    </section>
                )}

                {/* Products carrying this strain */}
                <section className="mb-12" aria-labelledby="products-heading">
                    <h2 id="products-heading" className="text-xl md:text-2xl font-bold text-foreground mb-4">
                        {strain.products.length > 0 ? `Shop ${strain.name} at Mohawk Medibles` : `Looking for ${strain.name}?`}
                    </h2>
                    {strain.products.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {strain.products.map((p) => (
                                <Link
                                    key={p.slug}
                                    href={p.path}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 hover:border-green-600/40 hover:shadow-md transition-all group"
                                >
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-foreground group-hover:text-green-600 transition-colors truncate">
                                            {p.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{p.category}</p>
                                    </div>
                                    {p.price ? (
                                        <span className="text-green-600 font-bold text-sm shrink-0">${p.price.toFixed(2)}</span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground shrink-0">View →</span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            This strain isn&apos;t in stock right now, but new drops land weekly.{" "}
                            <Link href={`/shop?search=${encodeURIComponent(strain.name)}`} className="text-green-600 font-semibold hover:underline">
                                Search the shop
                            </Link>{" "}
                            or browse{" "}
                            <Link href="/shop?category=Flower" className="text-green-600 font-semibold hover:underline">
                                all {strain.type.toLowerCase()} flower
                            </Link>
                            .
                        </p>
                    )}
                </section>

                {/* Similar strains by terpene overlap */}
                {similar.length > 0 && (
                    <section className="mb-12" aria-labelledby="similar-heading">
                        <h2 id="similar-heading" className="text-xl md:text-2xl font-bold text-foreground mb-1.5">
                            Strains With a Similar Terpene Profile
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
                            Matched on shared dominant terpenes — if you like {strain.name}, these live in the same
                            aromatic neighbourhood.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {similar.map((s) => (
                                <Link
                                    key={s.slug}
                                    href={`/strains/${s.slug}`}
                                    className="rounded-xl border border-border bg-card p-4 hover:border-green-600/40 hover:shadow-md transition-all group"
                                >
                                    <p className="font-bold text-sm text-foreground group-hover:text-green-600 transition-colors">
                                        {s.name}
                                    </p>
                                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                                        {s.type}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                                        {s.terpenes.slice(0, 3).join(" · ")}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* FAQ (mirrors the FAQPage JSON-LD) */}
                <section aria-labelledby="faq-heading" className="mb-8">
                    <h2 id="faq-heading" className="text-xl md:text-2xl font-bold text-foreground mb-4">
                        {strain.name} FAQ
                    </h2>
                    <div className="space-y-3">
                        {faqs.map((f) => (
                            <details key={f.q} className="rounded-xl border border-border bg-card p-4 group">
                                <summary className="font-semibold text-sm text-foreground cursor-pointer list-none flex justify-between items-center">
                                    {f.q}
                                    <span className="text-green-600 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                                </summary>
                                <p className="mt-2 text-sm text-foreground/80 leading-relaxed">{f.a}</p>
                            </details>
                        ))}
                    </div>
                </section>

                <div className="text-center pt-4 border-t border-border">
                    <Link href="/strains" className="text-sm font-semibold text-green-600 hover:underline">
                        ← Browse the full strain library
                    </Link>
                </div>
            </div>
        </main>
    );
}
