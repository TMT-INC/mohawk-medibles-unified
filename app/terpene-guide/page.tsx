/**
 * /terpene-guide — Cannabis Terpene Library
 * =============================================================================
 * Comprehensive, SEO-optimized guide to the 10 major cannabis terpenes.
 * Each terpene card displays aroma, effects, strains, and therapeutic benefits.
 *
 * SEO Target: "cannabis terpenes guide", "terpene effects", "terpene benefits"
 *
 * Server Component (RSC) — Next.js 16 App Router
 * Interactive filtering delegated to TerpeneGuideClient.
 */

import type { Metadata } from "next";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schemas";
import TerpeneGuideClient from "./TerpeneGuideClient";

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:
    "Cannabis Terpene Guide — Effects, Flavors & Benefits | Mohawk Medibles",
  description:
    "Explore the 10 most important cannabis terpenes — myrcene, limonene, caryophyllene, linalool, pinene & more. Learn their aromas, effects, therapeutic benefits, and which strains contain them.",
  alternates: {
    canonical: "https://mohawkmedibles.ca/terpene-guide",
  },
  keywords: [
    "cannabis terpenes",
    "terpene guide",
    "terpene effects",
    "myrcene effects",
    "limonene cannabis",
    "caryophyllene benefits",
    "linalool terpene",
    "pinene cannabis",
    "cannabis terpene chart",
    "terpene profiles weed",
    "what are terpenes",
    "terpene benefits",
    "cannabis flavors",
    "weed terpenes canada",
  ],
  openGraph: {
    title:
      "Cannabis Terpene Guide — Effects, Flavors & Benefits | Mohawk Medibles",
    description:
      "The complete guide to cannabis terpenes. Learn which terpenes create specific effects and how to choose strains by their terpene profile.",
    url: "https://mohawkmedibles.ca/terpene-guide",
    type: "website",
    siteName: "Mohawk Medibles",
    images: [
      {
        url: "https://mohawkmedibles.ca/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cannabis Terpene Guide — Mohawk Medibles",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Cannabis Terpene Guide — Effects, Flavors & Benefits | Mohawk Medibles",
    description:
      "Explore 10 major cannabis terpenes — aromas, effects, therapeutic benefits & which strains contain them.",
    images: [
      {
        url: "https://mohawkmedibles.ca/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cannabis Terpene Guide — Mohawk Medibles",
      },
    ],
  },
};

// ─── FAQ Data ────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: "What are terpenes in cannabis?",
    answer:
      "Terpenes are aromatic compounds produced by the cannabis plant (and many other plants) that give each strain its unique smell and flavor. They also interact with cannabinoids like THC and CBD to influence the overall effects — a phenomenon known as the entourage effect.",
  },
  {
    question: "Do terpenes get you high?",
    answer:
      "Terpenes alone are not intoxicating. However, they modulate the cannabis experience by influencing how cannabinoids interact with your endocannabinoid system. For example, myrcene may enhance THC absorption, while limonene may promote an uplifting mood.",
  },
  {
    question: "What is the entourage effect?",
    answer:
      "The entourage effect is the theory that cannabis compounds — cannabinoids, terpenes, and flavonoids — work synergistically to produce effects that are greater than any single compound alone. This is why full-spectrum products often feel different than pure THC isolates.",
  },
  {
    question: "Which terpene is best for relaxation?",
    answer:
      "Myrcene and linalool are the two terpenes most associated with relaxation and sedation. Myrcene is found in indica-dominant strains like Granddaddy Purple and Blue Dream, while linalool (also found in lavender) promotes calm and stress relief.",
  },
  {
    question: "Which terpene is best for energy and focus?",
    answer:
      "Limonene, pinene, and terpinolene are typically associated with uplifting, energizing effects. Strains high in these terpenes — like Super Lemon Haze, Jack Herer, and Dutch Treat — are popular daytime choices.",
  },
  {
    question: "How do I choose a strain based on terpenes?",
    answer:
      "Look for lab-tested products that list terpene profiles. If you want relaxation, look for high myrcene or linalool. For energy, seek limonene or pinene. For pain relief, caryophyllene is a great choice. At Mohawk Medibles, many of our products include detailed terpene information.",
  },
  {
    question: "Can terpenes be used for aromatherapy?",
    answer:
      "Yes! Many cannabis terpenes are the same compounds used in aromatherapy. Linalool is the primary terpene in lavender, limonene is found in citrus peels, and pinene is abundant in pine trees. These terpenes have been used therapeutically for centuries.",
  },
  {
    question: "Do edibles contain terpenes?",
    answer:
      "Most standard edibles lose their terpenes during the cooking/extraction process. However, some premium edibles are made with full-spectrum extracts or have terpenes reintroduced to preserve the entourage effect. Check the product description for details.",
  },
];

// ─── Breadcrumb Data ────────────────────────────────────────────────

const BREADCRUMB_ITEMS = [
  { name: "Home", url: "https://mohawkmedibles.ca" },
  { name: "Terpene Guide", url: "https://mohawkmedibles.ca/terpene-guide" },
];

// ─── Page Component ─────────────────────────────────────────────────

export default function TerpeneGuidePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(BREADCRUMB_ITEMS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(FAQ_ITEMS)),
        }}
      />

      <TerpeneGuideClient faqItems={FAQ_ITEMS} />
    </>
  );
}
