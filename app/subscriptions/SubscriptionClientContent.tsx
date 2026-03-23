"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Package, Leaf, Crown, Sparkles,
    Truck, Tag, CalendarX, Gift,
    ChevronDown, Send, CheckCircle, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ── Tier Data ──────────────────────────────────────────────── */

const tiers = [
    {
        name: "Seedling Box",
        price: 49,
        icon: Leaf,
        accent: "from-green-500 to-emerald-600",
        accentBg: "bg-green-500/10",
        accentText: "text-green-500",
        accentBorder: "border-green-500/30",
        items: [
            "3.5g premium flower",
            "2 edibles (assorted)",
            "1 surprise bonus item",
            "Strain info card",
        ],
        description: "Perfect for casual consumers looking to explore new strains each month.",
    },
    {
        name: "Empire Box",
        price: 99,
        icon: Package,
        accent: "from-lime to-forest",
        accentBg: "bg-lime/10",
        accentText: "text-lime",
        accentBorder: "border-lime/30",
        popular: true,
        items: [
            "7g premium flower (2 strains)",
            "4 edibles (assorted)",
            "Concentrate sample (0.5g)",
            "Exclusive Mohawk merch item",
            "Terpene profile card",
            "Priority customer support",
        ],
        description: "Our most popular tier. Curated premium selection with exclusive merch drops.",
    },
    {
        name: "Sovereignty Box",
        price: 149,
        icon: Crown,
        accent: "from-amber-500 to-yellow-600",
        accentBg: "bg-amber-500/10",
        accentText: "text-amber-500",
        accentBorder: "border-amber-500/30",
        items: [
            "14g top-shelf flower (3+ strains)",
            "6 edibles (premium selection)",
            "1g concentrate",
            "Pre-roll variety pack",
            "Exclusive VIP merch",
            "Early access to new drops",
            "VIP loyalty point multiplier (2x)",
            "Personal concierge support",
        ],
        description: "The ultimate cannabis experience. VIP treatment with the best we have to offer.",
    },
];

const benefits = [
    {
        icon: Tag,
        title: "Save 20-30%",
        description: "Every box is valued well above retail price. Guaranteed savings on every delivery.",
    },
    {
        icon: Gift,
        title: "Exclusive Drops",
        description: "Access strains, products, and merch you won't find anywhere else. Subscriber-only exclusives.",
    },
    {
        icon: Truck,
        title: "Free Shipping Always",
        description: "Every subscription box ships free across Canada. No minimum, no exceptions.",
    },
    {
        icon: CalendarX,
        title: "Cancel Anytime",
        description: "No contracts, no commitments. Pause or cancel your subscription whenever you want.",
    },
];

const faqs = [
    {
        question: "How does Mohawk Monthly work?",
        answer:
            "Choose your tier, join the waitlist, and once we launch you'll receive a curated box of premium cannabis products delivered to your door every month. Each box is hand-picked by our team to include the best strains, edibles, and extras.",
    },
    {
        question: "When will subscriptions launch?",
        answer:
            "We're currently building the Mohawk Monthly experience and taking waitlist signups. Join the waitlist to be the first to know when we go live — early subscribers get exclusive launch pricing.",
    },
    {
        question: "Can I customize my box?",
        answer:
            "At launch, boxes are curated by our team for the best experience. We'll offer customization options (strain preferences, edible types, indica/sativa/hybrid) shortly after launch.",
    },
    {
        question: "Where do you ship?",
        answer:
            "Mohawk Monthly ships Canada-wide. All subscription boxes include free shipping with discreet packaging and tracking.",
    },
    {
        question: "What if I want to skip a month or cancel?",
        answer:
            "No problem! You can pause, skip, or cancel your subscription at any time from your account dashboard. No cancellation fees, no questions asked.",
    },
];

/* ── Component ──────────────────────────────────────────────── */

export default function SubscriptionClientContent() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [pending, setPending] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    async function handleWaitlist(e: React.FormEvent) {
        e.preventDefault();
        if (!email.includes("@")) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setPending(true);
        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, source: "subscription_waitlist" }),
            });
            const data = await res.json();
            if (res.ok) {
                setSubmitted(true);
                toast.success(data.message || "You're on the list!");
            } else {
                toast.error(data.error || "Something went wrong. Try again.");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setPending(false);
        }
    }

    return (
        <>
            {/* ── Hero ──────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime/10 text-lime text-sm font-medium mb-6">
                    <Sparkles className="h-4 w-4" />
                    Coming Soon
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-forest dark:text-cream mb-4">
                    Mohawk Monthly
                </h1>
                <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-2">
                    Premium Cannabis Delivered Monthly
                </p>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Curated boxes of top-shelf flower, edibles, concentrates & exclusive merch
                    — delivered right to your door across Canada.
                </p>
            </motion.div>

            {/* ── Tier Cards ────────────────────────────────── */}
            <div className="grid md:grid-cols-3 gap-6 mb-20">
                {tiers.map((tier, i) => {
                    const Icon = tier.icon;
                    return (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (i + 1) }}
                            className={`relative rounded-2xl bg-card p-6 flex flex-col shadow-lg ${
                                tier.popular ? "ring-2 ring-lime" : ""
                            }`}
                        >
                            {tier.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-lime text-forest text-xs font-bold uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-xl ${tier.accentBg} flex items-center justify-center mb-4`}>
                                <Icon className={`w-6 h-6 ${tier.accentText}`} />
                            </div>

                            <h2 className="text-xl font-bold text-forest dark:text-cream mb-1">
                                {tier.name}
                            </h2>
                            <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-3xl font-bold text-forest dark:text-cream">
                                    ${tier.price}
                                </span>
                                <span className="text-muted-foreground text-sm">/month</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-5">
                                {tier.description}
                            </p>

                            <ul className="space-y-2.5 mb-6 flex-1">
                                {tier.items.map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-sm">
                                        <CheckCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${tier.accentText}`} />
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant="outline"
                                className={`w-full ${tier.accentBorder} hover:${tier.accentBg}`}
                                disabled
                            >
                                Coming Soon
                            </Button>
                        </motion.div>
                    );
                })}
            </div>

            {/* ── Why Subscribe? ────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mb-20"
            >
                <h2 className="text-3xl font-bold text-forest dark:text-cream text-center mb-10">
                    Why Subscribe?
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((b, i) => {
                        const Icon = b.icon;
                        return (
                            <motion.div
                                key={b.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 * i }}
                                className="rounded-xl bg-card p-6 shadow-lg text-center"
                            >
                                <div className="w-12 h-12 rounded-full bg-lime/10 flex items-center justify-center mx-auto mb-4">
                                    <Icon className="w-6 h-6 text-lime" />
                                </div>
                                <h3 className="font-bold text-forest dark:text-cream mb-2">
                                    {b.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">{b.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ── FAQ Section ───────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mb-20 max-w-3xl mx-auto"
            >
                <h2 className="text-3xl font-bold text-forest dark:text-cream text-center mb-10">
                    Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="rounded-xl bg-card shadow-lg overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
                            >
                                <span className="font-medium text-forest dark:text-cream pr-4">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${
                                        openFaq === i ? "rotate-180" : ""
                                    }`}
                                />
                            </button>
                            {openFaq === i && (
                                <div className="px-5 pb-5">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── Waitlist Signup ────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-xl mx-auto mb-16 text-center"
            >
                <div className="rounded-2xl bg-card p-8 shadow-lg">
                    <div className="w-14 h-14 rounded-full bg-lime/10 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-7 h-7 text-lime" />
                    </div>
                    <h2 className="text-2xl font-bold text-forest dark:text-cream mb-2">
                        Join the Waitlist
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Be the first to know when Mohawk Monthly launches.
                        Early subscribers get exclusive pricing.
                    </p>

                    {submitted ? (
                        <div className="flex items-center justify-center gap-2 text-lime font-medium py-3">
                            <CheckCircle className="h-5 w-5" />
                            You&apos;re on the list! We&apos;ll be in touch soon.
                        </div>
                    ) : (
                        <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                required
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-lime/50"
                            />
                            <Button
                                type="submit"
                                variant="brand"
                                className="gap-2 px-6"
                                disabled={pending}
                            >
                                <Send className="h-4 w-4" />
                                {pending ? "Joining..." : "Join Waitlist"}
                            </Button>
                        </form>
                    )}
                </div>
            </motion.div>
        </>
    );
}
