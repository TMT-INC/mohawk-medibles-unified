/**
 * /strains/ — Cannabis Strains Index Page
 * ════════════════════════════════════════
 * Hub page for all flower strains. Targets "cannabis strains canada".
 * ISR every hour. Full structured data (BreadcrumbList + ItemList).
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getAllFlowerProducts,
  getStrainTypeCounts,
  STRAIN_TYPES,
  STRAIN_TYPE_DATA,
  type StrainType,
} from "@/lib/strains";
import {
  breadcrumbSchema,
  itemListSchema,
  buildSchemaGraph,
} from "@/lib/seo/schemas";

export const revalidate = 3600;

const BASE_URL = "https://mohawkmedibles.ca";

const TYPE_EMOJI: Record<StrainType, string> = {
  Indica: "🌙",
  Sativa: "☀️",
  Hybrid: "⚡",
};

const TYPE_COLORS: Record<StrainType, string> = {
  Indica: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  Sativa: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Hybrid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

export const metadata: Metadata = {
  title: "Cannabis Strains Canada — Indica, Sativa & Hybrid | Mohawk Medibles",
  description:
    "Browse premium cannabis strains at Mohawk Medibles. Indica, sativa, and hybrid flower — lab-tested, terpene-profiled, shipped Canada-wide. Shop the Empire Standard.",
  keywords: [
    "cannabis strains canada",
    "indica strains",
    "sativa strains",
    "hybrid strains",
    "buy weed online canada",
    "premium flower canada",
    "lab-tested cannabis",
    "terpene profiled cannabis",
  ],
  alternates: {
    canonical: `${BASE_URL}/strains`,
  },
  openGraph: {
    title: "Cannabis Strains Canada — Indica, Sativa & Hybrid | Mohawk Medibles",
    description:
      "Browse premium cannabis strains at Mohawk Medibles. Lab-tested, terpene-profiled flower shipped Canada-wide.",
    url: `${BASE_URL}/strains`,
    siteName: "Mohawk Medibles",
    type: "website",
  },
};

export default async function StrainsPage() {
  const [flowers, counts] = await Promise.all([
    getAllFlowerProducts(),
    getStrainTypeCounts(),
  ]);

  // Group flowers by type for the grid
  const grouped: Record<StrainType, typeof flowers> = {
    Indica: [],
    Sativa: [],
    Hybrid: [],
  };
  for (const flower of flowers) {
    const type = flower.specs.type as StrainType;
    if (type in grouped) grouped[type].push(flower);
  }

  const totalStrains = flowers.length;

  // Structured data
  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Strains", url: `${BASE_URL}/strains` },
  ]);

  const itemList = itemListSchema(
    flowers.slice(0, 50).map((f) => ({
      name: f.name,
      slug: f.slug,
      image: f.image,
    })),
    "Cannabis Strains"
  );

  const jsonLd = buildSchemaGraph(breadcrumbs, itemList);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className="px-4 sm:px-6 lg:px-8 pt-6">
        <ol className="mx-auto flex max-w-7xl items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-foreground">Strains</li>
        </ol>
      </nav>

      {/* ── Hero ── */}
      <header className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Cannabis Strains Canada
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {totalStrains} premium flower strains — lab-tested for potency,
            terpene-profiled for flavour, shipped Canada-wide with discreet
            packaging.
          </p>

          {/* Strain Type Count Cards */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
            {STRAIN_TYPES.map((type) => {
              const data = STRAIN_TYPE_DATA[type];
              return (
                <Link
                  key={type}
                  href={`/strains/${data.slug}`}
                  className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-forest/40 dark:hover:border-lime/30"
                >
                  <span className="text-3xl mb-2" aria-hidden="true">
                    {TYPE_EMOJI[type]}
                  </span>
                  <h2 className="text-lg font-bold text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors">
                    {data.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.shortDescription}
                  </p>
                  <span className="mt-3 text-2xl font-bold text-forest dark:text-lime">
                    {counts[type]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    strains available
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Product Grid by Type ── */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mx-auto max-w-7xl space-y-16">
          {STRAIN_TYPES.map((type) => {
            const data = STRAIN_TYPE_DATA[type];
            const products = grouped[type];
            if (products.length === 0) return null;

            return (
              <section key={type} aria-labelledby={`${data.slug}-heading`}>
                <div className="flex items-center justify-between mb-6">
                  <h2
                    id={`${data.slug}-heading`}
                    className="text-2xl font-bold text-foreground"
                  >
                    <span className="mr-2" aria-hidden="true">
                      {TYPE_EMOJI[type]}
                    </span>
                    {data.title}
                  </h2>
                  <Link
                    href={`/strains/${data.slug}`}
                    className="text-sm font-medium text-forest dark:text-lime hover:underline"
                  >
                    View all {data.slug} &rarr;
                  </Link>
                </div>

                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {products.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/product/${product.slug}`}
                      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:border-forest/40 dark:hover:border-lime/30"
                    >
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.altText || product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          loading="lazy"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {product.specs.thc && product.specs.thc !== "TBD" && (
                          <span className="absolute top-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-lime backdrop-blur-sm">
                            THC {product.specs.thc}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-1.5 p-3">
                        <span
                          className={`self-start rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_COLORS[type]}`}
                        >
                          {type}
                        </span>
                        <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-forest dark:group-hover:text-lime transition-colors">
                          {product.name}
                        </h3>
                        <span className="mt-auto text-sm font-bold text-forest dark:text-lime">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* ── SEO Content Block ── */}
      <section className="bg-muted/30 border-t border-border px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl prose prose-neutral dark:prose-invert">
          <h2>Buy Cannabis Strains Online in Canada</h2>
          <p>
            Mohawk Medibles is an Indigenous-owned dispensary on Tyendinaga
            Mohawk Territory offering {totalStrains}+ premium cannabis flower
            strains for delivery across Canada. Every strain in our collection is
            lab-tested for THC and CBD potency and terpene-profiled so you know
            exactly what you are getting.
          </p>
          <h3>Why Choose Mohawk Medibles for Flower?</h3>
          <ul>
            <li>
              <strong>Lab-tested potency</strong> — verified THC/CBD percentages
              on every strain
            </li>
            <li>
              <strong>Terpene profiling</strong> — detailed flavour and effect
              data to match your preferences
            </li>
            <li>
              <strong>Canada-wide shipping</strong> — discreet, vacuum-sealed
              packaging with Xpresspost delivery
            </li>
            <li>
              <strong>Indigenous-owned</strong> — proudly operating from
              Tyendinaga Mohawk Territory since day one
            </li>
            <li>
              <strong>The Empire Standard</strong> — our quality benchmark means
              no shake, no trim, just premium whole-bud flower
            </li>
          </ul>
          <h3>Indica, Sativa, or Hybrid — Which Is Right for You?</h3>
          <p>
            <strong>Indica strains</strong> are best for evening relaxation, pain
            relief, and sleep support. <strong>Sativa strains</strong> deliver
            uplifting, creative energy perfect for daytime use.{" "}
            <strong>Hybrid strains</strong> blend the best of both, offering
            balanced effects for any time of day. Explore each category to find
            your perfect match.
          </p>
        </div>
      </section>
    </>
  );
}
