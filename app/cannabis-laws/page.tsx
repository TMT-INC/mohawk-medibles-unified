/**
 * /cannabis-laws — Cannabis Laws in Canada Hub Page
 * =============================================================================
 * National hub page covering cannabis legislation across all 13 provinces and
 * territories. Links to dynamic /cannabis-laws/[province] pages for detailed
 * province-specific legal guides.
 *
 * SEO Target: "cannabis laws canada", "weed laws by province", "marijuana legal canada"
 * Combined search volume target: 35K/mo
 *
 * Server Component (RSC) — Next.js 16 App Router
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schemas";

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:
    "Cannabis Laws in Canada by Province — Complete 2026 Guide",
  description:
    "Complete guide to cannabis laws in every Canadian province and territory for 2026. Legal ages, possession limits, consumption rules, home growing, delivery laws, and driving regulations across Ontario, BC, Alberta, Quebec, and all 13 provinces/territories.",
  alternates: {
    canonical: "https://mohawkmedibles.ca/cannabis-laws",
  },
  keywords: [
    "cannabis laws canada",
    "weed laws by province",
    "marijuana legal canada",
    "cannabis regulations canada 2026",
    "weed legal age canada",
    "cannabis possession limit canada",
    "marijuana laws ontario",
    "cannabis laws british columbia",
    "cannabis laws alberta",
    "cannabis laws quebec",
    "home growing cannabis canada",
    "cannabis driving laws canada",
    "where can you smoke weed canada",
    "cannabis delivery laws canada",
    "canadian cannabis act",
    "marijuana possession limit by province",
    "legal weed canada rules",
  ],
  openGraph: {
    title:
      "Cannabis Laws in Canada by Province — Complete 2026 Guide",
    description:
      "Everything you need to know about cannabis laws in every Canadian province and territory. Legal ages, possession limits, consumption rules, growing, delivery, and driving laws.",
    url: "https://mohawkmedibles.ca/cannabis-laws",
    type: "website",
    siteName: "Mohawk Medibles",
    images: [
      {
        url: "https://mohawkmedibles.ca/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cannabis Laws in Canada by Province — Mohawk Medibles 2026 Guide",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Cannabis Laws in Canada by Province — Complete 2026 Guide",
    description:
      "Complete guide to cannabis laws in all 13 Canadian provinces and territories for 2026. Legal ages, possession limits, and more.",
    images: [
      {
        url: "https://mohawkmedibles.ca/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cannabis Laws in Canada by Province — Mohawk Medibles 2026 Guide",
      },
    ],
  },
};

// ─── Province Summary Data (for hub cards) ─────────────────────────

const PROVINCES = [
  {
    slug: "ontario",
    name: "Ontario",
    abbreviation: "ON",
    legalAge: 19,
    possessionLimit: "30g dried",
    keyFact: "Largest cannabis market in Canada with 1,500+ retail stores.",
  },
  {
    slug: "british-columbia",
    name: "British Columbia",
    abbreviation: "BC",
    legalAge: 19,
    possessionLimit: "30g dried",
    keyFact:
      "Pioneered cannabis culture in Canada; home to the famous BC Bud.",
  },
  {
    slug: "alberta",
    name: "Alberta",
    abbreviation: "AB",
    legalAge: 18,
    possessionLimit: "30g dried",
    keyFact:
      "Lowest legal age (18) alongside Quebec. Over 700 licensed retail stores.",
  },
  {
    slug: "quebec",
    name: "Quebec",
    abbreviation: "QC",
    legalAge: 21,
    possessionLimit: "30g dried",
    keyFact:
      "Highest legal age in Canada at 21. SQDC is the sole legal retailer.",
  },
  {
    slug: "manitoba",
    name: "Manitoba",
    abbreviation: "MB",
    legalAge: 19,
    possessionLimit: "30g dried",
    keyFact:
      "Private retail model. Municipalities can opt out of hosting stores.",
  },
  {
    slug: "saskatchewan",
    name: "Saskatchewan",
    abbreviation: "SK",
    legalAge: 19,
    possessionLimit: "30g dried",
    keyFact:
      "Fully private retail model with over 90 licensed cannabis stores.",
  },
  {
    slug: "nova-scotia",
    name: "Nova Scotia",
    abbreviation: "NS",
    legalAge: 19,
    possessionLimit: "30g dried",
    keyFact:
      "Government-run NSLC is the sole legal retailer for cannabis products.",
  },
  {
    slug: "new-brunswick",
    name: "New Brunswick",
    abbreviation: "NB",
    legalAge: 19,
    possessionLimit: "30g dried",
    keyFact:
      "Cannabis NB (government-owned) operates all retail cannabis stores.",
  },
  {
    slug: "newfoundland-and-labrador",
    name: "Newfoundland and Labrador",
    abbreviation: "NL",
    legalAge: 19,
    possessionLimit: "30g dried",
    keyFact:
      "First province to complete a legal cannabis sale on Oct. 17, 2018.",
  },
  {
    slug: "prince-edward-island",
    name: "Prince Edward Island",
    abbreviation: "PE",
    legalAge: 19,
    possessionLimit: "30g dried",
    keyFact:
      "Government-run PEI Cannabis stores are the sole retail option on the island.",
  },
  {
    slug: "northwest-territories",
    name: "Northwest Territories",
    abbreviation: "NT",
    legalAge: 19,
    possessionLimit: "30g dried",
    keyFact:
      "Communities can hold plebiscites to ban cannabis sales in their area.",
  },
  {
    slug: "yukon",
    name: "Yukon",
    abbreviation: "YT",
    legalAge: 19,
    possessionLimit: "30g dried",
    keyFact:
      "Government-run Cannabis Yukon stores and licensed private retailers.",
  },
  {
    slug: "nunavut",
    name: "Nunavut",
    abbreviation: "NU",
    legalAge: 19,
    possessionLimit: "30g dried",
    keyFact:
      "Online ordering only via government portal. No physical retail stores.",
  },
];

// ─── Hub FAQ Data ──────────────────────────────────────────────────

const HUB_FAQS = [
  {
    question: "Is cannabis legal in all of Canada?",
    answer:
      "Yes. Cannabis was legalized across Canada on October 17, 2018, under the Cannabis Act (Bill C-45). However, each province and territory has the authority to set its own regulations regarding legal age, retail models, possession limits in private spaces, consumption locations, and home cultivation rules. The federal law sets the baseline, but provincial regulations may be stricter.",
  },
  {
    question: "What is the legal age to buy cannabis in Canada?",
    answer:
      "The legal age varies by province. Most provinces set the legal age at 19, matching their drinking age. Alberta sets it at 18, and Quebec raised it to 21 in 2020. The federal minimum is 18, but provinces can set it higher. You must carry valid government-issued photo ID when purchasing.",
  },
  {
    question: "How much cannabis can you legally possess in Canada?",
    answer:
      "Under federal law, adults can possess up to 30 grams of dried cannabis (or equivalent) in public. At home, you can store as much legally purchased or home-grown cannabis as you wish, unless your province has set additional limits. The 30g limit applies to what you carry on your person in public spaces.",
  },
  {
    question: "Can you grow cannabis at home in Canada?",
    answer:
      "Most provinces allow adults to grow up to 4 cannabis plants per household for personal use, as permitted under federal law. However, Quebec and Manitoba have banned home cultivation entirely. In provinces where it is allowed, plants must be grown from legally obtained seeds or seedlings, and landlords or condo boards may impose additional restrictions.",
  },
  {
    question: "Where can you legally consume cannabis in Canada?",
    answer:
      "Consumption rules vary significantly by province. Generally, cannabis can be consumed in private residences. Some provinces allow consumption wherever tobacco smoking is permitted, while others are more restrictive. Cannabis consumption is universally prohibited in vehicles, workplaces, and near schools or playgrounds. Some provinces, like Ontario, allow public consumption in most areas where tobacco is allowed, while Quebec restricts it to private residences only.",
  },
  {
    question:
      "Can you drive after consuming cannabis in Canada?",
    answer:
      "Driving under the influence of cannabis is illegal everywhere in Canada. Federal law sets two criminal offences based on THC blood levels: 2-5 ng/mL THC results in a summary conviction with a maximum $1,000 fine, while 5+ ng/mL THC or combined THC + alcohol can lead to mandatory minimum penalties, licence suspension, and imprisonment. Many provinces also have zero-tolerance policies for novice and young drivers. Roadside saliva testing (Draeger DrugTest 5000) is authorized for screening.",
  },
];

// ─── Component ────────────────────────────────────────────────────────

export default function CannabisLawsHubPage() {
  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: "https://mohawkmedibles.ca" },
    { name: "Cannabis Laws", url: "https://mohawkmedibles.ca/cannabis-laws" },
  ]);

  const faqs = faqSchema(HUB_FAQS);

  // JSON-LD data is static/hardcoded — safe to inject directly
  const breadcrumbsJson = JSON.stringify(breadcrumbs);
  const faqsJson = JSON.stringify(faqs);

  return (
    <>
      {/* JSON-LD Structured Data — all data is static constants, safe to render */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbsJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqsJson }}
      />

      <main className="min-h-screen pt-32 pb-20 page-glass text-foreground">
        <div className="container mx-auto px-6">
          {/* Breadcrumb Navigation */}
          <nav
            className="mb-12 text-sm text-muted-foreground"
            aria-label="breadcrumb"
          >
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <span>&rarr;</span>
              <span className="text-forest dark:text-lime font-medium">
                Cannabis Laws
              </span>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="mb-16">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase text-foreground mb-6">
              Cannabis Laws in Canada — Province by Province Guide
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl leading-relaxed">
              Canada became the second country in the world to legalize
              recreational cannabis on{" "}
              <span className="text-foreground font-medium">
                October 17, 2018
              </span>
              , under the{" "}
              <span className="text-foreground font-medium">
                Cannabis Act (Bill C-45)
              </span>
              . While the federal law sets baseline rules — including a 30g
              public possession limit and minimum age of 18 — each province and
              territory has the power to set stricter regulations on legal age,
              where you can consume, how cannabis is sold, home growing, and
              more. This guide covers the current 2026 cannabis laws for all 13
              provinces and territories so you know exactly what is legal where
              you live.
            </p>
          </section>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            <div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all">
              <div className="text-4xl font-bold text-forest dark:text-lime mb-2">
                13
              </div>
              <p className="text-muted-foreground text-sm">
                Provinces & Territories
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all">
              <div className="text-4xl font-bold text-forest dark:text-lime mb-2">
                18-21
              </div>
              <p className="text-muted-foreground text-sm">
                Legal Age Range
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all">
              <div className="text-4xl font-bold text-forest dark:text-lime mb-2">
                30g
              </div>
              <p className="text-muted-foreground text-sm">
                Federal Possession Limit
              </p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all">
              <div className="text-4xl font-bold text-forest dark:text-lime mb-2">
                4
              </div>
              <p className="text-muted-foreground text-sm">
                Plants Per Household (Federal)
              </p>
            </div>
          </div>

          {/* Province/Territory Grid */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase text-foreground mb-4">
              Cannabis Laws by Province & Territory
            </h2>
            <p className="text-muted-foreground mb-12 max-w-3xl">
              Select a province or territory below to read the full breakdown of
              cannabis regulations, including legal age, possession limits,
              consumption rules, home growing, delivery laws, and driving rules.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROVINCES.map((province) => (
                <Link
                  key={province.slug}
                  href={`/cannabis-laws/${province.slug}`}
                  className="group"
                >
                  <div className="glass-card p-6 rounded-2xl border border-border group-hover:border-forest/50 dark:group-hover:border-lime/50 transition-all h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors">
                        {province.name}
                      </h3>
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                        {province.abbreviation}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-forest/10 dark:bg-lime/10 flex items-center justify-center text-forest dark:text-lime text-sm font-bold">
                          {province.legalAge}+
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Legal Age
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-forest/10 dark:bg-lime/10 flex items-center justify-center text-forest dark:text-lime text-xs font-bold">
                          30g
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Possession
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground flex-grow">
                      {province.keyFact}
                    </p>
                    <div className="mt-4 pt-4 border-t border-border">
                      <span className="text-sm font-medium text-forest dark:text-lime group-hover:underline">
                        View Full {province.name} Laws &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Key Differences Section */}
          <section className="mb-20">
            <div className="glass-card p-8 rounded-2xl border border-forest/30 dark:border-lime/30 bg-forest/5 dark:bg-lime/5">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-forest/20 dark:bg-lime/20 flex items-center justify-center text-forest dark:text-lime text-lg">
                  &sect;
                </span>
                Key Differences Between Provinces
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 pr-4 text-foreground font-bold">
                        Province
                      </th>
                      <th className="text-left py-3 pr-4 text-foreground font-bold">
                        Legal Age
                      </th>
                      <th className="text-left py-3 pr-4 text-foreground font-bold">
                        Home Growing
                      </th>
                      <th className="text-left py-3 text-foreground font-bold">
                        Retail Model
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Ontario</td>
                      <td className="py-3 pr-4">19</td>
                      <td className="py-3 pr-4">4 plants</td>
                      <td className="py-3">Private retail + OCS online</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">British Columbia</td>
                      <td className="py-3 pr-4">19</td>
                      <td className="py-3 pr-4">4 plants</td>
                      <td className="py-3">Government + private retail</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Alberta</td>
                      <td className="py-3 pr-4">18</td>
                      <td className="py-3 pr-4">4 plants</td>
                      <td className="py-3">Private retail only</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Quebec</td>
                      <td className="py-3 pr-4">21</td>
                      <td className="py-3 pr-4 text-red-400">Prohibited</td>
                      <td className="py-3">Government (SQDC) only</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Manitoba</td>
                      <td className="py-3 pr-4">19</td>
                      <td className="py-3 pr-4 text-red-400">Prohibited</td>
                      <td className="py-3">Private retail only</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Saskatchewan</td>
                      <td className="py-3 pr-4">19</td>
                      <td className="py-3 pr-4">4 plants</td>
                      <td className="py-3">Private retail only</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Nova Scotia</td>
                      <td className="py-3 pr-4">19</td>
                      <td className="py-3 pr-4">4 plants</td>
                      <td className="py-3">Government (NSLC) only</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">New Brunswick</td>
                      <td className="py-3 pr-4">19</td>
                      <td className="py-3 pr-4">4 plants</td>
                      <td className="py-3">Government (Cannabis NB) only</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Newfoundland & Labrador</td>
                      <td className="py-3 pr-4">19</td>
                      <td className="py-3 pr-4">4 plants</td>
                      <td className="py-3">Private retail (licensed)</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Prince Edward Island</td>
                      <td className="py-3 pr-4">19</td>
                      <td className="py-3 pr-4">4 plants</td>
                      <td className="py-3">Government stores only</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Northwest Territories</td>
                      <td className="py-3 pr-4">19</td>
                      <td className="py-3 pr-4">4 plants</td>
                      <td className="py-3">Government (NTLC) + licensed</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">Yukon</td>
                      <td className="py-3 pr-4">19</td>
                      <td className="py-3 pr-4">4 plants</td>
                      <td className="py-3">Government + private retail</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium text-foreground">Nunavut</td>
                      <td className="py-3 pr-4">19</td>
                      <td className="py-3 pr-4">4 plants</td>
                      <td className="py-3">Online government sales only</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase text-foreground mb-4">
              Cannabis Laws in Canada — FAQ
            </h2>
            <p className="text-muted-foreground mb-12">
              Common questions about cannabis legislation across Canada
            </p>
            <div className="space-y-4">
              {HUB_FAQS.map((faq, idx) => (
                <details
                  key={idx}
                  className="glass-card p-6 rounded-2xl border border-border group"
                  {...(idx === 0 ? { open: true } : {})}
                >
                  <summary className="cursor-pointer font-bold text-lg text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors flex items-center justify-between">
                    {faq.question}
                    <span className="text-forest dark:text-lime transition-transform group-open:rotate-180 flex-shrink-0 ml-4">
                      &darr;
                    </span>
                  </summary>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <div className="glass-card p-12 rounded-3xl border border-border text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4 uppercase tracking-tighter">
              Shop Legal Cannabis Online
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Mohawk Medibles delivers premium, lab-tested cannabis products
              across Canada. Browse our full selection of flower, edibles,
              concentrates, vapes, and more. Free shipping on orders over $149.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="brand" size="lg">
                <Link href="/shop">Shop Premium Cannabis</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/delivery">View Delivery Areas</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
