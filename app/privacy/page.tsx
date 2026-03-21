/**
 * Privacy Policy — Mohawk Medibles
 * Required legal page for cannabis dispensary operations.
 */
import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

export const metadata: Metadata = {
    title: "Privacy Policy | Mohawk Medibles — PIPEDA Compliant",
    description:
        "How Mohawk Medibles collects, uses, and protects your personal information. PIPEDA compliant privacy practices for our online cannabis dispensary.",
    keywords: [
        "mohawk medibles privacy policy",
        "cannabis dispensary privacy",
        "PIPEDA compliant dispensary",
        "online dispensary data protection",
        "cannabis privacy canada",
    ],
    openGraph: {
        title: "Privacy Policy | Mohawk Medibles",
        description: "How we collect, use, and protect your personal information. PIPEDA compliant.",
        url: "https://mohawkmedibles.ca/privacy",
        type: "website",
    },
    alternates: { canonical: "https://mohawkmedibles.ca/privacy" },
};

export default function PrivacyPolicy() {
    return <PrivacyClient />;
}
