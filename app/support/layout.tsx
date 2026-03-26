/**
 * Support Layout — Mohawk Medibles
 * Exports metadata + FAQPage JSON-LD schema for rich SERP snippets.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Customer Support — Help Center & FAQ",
    description:
        "Get help with orders, shipping, payments, and product questions. Contact Mohawk Medibles by email, phone, or visit us at Tyendinaga Mohawk Territory.",
    keywords: [
        "mohawk medibles support",
        "cannabis dispensary help",
        "mohawk medibles shipping help",
        "online dispensary customer service",
        "cannabis order support canada",
    ],
    openGraph: {
        title: "Customer Support — Mohawk Medibles",
        description:
            "Help center for orders, shipping, payments, and product questions. Reach us by email, phone, or in person.",
        url: "https://mohawkmedibles.ca/support",
        images: ["/og-image.png"],
    },
    alternates: { canonical: "https://mohawkmedibles.ca/support" },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How long does shipping take?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Same-day delivery to Tyendinaga, Belleville, and Deseronto (order before 4 PM). Next-day delivery to Toronto GTA, Hamilton, and Brantford. Canada-wide via Xpresspost in 2-5 business days.",
            },
        },
        {
            "@type": "Question",
            "name": "Is shipping discreet?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. All orders ship in plain, unmarked packaging with no indication of contents. Your privacy is our priority.",
            },
        },
        {
            "@type": "Question",
            "name": "Do you offer free shipping?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Orders over $149 CAD qualify for free Canada-wide shipping. Local delivery is always free within our same-day zones.",
            },
        },
        {
            "@type": "Question",
            "name": "What payment methods do you accept?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We accept Visa, Mastercard, American Express, Interac e-Transfer, and cryptocurrency. All payments are processed securely through PayGo Billing.",
            },
        },
        {
            "@type": "Question",
            "name": "Is my payment information secure?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. We use PayGo Billing for payment processing with bank-level encryption. We never store your card details on our servers.",
            },
        },
        {
            "@type": "Question",
            "name": "Can I cancel or modify my order?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Orders can be modified or cancelled within 1 hour of placement, before they enter processing. Contact us immediately at info@mohawkmedibles.ca or call (613) 396-6728.",
            },
        },
        {
            "@type": "Question",
            "name": "My order arrived damaged — what do I do?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Take photos of the damaged items and packaging, then contact us within 48 hours. We'll send a replacement or issue a full refund — your choice.",
            },
        },
        {
            "@type": "Question",
            "name": "Are your products lab-tested?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. All products meet our Empire Standard quality benchmark and are lab-tested for potency, pesticides, heavy metals, and microbial contaminants.",
            },
        },
        {
            "@type": "Question",
            "name": "What's the recommended dosage for edibles?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Start low, go slow. We recommend beginning with 5-10mg THC and waiting at least 2 hours before consuming more. Edibles take longer to kick in than smoking or vaping.",
            },
        },
        {
            "@type": "Question",
            "name": "Do I need to be 19+ to order?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. You must be 19 years or older to purchase cannabis products. We verify age on all orders — no exceptions.",
            },
        },
        {
            "@type": "Question",
            "name": "How do refunds work?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Refunds are processed within 5-7 business days back to your original payment method. Contact us within 48 hours of receiving your order if there's an issue.",
            },
        },
        {
            "@type": "Question",
            "name": "What is your return policy?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We accept returns on unopened, sealed products within 14 days of delivery. Products must be in original packaging. Contact support to initiate a return.",
            },
        },
        {
            "@type": "Question",
            "name": "How do I track my order?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Once your order ships, you'll receive a tracking number via email. You can also check your order status in your account dashboard.",
            },
        },
    ],
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            {children}
        </>
    );
}
