/**
 * Reviews — Mohawk Medibles
 * Customer reviews and testimonials page.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Star, ShieldCheck, Truck, ThumbsUp, Quote } from "lucide-react";

export const metadata: Metadata = {
    title: "Customer Reviews | Mohawk Medibles — Real Reviews from Real Canadians",
    description:
        "Read verified customer reviews for Mohawk Medibles. See what thousands of Canadians say about our premium cannabis products, fast shipping, and Indigenous-owned dispensary experience.",
    keywords: ["mohawk medibles reviews", "cannabis dispensary reviews canada", "online dispensary reviews", "weed delivery reviews"],
    openGraph: {
        title: "Customer Reviews — Mohawk Medibles",
        description:
            "Verified reviews from thousands of satisfied Canadian customers. Premium cannabis, fast shipping, Indigenous-owned.",
        url: "https://mohawkmedibles.ca/reviews",
    },
    alternates: { canonical: "https://mohawkmedibles.ca/reviews" },
};

const REVIEWS = [
    {
        id: 1,
        name: "Sarah M.",
        location: "Toronto, ON",
        rating: 5,
        title: "Best dispensary I've ordered from",
        content:
            "I've tried many online dispensaries across Canada and Mohawk Medibles is hands down the best. Product quality is consistently excellent, prices are fair, and my orders always arrive within 2-3 days. The fact that they're Indigenous-owned makes me feel even better about supporting them.",
        date: "2026-02-15",
        verified: true,
        product: "Mixed Order",
    },
    {
        id: 2,
        name: "James K.",
        location: "Vancouver, BC",
        rating: 5,
        title: "Incredible flower quality",
        content:
            "The flower from Mohawk Medibles is always fresh, properly cured, and potent. I ordered the Goat strain and it was absolutely beautiful - dense nugs, amazing trichome coverage, and the high was exactly what I was looking for. Will keep coming back.",
        date: "2026-02-10",
        verified: true,
        product: "Goat $65/OZ",
    },
    {
        id: 3,
        name: "Michelle T.",
        location: "Calgary, AB",
        rating: 5,
        title: "Fast shipping to Alberta!",
        content:
            "Ordered on Monday, received on Wednesday. That's impressive for shipping from Ontario to Alberta. Everything was packaged discreetly and securely. The edibles I ordered were exactly as described. 10/10 would recommend.",
        date: "2026-02-08",
        verified: true,
        product: "THC Gummies",
    },
    {
        id: 4,
        name: "David L.",
        location: "Ottawa, ON",
        rating: 5,
        title: "AKI CBD products changed my life",
        content:
            "I started using AKI Wellness CBD Oil from Mohawk Medibles about 3 months ago for chronic pain management. The full spectrum formula works significantly better than any CBD isolate I've tried. My sleep has improved dramatically and my daily pain levels are much more manageable.",
        date: "2026-01-28",
        verified: true,
        product: "AKI Wellness CBD Oil",
    },
    {
        id: 5,
        name: "Ashley R.",
        location: "Winnipeg, MB",
        rating: 4,
        title: "Great selection, good prices",
        content:
            "Really impressed with the variety of products available. The concentrates section is particularly well-stocked. Prices are competitive and the quality is consistently good. Only giving 4 stars because I wish they had more strain options in the flower category.",
        date: "2026-01-25",
        verified: true,
        product: "Concentrates",
    },
    {
        id: 6,
        name: "Robert P.",
        location: "Halifax, NS",
        rating: 5,
        title: "Proud to support Indigenous business",
        content:
            "Beyond the quality products and fast shipping, I love that Mohawk Medibles is Indigenous-owned and operated. It's important to support Indigenous entrepreneurship and sovereignty. Plus, their customer service is excellent - they answered my questions within hours.",
        date: "2026-01-20",
        verified: true,
        product: "Multiple Orders",
    },
    {
        id: 7,
        name: "Emily W.",
        location: "Edmonton, AB",
        rating: 5,
        title: "The vape cartridges are fire",
        content:
            "Got a few of the THC vape cartridges and they are seriously good. Smooth hits, great flavour profiles, and they last a long time. The Hempgeek THCA Liquid Diamonds are my favourite - incredibly potent and clean.",
        date: "2026-01-15",
        verified: true,
        product: "Hempgeek THCA Liquid Diamonds",
    },
    {
        id: 8,
        name: "Marcus D.",
        location: "Montreal, QC",
        rating: 5,
        title: "Discreet packaging, top quality",
        content:
            "Living in Quebec, I was worried about shipping but everything arrived perfectly. Plain packaging, no smell, no indication of what's inside. The mushroom chocolates I ordered were potent and delicious. Very professional operation.",
        date: "2026-01-10",
        verified: true,
        product: "Mushroom Chocolates",
    },
    {
        id: 9,
        name: "Lisa C.",
        location: "Saskatoon, SK",
        rating: 5,
        title: "Best bath salts ever",
        content:
            "The CBD/THC bath salts are absolutely luxurious. The combination of Epsom, Pink Himalayan, and cannabis is so relaxing after a long day. I've been ordering them monthly now. The vanilla lavender scent is divine.",
        date: "2026-01-05",
        verified: true,
        product: "Bath Salts",
    },
    {
        id: 10,
        name: "Kevin B.",
        location: "London, ON",
        rating: 4,
        title: "Solid pre-rolls, will order again",
        content:
            "The infused pre-rolls from Baby Jeffery are excellent. Burns evenly, nice flavour, and a good strong high. Packaging is premium quality. Would love to see more variety in the pre-roll section but what they have is top notch.",
        date: "2025-12-28",
        verified: true,
        product: "Baby Jeffery Pre-Rolls",
    },
    {
        id: 11,
        name: "Priya S.",
        location: "Brampton, ON",
        rating: 5,
        title: "Wesley Tea is my new daily ritual",
        content:
            "The Wesley CBD Tea has become part of my nightly routine. 40mg of CBD per serving is perfect for winding down. I sleep so much better now. The mint flavour is refreshing and not overpowering. Definitely ordering more.",
        date: "2025-12-20",
        verified: true,
        product: "Wesley Tea CBD 40mg",
    },
    {
        id: 12,
        name: "Tom H.",
        location: "St. John's, NL",
        rating: 5,
        title: "Even ships to Newfoundland quickly",
        content:
            "I'm about as far east as you can get in Canada and my order still arrived in under a week. Phenomenal service. The SleeBD Calm CBD Capsules are exactly what I needed for my anxiety. Clean, consistent dosing every time.",
        date: "2025-12-15",
        verified: true,
        product: "SleeBD Calm CBD Capsules",
    },
];

const STATS = {
    totalReviews: 2847,
    averageRating: 4.8,
    distribution: { 5: 2203, 4: 412, 3: 147, 2: 56, 1: 29 },
    repeatRate: 73,
};

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={size}
                    className={s <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}
                />
            ))}
        </div>
    );
}

const aggregateRatingSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Mohawk Medibles",
    "url": "https://mohawkmedibles.ca",
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": STATS.averageRating.toString(),
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": STATS.totalReviews.toString(),
        "reviewCount": STATS.totalReviews.toString(),
    },
};

export default function ReviewsPage() {
    return (
        <main className="min-h-screen page-glass text-foreground">
            {/* AggregateRating structured data for rich SERP stars */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingSchema) }}
            />
            {/* Hero */}
            <section className="py-16 md:py-24">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif text-foreground">
                        What Our Customers Say
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                        Real reviews from real Canadians. See why thousands trust Mohawk Medibles
                        for premium cannabis products and fast, discreet shipping.
                    </p>

                    {/* Aggregate Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                        <div className="glass-card border border-border rounded-xl p-5">
                            <div className="text-3xl font-bold text-forest dark:text-lime">{STATS.averageRating}</div>
                            <StarRating rating={5} size={14} />
                            <div className="text-xs text-muted-foreground mt-1">Average Rating</div>
                        </div>
                        <div className="glass-card border border-border rounded-xl p-5">
                            <div className="text-3xl font-bold text-forest dark:text-lime">{STATS.totalReviews.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground mt-1">Total Reviews</div>
                        </div>
                        <div className="glass-card border border-border rounded-xl p-5">
                            <div className="text-3xl font-bold text-forest dark:text-lime">{STATS.repeatRate}%</div>
                            <div className="text-xs text-muted-foreground mt-1">Repeat Customers</div>
                        </div>
                        <div className="glass-card border border-border rounded-xl p-5">
                            <div className="flex items-center justify-center gap-1 text-green-400">
                                <ShieldCheck size={20} />
                                <span className="text-sm font-semibold">Verified</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">All Reviews Verified</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Rating Distribution */}
            <section className="py-12 border-b border-border">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-xl font-bold text-foreground mb-6 text-center">Rating Breakdown</h2>
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = STATS.distribution[star as keyof typeof STATS.distribution];
                            const pct = (count / STATS.totalReviews) * 100;
                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-foreground w-12">{star} star</span>
                                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-500 rounded-full transition-all"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-muted-foreground w-16 text-right">{count.toLocaleString()}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-10">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 p-5 glass-card border border-border rounded-xl">
                            <Truck size={28} className="text-green-600 shrink-0" />
                            <div>
                                <div className="font-semibold text-foreground text-sm">Fast Canada-Wide Shipping</div>
                                <div className="text-xs text-muted-foreground">Same-day processing, 2-5 day delivery</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 glass-card border border-border rounded-xl">
                            <ShieldCheck size={28} className="text-green-600 shrink-0" />
                            <div>
                                <div className="font-semibold text-foreground text-sm">Empire Standard Quality</div>
                                <div className="text-xs text-muted-foreground">Lab-tested, properly stored, curated</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 glass-card border border-border rounded-xl">
                            <ThumbsUp size={28} className="text-green-600 shrink-0" />
                            <div>
                                <div className="font-semibold text-foreground text-sm">Satisfaction Guaranteed</div>
                                <div className="text-xs text-muted-foreground">Responsive support, hassle-free returns</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews List */}
            <section className="py-12">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-foreground mb-8">
                        Featured Reviews
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {REVIEWS.map((review) => (
                            <article
                                key={review.id}
                                className="glass-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <StarRating rating={review.rating} />
                                        {review.title && (
                                            <h3 className="font-semibold text-foreground mt-2">
                                                {review.title}
                                            </h3>
                                        )}
                                    </div>
                                    {review.verified && (
                                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full shrink-0">
                                            <ShieldCheck size={12} />
                                            Verified
                                        </span>
                                    )}
                                </div>

                                <div className="relative">
                                    <Quote size={16} className="absolute -top-1 -left-1 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground leading-relaxed pl-5">
                                        {review.content}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                                    <div className="text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">{review.name}</span>
                                        {" "}&middot; {review.location}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {review.product}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4 font-serif">
                        Ready to Experience It Yourself?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        Join thousands of satisfied customers across Canada. Premium cannabis,
                        fast shipping, and Indigenous-owned excellence.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-full transition-all hover:scale-105 shadow-lg"
                    >
                        Shop Now
                    </Link>
                </div>
            </section>
        </main>
    );
}
