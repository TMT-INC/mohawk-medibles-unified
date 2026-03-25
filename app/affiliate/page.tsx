/**
 * Affiliate Program — Mohawk Medibles
 * Server component: exports metadata. Client content in AffiliateClientContent.
 */
import type { Metadata } from "next";
import AffiliateClientContent from "./AffiliateClientContent";

export const metadata: Metadata = {
    title: "Affiliate Program — Earn 10% Commission",
    description:
        "Join the Mohawk Medibles Affiliate Program and earn 10% commission on every sale. 30-day cookie window, real-time tracking, and monthly payouts via e-Transfer or crypto.",
    keywords: [
        "mohawk medibles affiliate program",
        "cannabis affiliate program canada",
        "earn money selling cannabis",
        "cannabis referral program",
        "indigenous cannabis affiliate",
        "weed affiliate program",
    ],
    openGraph: {
        title: "Affiliate Program — Earn 10% Commission",
        description:
            "Join our affiliate program and earn 10% on every sale you refer. 30-day cookie, real-time dashboard, monthly payouts.",
        url: "https://mohawkmedibles.ca/affiliate",
        type: "website",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/affiliate",
    },
};

export default function AffiliatePage() {
    return <AffiliateClientContent />;
}
