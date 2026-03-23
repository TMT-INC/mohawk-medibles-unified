"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Calculator,
  ShieldAlert,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Timer,
  AlertTriangle,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

type ExperienceLevel = "beginner" | "intermediate" | "experienced";
type DesiredEffect = "mild" | "moderate" | "strong";

interface DoseResult {
  minMg: number;
  maxMg: number;
  label: string;
  description: string;
  color: string;
}

// ─── Dosing Logic ───────────────────────────────────────────────────

function calculateDose(
  experience: ExperienceLevel,
  effect: DesiredEffect,
  weightLbs: number | null
): DoseResult {
  // Base dose matrix [experience][effect]
  const matrix: Record<ExperienceLevel, Record<DesiredEffect, DoseResult>> = {
    beginner: {
      mild: {
        minMg: 1,
        maxMg: 2.5,
        label: "Microdose",
        description:
          "Subtle relief with minimal psychoactive effects. Great for your first time or daily functional use. You may feel mild relaxation or mood improvement.",
        color: "text-green-600 dark:text-green-400",
      },
      moderate: {
        minMg: 2.5,
        maxMg: 5,
        label: "Low Dose",
        description:
          "A gentle introduction to edibles. Expect mild euphoria, light relaxation, and some anxiety relief. Effects are noticeable but manageable.",
        color: "text-emerald-600 dark:text-emerald-400",
      },
      strong: {
        minMg: 5,
        maxMg: 10,
        label: "Standard Dose",
        description:
          "This is a significant dose for a beginner. Expect noticeable euphoria, altered perception, and strong relaxation. Only try this if lower doses had minimal effect. Wait 2+ hours before redosing.",
        color: "text-yellow-600 dark:text-yellow-400",
      },
    },
    intermediate: {
      mild: {
        minMg: 5,
        maxMg: 10,
        label: "Standard Dose",
        description:
          "A comfortable dose for those with some experience. Reliable euphoria, good relaxation, and noticeable stress relief without being overwhelming.",
        color: "text-emerald-600 dark:text-emerald-400",
      },
      moderate: {
        minMg: 10,
        maxMg: 20,
        label: "Elevated Dose",
        description:
          "Strong effects with pronounced euphoria, deep relaxation, and altered perception. Good for experienced users seeking a more impactful session. Not recommended if you have responsibilities.",
        color: "text-yellow-600 dark:text-yellow-400",
      },
      strong: {
        minMg: 20,
        maxMg: 30,
        label: "High Dose",
        description:
          "Very strong effects. Intense euphoria, significant psychoactive experience, potential couch-lock. Make sure you have a safe, comfortable setting and no plans.",
        color: "text-orange-600 dark:text-orange-400",
      },
    },
    experienced: {
      mild: {
        minMg: 10,
        maxMg: 15,
        label: "Standard Dose",
        description:
          "A moderate session for experienced users. Reliable effects without going overboard. Good for social situations or relaxed evenings.",
        color: "text-emerald-600 dark:text-emerald-400",
      },
      moderate: {
        minMg: 15,
        maxMg: 30,
        label: "Strong Dose",
        description:
          "Pronounced effects with deep relaxation and strong euphoria. A solid session for regular consumers with established tolerance.",
        color: "text-yellow-600 dark:text-yellow-400",
      },
      strong: {
        minMg: 30,
        maxMg: 50,
        label: "Very High Dose",
        description:
          "Intense, long-lasting psychoactive experience. Only for those with significant tolerance. Effects may last 8-12+ hours. Ensure a safe setting.",
        color: "text-red-600 dark:text-red-400",
      },
    },
  };

  const result = { ...matrix[experience][effect] };

  // Subtle weight adjustment (minor influence)
  if (weightLbs && weightLbs > 220) {
    result.minMg = Math.round(result.minMg * 1.15);
    result.maxMg = Math.round(result.maxMg * 1.15);
  } else if (weightLbs && weightLbs < 130) {
    result.minMg = Math.round(result.minMg * 0.85);
    result.maxMg = Math.round(result.maxMg * 0.85);
  }

  // Floor of 1mg
  if (result.minMg < 1) result.minMg = 1;

  return result;
}

// ─── Dose Chart Data ────────────────────────────────────────────────

const DOSE_CHART = [
  {
    range: "1 - 2.5 mg",
    label: "Microdose",
    who: "First-time users, microdosers",
    effects: "Subtle mood lift, mild anxiety relief, slight focus enhancement",
    color: "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400",
  },
  {
    range: "2.5 - 5 mg",
    label: "Beginner",
    who: "New users, low tolerance",
    effects: "Mild euphoria, light relaxation, gentle stress relief",
    color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  },
  {
    range: "5 - 15 mg",
    label: "Intermediate",
    who: "Casual users, some tolerance",
    effects: "Noticeable euphoria, deep relaxation, altered perception, pain relief",
    color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  },
  {
    range: "15 - 30 mg",
    label: "Experienced",
    who: "Regular consumers, higher tolerance",
    effects: "Strong euphoria, significant psychoactive effects, potential couch-lock",
    color: "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400",
  },
  {
    range: "30 - 50 mg",
    label: "High Tolerance",
    who: "Daily users, medical patients",
    effects: "Very strong effects, intense body high, long duration (8-12h)",
    color: "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400",
  },
  {
    range: "50+ mg",
    label: "Very High Tolerance",
    who: "Experienced daily users only",
    effects: "Extremely potent, overwhelming for most. Potential nausea, anxiety if underdosed on tolerance",
    color: "bg-red-600/10 border-red-600/20 text-red-800 dark:text-red-300",
  },
];

// ─── FAQ Accordion ──────────────────────────────────────────────────

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

export default function DosingGuideClient({
  faqItems,
}: {
  faqItems: { question: string; answer: string }[];
}) {
  const [experience, setExperience] = useState<ExperienceLevel>("beginner");
  const [effect, setEffect] = useState<DesiredEffect>("mild");
  const [weight, setWeight] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const weightNum = weight ? parseInt(weight, 10) : null;
  const result = calculateDose(experience, effect, weightNum);

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
          <li className="text-foreground font-medium">Dosing Guide</li>
        </ol>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-green-500/10">
              <Calculator className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
              Cannabis Education
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            Edible Dosing Guide &amp; Calculator
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Finding the right edible dose is essential for a safe, enjoyable
            experience. Unlike smoking or vaping, edibles are processed through
            your digestive system and liver, producing stronger, longer-lasting
            effects that can take up to 2 hours to kick in.
          </p>

          {/* Start Low Go Slow Banner */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 mt-6">
            <Timer className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-foreground mb-1 text-base">
                The Golden Rule: Start Low, Go Slow
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Always begin with the lowest recommended dose, especially if
                you&apos;re new to edibles. Wait at least <strong className="text-foreground">2 full hours</strong> before
                considering a second dose. Edibles can take much longer to kick
                in than you expect, and taking more too soon is the most common
                mistake.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Calculator ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
            Dosing Calculator
          </h2>

          <div className="rounded-2xl bg-card shadow-md p-6 sm:p-8 space-y-6">
            {/* Experience Level */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                1. What is your experience level?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { value: "beginner", label: "Beginner", desc: "New to edibles" },
                    { value: "intermediate", label: "Intermediate", desc: "Tried a few times" },
                    { value: "experienced", label: "Experienced", desc: "Regular user" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setExperience(opt.value);
                      setShowResult(false);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      experience === opt.value
                        ? "border-green-500 bg-green-500/10 shadow-sm"
                        : "border-border bg-background hover:border-green-500/40"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-foreground">
                      {opt.label}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Desired Effect */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                2. What effect are you looking for?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { value: "mild", label: "Mild", desc: "Relaxation & calm" },
                    { value: "moderate", label: "Moderate", desc: "Noticeable euphoria" },
                    { value: "strong", label: "Strong", desc: "Intense experience" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setEffect(opt.value);
                      setShowResult(false);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      effect === opt.value
                        ? "border-green-500 bg-green-500/10 shadow-sm"
                        : "border-border bg-background hover:border-green-500/40"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-foreground">
                      {opt.label}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Body Weight (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                3. Body weight in lbs{" "}
                <span className="font-normal text-muted-foreground">
                  (optional — minor adjustment)
                </span>
              </label>
              <input
                type="number"
                placeholder="e.g., 160"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  setShowResult(false);
                }}
                min={80}
                max={400}
                className="w-full max-w-[200px] px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all"
              />
            </div>

            {/* Calculate Button */}
            <button
              onClick={() => setShowResult(true)}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors shadow-md"
            >
              Calculate My Dose
            </button>

            {/* Result */}
            {showResult && (
              <div className="rounded-2xl bg-gradient-to-br from-green-500/5 to-emerald-500/10 border border-green-500/20 p-6 animate-in fade-in duration-300">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    Recommended Dose
                  </p>
                  <p className={`text-4xl font-bold ${result.color}`}>
                    {result.minMg} - {result.maxMg} mg
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {result.label}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed text-center max-w-lg mx-auto">
                  {result.description}
                </p>
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-700 dark:text-amber-400 text-center font-medium">
                    Always wait at least 2 hours before taking more. Individual
                    results vary — this is a general guideline, not medical
                    advice.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Dose Chart ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Complete Dosing Chart
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOSE_CHART.map((tier) => (
            <div
              key={tier.label}
              className={`rounded-2xl p-5 border shadow-sm ${tier.color}`}
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-lg font-bold">{tier.range}</span>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  {tier.label}
                </span>
              </div>
              <p className="text-xs font-medium mb-2 opacity-70">
                {tier.who}
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {tier.effects}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Safety Information ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-2xl bg-red-500/5 border border-red-500/15 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-bold text-foreground">
              Safety Information
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Wait Before Redosing",
                text: "Edibles take 30 min to 2 hours to kick in. The #1 mistake is taking more too soon. Wait at least 2 full hours.",
              },
              {
                title: "Never Drive Impaired",
                text: "Cannabis impairs reaction time and judgment. Never drive or operate machinery after consuming edibles. Effects can last 8+ hours.",
              },
              {
                title: "Store Safely",
                text: "Keep all edibles in child-resistant packaging, away from children and pets. Many edibles look like regular candy or treats.",
              },
              {
                title: "Check Medications",
                text: "Cannabis can interact with certain medications, especially blood thinners and anti-anxiety drugs. Consult your doctor if you take prescription medications.",
              },
              {
                title: "Know Your Product",
                text: "Only consume edibles with clear labeling showing THC content in mg. At Mohawk Medibles, all products are lab-tested with accurate dosing.",
              },
              {
                title: "Set & Setting",
                text: "Especially for new users: consume in a comfortable, familiar environment with people you trust. Have water, snacks, and entertainment ready.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tips for First-Time Users ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <h2 className="text-2xl font-bold text-foreground">
            Tips for First-Time Edible Users
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              tip: "Start with 2.5mg or less",
              detail:
                "Your first edible should be a half or quarter dose. You can always take more next time, but you can't take less once it's consumed.",
            },
            {
              tip: "Eat a light meal first",
              detail:
                "Having some food in your stomach leads to a more gradual, predictable onset. Avoid taking edibles on a completely empty stomach.",
            },
            {
              tip: "Clear your schedule",
              detail:
                "Your first edible experience should be on a day with no responsibilities. Effects can last 6-8 hours and may be stronger than expected.",
            },
            {
              tip: "Have a buddy",
              detail:
                "Having a trusted friend present (ideally someone experienced with edibles) can make your first experience more comfortable and enjoyable.",
            },
            {
              tip: "Keep CBD nearby",
              detail:
                "CBD can help counteract THC effects if you feel uncomfortable. Having a CBD product on hand provides peace of mind.",
            },
            {
              tip: "Journal your experience",
              detail:
                "Note the product, dose, onset time, and effects. This helps you dial in your ideal dose for future sessions.",
            },
          ].map((item) => (
            <div
              key={item.tip}
              className="rounded-2xl bg-card shadow-sm p-5"
            >
              <h3 className="text-sm font-bold text-foreground mb-2">
                {item.tip}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Shop CTA ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 p-8 sm:p-12 text-white text-center shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Ready to Try Edibles?
          </h2>
          <p className="text-green-100 max-w-xl mx-auto mb-6">
            Browse our lab-tested edibles with accurate THC labeling. From
            microdose options to full-strength treats, find the perfect product
            for your experience level.
          </p>
          <Link
            href="/product-category/edibles"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-green-700 font-semibold text-sm hover:bg-green-50 transition-colors shadow-md"
          >
            Shop Edibles <ArrowRight className="h-4 w-4" />
          </Link>
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
