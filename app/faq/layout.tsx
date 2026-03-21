import { Metadata } from "next";
import { faqSchema, breadcrumbSchema } from "@/lib/seo/schemas";

// FAQ data matching the client component's FAQ_DATA — all static trusted content
const FAQ_ITEMS = [
    { question: "How do I place an order?", answer: "Browse our shop, add items to your cart, and proceed to checkout. We accept Visa, Mastercard, Interac e-Transfer, and Bitcoin. All orders are processed securely through our payment gateway." },
    { question: "Is there a minimum order amount?", answer: "No minimum order required! However, orders over $199 CAD qualify for FREE shipping Canada-wide." },
    { question: "Where do you ship?", answer: "We ship Canada-wide to all 13 provinces and territories via Canada Post Xpresspost. Local delivery is available for Hamilton, Brantford, and the Six Nations area." },
    { question: "How long does shipping take?", answer: "Local delivery: Same day or next day. Ontario: 1-3 business days. Quebec/Maritimes: 2-4 business days. Western Canada: 3-5 business days. Northern Canada: 5-10 business days." },
    { question: "Is the packaging discreet?", answer: "Absolutely. All orders ship in plain, unbranded boxes with no indication of contents. The return address shows a generic business name. Products are vacuum-sealed for freshness and odour control." },
    { question: "Are your products lab-tested?", answer: "Yes. All products meet our Empire Standard\u2122 quality benchmarks. We work with certified labs to verify THC/CBD content, check for contaminants, and ensure consistent potency across batches." },
    { question: "What product categories do you carry?", answer: "We carry 344+ products across Flower, Edibles, Concentrates, Vapes, Hash, CBD, Mushrooms, and Accessories. Our catalogue is updated regularly with new arrivals." },
    { question: "What is your return policy?", answer: "Due to the nature of cannabis products, returns are accepted only for damaged, defective, or incorrectly shipped items. Report issues within 48 hours of delivery with photos." },
    { question: "How is my data protected?", answer: "All data is encrypted in transit (TLS) and at rest. Payment processing is handled by PayGo Billing (PCI-DSS compliant). We never store full credit card numbers." },
];

export const metadata: Metadata = {
    title: "FAQ | Mohawk Medibles — Frequently Asked Questions",
    description:
        "Get answers to common questions about buying cannabis online from Mohawk Medibles. Shipping times, payment methods, lab testing, return policy, and more.",
    keywords: [
        "mohawk medibles faq",
        "cannabis dispensary faq",
        "buy weed online faq canada",
        "online dispensary questions",
        "cannabis shipping faq",
    ],
    openGraph: {
        title: "FAQ | Mohawk Medibles",
        description:
            "Frequently asked questions about ordering cannabis online, shipping across Canada, lab testing, and our Empire Standard\u2122 quality guarantee.",
        url: "https://mohawkmedibles.ca/faq",
        type: "website",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/faq",
    },
};

// Structured data from static, trusted content (not user input) — safe for JSON serialization
const faqJsonLd = faqSchema(FAQ_ITEMS);
const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: "https://mohawkmedibles.ca" },
    { name: "FAQ", url: "https://mohawkmedibles.ca/faq" },
]);

export default function FaqLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {children}
        </>
    );
}
