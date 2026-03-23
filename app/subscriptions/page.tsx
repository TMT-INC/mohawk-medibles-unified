/**
 * Mohawk Monthly — Subscription Boxes
 * Server component: exports metadata. Client waitlist form below.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SubscriptionClientContent from "./SubscriptionClientContent";

export const metadata: Metadata = {
    title: "Mohawk Monthly Cannabis Subscription Box | Mohawk Medibles",
    description:
        "Subscribe to Mohawk Monthly — premium cannabis delivered to your door every month. Choose from 3 tiers: Seedling, Empire, or Sovereignty. Save 20-30% with exclusive drops, free shipping & cancel anytime.",
    keywords: [
        "cannabis subscription box canada",
        "monthly weed subscription",
        "mohawk monthly",
        "cannabis delivery subscription",
        "weed subscription box",
        "mohawk medibles subscription",
        "premium cannabis monthly box",
    ],
    openGraph: {
        title: "Mohawk Monthly — Premium Cannabis Delivered Monthly",
        description:
            "3 subscription tiers with curated flower, edibles, concentrates & exclusive merch. Save 20-30% vs retail. Free shipping always.",
        url: "https://mohawkmedibles.ca/subscriptions",
        type: "website",
        images: ["/og-image.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Mohawk Monthly Cannabis Subscription Box",
        description:
            "Premium cannabis delivered monthly. 3 tiers from $49/mo. Free shipping, cancel anytime.",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/subscriptions",
    },
};

const subscriptionSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://mohawkmedibles.ca/subscriptions/#webpage",
    name: "Mohawk Monthly Cannabis Subscription Box",
    description:
        "Subscribe to Mohawk Monthly — premium cannabis delivered to your door every month.",
    url: "https://mohawkmedibles.ca/subscriptions",
    isPartOf: { "@id": "https://mohawkmedibles.ca/#website" },
};

export default function SubscriptionsPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(subscriptionSchema) }}
            />

            <div className="min-h-screen page-glass pt-20">
                <div className="container mx-auto px-4 sm:px-6 py-8">
                    {/* Breadcrumbs */}
                    <nav
                        className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
                        aria-label="Breadcrumb"
                    >
                        <Link href="/" className="hover:text-forest transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-forest font-medium">Subscriptions</span>
                    </nav>

                    <SubscriptionClientContent />
                </div>
            </div>
        </>
    );
}
