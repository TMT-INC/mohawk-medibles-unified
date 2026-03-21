import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DispensaryDetail from "@/components/directory/DispensaryDetail";
import { VoiceRecommendationWidget } from "@/components/directory/VoiceRecommendationWidget";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const dispensary = await prisma.dispensary.findUnique({
        where: { slug },
        select: {
            name: true,
            metaTitle: true,
            metaDescription: true,
            description: true,
            city: true,
            province: true,
            keywords: true,
        },
    });

    if (!dispensary) {
        return {
            title: "Dispensary Not Found | Mohawk Medibles",
        };
    }

    const title = dispensary.metaTitle || `${dispensary.name} | Cannabis Dispensary ${dispensary.city}`;
    const description = dispensary.metaDescription || 
        `Visit ${dispensary.name} in ${dispensary.city}, ${dispensary.province}. Quality cannabis products, delivery, and exceptional service.`;

    return {
        title,
        description,
        keywords: dispensary.keywords?.join(", ") || "cannabis dispensary, marijuana, weed",
        openGraph: {
            title,
            description,
            type: "website",
            locale: "en_CA",
        },
    };
}

export async function generateStaticParams() {
    const dispensaries = await prisma.dispensary.findMany({
        select: { slug: true },
        take: 100,
    });

    return dispensaries.map((d: { slug: string }) => ({
        slug: d.slug,
    }));
}

async function getDispensary(slug: string) {
    const dispensary = await prisma.dispensary.findUnique({
        where: { slug },
        include: {
            hours: true,
            reviews: {
                orderBy: { createdAt: "desc" },
                take: 10,
            },
            products: {
                take: 6,
            },
            images: true,
        },
    });

    return dispensary;
}

export default async function DispensaryPage({ params }: PageProps) {
    const { slug } = await params;
    const dispensary = await getDispensary(slug);

    if (!dispensary) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
            <DispensaryDetail dispensary={dispensary} />
            
            {/* Voice AI Recommendation Widget for Premium Listings */}
            {dispensary.dataQualityScore > 70 && (
                <VoiceRecommendationWidget dispensary={dispensary} />
            )}
        </main>
    );
}
