import type { Metadata } from "next";
import HowToOrderClient from "./HowToOrderClient";

export const metadata: Metadata = {
    title: "How to Order Cannabis Online | Mohawk Medibles — 3 Easy Steps",
    description:
        "Order cannabis online from Mohawk Medibles in 3 simple steps. Browse products, checkout securely with e-Transfer or credit card, and get fast Canada-wide delivery.",
    keywords: [
        "how to order cannabis online canada",
        "buy weed online steps",
        "order cannabis delivery canada",
        "mohawk medibles how to order",
        "online dispensary ordering guide",
    ],
    openGraph: {
        title: "How to Order — Mohawk Medibles",
        description: "3 simple steps to order premium cannabis online with fast Canada-wide shipping.",
        url: "https://mohawkmedibles.ca/how-to-order",
    },
    alternates: { canonical: "https://mohawkmedibles.ca/how-to-order" },
};

const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Order Cannabis Online from Mohawk Medibles",
    "description":
        "Order premium cannabis products online from Mohawk Medibles with fast Canada-wide delivery in 3 simple steps.",
    "totalTime": "PT5M",
    "step": [
        {
            "@type": "HowToStep",
            "position": 1,
            "name": "Browse & Add to Cart",
            "text": "Browse our curated selection of premium cannabis products including flower, edibles, concentrates, vapes, and CBD. Use filters to find exactly what you need. Add your favorites to cart.",
        },
        {
            "@type": "HowToStep",
            "position": 2,
            "name": "Secure Checkout",
            "text": "Review your cart and proceed to checkout. Choose your payment method — Interac e-Transfer, credit card (Visa, Mastercard, Amex), or cryptocurrency. All transactions are encrypted and secure.",
        },
        {
            "@type": "HowToStep",
            "position": 3,
            "name": "Fast Delivery to Your Door",
            "text": "Your order is processed same-day and shipped via Canada Post Xpresspost in discreet, unmarked packaging. Track your delivery and receive your order in 2-5 business days Canada-wide.",
        },
    ],
};

export default function HowToOrderPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <HowToOrderClient />
        </>
    );
}
