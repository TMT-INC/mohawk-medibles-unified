/**
 * Terms of Service — Mohawk Medibles
 */
import type { Metadata } from "next";
import TermsClient from "./TermsClient";

export const metadata: Metadata = {
    title: "Terms of Service | Mohawk Medibles — Online Cannabis Dispensary",
    description:
        "Terms and conditions for using Mohawk Medibles online cannabis dispensary. Age verification (19+), ordering, shipping, returns, and legal terms for Canadian customers.",
    keywords: [
        "mohawk medibles terms",
        "cannabis dispensary terms of service",
        "online dispensary terms canada",
        "cannabis ordering terms",
        "age verification cannabis",
    ],
    openGraph: {
        title: "Terms of Service | Mohawk Medibles",
        description: "Terms and conditions for ordering cannabis online. Age verification, shipping, and legal terms.",
        url: "https://mohawkmedibles.ca/terms",
        type: "website",
    },
    alternates: { canonical: "https://mohawkmedibles.ca/terms" },
};

export default function TermsOfService() {
    return <TermsClient />;
}
