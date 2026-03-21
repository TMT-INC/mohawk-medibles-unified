import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Our Story | Mohawk Medibles — Indigenous-Owned Cannabis Since 2019",
    description:
        "The story behind Mohawk Medibles — an Indigenous-owned cannabis dispensary rooted in Six Nations heritage. From community roots to serving all of Canada with 344+ lab-tested products meeting the Empire Standard.",
    keywords: [
        "mohawk medibles story",
        "indigenous cannabis dispensary",
        "six nations cannabis",
        "indigenous owned business canada",
        "first nations dispensary",
        "mohawk territory cannabis",
        "indigenous entrepreneur canada",
        "six nations of the grand river",
        "native owned dispensary canada",
        "cannabis community support",
    ],
    openGraph: {
        title: "Our Story | Mohawk Medibles",
        description:
            "Indigenous-owned cannabis dispensary rooted in Six Nations heritage. Our story of community, quality, and sovereignty.",
        url: "https://mohawkmedibles.ca/our-story",
        type: "website",
        images: ["/og-image.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Our Story | Mohawk Medibles",
        description:
            "Indigenous-owned cannabis dispensary from Six Nations of the Grand River.",
    },
    alternates: {
        canonical: "https://mohawkmedibles.ca/our-story",
    },
};

export default function OurStoryPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 page-glass text-foreground">
            {/* Hero */}
            <section className="container mx-auto px-6 mb-20">
                <div className="text-center max-w-3xl mx-auto">
                    <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">
                        Indigenous-Owned &middot; Six Nations Territory
                    </p>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground uppercase mb-6">
                        Our Story
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        Rooted in heritage. Driven by community. Built on quality.
                    </p>
                </div>
            </section>

            {/* Story Content */}
            <article className="container mx-auto px-6 max-w-3xl space-y-16">
                {/* Origins */}
                <section>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight mb-6">
                        Where It All Began
                    </h2>
                    <div className="space-y-5 text-muted-foreground leading-relaxed text-lg">
                        <p>
                            Mohawk Medibles was born from a simple conviction: our community deserves access to
                            safe, lab-tested, premium cannabis &mdash; and the economic sovereignty that comes
                            with building our own.
                        </p>
                        <p>
                            Founded in 2019 on Six Nations of the Grand River Territory, we started as a
                            small operation with a big vision. Cannabis has deep roots in Indigenous traditions
                            of healing and ceremony. We saw an opportunity to honour that relationship while
                            building something that would benefit our families and our community for
                            generations to come.
                        </p>
                        <p>
                            What began as a local dispensary serving our neighbours has grown into a trusted
                            name across Canada, with over 25,000 customers and 344+ products in our catalogue.
                            But no matter how far we reach, our roots remain firmly planted in Six Nations soil.
                        </p>
                    </div>
                </section>

                {/* Divider */}
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />

                {/* Heritage */}
                <section>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight mb-6">
                        Six Nations Heritage
                    </h2>
                    <div className="space-y-5 text-muted-foreground leading-relaxed text-lg">
                        <p>
                            Six Nations of the Grand River is the largest First Nations reserve in Canada,
                            home to all six nations of the Haudenosaunee Confederacy: the Mohawk, Cayuga,
                            Onondaga, Oneida, Seneca, and Tuscarora. Our ancestors walked this land for
                            thousands of years, guided by the Great Law of Peace &mdash; one of the oldest
                            participatory democracies on Earth.
                        </p>
                        <p>
                            As Mohawk people, we carry forward values of community strength, respect for the
                            natural world, and the responsibility to provide for the next seven generations.
                            These aren&apos;t slogans on a website &mdash; they&apos;re the principles that shape
                            every decision we make, from which products we stock to how we treat every
                            customer who walks through our doors or places an order online.
                        </p>
                        <p>
                            Indigenous sovereignty includes economic sovereignty. Every purchase from Mohawk
                            Medibles directly supports Indigenous families and community initiatives on Six
                            Nations territory. You&apos;re not just buying cannabis &mdash; you&apos;re investing in
                            a community&apos;s future.
                        </p>
                    </div>
                </section>

                {/* Divider */}
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />

                {/* Empire Standard */}
                <section>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight mb-6">
                        The Empire Standard&trade;
                    </h2>
                    <div className="space-y-5 text-muted-foreground leading-relaxed text-lg">
                        <p>
                            We created the Empire Standard&trade; because &ldquo;good enough&rdquo; isn&apos;t
                            good enough for our customers. Every product that carries our name has passed
                            through rigorous quality gates:
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        {[
                            {
                                title: "Lab-Tested Potency",
                                desc: "Third-party lab verification for accurate THC/CBD levels. No guessing, no inflated numbers.",
                            },
                            {
                                title: "Clean Cultivation",
                                desc: "We verify growing practices to ensure products are free from harmful pesticides and contaminants.",
                            },
                            {
                                title: "Terpene Profiling",
                                desc: "Full terpene analysis so you know exactly what you're getting — flavour, aroma, and effect.",
                            },
                            {
                                title: "Consistent Supply",
                                desc: "We partner with growers who deliver the same quality batch after batch, month after month.",
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="p-6 rounded-2xl bg-card border border-border"
                            >
                                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Divider */}
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />

                {/* Community */}
                <section>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight mb-6">
                        Community First
                    </h2>
                    <div className="space-y-5 text-muted-foreground leading-relaxed text-lg">
                        <p>
                            Revenue from Mohawk Medibles stays in the community. We employ locally, source
                            from Indigenous producers when possible, and contribute to community programs on
                            Six Nations. When we grow, our community grows.
                        </p>
                        <p>
                            We also believe in education. Cannabis prohibition disproportionately impacted
                            Indigenous communities across Canada. Part of our mission is to destigmatize
                            cannabis use, provide accurate information about products and dosing, and ensure
                            our customers make informed decisions. That&apos;s why every product page includes
                            detailed usage guides, FAQ sections, and honest descriptions.
                        </p>
                    </div>
                </section>

                {/* Divider */}
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />

                {/* Looking Forward */}
                <section>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight mb-6">
                        Looking Forward
                    </h2>
                    <div className="space-y-5 text-muted-foreground leading-relaxed text-lg">
                        <p>
                            From a small dispensary to serving customers across Canada, our journey is just
                            beginning. We&apos;re constantly expanding our product line, improving our service,
                            and finding new ways to put our community first.
                        </p>
                        <p>
                            Whether you&apos;re a first-time buyer or a long-time customer, thank you for being
                            part of this story. Every order, every review, every recommendation helps us
                            build something lasting &mdash; not just a business, but a legacy.
                        </p>
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center py-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                        Ready to Experience the Difference?
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Browse our full catalogue of 344+ lab-tested products. Free shipping on orders over $199.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90 transition-opacity"
                        >
                            Shop Now
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-8 py-4 border border-border text-foreground font-semibold rounded-full hover:bg-card transition-colors"
                        >
                            Get in Touch
                        </Link>
                    </div>
                </section>
            </article>
        </div>
    );
}
