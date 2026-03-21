import { Metadata } from "next";
import { getAllBlogPosts, getAllBlogCategories } from "@/data/blog/posts";
import { breadcrumbSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = {
    title: "Cannabis Blog | Guides, News & Education | Mohawk Medibles",
    description:
        "Expert cannabis guides, dosage information, strain reviews, and industry news from Mohawk Medibles — Canada's trusted Indigenous-owned dispensary.",
    keywords: [
        "cannabis blog",
        "cannabis guides",
        "THC dosing guide",
        "terpene guide",
        "indica vs sativa",
        "cannabis education",
        "Mohawk Medibles blog",
        "cannabis news Canada",
    ],
    openGraph: {
        title: "Cannabis Blog | Guides, News & Education | Mohawk Medibles",
        description:
            "Expert cannabis guides, dosage information, strain reviews, and industry news from Mohawk Medibles — Canada's trusted Indigenous-owned dispensary.",
        url: "https://mohawkmedibles.ca/blog",
        type: "website",
        siteName: "Mohawk Medibles",
    },
    twitter: {
        card: "summary_large_image",
        title: "Cannabis Blog | Guides, News & Education | Mohawk Medibles",
        description:
            "Expert cannabis guides, dosage information, strain reviews, and industry news from Mohawk Medibles — Canada's trusted Indigenous-owned dispensary.",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/blog",
    },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    const allPosts = getAllBlogPosts();
    const categories = getAllBlogCategories();

    // CollectionPage schema for the blog listing — all data is static/trusted from our own data files
    const collectionPageSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": "https://mohawkmedibles.ca/blog/#collectionpage",
        name: "Cannabis Blog | Guides, News & Education",
        description:
            "Expert cannabis guides, dosage information, strain reviews, and industry news from Mohawk Medibles — Canada's trusted Indigenous-owned dispensary.",
        url: "https://mohawkmedibles.ca/blog",
        isPartOf: {
            "@type": "WebSite",
            "@id": "https://mohawkmedibles.ca/#website",
        },
        publisher: {
            "@id": "https://mohawkmedibles.ca/#organization",
        },
        inLanguage: "en-CA",
        about: categories.map((cat) => ({
            "@type": "Thing",
            name: cat,
        })),
        mainEntity: {
            "@type": "ItemList",
            numberOfItems: allPosts.length,
            itemListElement: allPosts.slice(0, 20).map((post, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: post.title,
                url: `https://mohawkmedibles.ca/blog/${post.slug}`,
            })),
        },
    };

    const breadcrumbJsonLd = breadcrumbSchema([
        { name: "Home", url: "https://mohawkmedibles.ca" },
        { name: "Blog", url: "https://mohawkmedibles.ca/blog" },
    ]);

    return (
        <>
            {/* JSON-LD injection — trusted static content from data/blog/posts.ts, not user input */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(collectionPageSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbJsonLd),
                }}
            />
            {children}
        </>
    );
}
