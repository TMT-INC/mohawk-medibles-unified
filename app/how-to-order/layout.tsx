import { Metadata } from "next";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = {
    title: "How to Order Cannabis Online | Mohawk Medibles",
    description:
        "Simple 3-step guide to ordering cannabis online from Mohawk Medibles. Browse 344+ lab-tested products, secure checkout with multiple payment methods, fast Canada-wide shipping.",
    openGraph: {
        title: "How to Order Cannabis Online | Mohawk Medibles",
        description:
            "Easy ordering guide: Browse products, checkout securely, receive fast delivery. Multiple payment options and Canada-wide shipping.",
        url: "https://mohawkmedibles.ca/how-to-order",
        type: "website",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/how-to-order",
    },
};

const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: "https://mohawkmedibles.ca" },
    { name: "How to Order", url: "https://mohawkmedibles.ca/how-to-order" },
]);

const howToOrderFaqJsonLd = faqSchema([
    { question: "How do I order cannabis online from Mohawk Medibles?", answer: "Ordering is simple: 1) Browse our shop and add products to your cart, 2) Proceed to checkout and enter your shipping details, 3) Pay securely via Interac e-Transfer, Visa, Mastercard, or Bitcoin. Your order ships within 24 hours." },
    { question: "What payment methods does Mohawk Medibles accept?", answer: "We accept Interac e-Transfer (instant), Visa, Mastercard, American Express, Google Pay, and Bitcoin (cryptocurrency). All transactions are processed securely in Canadian dollars (CAD)." },
    { question: "Do I need an account to order?", answer: "No, guest checkout is available. However, creating an account lets you track orders, save addresses, and access your order history for easy reordering." },
    { question: "How do I track my order?", answer: "After your order ships, you'll receive a confirmation email with your Canada Post Xpresspost tracking number. You can track your package at canadapost.ca or through the Canada Post app." },
]);

export default function HowToOrderLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToOrderFaqJsonLd) }}
            />
            {children}
        </>
    );
}
