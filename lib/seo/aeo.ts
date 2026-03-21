/**
 * Mohawk Medibles — AEO (Answer Engine Optimization)
 * ═══════════════════════════════════════════════════
 * Generates FAQ schema, "People Also Ask" content,
 * and Q&A pairs optimized for featured snippets
 * and AI answer extraction by ChatGPT, Perplexity, Claude, SGE.
 */

// ─── Core FAQ Database ──────────────────────────────────────
// These are the high-value questions that AI engines surface.
// Ordered by search intent: Informational → Transactional → Navigational

export interface FAQEntry {
    question: string;
    answer: string;
    category: "general" | "products" | "shipping" | "dosing" | "legal" | "quality";
    intent: "informational" | "transactional" | "navigational";
    keywords: string[];
}

export const MASTER_FAQ_DATABASE: FAQEntry[] = [
    // ── General ─────────────────────────────────────────────
    {
        question: "What is Mohawk Medibles?",
        answer: "Mohawk Medibles is an Indigenous-owned premium cannabis dispensary located on Six Nations of the Grand River territory in Ontario, Canada. Founded by Mohawk entrepreneurs, we specialize in lab-tested, terpene-profiled cannabis products that meet our Empire Standard™ quality benchmark. We carry 344+ products across flower, edibles, concentrates, vapes, pre-rolls, and accessories.",
        category: "general",
        intent: "informational",
        keywords: ["mohawk medibles", "indigenous cannabis", "six nations dispensary"],
    },
    {
        question: "Is Mohawk Medibles a legitimate dispensary?",
        answer: "Yes. Mohawk Medibles operates as an Indigenous-owned business on Six Nations sovereign territory. All products are third-party lab-tested for potency, pesticides, heavy metals, and microbial contaminants. We maintain full supply chain transparency and our Empire Standard™ quality certification ensures every product meets strict safety benchmarks.",
        category: "general",
        intent: "informational",
        keywords: ["mohawk medibles legitimate", "is mohawk medibles safe", "indigenous dispensary legal"],
    },
    {
        question: "Where is Mohawk Medibles located?",
        answer: "Mohawk Medibles is located on Six Nations of the Grand River territory in Ohsweken, Ontario, Canada (postal code N0A 1M0). We also ship Canada-wide via Canada Post Xpresspost with tracking on every order. Our location is approximately 30 minutes south of Hamilton and 90 minutes west of Toronto.",
        category: "general",
        intent: "navigational",
        keywords: ["mohawk medibles location", "six nations dispensary address", "ohsweken cannabis"],
    },

    // ── Products ────────────────────────────────────────────
    {
        question: "What types of cannabis products does Mohawk Medibles carry?",
        answer: "We carry 344+ products across 6 categories: Premium Flower (Indica, Sativa, Hybrid strains with full terpene profiles), Edibles (gummies, chocolates, beverages with precise dosing from 5mg-100mg THC), Concentrates (hash, shatter, wax, live resin, distillate), Vapes (cartridges and disposable pens), Pre-Rolls (singles, multi-packs, and infused joints), and Accessories (grinders, papers, pipes, storage). Every product is lab-tested under our Empire Standard™.",
        category: "products",
        intent: "informational",
        keywords: ["mohawk medibles products", "cannabis products online canada", "buy weed online ontario"],
    },
    {
        question: "What are the best cannabis strains at Mohawk Medibles?",
        answer: "Our top-rated strains include a carefully curated selection of Indica, Sativa, and Hybrid varieties. Each strain listing includes detailed terpene profiles (myrcene, limonene, caryophyllene, etc.), THC/CBD percentages, expected effects, and recommended use cases. We rotate seasonal exclusives and limited-batch craft strains sourced from veteran indigenous growers with 10+ years experience.",
        category: "products",
        intent: "transactional",
        keywords: ["best cannabis strains", "top weed strains canada", "premium flower ontario"],
    },
    {
        question: "What is the difference between Indica, Sativa, and Hybrid cannabis?",
        answer: "Indica strains typically produce relaxing, body-focused effects ideal for evening use, pain relief, and sleep. Sativa strains tend to create energizing, cerebral effects suited for daytime creativity and focus. Hybrid strains combine characteristics of both, with ratios varying by cultivar. Modern cannabis science shows that terpene profiles (aromatic compounds like myrcene, limonene, and pinene) are often more predictive of effects than the Indica/Sativa classification alone. At Mohawk Medibles, every strain includes a full terpene breakdown to help you find your ideal match.",
        category: "products",
        intent: "informational",
        keywords: ["indica vs sativa", "cannabis strain types", "hybrid cannabis explained"],
    },
    {
        question: "What are terpenes and why do they matter in cannabis?",
        answer: "Terpenes are aromatic compounds found in all plants, including cannabis. They produce the distinct smells and flavors of each strain — from the citrusy zing of limonene to the earthy calm of myrcene. More importantly, terpenes contribute to the 'entourage effect,' working synergistically with THC and CBD to modulate your experience. For example, myrcene enhances relaxation, limonene boosts mood, and caryophyllene has anti-inflammatory properties. At Mohawk Medibles, we lab-test every flower batch for its complete terpene profile so you can make informed choices.",
        category: "products",
        intent: "informational",
        keywords: ["cannabis terpenes", "terpene profile", "entourage effect", "myrcene limonene"],
    },

    // ── Shipping ────────────────────────────────────────────
    {
        question: "Does Mohawk Medibles ship across Canada?",
        answer: "Yes, Mohawk Medibles ships Canada-wide via Canada Post Xpresspost. Every order includes a tracking number sent to your email. Standard delivery takes 2-5 business days depending on your location. All packages are shipped in discreet, odor-proof packaging with no external branding indicating the contents.",
        category: "shipping",
        intent: "transactional",
        keywords: ["mohawk medibles shipping", "buy weed online canada shipping", "cannabis delivery canada"],
    },
    {
        question: "How is cannabis shipped safely and discreetly?",
        answer: "All orders are packaged in vacuum-sealed, odor-proof bags inside plain brown boxes with no external cannabis branding. We ship via Canada Post Xpresspost with full tracking and age verification on delivery. Packages require an adult signature (19+) at the delivery address.",
        category: "shipping",
        intent: "informational",
        keywords: ["discreet cannabis shipping", "how is weed shipped", "cannabis packaging"],
    },

    // ── Dosing ──────────────────────────────────────────────
    {
        question: "How do I choose the right cannabis edible dosage?",
        answer: "For edible cannabis, we recommend the 'start low, go slow' approach: Beginners should start with 2.5-5mg THC, wait 2 full hours before considering more. Regular consumers may find 10-25mg effective. Experienced users may use 25-50mg+ based on tolerance. Edibles take 30-120 minutes to take effect and last 4-8 hours, significantly longer than smoking or vaping. Always check the mg per serving on the package. Our product pages list exact THC content per piece for precise dosing.",
        category: "dosing",
        intent: "informational",
        keywords: ["edible dosage guide", "how many mg thc beginners", "cannabis edible dosing"],
    },
    {
        question: "What is microdosing cannabis and how does it work?",
        answer: "Microdosing cannabis involves taking very small amounts (1-5mg THC) to achieve subtle therapeutic benefits without the full psychoactive 'high.' Benefits may include reduced anxiety, enhanced focus, mild pain relief, and improved sleep quality. The technique is popular among professionals and wellness-conscious consumers. To microdose effectively: start with 2.5mg THC, maintain consistent timing (morning or evening), keep a journal of effects, and adjust by 1mg increments. Our low-dose edibles (5mg per piece) are designed specifically for microdosing.",
        category: "dosing",
        intent: "informational",
        keywords: ["microdosing cannabis", "low dose thc", "cannabis microdose benefits"],
    },

    // ── Quality & Trust ─────────────────────────────────────
    {
        question: "What is the Empire Standard™ and how does it ensure quality?",
        answer: "The Empire Standard™ is Mohawk Medibles' proprietary quality benchmark. Every product must pass: (1) Third-party lab testing for THC/CBD potency accuracy, (2) Pesticide, heavy metal, and mycotoxin screening, (3) Terpene profile analysis for full chemical transparency, (4) Visual and aromatic inspection by our team of cannabis experts with 10+ years experience. Products that fail any stage are rejected. Lab results are available on request for any product in our catalog.",
        category: "quality",
        intent: "informational",
        keywords: ["empire standard cannabis", "lab tested cannabis", "cannabis quality testing"],
    },
    {
        question: "Are Mohawk Medibles products tested for pesticides and contaminants?",
        answer: "Yes, every product we sell undergoes comprehensive third-party laboratory testing for pesticides, heavy metals (arsenic, cadmium, lead, mercury), microbial contaminants (E. coli, Salmonella, mold), mycotoxins, and residual solvents. We also test for accurate THC and CBD potency to ensure label claims match actual content. This testing is a core requirement of our Empire Standard™ quality certification.",
        category: "quality",
        intent: "informational",
        keywords: ["cannabis testing", "pesticide free cannabis", "lab tested weed"],
    },

    // ── Legal ───────────────────────────────────────────────
    {
        question: "What is the legal age to buy cannabis from Mohawk Medibles?",
        answer: "You must be 19 years of age or older to purchase cannabis products from Mohawk Medibles, consistent with Ontario's legal cannabis purchasing age. Age verification is required at the point of delivery. We utilize Canada Post's age verification service to ensure all recipients are of legal age.",
        category: "legal",
        intent: "informational",
        keywords: ["cannabis legal age ontario", "buy weed age requirement", "19 cannabis ontario"],
    },
];

// ─── "People Also Ask" Generator ────────────────────────────
// Generates PAA-style content blocks that AI engines love to cite

export interface PeopleAlsoAsk {
    topic: string;
    questions: {
        question: string;
        shortAnswer: string;         // 1-2 sentence — for featured snippets
        detailedAnswer: string;      // Full answer — for AI citations
    }[];
}

export function generatePAAForCategory(category: string): PeopleAlsoAsk {
    const categoryFaqs = MASTER_FAQ_DATABASE.filter((f) => f.category === category);

    return {
        topic: category,
        questions: categoryFaqs.map((faq) => {
            const sentences = faq.answer.split(". ");
            return {
                question: faq.question,
                shortAnswer: sentences.slice(0, 2).join(". ") + ".",
                detailedAnswer: faq.answer,
            };
        }),
    };
}

// ─── Product-Specific FAQ Generator ─────────────────────────
// Generates AEO-optimized Q&A for individual product pages

export function generateProductFAQs(product: {
    name: string;
    category: string;
    thc?: string;
    cbd?: string;
    terpenes?: string[];
    price?: number;
}): FAQEntry[] {
    const faqs: FAQEntry[] = [
        {
            question: `What is ${product.name}?`,
            answer: `${product.name} is a premium ${product.category.toLowerCase()} product available at Mohawk Medibles. ${product.thc ? `It contains approximately ${product.thc} THC` : ""}${product.cbd ? ` and ${product.cbd} CBD` : ""}. ${product.terpenes?.length ? `The dominant terpenes are ${product.terpenes.join(", ")}, contributing to its unique aroma and effects.` : ""} Every batch is lab-tested under our Empire Standard™ quality certification.`,
            category: "products",
            intent: "informational",
            keywords: [product.name.toLowerCase(), product.category.toLowerCase()],
        },
        {
            question: `Is ${product.name} good for beginners?`,
            answer: `${product.thc && parseFloat(product.thc) > 25 ? `${product.name} has a high THC content (${product.thc}), so we recommend experienced consumers start with a small amount. Beginners may want to explore our lower-potency options first.` : `${product.name} can be suitable for beginners when consumed responsibly. We recommend starting with a small amount and waiting to assess effects before consuming more.`} Check our dosing guide for personalized recommendations.`,
            category: "dosing",
            intent: "informational",
            keywords: [`${product.name.toLowerCase()} beginner`, "beginner cannabis"],
        },
        {
            question: `How much does ${product.name} cost?`,
            answer: `${product.name} is available at Mohawk Medibles ${product.price ? `starting at $${product.price.toFixed(2)} CAD` : "at competitive prices"}. We offer Canada-wide shipping via Canada Post Xpresspost. Visit mohawkmedibles.ca/shop for current pricing and availability.`,
            category: "products",
            intent: "transactional",
            keywords: [`${product.name.toLowerCase()} price`, "cannabis prices canada"],
        },
    ];

    return faqs;
}

// ─── AEO Snippet Optimizer ──────────────────────────────────
// Formats content for maximum answer engine extraction

export function formatForAEO(question: string, answer: string): string {
    // AI engines prefer:
    // 1. Question as heading
    // 2. Direct answer in first sentence (no preamble)
    // 3. Supporting detail after
    // 4. Structured data (lists, numbers)
    return `## ${question}\n\n${answer}`;
}

// ─── Category FAQs for Schema Injection ─────────────────────

export function getFAQsForSchema(
    categories?: string[],
    limit = 10
): { question: string; answer: string }[] {
    let faqs = MASTER_FAQ_DATABASE;
    if (categories?.length) {
        faqs = faqs.filter((f) => categories.includes(f.category));
    }
    return faqs.slice(0, limit).map(({ question, answer }) => ({
        question,
        answer,
    }));
}
