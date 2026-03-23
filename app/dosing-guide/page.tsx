/**
 * /dosing-guide — Cannabis Edible Dosing Guide & Calculator
 * =============================================================================
 * Interactive dosing calculator with safety information, dose chart,
 * tips for first-time users, and FAQ with JSON-LD structured data.
 *
 * SEO Target: "edible dosing guide", "cannabis dosage calculator", "how much edible should I take"
 *
 * Server Component (RSC) — Next.js 16 App Router
 * Interactive calculator delegated to DosingGuideClient.
 */

import type { Metadata } from "next";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schemas";
import DosingGuideClient from "./DosingGuideClient";

// ─── Metadata ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Cannabis Edible Dosing Guide & Calculator | Mohawk Medibles",
  description:
    "Find your ideal cannabis edible dose with our interactive calculator. Dosing chart from microdose (1mg) to experienced (50mg+), safety tips, first-timer advice, and the golden rule: start low, go slow.",
  alternates: {
    canonical: "https://mohawkmedibles.ca/dosing-guide",
  },
  keywords: [
    "edible dosing guide",
    "cannabis dosage calculator",
    "how much edible should I take",
    "edible dose chart",
    "cannabis edible mg guide",
    "weed edible dosing",
    "THC dosage calculator",
    "microdosing cannabis",
    "edibles for beginners",
    "start low go slow cannabis",
    "edible dosage by weight",
    "cannabis edible first time",
    "how many mg edible beginner",
    "edible dosage chart canada",
  ],
  openGraph: {
    title: "Cannabis Edible Dosing Guide & Calculator | Mohawk Medibles",
    description:
      "Interactive edible dosing calculator with personalized recommendations based on experience level and desired effects. Plus safety tips and a complete dose chart.",
    url: "https://mohawkmedibles.ca/dosing-guide",
    type: "website",
    siteName: "Mohawk Medibles",
    images: [
      {
        url: "https://mohawkmedibles.ca/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cannabis Edible Dosing Guide — Mohawk Medibles",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cannabis Edible Dosing Guide & Calculator | Mohawk Medibles",
    description:
      "Find your ideal edible dose with our interactive calculator. Personalized recommendations, safety tips & complete dosing chart.",
    images: [
      {
        url: "https://mohawkmedibles.ca/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cannabis Edible Dosing Guide — Mohawk Medibles",
      },
    ],
  },
};

// ─── FAQ Data ────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: "How long do edibles take to kick in?",
    answer:
      "Cannabis edibles typically take 30 minutes to 2 hours to take effect, depending on your metabolism, whether you've eaten recently, and the type of edible. Sublingual products (tinctures, lozenges) can work in 15-30 minutes. Always wait at least 2 hours before taking more.",
  },
  {
    question: "How long do edible effects last?",
    answer:
      "Edible effects typically last 4-8 hours, with peak effects around 2-4 hours after consumption. Higher doses and individual metabolism can extend this to 12+ hours. Plan accordingly and avoid driving or operating machinery.",
  },
  {
    question: "What should I do if I took too much?",
    answer:
      "Stay calm — no one has ever fatally overdosed on cannabis. Find a comfortable, safe space. Drink water, eat a snack, and try to rest. Black pepper (chewing peppercorns) may help reduce anxiety due to its caryophyllene content. CBD can also help counteract THC effects. The feelings will pass within a few hours.",
  },
  {
    question: "Can I mix edibles with alcohol?",
    answer:
      "Mixing cannabis edibles with alcohol is not recommended, especially for beginners. Alcohol can increase THC absorption, leading to stronger and potentially uncomfortable effects. If you choose to combine them, significantly reduce your dose of both substances.",
  },
  {
    question: "Why do edibles feel stronger than smoking?",
    answer:
      "When you eat cannabis, THC is processed by your liver and converted into 11-hydroxy-THC, which is more potent and longer-lasting than inhaled THC. This is why edibles produce stronger, more body-centric effects and why proper dosing is so important.",
  },
  {
    question: "Does body weight affect edible dosing?",
    answer:
      "Body weight can have some influence on edible effects, but tolerance, metabolism, and individual endocannabinoid system differences play a bigger role. A 200lb person with no tolerance may still feel 5mg strongly, while a 130lb experienced user might need 20mg+. Always start low regardless of body weight.",
  },
  {
    question: "What is microdosing cannabis?",
    answer:
      "Microdosing involves taking very small amounts of THC (typically 1-2.5mg) to achieve subtle therapeutic benefits without significant psychoactive effects. Many people microdose for mild anxiety relief, creativity, focus, or pain management while remaining fully functional.",
  },
  {
    question: "Are edibles safe?",
    answer:
      "Cannabis edibles are generally safe for healthy adults when consumed responsibly. The main risks come from overconsumption (unpleasant but not dangerous) and impaired judgment. Keep edibles away from children and pets, start with low doses, and never drive after consuming. Consult your doctor if you take medications or have heart conditions.",
  },
];

// ─── Breadcrumb Data ────────────────────────────────────────────────

const BREADCRUMB_ITEMS = [
  { name: "Home", url: "https://mohawkmedibles.ca" },
  { name: "Dosing Guide", url: "https://mohawkmedibles.ca/dosing-guide" },
];

// ─── Page Component ─────────────────────────────────────────────────

export default function DosingGuidePage() {
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

      <DosingGuideClient faqItems={FAQ_ITEMS} />
    </>
  );
}
