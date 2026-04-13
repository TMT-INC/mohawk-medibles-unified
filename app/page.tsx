/**
 * Homepage — Mohawk Medibles
 * Server component: exports metadata + JSON-LD. Client content in HomeClient.
 * Note: dangerouslySetInnerHTML is safe — all data is hardcoded static content, not user input.
 */
import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import TopStrainsSection from "@/components/TopStrainsSection";

export const metadata: Metadata = {
    title: "Mohawk Medibles — Premium Indigenous Cannabis Dispensary | Buy Weed Online Canada",
    description:
        "Shop 360+ lab-tested cannabis products: flower, edibles, concentrates, vapes, pre-rolls & more. Indigenous-owned dispensary on Tyendinaga Mohawk Territory. Free shipping over $149 Canada-wide. Empire Standard™ quality.",
    keywords: [
        "buy weed online canada",
        "online dispensary canada",
        "mohawk medibles",
        "indigenous cannabis dispensary",
        "cannabis delivery canada",
        "buy cannabis online",
        "mail order marijuana canada",
        "premium cannabis flower",
        "THC edibles canada",
        "concentrates online canada",
        "vapes online canada",
        "tyendinaga dispensary",
        "native dispensary canada",
        "lab tested cannabis",
        "empire standard cannabis",
        "AAAA weed online",
        "cheap ounces canada",
        "free shipping cannabis",
        "dispensaire en ligne canada",
        "acheter cannabis en ligne",
    ],
    openGraph: {
        title: "Mohawk Medibles — Premium Cannabis | Buy Weed Online Canada",
        description:
            "360+ lab-tested cannabis products. Flower, edibles, concentrates, vapes & more. Indigenous-owned. Free shipping over $149.",
        url: "https://mohawkmedibles.ca",
        siteName: "Mohawk Medibles",
        type: "website",
        locale: "en_CA",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Mohawk Medibles — Premium Indigenous Cannabis Dispensary",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Mohawk Medibles — Buy Premium Cannabis Online Canada",
        description:
            "Indigenous-owned dispensary. 360+ lab-tested products. Free shipping over $149 Canada-wide.",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca",
    },
};

const homepageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://mohawkmedibles.ca/#webpage",
    name: "Mohawk Medibles — Premium Indigenous Cannabis Dispensary",
    description:
        "Shop 360+ lab-tested cannabis products from an Indigenous-owned dispensary on Tyendinaga Mohawk Territory. Free shipping over $149 Canada-wide.",
    url: "https://mohawkmedibles.ca",
    isPartOf: { "@id": "https://mohawkmedibles.ca/#website" },
    about: { "@id": "https://mohawkmedibles.ca/#organization" },
    primaryImageOfPage: {
        "@type": "ImageObject",
        url: "https://mohawkmedibles.ca/og-image.png",
    },
    speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".hero-title", ".social-proof-strip"],
    },
};

// ISR: serve static HTML from CDN edge, revalidate every 60 seconds
export const revalidate = 60;

export default function Home() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
            />
            <HomeClient />
            <TopStrainsSection />
        </>
    );
}
