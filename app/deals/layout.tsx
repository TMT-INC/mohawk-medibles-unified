import { Metadata } from "next";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schemas";

const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: "https://mohawkmedibles.ca" },
    { name: "Deals", url: "https://mohawkmedibles.ca/deals" },
]);

const dealsFaqJsonLd = faqSchema([
    { question: "Does Mohawk Medibles offer free shipping?", answer: "Yes! All orders over $149 CAD ship free to any Canadian address via Canada Post Xpresspost with full tracking." },
    { question: "What cannabis deals are currently available?", answer: "We offer free shipping on orders over $149, mix & match edible discounts when you buy 3+ items, and bulk ounce deals starting at $40 CAD. Check our deals page for the latest promotions." },
    { question: "Can I use a coupon code at checkout?", answer: "Yes, enter your coupon code in the checkout page. Coupons can provide percentage discounts, fixed amount savings, or free shipping. Only one coupon can be applied per order." },
    { question: "How often do new deals become available?", answer: "We update our deals and promotions regularly. Sign up for our newsletter to be the first to know about new offers, exclusive drops, and seasonal promotions." },
]);

export const metadata: Metadata = {
    title: "Cannabis Deals & Promotions",
    description:
        "Save on premium cannabis at Mohawk Medibles. Free shipping on orders over $149, mix & match edible discounts, ounce deals starting at $40 CAD. Indigenous-owned, Empire Standard™ quality. Ships Canada-wide.",
    keywords: [
        "cannabis deals Canada",
        "weed discounts",
        "bulk cannabis",
        "edible deals",
        "cannabis promotions",
        "free shipping cannabis",
        "ounce deals",
        "cannabis bulk savings",
    ],
    openGraph: {
        title: "Cannabis Deals & Promotions",
        description:
            "Save on premium cannabis at Mohawk Medibles. Free shipping, mix & match discounts, bulk ounce deals. Indigenous-owned, Empire Standard™ quality.",
        url: "https://mohawkmedibles.ca/deals",
        type: "website",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/deals",
    },
};

export default function DealsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(dealsFaqJsonLd) }}
            />
            {children}
        </>
    );
}
