/**
 * /strains/[type]/ — Dynamic Strain Type Page
 * ═════════════════════════════════════════════
 * Renders /strains/indica/, /strains/sativa/, /strains/hybrid/.
 * ISR every hour. Full structured data (Breadcrumb + ItemList + FAQ).
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getFlowersByStrainType,
  STRAIN_TYPES,
  STRAIN_TYPE_DATA,
  type StrainType,
} from "@/lib/strains";
import {
  breadcrumbSchema,
  itemListSchema,
  faqSchema,
  buildSchemaGraph,
} from "@/lib/seo/schemas";

export const revalidate = 3600;

const BASE_URL = "https://mohawkmedibles.ca";

const TYPE_COLORS: Record<StrainType, string> = {
  Indica: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  Sativa: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Hybrid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

const TYPE_EMOJI: Record<StrainType, string> = {
  Indica: "\u{1F319}",
  Sativa: "\u2600\uFE0F",
  Hybrid: "\u26A1",
};

// Slug to StrainType mapping
const SLUG_TO_TYPE: Record<string, StrainType> = {
  indica: "Indica",
  sativa: "Sativa",
  hybrid: "Hybrid",
};

// FAQ content per strain type
const TYPE_FAQS: Record<StrainType, { question: string; answer: string }[]> = {
  Indica: [
    {
      question: "What are indica cannabis strains?",
      answer:
        "Indica strains originate from the Hindu Kush mountain region and produce dense, resinous buds. They are known for deeply relaxing body effects, making them ideal for evening use, pain relief, insomnia, and stress reduction.",
    },
    {
      question: "What effects do indica strains have?",
      answer:
        "Indica strains typically produce full-body relaxation, sedation, pain relief, and appetite stimulation. The dominant terpenes myrcene, linalool, and caryophyllene contribute to the calming, couch-lock experience indica is known for.",
    },
    {
      question: "Can I buy indica strains online in Canada?",
      answer:
        "Yes. Mohawk Medibles ships lab-tested indica flower strains across Canada with discreet, vacuum-sealed packaging. All products include verified THC/CBD percentages and terpene profiles.",
    },
    {
      question: "When should I use indica strains?",
      answer:
        "Indica strains are best suited for evening and nighttime use. They are commonly chosen for relaxation after work, managing chronic pain, improving sleep quality, and reducing anxiety or stress.",
    },
  ],
  Sativa: [
    {
      question: "What are sativa cannabis strains?",
      answer:
        "Sativa strains originate from equatorial regions like Southeast Asia and Central America. They grow tall with narrow leaves and produce airy buds rich in limonene, pinene, and terpinolene. Sativas deliver energizing, cerebral effects.",
    },
    {
      question: "What effects do sativa strains have?",
      answer:
        "Sativa strains produce uplifting, energizing cerebral effects. They enhance creativity, focus, and social engagement. Common effects include euphoria, mental clarity, and motivation — ideal for daytime activities.",
    },
    {
      question: "Can I buy sativa strains online in Canada?",
      answer:
        "Absolutely. Mohawk Medibles offers a curated selection of premium sativa flower strains with Canada-wide shipping. Each strain is lab-tested for potency and includes a full terpene analysis.",
    },
    {
      question: "When should I use sativa strains?",
      answer:
        "Sativa strains are perfect for daytime use — creative work, social events, outdoor adventures, exercise, and combating fatigue or depression. Their uplifting effects pair well with productivity and activity.",
    },
  ],
  Hybrid: [
    {
      question: "What are hybrid cannabis strains?",
      answer:
        "Hybrid strains are bred by crossing indica and sativa genetics to combine the best qualities of both. They can be indica-dominant, sativa-dominant, or balanced, offering versatile effects tailored to your needs.",
    },
    {
      question: "What effects do hybrid strains have?",
      answer:
        "Hybrid effects vary depending on the genetic balance. Indica-dominant hybrids lean toward relaxation with mental clarity, while sativa-dominant hybrids provide energy with body comfort. Balanced hybrids offer the best of both worlds.",
    },
    {
      question: "Can I buy hybrid strains online in Canada?",
      answer:
        "Yes. Mohawk Medibles carries a wide selection of hybrid flower strains with detailed terpene and cannabinoid profiles. All products are shipped Canada-wide with discreet, vacuum-sealed packaging.",
    },
    {
      question: "Are hybrid strains good for beginners?",
      answer:
        "Balanced hybrids are often recommended for first-time cannabis users. They provide moderate effects without the extreme sedation of pure indica or the intense cerebral stimulation of pure sativa, making them approachable and versatile.",
    },
  ],
};

export function generateStaticParams() {
  return [
    { type: "indica" },
    { type: "sativa" },
    { type: "hybrid" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type: slug } = await params;
  const strainType = SLUG_TO_TYPE[slug];

  if (!strainType) {
    return { title: "Strain Type Not Found | Mohawk Medibles" };
  }

  const data = STRAIN_TYPE_DATA[strainType];

  return {
    title: `${data.title} — Buy ${strainType} Weed Online Canada | Mohawk Medibles`,
    description: `Shop premium ${strainType.toLowerCase()} cannabis strains at Mohawk Medibles. ${data.shortDescription} Lab-tested, terpene-profiled flower shipped Canada-wide.`,
    keywords: [
      `${strainType.toLowerCase()} strains`,
      `${strainType.toLowerCase()} weed canada`,
      `buy ${strainType.toLowerCase()} online`,
      "cannabis strains canada",
      "premium flower canada",
      `${strainType.toLowerCase()} cannabis effects`,
    ],
    alternates: {
      canonical: `${BASE_URL}/strains/${slug}`,
    },
    openGraph: {
      title: `${data.title} — Buy ${strainType} Weed Online Canada | Mohawk Medibles`,
      description: `Shop premium ${strainType.toLowerCase()} cannabis strains. ${data.shortDescription}`,
      url: `${BASE_URL}/strains/${slug}`,
      siteName: "Mohawk Medibles",
      type: "website",
    },
  };
}

export default async function StrainTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: slug } = await params;
  const strainType = SLUG_TO_TYPE[slug];

  if (!strainType) {
    return (
      <div className="px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Strain type not found
        </h1>
        <p className="mt-2 text-muted-foreground">
          Try{" "}
          <Link href="/strains" className="text-forest dark:text-lime underline">
            browsing all strains
          </Link>
          .
        </p>
      </div>
    );
  }

  const data = STRAIN_TYPE_DATA[strainType];
  const products = await getFlowersByStrainType(strainType);
  const faqs = TYPE_FAQS[strainType];

  // Other strain types for cross-linking
  const otherTypes = STRAIN_TYPES.filter((t) => t !== strainType);

  // Structured data
  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Strains", url: `${BASE_URL}/strains` },
    { name: data.title, url: `${BASE_URL}/strains/${slug}` },
  ]);

  const itemList = itemListSchema(
    products.slice(0, 50).map((p) => ({
      name: p.name,
      slug: p.slug,
      image: p.image,
    })),
    data.title
  );

  const faqData = faqSchema(faqs);

  const jsonLd = buildSchemaGraph(breadcrumbs, itemList, faqData);

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
          <li>
            <Link
              href="/strains"
              className="hover:text-foreground transition-colors"
            >
              Strains
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-foreground">{data.title}</li>
        </ol>
      </nav>

      {/* ── Hero ── */}
      <header className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-7xl text-center">
          <span className="text-5xl mb-4 block" aria-hidden="true">
            {TYPE_EMOJI[strainType]}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {data.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {data.shortDescription} Browse {products.length} premium{" "}
            {strainType.toLowerCase()} strains — lab-tested and shipped
            Canada-wide.
          </p>

          {/* Effects Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {data.effects.map((effect) => (
              <span
                key={effect}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium ${TYPE_COLORS[strainType]}`}
              >
                {effect}
              </span>
            ))}
          </div>

          {/* Best For */}
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Best for:</span>{" "}
              {data.bestFor.join(" · ")}
            </p>
          </div>
        </div>
      </header>

      {/* ── Product Grid ── */}
      <section
        aria-labelledby="products-heading"
        className="px-4 sm:px-6 lg:px-8 pb-16"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="products-heading"
            className="text-2xl font-bold text-foreground mb-6"
          >
            All {data.title} ({products.length})
          </h2>

          {products.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center">
              No {strainType.toLowerCase()} strains currently available. Check
              back soon or{" "}
              <Link
                href="/strains"
                className="text-forest dark:text-lime underline"
              >
                browse all strains
              </Link>
              .
            </p>
          ) : (
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
                      className={`self-start rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_COLORS[strainType]}`}
                    >
                      {strainType}
                    </span>
                    <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-forest dark:group-hover:text-lime transition-colors">
                      {product.name}
                    </h3>
                    {product.specs.terpenes &&
                      product.specs.terpenes.length > 0 && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {product.specs.terpenes.slice(0, 3).join(" \u00B7 ")}
                        </p>
                      )}
                    <span className="mt-auto pt-1 text-sm font-bold text-forest dark:text-lime">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Educational Content ── */}
      <section className="bg-muted/30 border-t border-border px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-3xl prose prose-neutral dark:prose-invert">
          <h2>
            About {data.title}
          </h2>
          <p>{data.description}</p>
          <h3>Dominant Terpenes</h3>
          <p>
            The signature terpene profile of {strainType.toLowerCase()} strains
            is{" "}
            <strong>{data.terpeneProfile}</strong>. These terpenes work
            synergistically with cannabinoids through the entourage effect to
            produce the characteristic{" "}
            {strainType === "Indica"
              ? "relaxing and sedating"
              : strainType === "Sativa"
                ? "energizing and uplifting"
                : "balanced and versatile"}{" "}
            experience.
          </p>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section
        aria-labelledby="faq-heading"
        className="px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="faq-heading"
            className="text-2xl font-bold text-foreground mb-8 text-center"
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cross-Links to Other Types ── */}
      <section className="border-t border-border px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
            Explore Other Strain Types
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
            {otherTypes.map((type) => {
              const otherData = STRAIN_TYPE_DATA[type];
              return (
                <Link
                  key={type}
                  href={`/strains/${otherData.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-forest/40 dark:hover:border-lime/30"
                >
                  <span className="text-3xl" aria-hidden="true">
                    {TYPE_EMOJI[type]}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors">
                      {otherData.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {otherData.shortDescription}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/strains"
              className="text-sm font-medium text-forest dark:text-lime hover:underline"
            >
              &larr; Back to All Strains
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
