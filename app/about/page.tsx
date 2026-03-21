/**
 * About Us — Mohawk Medibles
 * Server component: exports metadata. Client content in AboutClientContent.
 */
import type { Metadata } from "next";
import AboutClientContent from "./AboutClientContent";

export const metadata: Metadata = {
    title: "About Us | Mohawk Medibles — Indigenous-Owned Cannabis Dispensary",
    description:
        "Learn about Mohawk Medibles — an Indigenous-owned cannabis dispensary operating from Six Nations of the Grand River Territory, serving Canada since 2019.",
    keywords: [
        "mohawk medibles",
        "indigenous cannabis dispensary",
        "six nations dispensary",
        "about mohawk medibles",
        "indigenous owned cannabis canada",
        "first nations dispensary",
        "tyendinaga mohawk territory",
        "cannabis dispensary canada",
        "native owned dispensary",
        "six nations of the grand river",
    ],
    openGraph: {
        title: "About Mohawk Medibles — Indigenous-Owned Cannabis Since 2019",
        description: "Indigenous-owned cannabis dispensary serving Canada with 344+ premium, lab-tested products from Six Nations territory.",
        url: "https://mohawkmedibles.ca/about",
        type: "website",
        images: ["/og-image.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "About Mohawk Medibles",
        description: "Indigenous-owned cannabis dispensary serving Canada since 2019.",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/about",
    },
};

// Static hardcoded data — safe for JSON-LD injection, not user input
const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": "https://mohawkmedibles.ca/about/#aboutpage",
    name: "About Mohawk Medibles",
    description:
        "Learn about Mohawk Medibles — an Indigenous-owned cannabis dispensary operating from Six Nations of the Grand River Territory, serving Canada since 2019.",
    url: "https://mohawkmedibles.ca/about",
    isPartOf: { "@id": "https://mohawkmedibles.ca/#website" },
    about: {
        "@type": "Organization",
        "@id": "https://mohawkmedibles.ca/#organization",
        name: "Mohawk Medibles",
        foundingDate: "2019",
        foundingLocation: "Six Nations of the Grand River, Ontario, Canada",
        description:
            "Indigenous-owned premium cannabis dispensary serving Canada with 344+ lab-tested products meeting the Empire Standard™.",
        ethicsPolicy: "https://mohawkmedibles.ca/privacy",
    },
    mainEntity: { "@id": "https://mohawkmedibles.ca/#organization" },
};

// Team member Person schemas — E-E-A-T signals for Google
const teamSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://mohawkmedibles.ca/#team",
    name: "Mohawk Medibles Team",
    member: [
        {
            "@type": "Person",
            name: "Mohawk Medibles Founder",
            jobTitle: "Founder & CEO",
            description: "Indigenous entrepreneur from Six Nations of the Grand River. Founded Mohawk Medibles in 2019 to provide premium, lab-tested cannabis while supporting community economic sovereignty.",
            worksFor: { "@id": "https://mohawkmedibles.ca/#organization" },
            knowsAbout: ["Cannabis cultivation", "Indigenous business", "Six Nations heritage", "Cannabis quality control"],
        },
        {
            "@type": "Person",
            name: "Quality Assurance Team",
            jobTitle: "Quality Assurance & Lab Testing",
            description: "Certified cannabis quality specialists ensuring every product meets the Empire Standard™. 10+ years combined experience in cannabis testing, terpene profiling, and potency verification.",
            worksFor: { "@id": "https://mohawkmedibles.ca/#organization" },
            knowsAbout: ["Cannabis lab testing", "Terpene profiling", "THC/CBD analysis", "Quality assurance"],
        },
        {
            "@type": "Person",
            name: "Customer Experience Team",
            jobTitle: "Customer Support & Cannabis Education",
            description: "Dedicated support team providing personalized cannabis guidance to 25,000+ customers across Canada. Experts in strain selection, dosing recommendations, and product education.",
            worksFor: { "@id": "https://mohawkmedibles.ca/#organization" },
            knowsAbout: ["Cannabis dosing", "Strain selection", "Customer service", "Cannabis education"],
        },
    ],
};

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://mohawkmedibles.ca" },
        { "@type": "ListItem", position: 2, name: "About", item: "https://mohawkmedibles.ca/about" },
    ],
};

export default function AboutPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(teamSchema) }}
            />
            <AboutClientContent />
        </>
    );
}
