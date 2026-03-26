/**
 * Compare Dispensaries Index — Mohawk Medibles
 * ═════════════════════════════════════════════
 * SEO landing page listing all competitor comparisons.
 * Targets: "best online dispensary canada", "dispensary comparison",
 *          "OCS alternative", "SQDC alternative", "better than OCS"
 */
import type { Metadata } from "next";
import Link from "next/link";
import { COMPETITORS, MOHAWK_STATS } from "@/data/comparisons";

const privateCompetitors = COMPETITORS.filter((c) => c.category === "private");
const momCompetitors = COMPETITORS.filter((c) => c.category === "mom");
const provincialCompetitors = COMPETITORS.filter((c) => c.category === "provincial");

export const metadata: Metadata = {
  title: "Compare Cannabis Dispensaries in Canada — Mohawk Medibles vs Competitors (2026)",
  description:
    "Compare Mohawk Medibles to top Canadian online dispensaries and provincial government stores like OCS, SQDC, and BC Cannabis Store. Side-by-side comparisons of products, pricing, shipping, and quality. Find out why 25,900+ customers choose Mohawk Medibles.",
  keywords: [
    "best online dispensary canada",
    "dispensary comparison",
    "compare cannabis dispensaries",
    "online dispensary canada review",
    "best mail order marijuana canada",
    "mohawk medibles review",
    "top dispensaries canada 2026",
    "cannabis dispensary comparison",
    "best weed delivery canada",
    "indigenous dispensary canada",
    "budmail alternative",
    "west coast cannabis alternative",
    "herb approach alternative",
    "speed greens alternative",
    "weed smart alternative",
    "togoweed alternative",
    "get kush alternative",
    "green society alternative",
    "bc bud supply alternative",
    "the green ace alternative",
    "best MOM dispensary canada",
    "mail order marijuana canada",
    "OCS alternative",
    "SQDC alternative",
    "better than OCS",
    "better than SQDC",
    "BC Cannabis Store alternative",
    "cheaper than OCS",
    "cheaper than SQDC",
    "government cannabis store alternative",
    "provincial cannabis store comparison",
    "cannabis NB alternative",
    "NSLC cannabis alternative",
    "AGLC alternative",
  ],
  openGraph: {
    title: "Compare Cannabis Dispensaries — Mohawk Medibles vs Top Competitors & Provincial Stores",
    description:
      "Side-by-side comparisons with Canada's top online dispensaries and every provincial government cannabis store. 360+ products, lab-tested quality, Indigenous-owned.",
    url: "https://mohawkmedibles.ca/compare-dispensary",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Cannabis Dispensaries in Canada",
    description:
      "See how Mohawk Medibles compares to top Canadian dispensaries and provincial government stores on products, price, quality, and shipping.",
  },
  alternates: {
    canonical: "https://mohawkmedibles.ca/compare-dispensary",
  },
};

function CompetitorCard({ comp }: { comp: (typeof COMPETITORS)[number] }) {
  return (
    <Link
      href={`/compare-dispensary/${comp.slug}`}
      className="group relative bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-lime/5 hover:-translate-y-1"
    >
      {/* Card glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-lime/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="bg-lime/10 rounded-lg px-3 py-1">
            <span className="text-xs font-bold text-lime uppercase tracking-wider">VS</span>
          </div>
          <svg
            className="w-5 h-5 text-white/20 group-hover:text-lime group-hover:translate-x-1 transition-all"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-white group-hover:text-lime transition-colors mb-2">
          Mohawk Medibles vs {comp.name}
        </h3>

        <p className="text-white/50 text-sm mb-4 leading-relaxed line-clamp-2">
          {comp.description}
        </p>

        {/* Quick comparison chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-lime/10 text-lime/80 text-xs font-medium px-2.5 py-1 rounded-md">
            {comp.productCount} products
          </span>
          <span className="bg-white/5 text-white/50 text-xs font-medium px-2.5 py-1 rounded-md">
            {comp.location}
          </span>
          <span className="bg-white/5 text-white/50 text-xs font-medium px-2.5 py-1 rounded-md">
            Est. {comp.founded}
          </span>
        </div>

        {/* Top advantage preview */}
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-lime flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-white/60">{comp.mohawkAdvantages[0]}</span>
        </div>
      </div>
    </Link>
  );
}

export default function CompareDispensaryIndex() {
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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ─── Hero Section ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-charcoal-deep via-charcoal to-forest/30 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-lime/8 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-forest/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center justify-center gap-2 text-sm text-white/50">
              <li>
                <Link href="/" className="hover:text-lime transition-colors">Home</Link>
              </li>
              <li>/</li>
              <li className="text-lime/80">Compare Dispensaries</li>
            </ol>
          </nav>

          <div className="inline-flex items-center gap-2 bg-lime/10 border border-lime/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            <span className="text-xs font-semibold text-lime uppercase tracking-wider">
              Honest Comparisons
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Compare Cannabis{" "}
            <span className="text-lime">Dispensaries</span>{" "}
            in Canada
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed">
            Choosing the right cannabis source matters. Compare Mohawk Medibles — Canada&apos;s
            premier Indigenous-owned dispensary — against private competitors, top mail order marijuana
            (MOM) services, and every provincial government cannabis store on products, pricing, quality,
            and customer experience.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: MOHAWK_STATS.productCount, label: "Products" },
              { value: "25,900+", label: "Customers" },
              { value: "3", label: "Payment Methods" },
              { value: "2018", label: "Established" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/[0.04] rounded-xl py-4 px-3">
                <div className="text-2xl md:text-3xl font-extrabold text-lime">{stat.value}</div>
                <div className="text-xs text-white/40 mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Provincial Government Stores ─────────────────── */}
      <section className="bg-charcoal py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-lime/30" />
            <span className="text-xs font-bold text-lime/60 uppercase tracking-[0.2em]">Government Stores</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-lime/30" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Mohawk Medibles vs Provincial Cannabis Stores
          </h2>
          <p className="text-white/50 text-center mb-12 max-w-2xl mx-auto">
            Every Canadian province runs a government cannabis store with inflated prices and potency caps.
            See why thousands are switching to Mohawk Medibles for better prices, more selection, and no government markup.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {provincialCompetitors.map((comp) => (
              <CompetitorCard key={comp.slug} comp={comp} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Private Dispensaries ─────────────────────────── */}
      <section className="bg-gradient-to-b from-charcoal to-charcoal-deep py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-lime/30" />
            <span className="text-xs font-bold text-lime/60 uppercase tracking-[0.2em]">Private Dispensaries</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-lime/30" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Mohawk Medibles vs Online Dispensaries
          </h2>
          <p className="text-white/50 text-center mb-12 max-w-2xl mx-auto">
            Click any comparison to see a detailed side-by-side breakdown against Canada&apos;s top private online dispensaries.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {privateCompetitors.map((comp) => (
              <CompetitorCard key={comp.slug} comp={comp} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Top MOM Dispensaries ──────────────────────────── */}
      <section className="bg-charcoal py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-lime/30" />
            <span className="text-xs font-bold text-lime/60 uppercase tracking-[0.2em]">Mail Order Marijuana</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-lime/30" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Mohawk Medibles vs Top MOM Dispensaries
          </h2>
          <p className="text-white/50 text-center mb-12 max-w-2xl mx-auto">
            Canada&apos;s most popular mail order marijuana services compared side-by-side with Mohawk Medibles.
            See why our physical store, multiple payment methods, and Indigenous heritage set us apart.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {momCompetitors.map((comp) => (
              <CompetitorCard key={comp.slug} comp={comp} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Mohawk Medibles Section ───────────────────── */}
      <section className="bg-charcoal-deep py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Why Customers Choose Mohawk Medibles
          </h2>
          <p className="text-white/50 text-center mb-12 max-w-2xl mx-auto">
            The only Indigenous-owned premium cannabis dispensary with a physical store, lab-tested
            products, and Canada-wide shipping.
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            {MOHAWK_STATS.highlights.map((highlight) => (
              <div
                key={highlight}
                className="flex items-center gap-4 bg-white/[0.03] rounded-xl px-5 py-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-lime/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-lime" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-white/80 font-medium">{highlight}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-lime text-charcoal-deep font-bold px-10 py-4 rounded-xl hover:bg-lime-light transition-all shadow-lg shadow-lime/20 hover:shadow-lime/40 hover:scale-105 text-lg"
            >
              Shop Mohawk Medibles
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SEO Content Block ─────────────────────────────── */}
      <section className="bg-gradient-to-b from-charcoal-deep to-charcoal py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-white mb-4">
              Finding the Best Online Dispensary in Canada (2026 Guide)
            </h2>
            <div className="text-white/50 space-y-4 leading-relaxed text-sm">
              <p>
                With dozens of online dispensaries operating across Canada, choosing the right one
                can be overwhelming. Factors like product selection, quality testing, payment options,
                shipping speed, and customer service all play a role in your decision.
              </p>
              <p>
                Mohawk Medibles stands apart as the only Indigenous-owned premium cannabis dispensary
                operating from Tyendinaga Mohawk Territory in Ontario. With over 360 lab-tested
                products meeting the Empire Standard&trade; quality guarantee, three secure payment methods
                (credit card, Interac e-Transfer, and cryptocurrency), and a physical dispensary you
                can visit in person, Mohawk Medibles offers a level of transparency and trust that
                purely online operations cannot match.
              </p>

              <h3 className="text-xl font-bold text-white mt-8 mb-3">
                Why Choose Mohawk Medibles Over Provincial Government Stores?
              </h3>
              <p>
                Provincial government cannabis stores like the OCS (Ontario Cannabis Store), SQDC (Quebec),
                BC Cannabis Store, and Cannabis NB all operate under government-mandated pricing that
                inflates costs by 30-50%. These stores also enforce the federal 10mg edible potency cap
                with no flexibility, offer no loyalty rewards, and provide an impersonal, corporate
                shopping experience. Mohawk Medibles operates under Indigenous sovereignty from Tyendinaga
                Mohawk Territory, offering tax-free pricing, no potency restrictions, a rewards program
                with real value, and personal customer service that treats every customer like family.
              </p>
              <p>
                Whether you&apos;re searching for an OCS alternative, a cheaper option than SQDC, or
                a better cannabis store than your provincial government retailer, Mohawk Medibles
                delivers premium quality at prices the government stores simply cannot match.
              </p>

              <h3 className="text-xl font-bold text-white mt-8 mb-3">
                Better Selection, Better Prices, Better Experience
              </h3>
              <p>
                Whether you&apos;re looking for AAAA premium flower, edibles, concentrates, vapes,
                pre-rolls, or CBD products, our comparisons above show exactly how we stack up against
                both private online dispensaries and every provincial government cannabis store in Canada.
                Every comparison is based on publicly available information and aims to help you make
                an informed choice.
              </p>
              <p>
                Join 25,900+ satisfied customers who have made the switch to Mohawk Medibles —
                where quality, heritage, and community come first.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
