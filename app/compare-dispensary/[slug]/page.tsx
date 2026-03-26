/**
 * Compare Dispensary — [slug] — Mohawk Medibles vs [Competitor]
 * ═════════════════════════════════════════════════════════════
 * SEO landing page targeting "Mohawk Medibles vs [competitor]"
 * and "[competitor] alternative" search queries.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPETITORS, MOHAWK_STATS, getCompetitorBySlug } from "@/data/comparisons";

// ─── Static Params (SSG all comparison pages) ────────────────
export function generateStaticParams() {
  return COMPETITORS.map((c) => ({ slug: c.slug }));
}

// ─── Dynamic Metadata ────────────────────────────────────────
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comp = getCompetitorBySlug(slug);
  if (!comp) return {};

  const title = `Mohawk Medibles vs ${comp.name} — Which Dispensary Is Better? (2026)`;
  const description = `Compare Mohawk Medibles and ${comp.name} side-by-side. See why 25,900+ customers choose Mohawk Medibles for premium Indigenous cannabis — 360+ products, lab-tested quality, and multiple payment options.`;

  return {
    title,
    description,
    keywords: [
      `mohawk medibles vs ${comp.name.toLowerCase()}`,
      `${comp.name.toLowerCase()} alternative`,
      `${comp.name.toLowerCase()} vs mohawk medibles`,
      `${comp.name.toLowerCase()} review`,
      `best online dispensary canada`,
      `${comp.name.toLowerCase()} comparison`,
      "buy weed online canada",
      "online dispensary canada",
      "indigenous cannabis dispensary",
      "mail order marijuana canada",
      "best cannabis dispensary 2026",
    ],
    openGraph: {
      title,
      description,
      url: `https://mohawkmedibles.ca/compare-dispensary/${slug}`,
      type: "article",
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `Mohawk Medibles vs ${comp.name}`,
      description,
    },
    alternates: {
      canonical: `https://mohawkmedibles.ca/compare-dispensary/${slug}`,
    },
  };
}

// ─── Comparison Row Component ────────────────────────────────
function ComparisonRow({
  label,
  mohawk,
  competitor,
  mohawkWins,
}: {
  label: string;
  mohawk: string;
  competitor: string;
  mohawkWins?: boolean;
}) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <td className="py-4 px-4 md:px-6 font-semibold text-lime/90 text-sm">{label}</td>
      <td className="py-4 px-4 md:px-6 text-sm">
        <span className={mohawkWins ? "text-lime font-semibold" : "text-white/80"}>
          {mohawkWins && (
            <svg className="inline-block w-4 h-4 mr-1.5 text-lime" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {mohawk}
        </span>
      </td>
      <td className="py-4 px-4 md:px-6 text-sm text-white/60">{competitor}</td>
    </tr>
  );
}

// ─── Page Component ──────────────────────────────────────────
export default async function CompareDispensaryPage({ params }: Props) {
  const { slug } = await params;
  const comp = getCompetitorBySlug(slug);
  if (!comp) notFound();

  // FAQ items for schema and display
  const faqs = [
    {
      question: `Is Mohawk Medibles better than ${comp.name}?`,
      answer: `Mohawk Medibles offers 360+ lab-tested products, multiple payment methods (credit card, e-Transfer, crypto), a physical dispensary, and is Indigenous-owned on Tyendinaga Mohawk Territory. ${comp.name} has ${comp.productCount} products and accepts ${comp.paymentMethods.join(", ")}.`,
    },
    {
      question: `What are the main differences between Mohawk Medibles and ${comp.name}?`,
      answer: `Key differences: Mohawk Medibles has ${MOHAWK_STATS.productCount} products vs ${comp.productCount}, offers 3 payment methods vs ${comp.paymentMethods.length}, has a physical dispensary in Ontario, and is Indigenous-owned with the Empire Standard™ quality guarantee.`,
    },
    {
      question: `Does ${comp.name} have a physical store?`,
      answer: comp.category === "provincial"
        ? `${comp.name} operates government-regulated retail locations in ${comp.location}. Mohawk Medibles has its own physical dispensary on Tyendinaga Mohawk Territory in Ontario, plus nationwide shipping — with lower prices, no government markup, and no potency caps.`
        : `No, ${comp.name} operates online only from ${comp.location}. Mohawk Medibles has a physical dispensary on Tyendinaga Mohawk Territory in Ontario, plus nationwide shipping.`,
    },
    {
      question: `Which dispensary has more products — Mohawk Medibles or ${comp.name}?`,
      answer: `Mohawk Medibles offers ${MOHAWK_STATS.productCount} lab-tested products across all categories (flower, edibles, concentrates, vapes, pre-rolls, and more). ${comp.name} offers ${comp.productCount} products.`,
    },
    {
      question: `Is Mohawk Medibles Indigenous-owned?`,
      answer: `Yes, Mohawk Medibles is proudly Indigenous-owned and operated from Tyendinaga Mohawk Territory in Ontario, Canada. Operating under Indigenous sovereignty, they serve 25,900+ customers across Canada.`,
    },
  ];

  // JSON-LD: FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // JSON-LD: Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://mohawkmedibles.ca",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Compare Dispensaries",
        item: "https://mohawkmedibles.ca/compare-dispensary",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Mohawk Medibles vs ${comp.name}`,
        item: `https://mohawkmedibles.ca/compare-dispensary/${slug}`,
      },
    ],
  };

  // JSON-LD: Article/Review Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Mohawk Medibles vs ${comp.name} — Detailed Dispensary Comparison (2026)`,
    description: `An in-depth comparison between Mohawk Medibles and ${comp.name}, covering products, pricing, shipping, payment methods, and more.`,
    url: `https://mohawkmedibles.ca/compare-dispensary/${slug}`,
    datePublished: "2026-01-15",
    dateModified: "2026-03-26",
    author: {
      "@type": "Organization",
      name: "Mohawk Medibles",
      url: "https://mohawkmedibles.ca",
    },
    publisher: {
      "@type": "Organization",
      name: "Mohawk Medibles",
      logo: {
        "@type": "ImageObject",
        url: "https://mohawkmedibles.ca/logo.png",
      },
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* ─── Hero Section ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-charcoal-deep via-charcoal to-forest/30 pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-forest/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center justify-center gap-2 text-sm text-white/50">
              <li>
                <Link href="/" className="hover:text-lime transition-colors">Home</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/compare-dispensary" className="hover:text-lime transition-colors">Compare Dispensaries</Link>
              </li>
              <li>/</li>
              <li className="text-lime/80">vs {comp.name}</li>
            </ol>
          </nav>

          <div className="inline-flex items-center gap-2 bg-lime/10 border border-lime/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            <span className="text-xs font-semibold text-lime uppercase tracking-wider">
              2026 Comparison
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Mohawk Medibles{" "}
            <span className="text-lime">vs</span>{" "}
            {comp.name}
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed">
            Looking for a {comp.name} alternative? See how Mohawk Medibles — Canada&apos;s premier
            Indigenous-owned dispensary — compares on products, pricing, quality, and more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-lime text-charcoal-deep font-bold px-8 py-3.5 rounded-xl hover:bg-lime-light transition-all shadow-lg shadow-lime/20 hover:shadow-lime/40 hover:scale-105"
            >
              Shop Mohawk Medibles
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl hover:border-lime/40 hover:text-lime transition-all"
            >
              Read Reviews
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Comparison Table ──────────────────────────────── */}
      <section className="bg-charcoal py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Side-by-Side Comparison
          </h2>
          <p className="text-white/50 text-center mb-12 max-w-2xl mx-auto">
            An honest look at how Mohawk Medibles stacks up against {comp.name} across every category that matters.
          </p>

          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/5">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-gradient-to-r from-forest/40 to-forest/20">
              <div className="py-4 px-4 md:px-6 text-sm font-semibold text-white/60 uppercase tracking-wider">
                Feature
              </div>
              <div className="py-4 px-4 md:px-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-lime" />
                  <span className="text-sm font-bold text-lime">Mohawk Medibles</span>
                </div>
              </div>
              <div className="py-4 px-4 md:px-6">
                <span className="text-sm font-semibold text-white/60">{comp.name}</span>
              </div>
            </div>

            {/* Table Body */}
            <table className="w-full">
              <tbody>
                <ComparisonRow
                  label="Products"
                  mohawk={MOHAWK_STATS.productCount}
                  competitor={comp.productCount}
                  mohawkWins={true}
                />
                <ComparisonRow
                  label="Location"
                  mohawk={MOHAWK_STATS.location}
                  competitor={comp.location}
                  mohawkWins={true}
                />
                <ComparisonRow
                  label="Founded"
                  mohawk={MOHAWK_STATS.founded}
                  competitor={comp.founded}
                />
                <ComparisonRow
                  label="Free Shipping"
                  mohawk={`Orders over ${MOHAWK_STATS.freeShippingThreshold}`}
                  competitor={`Orders over ${comp.freeShippingThreshold}`}
                />
                <ComparisonRow
                  label="Payment Methods"
                  mohawk={MOHAWK_STATS.paymentMethods.join(", ")}
                  competitor={comp.paymentMethods.join(", ")}
                  mohawkWins={true}
                />
                <ComparisonRow
                  label="Physical Store"
                  mohawk="Yes — Tyendinaga"
                  competitor={comp.category === "provincial" ? `Yes — ${comp.location}` : "No"}
                  mohawkWins={true}
                />
                <ComparisonRow
                  label="Indigenous-Owned"
                  mohawk="Yes"
                  competitor="No"
                  mohawkWins={true}
                />
                <ComparisonRow
                  label="Lab Tested"
                  mohawk="All products"
                  competitor="Varies"
                  mohawkWins={true}
                />
                <ComparisonRow
                  label="Quality Guarantee"
                  mohawk="Empire Standard™"
                  competitor="Standard"
                  mohawkWins={true}
                />
                <ComparisonRow
                  label="Local Delivery"
                  mohawk="Same-day available"
                  competitor="Mail order only"
                  mohawkWins={true}
                />
                <ComparisonRow
                  label="AI Assistant"
                  mohawk="Yes"
                  competitor="No"
                  mohawkWins={true}
                />
                <ComparisonRow
                  label="Rewards Program"
                  mohawk="Points + Referrals"
                  competitor="Varies"
                  mohawkWins={true}
                />
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-white/40">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-lime" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Mohawk Medibles advantage
            </span>
          </div>
        </div>
      </section>

      {/* ─── Why Choose Mohawk Medibles ─────────────────────── */}
      <section className="bg-gradient-to-b from-charcoal to-charcoal-deep py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Why Choose Mohawk Medibles Over {comp.name}?
          </h2>
          <p className="text-white/50 text-center mb-12 max-w-2xl mx-auto">
            Here&apos;s what sets us apart as Canada&apos;s leading Indigenous-owned cannabis dispensary.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {comp.mohawkAdvantages.map((advantage, i) => (
              <div
                key={i}
                className="group relative bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-lime/5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-lime/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-lime" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-white/90 font-medium leading-relaxed">{advantage}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { icon: "shield", label: "Lab Tested", sublabel: "Every product" },
              { icon: "truck", label: "Free Shipping", sublabel: `Over ${MOHAWK_STATS.freeShippingThreshold}` },
              { icon: "star", label: "25,900+", sublabel: "Happy Customers" },
              { icon: "lock", label: "Secure", sublabel: "3 Payment Options" },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-2 bg-white/[0.03] rounded-xl py-5 px-3"
              >
                {badge.icon === "shield" && (
                  <svg className="w-8 h-8 text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )}
                {badge.icon === "truck" && (
                  <svg className="w-8 h-8 text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                )}
                {badge.icon === "star" && (
                  <svg className="w-8 h-8 text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )}
                {badge.icon === "lock" && (
                  <svg className="w-8 h-8 text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
                <span className="text-white font-bold text-sm">{badge.label}</span>
                <span className="text-white/40 text-xs">{badge.sublabel}</span>
              </div>
            ))}
          </div>

          {/* About the Competitor */}
          <div className="bg-white/[0.03] rounded-2xl p-8 md:p-10 mb-16">
            <h3 className="text-2xl font-bold text-white mb-4">About {comp.name}</h3>
            <p className="text-white/60 mb-6 leading-relaxed">{comp.description}</p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-lime/80 uppercase tracking-wider mb-3">
                  {comp.name} Pros
                </h4>
                <ul className="space-y-2">
                  {comp.pros.map((pro) => (
                    <li key={pro} className="flex items-center gap-2 text-white/60 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-400/80 uppercase tracking-wider mb-3">
                  {comp.name} Cons
                </h4>
                <ul className="space-y-2">
                  {comp.cons.map((con) => (
                    <li key={con} className="flex items-center gap-2 text-white/60 text-sm">
                      <svg className="w-3.5 h-3.5 text-red-400/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ───────────────────────────────────── */}
      <section className="bg-charcoal-deep py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-white/50 text-center mb-12">
            Common questions about Mohawk Medibles vs {comp.name}
          </p>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white/[0.03] rounded-xl overflow-hidden"
                {...(i === 0 ? { open: true } : {})}
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-white font-semibold hover:bg-white/[0.02] transition-colors">
                  <span className="pr-4">{faq.question}</span>
                  <svg
                    className="w-5 h-5 text-lime/60 flex-shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-white/60 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────────────── */}
      <section className="bg-gradient-to-br from-forest/30 via-charcoal to-charcoal-deep py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            Join 25,900+ Canadians who chose Mohawk Medibles for premium, lab-tested,
            Indigenous-sourced cannabis. Your first order ships with our Empire Standard™ guarantee.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-lime text-charcoal-deep font-bold px-10 py-4 rounded-xl hover:bg-lime-light transition-all shadow-lg shadow-lime/20 hover:shadow-lime/40 hover:scale-105 text-lg"
            >
              Shop Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/deals"
              className="inline-flex items-center gap-2 border border-lime/30 text-lime font-semibold px-10 py-4 rounded-xl hover:bg-lime/10 transition-all text-lg"
            >
              View Today&apos;s Deals
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Other Comparisons ─────────────────────────────── */}
      <section className="bg-charcoal-deep py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h3 className="text-xl font-bold text-white/70 text-center mb-8">
            More Dispensary Comparisons
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {COMPETITORS.filter((c) => c.slug !== slug).map((c) => (
              <Link
                key={c.slug}
                href={`/compare-dispensary/${c.slug}`}
                className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-lime/20 text-white/60 hover:text-lime text-sm font-medium px-4 py-2 rounded-lg transition-all"
              >
                vs {c.name}
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/compare-dispensary"
              className="text-lime/60 hover:text-lime text-sm font-medium transition-colors"
            >
              View All Comparisons &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
