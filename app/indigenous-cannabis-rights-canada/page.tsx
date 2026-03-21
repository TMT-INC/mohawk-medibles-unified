/**
 * Indigenous Cannabis Rights Canada — SEO Content Page
 * ════════════════════════════════════════════════════
 * Primary SEO target: "indigenous cannabis rights canada" (800/mo, 0 competition)
 * Secondary: "treaty rights cannabis", "first nations cannabis rights",
 *            "indigenous sovereignty cannabis", "six nations cannabis"
 *
 * 2,500+ word educational thought-leadership page with Article, FAQPage,
 * and BreadcrumbList structured data for maximum SERP coverage.
 */
import type { Metadata } from "next";
import Link from "next/link";
import {
    ChevronRight,
    ArrowRight,
    Scale,
    Leaf,
    BookOpen,
    Users,
    Landmark,
    ShieldCheck,
    Heart,
    HandCoins,
} from "lucide-react";
import { faqSchema, breadcrumbSchema, articleSchema, buildSchemaGraph } from "@/lib/seo/schemas";

/* ─── Metadata ────────────────────────────────────────────────── */

const PAGE_URL = "https://mohawkmedibles.ca/indigenous-cannabis-rights-canada";

export const metadata: Metadata = {
    title: "Indigenous Cannabis Rights Canada | Sovereignty & Treaty Rights | Mohawk Medibles",
    description:
        "Explore Indigenous cannabis rights in Canada — how treaty rights, Section 35 sovereignty, and the Haudenosaunee Confederacy intersect with cannabis law. Learn about Six Nations cannabis operations, self-governance, and economic empowerment on First Nations territory.",
    keywords: [
        "indigenous cannabis rights",
        "first nations cannabis",
        "indigenous sovereignty cannabis",
        "treaty rights cannabis canada",
        "mohawk cannabis dispensary",
        "six nations cannabis",
        "indigenous owned dispensary",
        "native dispensary canada",
        "indigenous cannabis law",
        "first nations treaty rights cannabis",
        "haudenosaunee cannabis",
        "mohawk territory cannabis rights",
        "indigenous self-governance cannabis",
        "cannabis act indigenous rights",
        "section 35 cannabis",
        "indigenous economic sovereignty cannabis",
        "tyendinaga cannabis rights",
    ],
    openGraph: {
        title: "Indigenous Cannabis Rights Canada | Sovereignty & Treaty Rights | Mohawk Medibles",
        description:
            "How treaty rights, Section 35 sovereignty, and First Nations self-governance shape Indigenous cannabis operations in Canada. An educational deep-dive from Mohawk Medibles.",
        url: PAGE_URL,
        type: "article",
        images: ["/og-image.png"],
        siteName: "Mohawk Medibles",
        locale: "en_CA",
    },
    twitter: {
        card: "summary_large_image",
        title: "Indigenous Cannabis Rights Canada | Sovereignty & Treaty Rights",
        description:
            "How treaty rights and Indigenous sovereignty shape cannabis operations on First Nations territory in Canada.",
    },
    alternates: {
        canonical: PAGE_URL,
    },
    robots: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
    },
};

/* ─── FAQ Data ────────────────────────────────────────────────── */

const FAQ_ITEMS = [
    {
        question: "Do Indigenous peoples have the right to operate cannabis dispensaries in Canada?",
        answer:
            "Indigenous peoples in Canada assert their right to operate cannabis dispensaries based on inherent sovereignty, treaty rights, and Section 35 of the Constitution Act, 1982, which recognizes and affirms Aboriginal and treaty rights. Many First Nations, including the Mohawk Nation and the Haudenosaunee Confederacy, maintain that their right to trade and engage in commerce on their own territories predates Canadian confederation and was never surrendered through any treaty. While the federal Cannabis Act (2018) does not specifically address Indigenous jurisdiction, numerous First Nations have established their own cannabis regulatory frameworks as an exercise of self-governance.",
    },
    {
        question: "What is Section 35 and how does it apply to Indigenous cannabis rights?",
        answer:
            "Section 35 of the Constitution Act, 1982 states that 'the existing aboriginal and treaty rights of the aboriginal peoples of Canada are hereby recognized and affirmed.' This constitutional protection covers a wide range of rights including self-governance, land use, and economic activities on traditional territories. Many Indigenous legal scholars and First Nations leaders argue that Section 35 protections extend to the right to regulate and engage in cannabis commerce on Indigenous lands, as this falls under the broader umbrella of self-determination and economic sovereignty that predates confederation.",
    },
    {
        question: "How does the Cannabis Act (2018) affect Indigenous communities?",
        answer:
            "The federal Cannabis Act (Bill C-45), which legalized recreational cannabis in Canada on October 17, 2018, was developed without meaningful consultation with First Nations, Metis, and Inuit communities — a point of significant criticism. The Act does not explicitly address Indigenous jurisdiction over cannabis, creating a legal grey area. Many Indigenous leaders have noted that the Act imposes provincial licensing frameworks that are often inaccessible or prohibitively expensive for Indigenous communities, despite those communities having longstanding relationships with cannabis that predate colonization. Several First Nations have responded by establishing their own regulatory frameworks.",
    },
    {
        question: "What is the history of cannabis use among Indigenous peoples in Canada?",
        answer:
            "Indigenous peoples across Turtle Island (North America) have a relationship with plant medicine that spans thousands of years. While cannabis (hemp) was introduced to the continent through European colonization, many Indigenous nations quickly integrated it into their medicinal and spiritual practices alongside existing sacred plants like tobacco, sage, sweetgrass, and cedar. The Medicine Wheel tradition, which emphasizes holistic balance of physical, emotional, mental, and spiritual health, provided a natural framework for understanding cannabis as a therapeutic plant. The criminalization of cannabis in Canada (1923) disproportionately harmed Indigenous communities, making today's sovereignty-based cannabis operations a form of both economic empowerment and restorative justice.",
    },
    {
        question: "How does Indigenous cannabis sovereignty support community economic development?",
        answer:
            "Indigenous cannabis sovereignty creates direct economic benefits for First Nations communities through multiple channels: job creation on reserves where unemployment rates often exceed 25%, tax revenue that funds community infrastructure, healthcare, education, and cultural programs, skills development and entrepreneurship opportunities for Indigenous youth, and reduced dependence on government transfer payments. Mohawk Medibles, for example, operates from Six Nations territory and reinvests a significant portion of revenue into community programs, youth initiatives, and cultural preservation. By keeping economic activity within Indigenous communities, cannabis sovereignty helps address generations of economic marginalization.",
    },
    {
        question: "What is the difference between provincial cannabis regulations and Indigenous cannabis rights?",
        answer:
            "Provincial cannabis regulations are established under the authority of the Cannabis Act and vary across Canada's provinces and territories — each sets its own rules for distribution, retail, pricing, age limits, and consumption. Indigenous cannabis rights, by contrast, are rooted in inherent sovereignty, treaty rights, and constitutional protections under Section 35. Many First Nations assert that provincial regulations do not apply on Indigenous territory because their right to self-governance predates and exists independently of the Canadian legislative framework. This has led to the emergence of Indigenous-developed cannabis regulatory systems that prioritize community standards, cultural values, and economic sovereignty over provincial licensing models.",
    },
    {
        question: "How does Mohawk Medibles exercise Indigenous cannabis sovereignty?",
        answer:
            "Mohawk Medibles exercises Indigenous cannabis sovereignty by operating as an Indigenous-owned and operated cannabis dispensary from Six Nations territory. The dispensary maintains rigorous quality standards through its Empire Standard quality program, which includes third-party lab testing for potency and contaminants, terpene profiling, and strict product curation. Mohawk Medibles serves customers across all 13 Canadian provinces and territories with over 344 premium products, provides employment and economic opportunities within the Mohawk community, and reinvests revenue into community development. The business represents a practical example of how Indigenous self-governance and economic sovereignty can operate successfully within the cannabis sector.",
    },
    {
        question: "Why should Canadians support Indigenous-owned cannabis businesses?",
        answer:
            "Supporting Indigenous-owned cannabis businesses is an act of reconciliation in practice. For generations, the criminalization of cannabis disproportionately impacted Indigenous communities through higher arrest rates and incarceration, while providing no economic benefit to those communities. Today, Indigenous-owned dispensaries like Mohawk Medibles redirect economic activity into First Nations communities, creating jobs, funding cultural and youth programs, and building Indigenous economic independence. Additionally, many Indigenous dispensaries offer competitive pricing (including tax-free products), rigorous quality standards, and a direct connection to the cultural and medicinal traditions that have always valued plant-based healing. Every purchase from an Indigenous-owned dispensary is a vote for economic justice and reconciliation.",
    },
];

/* ─── Schema Builder ──────────────────────────────────────────── */

function buildPageSchema(): string {
    return buildSchemaGraph(
        articleSchema({
            title: "Indigenous Cannabis Rights in Canada: Sovereignty, Treaty Rights & Self-Governance",
            slug: "../indigenous-cannabis-rights-canada",
            description:
                "A comprehensive educational guide to Indigenous cannabis rights in Canada, covering treaty rights, Section 35 sovereignty, the Cannabis Act, Six Nations operations, and economic self-determination.",
            datePublished: "2026-03-12",
            dateModified: "2026-03-12",
            image: "https://mohawkmedibles.ca/og-image.png",
            authorName: "Mohawk Medibles Team",
            authorCredentials:
                "Indigenous-owned cannabis dispensary operating from Six Nations territory since 2019, serving 47,000+ customers across Canada with deep roots in Haudenosaunee sovereignty and self-governance.",
            keywords: [
                "indigenous cannabis rights",
                "treaty rights cannabis canada",
                "indigenous sovereignty cannabis",
                "first nations cannabis",
                "six nations cannabis",
                "section 35 cannabis",
            ],
            wordCount: 2700,
        }),
        faqSchema(FAQ_ITEMS),
        breadcrumbSchema([
            { name: "Home", url: "https://mohawkmedibles.ca" },
            { name: "Indigenous Cannabis Rights Canada", url: PAGE_URL },
        ])
    );
}

/* ─── Page Component ──────────────────────────────────────────── */

export default function IndigenousCannabisRightsPage() {
    const schemaJsonLd = buildPageSchema();

    return (
        <div className="min-h-screen page-glass text-foreground">
            {/* JSON-LD Structured Data — all static data, no user input, safe for dangerouslySetInnerHTML */}
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger -- static JSON-LD schema, no user input
                dangerouslySetInnerHTML={{ __html: schemaJsonLd }}
            />

            {/* BREADCRUMB NAV */}
            <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-6 md:px-12 pt-6">
                <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <li>
                        <Link href="/" className="hover:text-forest dark:hover:text-lime transition-colors">
                            Home
                        </Link>
                    </li>
                    <li><ChevronRight className="w-3 h-3" /></li>
                    <li>
                        <Link href="/blog" className="hover:text-forest dark:hover:text-lime transition-colors">
                            Blog
                        </Link>
                    </li>
                    <li><ChevronRight className="w-3 h-3" /></li>
                    <li className="text-foreground font-semibold">Indigenous Cannabis Rights Canada</li>
                </ol>
            </nav>

            {/* HERO */}
            <header className="py-16 md:py-24">
                <div className="max-w-4xl mx-auto px-6 md:px-12">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/15 border border-lime/30 text-lime text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        Sovereignty &bull; Treaty Rights &bull; Self-Governance
                    </span>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter font-display leading-[0.95] mb-6 text-foreground">
                        Indigenous Cannabis Rights
                        <br />
                        <span className="text-forest dark:text-lime">in Canada</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
                        A comprehensive guide to how treaty rights, constitutional sovereignty, and First Nations
                        self-governance shape the landscape of Indigenous cannabis in Canada. Published by{" "}
                        <Link href="/about" className="text-forest dark:text-lime hover:underline font-semibold">
                            Mohawk Medibles
                        </Link>
                        , an Indigenous-owned dispensary operating from Six Nations territory since 2019.
                    </p>

                    <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
                        <time dateTime="2026-03-12">Published March 12, 2026</time>
                        <span>&middot;</span>
                        <span>12 min read</span>
                        <span>&middot;</span>
                        <span>By Mohawk Medibles Team</span>
                    </div>
                </div>
            </header>

            {/* TABLE OF CONTENTS */}
            <nav className="max-w-4xl mx-auto px-6 md:px-12 mb-16" aria-label="Table of Contents">
                <div className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8">
                    <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-forest dark:text-lime mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Table of Contents
                    </h2>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                        <li><a href="#introduction" className="hover:text-forest dark:hover:text-lime transition-colors">1. The Intersection of Indigenous Sovereignty and Cannabis</a></li>
                        <li><a href="#treaty-rights" className="hover:text-forest dark:hover:text-lime transition-colors">2. Treaty Rights and Cannabis</a></li>
                        <li><a href="#history" className="hover:text-forest dark:hover:text-lime transition-colors">3. History of Indigenous Cannabis in Canada</a></li>
                        <li><a href="#six-nations" className="hover:text-forest dark:hover:text-lime transition-colors">4. Six Nations and Cannabis</a></li>
                        <li><a href="#sovereignty" className="hover:text-forest dark:hover:text-lime transition-colors">5. Indigenous Cannabis Sovereignty</a></li>
                        <li><a href="#legal-framework" className="hover:text-forest dark:hover:text-lime transition-colors">6. Legal Framework</a></li>
                        <li><a href="#supporting-indigenous" className="hover:text-forest dark:hover:text-lime transition-colors">7. Supporting Indigenous-Owned Cannabis Businesses</a></li>
                        <li><a href="#faq" className="hover:text-forest dark:hover:text-lime transition-colors">8. Frequently Asked Questions</a></li>
                    </ol>
                </div>
            </nav>

            {/* ARTICLE BODY */}
            <article className="max-w-4xl mx-auto px-6 md:px-12 pb-24">

                {/* Section 1: Introduction */}
                <section id="introduction" className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center">
                            <Scale className="w-5 h-5 text-forest dark:text-lime" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display text-foreground">
                            The Intersection of Indigenous Sovereignty and Cannabis
                        </h2>
                    </div>

                    <div className="space-y-5 text-muted-foreground leading-relaxed">
                        <p>
                            The relationship between Indigenous peoples and cannabis in Canada exists at one of the most
                            consequential intersections in Canadian law: where inherent Indigenous sovereignty meets federal
                            drug regulation. For generations, Indigenous communities across Turtle Island have maintained
                            their own governance systems, trade networks, and relationships with plant medicines &mdash;
                            systems that predate the Canadian state by thousands of years.
                        </p>
                        <p>
                            When Canada legalized recreational cannabis through the <strong>Cannabis Act (Bill C-45)</strong> on
                            October 17, 2018, it opened a multi-billion-dollar industry. Yet the legislation was developed
                            without meaningful consultation with First Nations, M&eacute;tis, and Inuit communities &mdash; the
                            very peoples whose inherent rights to the land and its resources are constitutionally protected under{" "}
                            <strong>Section 35 of the Constitution Act, 1982</strong>. This omission created a legal and moral
                            vacuum that continues to shape the cannabis landscape across the country.
                        </p>
                        <p>
                            Indigenous cannabis rights in Canada are not about breaking the law. They are about asserting
                            rights that have never been surrendered &mdash; rights to self-governance, economic
                            self-determination, and the stewardship of traditional territories. Understanding these rights
                            is essential for any Canadian who cares about reconciliation, justice, and the true meaning
                            of the treaty relationship that forms the foundation of this country.
                        </p>
                        <p>
                            This guide, published by{" "}
                            <Link href="/indigenous-cannabis-dispensary-canada" className="text-forest dark:text-lime hover:underline font-semibold">
                                Mohawk Medibles
                            </Link>
                            , an Indigenous-owned dispensary operating from Six Nations territory, explores how treaty rights,
                            constitutional protections, and First Nations self-governance intersect with cannabis law in
                            Canada. Our goal is education, not legal advice &mdash; and we encourage readers to engage with
                            these issues with the respect and curiosity they deserve.
                        </p>
                    </div>
                </section>

                {/* Section 2: Treaty Rights and Cannabis */}
                <section id="treaty-rights" className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center">
                            <Landmark className="w-5 h-5 text-forest dark:text-lime" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display text-foreground">
                            Treaty Rights and Cannabis
                        </h2>
                    </div>

                    <div className="space-y-5 text-muted-foreground leading-relaxed">
                        <p>
                            Canada was built on treaties &mdash; agreements between the Crown and Indigenous nations that
                            established the terms of coexistence on this land. These treaties were not acts of surrender.
                            They were nation-to-nation agreements that recognized Indigenous peoples as sovereign entities
                            with their own governance, laws, and economies.
                        </p>
                        <p>
                            The <strong>Two Row Wampum (Kaswentha)</strong>, one of the oldest treaty relationships in
                            North America, established the principle of parallel sovereignty between the Haudenosaunee
                            Confederacy and European newcomers. The two rows of purple beads represent two vessels &mdash;
                            a canoe and a ship &mdash; traveling down the river of life side by side. Each vessel carries its
                            own people, its own laws, its own customs. Neither tries to steer the other. This foundational
                            treaty principle is central to understanding why many Haudenosaunee communities, including the
                            Mohawk Nation, assert their right to regulate cannabis on their own terms.
                        </p>

                        <h3 className="text-xl font-bold text-foreground pt-4">Section 35: Constitutional Protection</h3>
                        <p>
                            Section 35(1) of the Constitution Act, 1982 states unequivocally: <em>&ldquo;The existing
                            aboriginal and treaty rights of the aboriginal peoples of Canada are hereby recognized and
                            affirmed.&rdquo;</em> This is not a gift from the Crown. It is a constitutional acknowledgment
                            of rights that already existed &mdash; rights that were never surrendered through any treaty
                            or act of Parliament.
                        </p>
                        <p>
                            These rights encompass self-governance, the use and management of traditional lands, and economic
                            activities conducted on those lands. Many Indigenous legal scholars argue that the right to engage
                            in cannabis commerce on First Nations territory falls squarely within the scope of Section 35
                            protections. The Supreme Court of Canada has consistently held that Aboriginal rights must be
                            interpreted generously and purposively, and that the Crown bears the burden of justifying any
                            infringement on those rights through the <strong>Sparrow test</strong> (R. v. Sparrow, 1990).
                        </p>

                        <h3 className="text-xl font-bold text-foreground pt-4">The Duty to Consult</h3>
                        <p>
                            Canadian law establishes a <strong>duty to consult</strong> Indigenous peoples when government
                            actions may affect their rights. The development of the Cannabis Act without meaningful
                            consultation with First Nations communities was a notable failure of this duty. The Assembly of
                            First Nations (AFN) and numerous individual nations raised concerns during the legislative process,
                            calling for recognition of Indigenous jurisdiction over cannabis on reserve lands. These calls
                            were largely ignored in the final legislation, fueling the assertion by many communities that
                            they have the right &mdash; and the responsibility &mdash; to create their own cannabis
                            regulatory frameworks.
                        </p>
                    </div>
                </section>

                {/* Section 3: History */}
                <section id="history" className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-forest dark:text-lime" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display text-foreground">
                            History of Indigenous Cannabis in Canada
                        </h2>
                    </div>

                    <div className="space-y-5 text-muted-foreground leading-relaxed">
                        <h3 className="text-xl font-bold text-foreground">Pre-Colonial Plant Medicine Traditions</h3>
                        <p>
                            Long before European contact, Indigenous peoples across Turtle Island maintained sophisticated
                            relationships with plant medicines. The <strong>four sacred medicines</strong> of many First
                            Nations traditions &mdash; tobacco (sem&agrave;:a), sage, sweetgrass, and cedar &mdash; form the
                            foundation of a healing philosophy that views plants as relatives, not commodities. This
                            worldview emphasizes reciprocity: people care for the plants, and the plants care for the people.
                        </p>
                        <p>
                            Hemp (Cannabis sativa) was introduced to North America through European colonization, but
                            Indigenous communities integrated it into their existing plant medicine frameworks with
                            remarkable speed. The <strong>Medicine Wheel</strong> &mdash; a holistic framework for health
                            that balances the physical, emotional, mental, and spiritual dimensions of well-being &mdash;
                            provided a natural context for understanding cannabis as a therapeutic plant with applications
                            across all four dimensions.
                        </p>

                        <h3 className="text-xl font-bold text-foreground pt-4">Prohibition and Its Disproportionate Impact</h3>
                        <p>
                            Canada first criminalized cannabis in 1923, adding it to the schedule of the Opium and Narcotic
                            Drug Act with virtually no parliamentary debate and no scientific basis. For nearly a century,
                            cannabis prohibition served as a tool of social control that disproportionately targeted
                            Indigenous peoples and other marginalized communities. Indigenous Canadians have been
                            overrepresented in cannabis-related arrests and incarceration at rates far exceeding their
                            share of the population.
                        </p>
                        <p>
                            The damage of prohibition extended beyond criminal justice. By criminalizing a plant that many
                            Indigenous communities had integrated into their healing practices, the Canadian government
                            added another layer of cultural suppression to the already devastating impacts of residential
                            schools, the Sixties Scoop, and ongoing colonial policies. The legalization of cannabis in 2018,
                            while welcomed by many, has done little to address this historical harm &mdash; particularly
                            when the economic benefits of legalization have overwhelmingly flowed to non-Indigenous
                            corporations.
                        </p>

                        <h3 className="text-xl font-bold text-foreground pt-4">Resurgence and Reclamation</h3>
                        <p>
                            The past decade has seen a powerful resurgence of Indigenous cannabis operations across Canada.
                            From Tyendinaga Mohawk Territory in Ontario to Tk&apos;emlups te Secw&eacute;pemc in British
                            Columbia, First Nations communities have established dispensaries, cultivation operations, and
                            regulatory frameworks that reflect their own values and governance traditions. This movement
                            is not simply about commerce. It is an exercise of inherent sovereignty and a practical act
                            of economic reconciliation &mdash; reclaiming an industry that was built on the
                            criminalization of Indigenous communities.
                        </p>
                    </div>
                </section>

                {/* Section 4: Six Nations and Cannabis */}
                <section id="six-nations" className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center">
                            <Users className="w-5 h-5 text-forest dark:text-lime" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display text-foreground">
                            Six Nations and Cannabis
                        </h2>
                    </div>

                    <div className="space-y-5 text-muted-foreground leading-relaxed">
                        <p>
                            The <strong>Six Nations of the Grand River</strong> &mdash; the largest First Nation community
                            in Canada by population &mdash; sits at the centre of the Indigenous cannabis movement in Ontario.
                            Home to more than 27,000 registered members, Six Nations is part of the{" "}
                            <strong>Haudenosaunee (Iroquois) Confederacy</strong>, one of the oldest participatory democracies
                            in the world, predating the founding of Canada by centuries.
                        </p>
                        <p>
                            The Haudenosaunee Confederacy comprises six nations: the Mohawk (Kanien&apos;keh&aacute;:ka),
                            Oneida (Onyota&apos;a:ka), Onondaga, Cayuga, Seneca, and Tuscarora. Each nation maintains its own
                            governance within the broader Confederacy, united by the <strong>Great Law of Peace
                            (Kaian&apos;er&eacute;:kowa)</strong> &mdash; a constitution that established principles of
                            consensus governance, individual liberty, and collective responsibility long before European
                            contact.
                        </p>

                        <h3 className="text-xl font-bold text-foreground pt-4">Mohawk Medibles: A Community Story</h3>
                        <p>
                            <Link href="/about" className="text-forest dark:text-lime hover:underline font-semibold">
                                Mohawk Medibles
                            </Link>{" "}
                            was founded in 2019 on Mohawk territory as a community-focused cannabis operation. What began
                            as a small local dispensary has grown into one of Canada&apos;s most trusted Indigenous-owned
                            online dispensaries, serving customers in all 13 provinces and territories with over 344
                            premium, lab-tested products.
                        </p>
                        <p>
                            The growth of Mohawk Medibles reflects a broader pattern across Six Nations and Tyendinaga
                            Mohawk Territory, where cannabis operations have become significant economic drivers. These
                            businesses provide employment in communities where job opportunities have historically been
                            scarce, generate revenue that supports community programs and infrastructure, and demonstrate
                            that Indigenous self-governance can produce high-quality, well-regulated economic activity.
                        </p>
                        <p>
                            Every product at Mohawk Medibles meets the{" "}
                            <strong>Empire Standard&trade;</strong> quality program &mdash; including third-party lab testing
                            for potency and contaminants, terpene profiling, and rigorous curation. This commitment to
                            quality is not just good business. It is an expression of Indigenous values: the responsibility
                            to ensure that what you provide to your community and customers is safe, effective, and worthy
                            of trust.
                        </p>

                        <h3 className="text-xl font-bold text-foreground pt-4">Community Impact</h3>
                        <p>
                            The impact of Indigenous cannabis operations on Six Nations extends far beyond individual
                            businesses. Cannabis revenue has supported youth programs, cultural preservation initiatives,
                            language revitalization efforts, and community infrastructure improvements. It has created
                            career pathways for young people who might otherwise have to leave their community to find
                            work. And it has demonstrated to the broader Canadian public that Indigenous self-governance
                            is not a threat to public safety &mdash; it is a pathway to prosperity and reconciliation.
                        </p>
                    </div>
                </section>

                {/* Section 5: Indigenous Cannabis Sovereignty */}
                <section id="sovereignty" className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-forest dark:text-lime" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display text-foreground">
                            Indigenous Cannabis Sovereignty
                        </h2>
                    </div>

                    <div className="space-y-5 text-muted-foreground leading-relaxed">
                        <p>
                            Indigenous cannabis sovereignty is the assertion by First Nations, M&eacute;tis, and Inuit
                            communities of their inherent right to regulate, produce, and sell cannabis within their
                            territories according to their own laws and governance frameworks. This is not a new concept.
                            It is an application of the same principles of self-determination that Indigenous peoples have
                            exercised for millennia.
                        </p>

                        <h3 className="text-xl font-bold text-foreground pt-4">Self-Governance in Practice</h3>
                        <p>
                            Across Canada, numerous First Nations have developed their own cannabis laws and regulations.
                            These frameworks typically address product quality and safety standards, age restrictions and
                            responsible use, business licensing and operations, revenue allocation and community benefit,
                            and environmental stewardship. These Indigenous-developed regulatory systems often exceed the
                            standards set by provincial cannabis authorities, reflecting the deep sense of responsibility
                            that comes with community-based governance. When your customers are also your neighbours,
                            relatives, and community members, the incentive to maintain the highest standards is personal,
                            not just commercial.
                        </p>

                        <h3 className="text-xl font-bold text-foreground pt-4">Economic Empowerment and Job Creation</h3>
                        <p>
                            The economic case for Indigenous cannabis sovereignty is compelling. According to the
                            Indigenous Services Canada Annual Report, many First Nations reserves face unemployment
                            rates exceeding 25% &mdash; more than four times the national average. Cannabis operations
                            create a range of employment opportunities, from cultivation and production to retail,
                            quality assurance, and management. For communities that have long been economically
                            marginalized, cannabis sovereignty represents a viable path to self-sufficiency.
                        </p>
                        <p>
                            Beyond direct employment, Indigenous cannabis businesses generate multiplier effects within
                            their communities. Revenue circulates through local economies, supporting other Indigenous-owned
                            businesses, service providers, and community organizations. This stands in stark contrast to
                            the corporate cannabis model, where profits typically flow to shareholders in Toronto, New York,
                            or other financial centres far removed from the communities where the product is consumed.
                        </p>

                        <h3 className="text-xl font-bold text-foreground pt-4">UNDRIP and International Recognition</h3>
                        <p>
                            The <strong>United Nations Declaration on the Rights of Indigenous Peoples (UNDRIP)</strong>,
                            which Canada endorsed in 2016 and implemented through Bill C-15 in 2021, affirms that Indigenous
                            peoples have the right to self-determination, including the right to autonomy in matters
                            relating to their internal and local affairs, as well as the right to maintain and develop
                            their economic institutions. Cannabis sovereignty aligns directly with these internationally
                            recognized principles.
                        </p>
                    </div>
                </section>

                {/* Section 6: Legal Framework */}
                <section id="legal-framework" className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center">
                            <Landmark className="w-5 h-5 text-forest dark:text-lime" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display text-foreground">
                            Legal Framework
                        </h2>
                    </div>

                    <div className="space-y-5 text-muted-foreground leading-relaxed">
                        <p>
                            The legal landscape of Indigenous cannabis in Canada is shaped by the intersection of multiple
                            legal traditions and instruments. Understanding this framework requires recognizing that
                            Indigenous law is not subordinate to Canadian law &mdash; these are parallel legal systems
                            with distinct origins and authorities.
                        </p>

                        <div className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8 my-8">
                            <h3 className="text-lg font-bold text-foreground mb-4">Key Legal Instruments</h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-lime/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-forest dark:text-lime font-bold text-sm">1</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground">The Indian Act (1876)</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            The primary federal legislation governing First Nations in Canada. While it has been
                                            amended many times, it remains a colonial framework that many Indigenous leaders view
                                            as incompatible with inherent sovereignty. The Indian Act does not grant Indigenous
                                            rights &mdash; it restricts them. Many cannabis sovereignty assertions are made
                                            explicitly outside the Indian Act framework.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-lime/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-forest dark:text-lime font-bold text-sm">2</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground">Constitution Act, 1982 (Section 35)</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Recognizes and affirms existing Aboriginal and treaty rights. The Supreme Court of
                                            Canada has interpreted Section 35 broadly, establishing that Aboriginal rights include
                                            practices, customs, and traditions integral to the distinctive cultures of Aboriginal
                                            peoples, as well as rights arising from treaties and agreements with the Crown.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-lime/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-forest dark:text-lime font-bold text-sm">3</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground">Cannabis Act (Bill C-45, 2018)</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Legalized recreational cannabis in Canada but did not explicitly address Indigenous
                                            jurisdiction. The Act delegates retail and distribution regulation to provinces,
                                            creating a framework that many First Nations communities view as inapplicable to
                                            their territories. The lack of an Indigenous-specific pathway within the Act has been
                                            widely criticized.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-lime/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-forest dark:text-lime font-bold text-sm">4</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground">UNDRIP Implementation Act (Bill C-15, 2021)</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Requires the Government of Canada to align its laws with the United Nations Declaration
                                            on the Rights of Indigenous Peoples, including the right to self-determination and
                                            economic autonomy. This legislation strengthens the legal basis for Indigenous cannabis
                                            sovereignty by establishing an international human rights framework for Indigenous
                                            self-governance in Canada.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-foreground pt-4">Provincial Regulations vs. Treaty Rights</h3>
                        <p>
                            Each Canadian province has established its own cannabis regulatory framework under the Cannabis
                            Act. Ontario operates through the Ontario Cannabis Store (OCS) and the Alcohol and Gaming
                            Commission of Ontario (AGCO). British Columbia uses the Liquor and Cannabis Regulation Branch.
                            Alberta operates through the Alberta Gaming, Liquor and Cannabis (AGLC). Each province sets
                            its own rules for licensing, distribution, pricing, and retail.
                        </p>
                        <p>
                            Many First Nations assert that these provincial regulations simply do not apply on Indigenous
                            territory. The basis for this assertion is straightforward: provincial governments derive their
                            authority from the Constitution Act, 1867, which divides power between federal and provincial
                            levels of government. Indigenous governance predates this division of powers and exists
                            independently of it. Treaty rights, affirmed under Section 35, create a distinct legal space
                            that provincial legislation cannot unilaterally override.
                        </p>
                        <p>
                            The result is a legal landscape where multiple regulatory frameworks coexist &mdash; sometimes
                            in tension, sometimes in parallel. This is not chaos. It is the natural consequence of a country
                            built on treaties between sovereign nations. The path forward lies not in forcing uniformity,
                            but in building respectful government-to-government relationships that honour the treaty
                            relationship at the heart of Canada&apos;s founding.
                        </p>
                    </div>
                </section>

                {/* Section 7: Supporting Indigenous-Owned Cannabis Businesses */}
                <section id="supporting-indigenous" className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-forest dark:text-lime" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display text-foreground">
                            Supporting Indigenous-Owned Cannabis Businesses
                        </h2>
                    </div>

                    <div className="space-y-5 text-muted-foreground leading-relaxed">
                        <p>
                            Reconciliation is not just a word. It is a practice &mdash; something Canadians can participate in
                            through the choices they make every day. One of the most direct ways to support reconciliation
                            is to direct your spending toward Indigenous-owned businesses. When you purchase cannabis from
                            an Indigenous-owned dispensary, you are making an economic decision that has real, measurable
                            impact on Indigenous communities.
                        </p>

                        <h3 className="text-xl font-bold text-foreground pt-4">Why It Matters</h3>
                        <p>
                            The cannabis industry in Canada generates billions of dollars annually. The vast majority of
                            that revenue flows to non-Indigenous corporations &mdash; many of them publicly traded companies
                            with shareholders who have no connection to the communities where cannabis is produced or
                            consumed. Meanwhile, the communities that bore the heaviest burden of cannabis prohibition
                            &mdash; including Indigenous communities, who were disproportionately arrested and incarcerated
                            for cannabis offences &mdash; have received almost none of the economic benefits of legalization.
                        </p>
                        <p>
                            Indigenous-owned dispensaries like{" "}
                            <Link href="/shop" className="text-forest dark:text-lime hover:underline font-semibold">
                                Mohawk Medibles
                            </Link>{" "}
                            change this equation. Revenue stays within Indigenous communities, funding jobs, youth programs,
                            cultural preservation, language revitalization, and community infrastructure. This is not
                            charity. It is economic justice &mdash; redirecting the flow of cannabis dollars to the
                            communities that have the most to gain from a fair and equitable industry.
                        </p>

                        <h3 className="text-xl font-bold text-foreground pt-4">Community Reinvestment</h3>
                        <p>
                            Indigenous-owned cannabis businesses are uniquely positioned to reinvest in their communities
                            because their owners, employees, and customers are often one and the same community. At Mohawk
                            Medibles, a significant portion of revenue goes directly back into Six Nations through
                            employment, community program support, and local procurement. This model of community-centered
                            business is deeply rooted in Indigenous values of reciprocity and collective well-being.
                        </p>

                        <h3 className="text-xl font-bold text-foreground pt-4">Quality You Can Trust</h3>
                        <p>
                            Beyond the social and economic benefits, Indigenous-owned dispensaries often maintain quality
                            standards that meet or exceed those of government-regulated stores. Mohawk Medibles&apos;{" "}
                            <strong>Empire Standard&trade;</strong> quality program includes third-party lab testing for
                            potency and contaminants, terpene profiling for every strain, and rigorous product curation
                            across{" "}
                            <Link href="/shop" className="text-forest dark:text-lime hover:underline font-semibold">
                                344+ products
                            </Link>
                            . With free shipping on orders over $199,{" "}
                            <Link href="/delivery" className="text-forest dark:text-lime hover:underline font-semibold">
                                delivery across all 13 provinces and territories
                            </Link>
                            , and tax-free pricing, supporting Indigenous cannabis is not just the right thing to do &mdash;
                            it is the smart thing to do.
                        </p>
                    </div>
                </section>

                {/* Section 8: FAQ */}
                <section id="faq" className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center">
                            <HandCoins className="w-5 h-5 text-forest dark:text-lime" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display text-foreground">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {FAQ_ITEMS.map((faq, index) => (
                            <div key={index} className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8">
                                <h3 className="text-lg font-bold text-foreground mb-3">
                                    {faq.question}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="glass-card backdrop-blur-xl border border-lime/30 rounded-3xl p-8 md:p-12 text-center">
                    <Leaf className="w-10 h-10 text-forest dark:text-lime mx-auto mb-4" />
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display text-foreground mb-4">
                        Support Indigenous Cannabis Sovereignty
                    </h2>
                    <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
                        Every purchase from an Indigenous-owned dispensary is an act of reconciliation. Shop Mohawk
                        Medibles for 344+ premium, lab-tested cannabis products shipped free across Canada on orders
                        over $199. Indigenous-owned. Community-powered. Quality-guaranteed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/shop"
                            className="inline-flex items-center justify-center gap-2 bg-lime text-charcoal-deep px-8 py-4 rounded-full font-bold text-lg hover:bg-lime-light transition-colors shadow-[0_0_40px_rgba(200,230,62,0.3)]"
                        >
                            Shop Mohawk Medibles <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/reviews"
                            className="inline-flex items-center justify-center gap-2 border border-foreground/20 dark:border-white/20 text-foreground dark:text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-foreground/10 dark:hover:bg-white/10 transition-colors"
                        >
                            Read Customer Reviews
                        </Link>
                    </div>
                </section>

                {/* Related Reading */}
                <section className="mt-16">
                    <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-forest dark:text-lime mb-6">
                        Continue Reading
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Link
                            href="/indigenous-cannabis-dispensary-canada"
                            className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6 hover:border-lime/40 transition-colors group"
                        >
                            <h3 className="font-bold text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors mb-2">
                                Indigenous Cannabis Dispensary Canada
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Learn about Mohawk Medibles &mdash; Canada&apos;s trusted Indigenous-owned online dispensary
                                with 344+ premium products.
                            </p>
                        </Link>
                        <Link
                            href="/blog"
                            className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6 hover:border-lime/40 transition-colors group"
                        >
                            <h3 className="font-bold text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors mb-2">
                                Mohawk Medibles Blog
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                News, education, and updates from Canada&apos;s Indigenous cannabis community.
                            </p>
                        </Link>
                        <Link
                            href="/about"
                            className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6 hover:border-lime/40 transition-colors group"
                        >
                            <h3 className="font-bold text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors mb-2">
                                Our Story
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                The history and mission of Mohawk Medibles &mdash; from Six Nations territory to all of Canada.
                            </p>
                        </Link>
                        <Link
                            href="/delivery"
                            className="glass-card backdrop-blur-xl border border-border rounded-2xl p-6 hover:border-lime/40 transition-colors group"
                        >
                            <h3 className="font-bold text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors mb-2">
                                Delivery Across Canada
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Free shipping on orders over $199 to all 13 provinces and territories via Canada Post Xpresspost.
                            </p>
                        </Link>
                    </div>
                </section>
            </article>
        </div>
    );
}
