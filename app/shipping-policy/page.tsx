/**
 * Shipping Policy — Mohawk Medibles
 */
import type { Metadata } from "next";
import ShippingPolicyClient from "./ShippingPolicyClient";

export const metadata: Metadata = {
    title: "Shipping Policy | Mohawk Medibles — Free Shipping Over $199 Canada-Wide",
    description:
        "Mohawk Medibles shipping info. Free shipping over $199 CAD. Canada-wide Xpresspost delivery in 1-5 business days. Discreet packaging, full tracking, same-day local delivery.",
    keywords: [
        "cannabis shipping canada",
        "free shipping cannabis",
        "mohawk medibles shipping",
        "weed delivery canada",
        "discreet cannabis shipping",
        "cannabis xpresspost delivery",
        "same day cannabis delivery ontario",
    ],
    openGraph: {
        title: "Shipping Policy | Mohawk Medibles — Free Shipping Over $199",
        description:
            "Free shipping over $199 CAD. Canada-wide Xpresspost in 1-5 business days. Discreet packaging & full tracking.",
        url: "https://mohawkmedibles.ca/shipping-policy",
        type: "website",
    },
    alternates: { canonical: "https://mohawkmedibles.ca/shipping-policy" },
};

export default function ShippingPolicy() {
    return <ShippingPolicyClient />;
}
