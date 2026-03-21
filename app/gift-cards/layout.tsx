import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gift Cards | Mohawk Medibles — Give the Gift of Premium Cannabis",
    description:
        "Buy Mohawk Medibles gift cards. Choose from $25 to $200 or set a custom amount. Send to friends and family via email. Redeemable on 344+ premium cannabis products. Indigenous-owned dispensary.",
    keywords: [
        "cannabis gift card canada",
        "weed gift card",
        "mohawk medibles gift card",
        "dispensary gift card",
        "marijuana gift card online",
        "cannabis gift ideas",
        "buy cannabis gift card",
    ],
    openGraph: {
        title: "Gift Cards | Mohawk Medibles",
        description:
            "Give the gift of premium cannabis. Mohawk Medibles gift cards from $25-$200+. Delivered by email.",
        url: "https://mohawkmedibles.ca/gift-cards",
        type: "website",
        images: ["/og-image.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Gift Cards | Mohawk Medibles",
        description:
            "Give the gift of premium cannabis. Gift cards from $25 to $200+.",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/gift-cards",
    },
};

export default function GiftCardsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
