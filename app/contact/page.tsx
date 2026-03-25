/**
 * Contact Us — Mohawk Medibles
 * Server component: exports metadata. Client content in ContactClientContent.
 */
import type { Metadata } from "next";
import ContactClientContent from "./ContactClientContent";

export const metadata: Metadata = {
    title: "Contact Us — Get In Touch",
    description:
        "Contact Mohawk Medibles for questions about orders, products, wholesale, or anything else. Email, phone, or visit us at Tyendinaga Mohawk Territory.",
    keywords: ["mohawk medibles contact", "cannabis dispensary contact", "mohawk medibles phone", "mohawk medibles email"],
    openGraph: {
        title: "Contact Mohawk Medibles",
        description: "Have a question? Reach out by email, phone, or visit us at 45 Dundas Street, Deseronto, ON.",
        url: "https://mohawkmedibles.ca/contact",
        type: "website",
        images: ["/og-image.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact Mohawk Medibles",
        description: "Have a question? Reach out by email, phone, or visit us.",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/contact",
    },
};

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://mohawkmedibles.ca" },
        { "@type": "ListItem", position: 2, name: "Contact", item: "https://mohawkmedibles.ca/contact" },
    ],
};

const contactSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Mohawk Medibles",
    "url": "https://mohawkmedibles.ca",
    "telephone": "+1-613-396-6728",
    "email": "info@mohawkmedibles.ca",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "45 Dundas Street",
        "addressLocality": "Deseronto",
        "addressRegion": "ON",
        "addressCountry": "CA",
    },
    "contactPoint": [
        {
            "@type": "ContactPoint",
            "telephone": "+1-613-396-6728",
            "contactType": "customer service",
            "email": "info@mohawkmedibles.ca",
            "availableLanguage": ["English", "French"],
            "areaServed": "CA",
        },
    ],
};

export default function ContactPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <ContactClientContent />
        </>
    );
}
