import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Flash Sale | Mohawk Medibles — Limited-Time Cannabis Deals",
    description:
        "Grab limited-time flash sale deals on premium cannabis products at Mohawk Medibles. Huge discounts on flower, edibles, concentrates & more. Indigenous-owned dispensary. Ships Canada-wide.",
    keywords: [
        "cannabis flash sale canada",
        "weed deals online",
        "limited time cannabis deals",
        "mohawk medibles flash sale",
        "cheap weed canada",
        "cannabis discount canada",
        "dispensary sale",
    ],
    openGraph: {
        title: "Flash Sale | Mohawk Medibles",
        description:
            "Limited-time flash sale on premium cannabis. Massive savings on flower, edibles, concentrates & more.",
        url: "https://mohawkmedibles.ca/flash-sale",
        type: "website",
        images: ["/og-image.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Flash Sale | Mohawk Medibles",
        description:
            "Limited-time cannabis flash sale. Premium products at unbeatable prices.",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/flash-sale",
    },
};

export default function FlashSaleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
