"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  Leaf,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

// ─── Terpene Data ───────────────────────────────────────────────────

interface Terpene {
  name: string;
  slug: string;
  aroma: string;
  color: string;
  colorBg: string;
  icon: string;
  effects: string[];
  foundIn: string[];
  therapeuticBenefits: string[];
  description: string;
}

const TERPENES: Terpene[] = [
  {
    name: "Myrcene",
    slug: "myrcene",
    aroma: "Earthy, musky, herbal with hints of ripe fruit",
    color: "text-amber-600 dark:text-amber-400",
    colorBg: "bg-amber-500/10 border-amber-500/20",
    icon: "🥭",
    effects: ["Relaxing", "Sedating", "Body high", "Couch-lock"],
    foundIn: ["Blue Dream", "Granddaddy Purple", "OG Kush", "Mango Kush"],
    therapeuticBenefits: [
      "Pain relief",
      "Anti-inflammatory",
      "Muscle relaxation",
      "Sleep aid",
    ],
    description:
      "The most abundant terpene in cannabis, myrcene is responsible for the classic earthy, musky scent. It may enhance THC absorption across the blood-brain barrier, intensifying psychoactive effects.",
  },
  {
    name: "Limonene",
    slug: "limonene",
    aroma: "Bright citrus — lemon, orange, grapefruit",
    color: "text-yellow-600 dark:text-yellow-400",
    colorBg: "bg-yellow-500/10 border-yellow-500/20",
    icon: "🍋",
    effects: ["Uplifting", "Mood-boosting", "Energizing", "Stress relief"],
    foundIn: [
      "Super Lemon Haze",
      "Durban Poison",
      "Wedding Cake",
      "Do-Si-Dos",
    ],
    therapeuticBenefits: [
      "Anxiety relief",
      "Antidepressant",
      "Anti-fungal",
      "Digestive aid",
    ],
    description:
      "Found in citrus peels and many sativa-dominant strains, limonene delivers an uplifting, mood-enhancing experience. It has strong anti-anxiety properties and may improve absorption of other terpenes.",
  },
  {
    name: "Caryophyllene",
    slug: "caryophyllene",
    aroma: "Spicy, peppery, warm, woody",
    color: "text-orange-600 dark:text-orange-400",
    colorBg: "bg-orange-500/10 border-orange-500/20",
    icon: "🌶️",
    effects: ["Calming", "Anti-inflammatory", "Grounding", "Mild body relief"],
    foundIn: [
      "Girl Scout Cookies",
      "Bubba Kush",
      "Gelato",
      "Original Glue (GG4)",
    ],
    therapeuticBenefits: [
      "Pain management",
      "Anti-inflammatory",
      "Anti-anxiety",
      "Neuroprotective",
    ],
    description:
      "The only terpene known to directly bind to CB2 cannabinoid receptors, caryophyllene acts almost like a cannabinoid itself. Its spicy, peppery aroma is also found in black pepper, cloves, and cinnamon.",
  },
  {
    name: "Linalool",
    slug: "linalool",
    aroma: "Floral, lavender, sweet, slightly spicy",
    color: "text-purple-600 dark:text-purple-400",
    colorBg: "bg-purple-500/10 border-purple-500/20",
    icon: "💜",
    effects: ["Calming", "Relaxing", "Sedating", "Stress relief"],
    foundIn: ["Lavender", "Do-Si-Dos", "Zkittlez", "Amnesia Haze"],
    therapeuticBenefits: [
      "Anxiety relief",
      "Sleep aid",
      "Anti-convulsant",
      "Pain relief",
    ],
    description:
      "Best known as the dominant terpene in lavender, linalool brings powerful calming and anti-anxiety effects. It has been used in traditional medicine for centuries and is prized in indica strains for promoting deep relaxation.",
  },
  {
    name: "Pinene",
    slug: "pinene",
    aroma: "Pine, fresh forest, cedar, rosemary",
    color: "text-green-600 dark:text-green-400",
    colorBg: "bg-green-500/10 border-green-500/20",
    icon: "🌲",
    effects: ["Alert", "Focused", "Clear-headed", "Memory retention"],
    foundIn: ["Jack Herer", "Blue Dream", "Snoop's Dream", "Critical Mass"],
    therapeuticBenefits: [
      "Bronchodilator",
      "Anti-inflammatory",
      "Memory aid",
      "Alertness",
    ],
    description:
      "The most common terpene in nature, pinene gives pine trees their signature scent. In cannabis, it may counteract some of THC's short-term memory impairment and acts as a natural bronchodilator, opening airways.",
  },
  {
    name: "Humulene",
    slug: "humulene",
    aroma: "Hoppy, earthy, woody, subtle spice",
    color: "text-emerald-700 dark:text-emerald-400",
    colorBg: "bg-emerald-500/10 border-emerald-500/20",
    icon: "🍺",
    effects: ["Appetite suppression", "Calming", "Grounding"],
    foundIn: [
      "White Widow",
      "Headband",
      "Death Star",
      "Sour Diesel",
    ],
    therapeuticBenefits: [
      "Anti-inflammatory",
      "Appetite suppressant",
      "Antibacterial",
      "Pain relief",
    ],
    description:
      "Also found abundantly in hops (giving beer its hoppy aroma), humulene is notable for its appetite-suppressing qualities — unusual for cannabis. It works synergistically with caryophyllene for enhanced anti-inflammatory effects.",
  },
  {
    name: "Terpinolene",
    slug: "terpinolene",
    aroma: "Herbal, floral, piney, slightly citrus",
    color: "text-teal-600 dark:text-teal-400",
    colorBg: "bg-teal-500/10 border-teal-500/20",
    icon: "🌿",
    effects: ["Uplifting", "Creative", "Mildly sedating at high doses"],
    foundIn: ["Jack Herer", "Dutch Treat", "Ghost Train Haze", "XJ-13"],
    therapeuticBenefits: [
      "Antioxidant",
      "Antibacterial",
      "Anti-fungal",
      "Mild sedative",
    ],
    description:
      "Found in only about 10% of cannabis strains, terpinolene is the least common major terpene but delivers a complex, multi-layered aroma. Strains dominant in terpinolene tend to be uplifting sativas prized for creative activities.",
  },
  {
    name: "Ocimene",
    slug: "ocimene",
    aroma: "Sweet, herbal, woody, tropical",
    color: "text-lime-600 dark:text-lime-400",
    colorBg: "bg-lime-500/10 border-lime-500/20",
    icon: "🌺",
    effects: ["Uplifting", "Energizing", "Decongestant"],
    foundIn: ["Clementine", "Dutch Treat", "Amnesia", "Golden Goat"],
    therapeuticBenefits: [
      "Anti-viral",
      "Anti-fungal",
      "Decongestant",
      "Anti-inflammatory",
    ],
    description:
      "Ocimene is found in many plants including mint, parsley, orchids, and mangoes. In cannabis, it contributes sweet, herbaceous notes and is valued for its potential anti-viral and decongestant properties.",
  },
  {
    name: "Bisabolol",
    slug: "bisabolol",
    aroma: "Floral, sweet, delicate chamomile",
    color: "text-pink-600 dark:text-pink-400",
    colorBg: "bg-pink-500/10 border-pink-500/20",
    icon: "🌼",
    effects: ["Soothing", "Gentle relaxation", "Calming"],
    foundIn: ["ACDC", "Harle-Tsu", "Pink Kush", "Headband"],
    therapeuticBenefits: [
      "Anti-irritant",
      "Anti-inflammatory",
      "Antimicrobial",
      "Skin healing",
    ],
    description:
      "The primary terpene in chamomile, bisabolol is prized for its gentle, soothing properties. It is widely used in skincare and cosmetics for its anti-irritant effects, and in cannabis it enhances relaxation without heavy sedation.",
  },
  {
    name: "Valencene",
    slug: "valencene",
    aroma: "Sweet citrus, fresh Valencia oranges, grapefruit",
    color: "text-orange-500 dark:text-orange-300",
    colorBg: "bg-orange-400/10 border-orange-400/20",
    icon: "🍊",
    effects: ["Uplifting", "Alert", "Mood-enhancing"],
    foundIn: ["Tangie", "Agent Orange", "Clementine", "ACDC"],
    therapeuticBenefits: [
      "Anti-inflammatory",
      "Insect repellent",
      "Anti-allergic",
      "Skin protectant",
    ],
    description:
      "Named after Valencia oranges where it is most abundant, valencene delivers a bright, sweet citrus aroma. It is relatively rare in cannabis but highly sought after for its uplifting effects and potential anti-allergic properties.",
  },
];

// ─── FAQ Accordion Component ────────────────────────────────────────

function FaqAccordion({
  item,
}: {
  item: { question: string; answer: string };
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm font-medium text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors pr-4">
          {item.question}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground/60 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted-foreground leading-relaxed pr-8">
          {item.answer}
        </div>
      )}
    </div>
  );
}

// ─── Main Client Component ──────────────────────────────────────────

export default function TerpeneGuideClient({
  faqItems,
}: {
  faqItems: { question: string; answer: string }[];
}) {
  const [search, setSearch] = useState("");
  const [selectedEffect, setSelectedEffect] = useState<string>("all");

  // Collect unique effects for filter
  const allEffects = Array.from(
    new Set(TERPENES.flatMap((t) => t.effects))
  ).sort();

  // Filter terpenes
  const filtered = TERPENES.filter((t) => {
    const matchesSearch =
      search === "" ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.aroma.toLowerCase().includes(search.toLowerCase()) ||
      t.effects.some((e) =>
        e.toLowerCase().includes(search.toLowerCase())
      ) ||
      t.foundIn.some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      ) ||
      t.therapeuticBenefits.some((b) =>
        b.toLowerCase().includes(search.toLowerCase())
      );

    const matchesEffect =
      selectedEffect === "all" ||
      t.effects.some(
        (e) => e.toLowerCase() === selectedEffect.toLowerCase()
      );

    return matchesSearch && matchesEffect;
  });

  return (
    <main className="min-h-screen bg-background">
      {/* ─── Breadcrumbs ──────────────────────────────────────── */}
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2"
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center gap-2 text-xs text-muted-foreground">
          <li>
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
            >
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium">Terpene Guide</li>
        </ol>
      </nav>

      {/* ─── Hero / Intro Section ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-green-500/10">
              <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
              Cannabis Education
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            Cannabis Terpene Guide
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Terpenes are aromatic compounds produced by the cannabis plant that
            shape each strain&apos;s unique aroma, flavor, and effects. They
            work synergistically with cannabinoids like THC and CBD through the{" "}
            <strong className="text-foreground">entourage effect</strong>,
            meaning the terpene profile of a strain can be just as important as
            its THC percentage.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Understanding terpenes helps you choose strains that match your
            desired experience — whether that&apos;s deep relaxation, creative
            energy, pain relief, or focused productivity. Below you&apos;ll find
            the 10 most important cannabis terpenes with their aromas, effects,
            common strains, and therapeutic benefits.
          </p>
        </div>
      </section>

      {/* ─── Search & Filter ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search terpenes, effects, strains..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all"
            />
          </div>

          {/* Effect Filter */}
          <select
            value={selectedEffect}
            onChange={(e) => setSelectedEffect(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all cursor-pointer"
          >
            <option value="all">All Effects</option>
            {allEffects.map((effect) => (
              <option key={effect} value={effect}>
                {effect}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
            No terpenes match your search. Try a different term.
          </p>
        )}
      </section>

      {/* ─── Terpene Cards Grid ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((terpene) => (
            <article
              key={terpene.slug}
              className={`rounded-2xl bg-card shadow-md hover:shadow-lg transition-shadow p-6 border ${terpene.colorBg}`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl" role="img" aria-label={terpene.name}>
                  {terpene.icon}
                </span>
                <h2
                  className={`text-xl font-bold ${terpene.color}`}
                >
                  {terpene.name}
                </h2>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {terpene.description}
              </p>

              {/* Aroma */}
              <div className="mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Aroma
                </h3>
                <p className="text-sm text-foreground">{terpene.aroma}</p>
              </div>

              {/* Effects */}
              <div className="mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Effects
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {terpene.effects.map((effect) => (
                    <span
                      key={effect}
                      className="px-2.5 py-1 rounded-full bg-background text-xs font-medium text-foreground"
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              </div>

              {/* Found In */}
              <div className="mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Found In
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {terpene.foundIn.map((strain) => (
                    <span
                      key={strain}
                      className="px-2.5 py-1 rounded-full bg-green-500/10 text-xs font-medium text-green-700 dark:text-green-400"
                    >
                      {strain}
                    </span>
                  ))}
                </div>
              </div>

              {/* Therapeutic Benefits */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Therapeutic Benefits
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {terpene.therapeuticBenefits.map((benefit) => (
                    <span
                      key={benefit}
                      className="px-2.5 py-1 rounded-full bg-purple-500/10 text-xs font-medium text-purple-700 dark:text-purple-400"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── Shop CTA ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 p-8 sm:p-12 text-white text-center shadow-lg">
          <Sparkles className="h-8 w-8 mx-auto mb-4 text-green-200" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Shop by Terpene Profile
          </h2>
          <p className="text-green-100 max-w-xl mx-auto mb-6">
            Now that you know your terpenes, explore our curated selection of
            lab-tested cannabis products. Filter by strain type to find your
            perfect terpene match.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/shop?category=flower"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-green-700 font-semibold text-sm hover:bg-green-50 transition-colors shadow-md"
            >
              Shop Flower <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop?category=concentrates"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/15 backdrop-blur text-white font-semibold text-sm hover:bg-white/25 transition-colors"
            >
              Shop Concentrates <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop?category=vapes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/15 backdrop-blur text-white font-semibold text-sm hover:bg-white/25 transition-colors"
            >
              Shop Vapes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ──────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h2 className="text-2xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="rounded-2xl bg-card shadow-md p-6">
          {faqItems.map((item, i) => (
            <FaqAccordion key={i} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
