/**
 * Mohawk Medibles — Blog Post Registry
 * ═════════════════════════════════════
 * Static blog posts for topical authority and GEO optimization.
 * Each post targets high-intent cannabis search queries.
 */

export interface BlogPost {
    slug: string;
    title: string;
    metaDescription: string;
    excerpt: string;
    category: string;
    image: string;
    imageAlt: string;
    author: string;
    authorCredentials: string;
    datePublished: string;
    dateModified: string;
    readTime: string;
    tags: string[];
    content: string;
}

import { EXPANDED_BLOG_POSTS } from "./posts-expanded";
import { PAA_BLOG_POSTS } from "./posts-paa";

const BASE_BLOG_POSTS: BlogPost[] = [
    {
        slug: "terpene-guide-cannabis-effects",
        title: "The Complete Terpene Guide: How Terpenes Shape Your Cannabis Experience",
        metaDescription: "Learn how terpenes like myrcene, limonene, and pinene determine cannabis effects. Science-backed guide from Mohawk Medibles' 10+ years of cultivation expertise on Tyendinaga Mohawk Territory.",
        excerpt: "Terpenes are the unsung heroes of cannabis. These aromatic compounds do far more than create flavour — they fundamentally shape your high. Here's what 10+ years of cultivation on Tyendinaga Mohawk Territory has taught us.",
        category: "Cannabis Science",
        image: "/assets/blog/terpene-guide-cannabis-effects.jpg",
        imageAlt: "Colorful artistic illustration of terpene molecules floating among botanical leaves with glowing molecular structures",
        author: "Mohawk Medibles Team",
        authorCredentials: "Cannabis cultivation specialists with 10+ years of terpene profiling experience on Tyendinaga Mohawk Territory",
        datePublished: "2026-02-15",
        dateModified: "2026-03-01",
        readTime: "8 min",
        tags: ["terpenes", "cannabis science", "myrcene", "limonene", "pinene", "entourage effect"],
        content: `## What Are Terpenes?

Terpenes are naturally occurring aromatic compounds found in cannabis (and many other plants). They're produced in the same trichome glands that create cannabinoids like THC and CBD. While over 200 terpenes have been identified in cannabis, a handful dominate most strains.

At Mohawk Medibles, every flower product undergoes full terpene profiling as part of our **Empire Standard™** quality process. This isn't marketing — it's science-driven quality control refined over a decade of cultivation on Tyendinaga Mohawk Territory.

## The Top 7 Cannabis Terpenes

### 1. Myrcene — The Relaxation Terpene
**Aroma:** Earthy, musky, herbal (similar to hops)
**Found in:** Mangoes, lemongrass, thyme
**Effects:** Sedating, muscle-relaxing, anti-inflammatory
**Dominant in:** Indica-leaning strains like [Death Bubba](/shop/death-bubba-smalls-40-oz-or-100-3oz) and Purple Urkle

Myrcene is the most abundant terpene in cannabis. Research published in the *British Journal of Pharmacology* (2011) found that myrcene enhances cannabinoid absorption through the blood-brain barrier, potentially intensifying THC's effects. Strains with over 0.5% myrcene tend to produce the classic "couch-lock" sedation.

### 2. Limonene — The Mood Elevator
**Aroma:** Citrus, lemon, orange
**Found in:** Citrus peels, juniper, peppermint
**Effects:** Mood elevation, stress relief, anti-anxiety
**Dominant in:** Sativa-leaning strains like [Green Crack](/shop/green-crack-100oz-canada) and [Sour Pink Grapefruit](/shop/sour-pink-grapefruit-100oz-canada)

A 2013 study in *Behavioural Brain Research* demonstrated limonene's anxiolytic (anti-anxiety) properties. This terpene is also being studied for its potential anti-tumor properties.

### 3. Pinene — The Focus Terpene
**Aroma:** Pine, fresh forest
**Found in:** Pine needles, rosemary, basil
**Effects:** Alertness, memory retention, bronchodilation
**Dominant in:** Sativa strains like [Amnesia Haze](/shop/amnesia-haze-5g) and Alaskan Thunder Fuck

Pinene is unique among terpenes because it may counteract some of THC's memory-impairing effects. A study in *Psychopharmacology* (2016) found alpha-pinene improved cognitive performance in animal models.

### 4. Linalool — The Calm Terpene
**Aroma:** Floral, lavender
**Found in:** Lavender, coriander, cinnamon
**Effects:** Calming, sleep-promoting, anti-convulsant
**Dominant in:** Strains like Do-Si-Dos and LA Kush Cake

### 5. Caryophyllene — The Anti-Inflammatory
**Aroma:** Spicy, peppery, woody
**Found in:** Black pepper, cloves, cinnamon
**Effects:** Anti-inflammatory, pain relief, anxiety reduction
**Dominant in:** Hybrid strains like Biscotti and Larry Burger

Caryophyllene is unique because it directly binds to CB2 receptors in the endocannabinoid system, making it the only terpene that functions like a cannabinoid.

### 6. Humulene — The Appetite Suppressant
**Aroma:** Earthy, woody, hoppy
**Found in:** Hops, sage, ginseng
**Effects:** Anti-inflammatory, appetite suppression
**Dominant in:** Strains like Godfather OG

### 7. Terpinolene — The Uplifting Terpene
**Aroma:** Piney, floral, herbaceous
**Found in:** Nutmeg, tea tree, cumin
**Effects:** Uplifting, mildly sedating in high doses
**Dominant in:** Strains like Pineapple Express

## The Entourage Effect: Why Terpenes Matter

The **entourage effect** is the theory that cannabis compounds work synergistically — THC, CBD, and terpenes together produce effects greater than any single compound alone. Dr. Ethan Russo's landmark 2011 paper in the *British Journal of Pharmacology* provided compelling evidence that terpene-cannabinoid interactions significantly influence therapeutic outcomes.

This is why at Mohawk Medibles, we test for both cannabinoid potency AND terpene profiles. A strain's THC percentage tells you about potency, but the terpene profile tells you about the *experience*.

## How to Use Terpene Information

When browsing our shop, look at each product's terpene profile:

- **Want relaxation?** Look for myrcene-dominant strains
- **Need focus and energy?** Choose pinene or limonene-dominant strains
- **Seeking pain relief?** Caryophyllene-rich strains interact directly with your endocannabinoid system
- **Trouble sleeping?** Linalool and myrcene together create powerful sedation

Every flower, hash, and concentrate product at Mohawk Medibles includes terpene data on its product page, so you always know exactly what you're getting.

## The Empire Standard™ Difference

Our Empire Standard™ testing protocol includes:
1. **Potency verification** — THC and CBD percentages confirmed by third-party labs
2. **Terpene profiling** — Full analysis of dominant and secondary terpenes
3. **Contaminant screening** — Tested for pesticides, heavy metals, and microbials
4. **Visual inspection** — Trained experts assess trichome density and cure quality

This comprehensive approach ensures every product we sell delivers consistent, predictable effects — not just a number on a label.`,
    },
    {
        slug: "edible-dosing-guide-beginners-canada",
        title: "Cannabis Edible Dosing Guide for Beginners: How Much THC Should You Take?",
        metaDescription: "Complete cannabis edible dosing guide for Canadian beginners. Learn safe THC doses from 2.5mg to 50mg+, onset times, and tips from Mohawk Medibles' experts.",
        excerpt: "Edibles hit different — literally. The difference between a perfect evening and an overwhelming experience comes down to dosage. Here's our expert guide to getting it right every time.",
        category: "Education",
        image: "/assets/blog/edible-dosing-guide-beginners-canada.jpg",
        imageAlt: "Assorted colorful gummies and edibles on dark slate with dosage measurement tools — cannabis edible dosing guide",
        author: "Mohawk Medibles Team",
        authorCredentials: "Cannabis wellness educators with expertise in edible formulation and responsible dosing",
        datePublished: "2026-02-20",
        dateModified: "2026-03-01",
        readTime: "6 min",
        tags: ["edibles", "dosing guide", "THC", "beginners", "cannabis safety", "gummies"],
        content: `## Why Edible Dosing Is Different

When you smoke or vape cannabis, THC enters your bloodstream through the lungs within seconds. Edibles take a completely different path: THC is absorbed through the digestive system, converted to 11-hydroxy-THC by the liver, and then crosses the blood-brain barrier.

**11-hydroxy-THC is 2-3 times more potent** than regular THC. This is why a 10mg edible can feel dramatically stronger than smoking the equivalent amount.

At Mohawk Medibles, every edible product lists precise THC content per serving, tested under our Empire Standard™ protocol. Here's how to use that information.

## The Dosing Tiers

### Microdose: 1-2.5mg THC
**Best for:** First-timers, daytime productivity, subtle mood elevation
**What to expect:** Mild relief from anxiety and stress. Most people won't feel noticeably "high" but may notice improved mood, reduced tension, or enhanced creativity.
**Duration:** 4-6 hours

### Low Dose: 2.5-5mg THC
**Best for:** Beginners, social situations, mild pain relief
**What to expect:** Light euphoria, relaxation, enhanced sensory experiences. This is where most newcomers should start.
**Duration:** 4-6 hours

### Moderate Dose: 5-15mg THC
**Best for:** Regular consumers, moderate pain relief, sleep aid
**What to expect:** Noticeable euphoria, altered perception, strong relaxation. This is the sweet spot for experienced consumers.
**Duration:** 6-8 hours

### High Dose: 15-30mg THC
**Best for:** Experienced consumers with established tolerance
**What to expect:** Strong euphoria, significant perception changes, heavy body effects. Not recommended for beginners.
**Duration:** 8-12 hours

### Expert Dose: 30-50mg+ THC
**Best for:** Medical patients with high tolerance, experienced consumers
**What to expect:** Very intense effects. Only for those who have worked up gradually.
**Duration:** 8-14 hours

## The Golden Rules of Edible Dosing

### 1. Start Low, Go Slow
The most important rule. Begin with 2.5-5mg and wait a full 2 hours before considering more. Your liver needs time to process the THC.

### 2. Understand Onset Times
- **Gummies & candies:** 30-90 minutes
- **Chocolates:** 30-60 minutes (cocoa fat speeds absorption)
- **Beverages:** 15-45 minutes (faster absorption through stomach lining)
- **Baked goods:** 45-120 minutes

### 3. Your Stomach Matters
Eating edibles on an empty stomach produces faster, more intense effects. On a full stomach, onset is slower and effects may be milder. For consistent results, take edibles with a light meal.

### 4. Tolerance Varies Dramatically
Body weight, metabolism, previous cannabis experience, and even your gut microbiome affect how you process edibles. Two people taking the same dose can have very different experiences.

### 5. Keep a Dosing Journal
Track what you take, when you take it, and how you feel. After a few sessions, you'll know your ideal dose precisely.

## What to Do If You Take Too Much

It happens to everyone at least once. Here's how to handle it:

1. **Stay calm** — no one has ever died from a cannabis overdose. The uncomfortable feeling will pass.
2. **Hydrate** — water and light snacks help.
3. **Black pepper trick** — chewing 2-3 black peppercorns can reduce anxiety. The caryophyllene terpene interacts with the same receptors as CBD.
4. **CBD can help** — if available, CBD can moderate THC's effects.
5. **Sleep it off** — find a comfortable, safe place and rest.
6. **Time heals** — effects will diminish within 4-8 hours.

## Our Top Edibles for Beginners

For those starting their edible journey, we recommend products with precise per-piece dosing:

- [**Stellar Gummies**](/shop/stellar-strawberry-kiwi-gummies-canada) — Available in multiple flavours with clearly marked THC per piece
- [**Wesley Tea Company THC Tea**](/shop/wesley-tea-company-thc-tea-40mg-canada) — 40mg total, easily divisible into smaller doses
- **Stellar Chocolate Bars** — Scored into equal pieces for precise dosing
- [**Euphoria Extractions Shatter Chews**](/shop/euphoria-extractions-shatter-chews-canada) — Individual chews with consistent dosing

Browse our full edible collection at mohawkmedibles.co/shop with detailed dosing information on every product page.

## Shipping Edibles Across Canada

All edible products ship Canada-wide via Canada Post Xpresspost with discreet packaging. Same-day processing on orders placed before 2 PM EST.`,
    },
    {
        slug: "indica-vs-sativa-vs-hybrid-guide",
        title: "Indica vs Sativa vs Hybrid: What's the Real Difference in 2026?",
        metaDescription: "Indica vs Sativa vs Hybrid explained by experts. Learn why terpene profiles matter more than strain type, plus top picks from Mohawk Medibles' 360+ product catalog.",
        excerpt: "The indica/sativa debate is evolving. Modern cannabis science shows that terpene and cannabinoid profiles matter more than strain classification. Here's what you actually need to know.",
        category: "Cannabis Science",
        image: "/assets/blog/indica-vs-sativa-vs-hybrid-guide.jpg",
        imageAlt: "Split composition of purple indica vs green sativa with hybrid blend — indica vs sativa guide",
        author: "Mohawk Medibles Team",
        authorCredentials: "Certified cannabis specialists with 10+ years of strain selection and cultivation expertise",
        datePublished: "2026-02-25",
        dateModified: "2026-03-01",
        readTime: "7 min",
        tags: ["indica", "sativa", "hybrid", "cannabis strains", "strain guide", "terpenes"],
        content: `## The Traditional View

For decades, cannabis has been classified into three categories:

- **Indica:** Short, bushy plants. Associated with body relaxation, sedation, and "couch-lock."
- **Sativa:** Tall, narrow-leafed plants. Associated with cerebral energy, creativity, and focus.
- **Hybrid:** Crossbreeds offering a mix of both effects.

This classification has been the foundation of how dispensaries market cannabis. But modern science tells a more nuanced story.

## What Science Actually Says

Dr. Ethan Russo, a board-certified neurologist and cannabis researcher, stated in a 2016 interview with *Cannabis and Cannabinoid Research*:

> "The way that the sativa/indica nomenclature has been applied in commerce has been nonsensical... The clinical effects of the cannabis chemovar have nothing to do with whether the plant is tall and sparse vs. short and bushy."

The real drivers of cannabis effects are:

1. **Cannabinoid ratio** — THC:CBD balance
2. **Terpene profile** — which terpenes dominate
3. **Minor cannabinoids** — CBN, CBG, THCV, and others
4. **Individual biology** — your endocannabinoid system is unique

## Why the Labels Still Matter (Practically)

Despite the science, indica/sativa/hybrid labels remain useful as a **starting point** for consumers. They represent general tendencies:

### Indica-Leaning Strains
**Common terpenes:** Myrcene, linalool, caryophyllene
**General effects:** Body relaxation, sleep aid, pain relief, appetite stimulation
**Best for:** Evening use, insomnia, chronic pain, muscle tension

**Our top indica picks:**
- [Death Bubba Smalls](/shop/death-bubba-smalls-40-oz-or-100-3oz) — Heavy myrcene, deep relaxation
- Purple Urkle — Linalool-rich, excellent for sleep
- Pink Goo Smalls — Full-body calm with earthy notes

### Sativa-Leaning Strains
**Common terpenes:** Limonene, pinene, terpinolene
**General effects:** Energy, creativity, focus, mood elevation
**Best for:** Daytime use, social activities, creative projects, exercise

**Our top sativa picks:**
- [Green Crack](/shop/green-crack-100oz-canada) — Pinene-dominant, laser focus
- [Sour Pink Grapefruit](/shop/sour-pink-grapefruit-100oz-canada) — Limonene-rich, euphoric energy
- [Amnesia Haze](/shop/amnesia-haze-5g) — Terpinolene-forward, uplifting and cerebral

### Hybrid Strains
**Common terpenes:** Varied, depends on the cross
**General effects:** Balanced, combining relaxation with alertness
**Best for:** Versatile all-day use, social situations

**Our top hybrid picks:**
- Fantasy Island — Balanced myrcene and limonene
- Peanut Butter — Caryophyllene-dominant, relaxed but alert
- Goat — Unique terpene blend, smooth and versatile

## The Smarter Way to Choose Cannabis

Instead of asking "indica or sativa?", ask these questions:

### 1. What time of day?
- **Morning/Afternoon:** Look for limonene, pinene, or terpinolene-dominant profiles
- **Evening/Night:** Look for myrcene, linalool, or caryophyllene-dominant profiles

### 2. What effect do you want?
- **Energy & Focus:** High THC with pinene/limonene terpenes
- **Relaxation without sedation:** Moderate THC with caryophyllene
- **Deep sleep:** High THC with myrcene and linalool
- **Pain relief:** Balanced THC:CBD with caryophyllene

### 3. What's your tolerance?
- **New to cannabis:** Start with lower THC (15-20%) regardless of strain type
- **Moderate experience:** 20-25% THC with your preferred terpene profile
- **High tolerance:** 25%+ THC or concentrate products

## How We Label at Mohawk Medibles

Every product page on mohawkmedibles.co includes:

- **Strain type** (Indica/Sativa/Hybrid) — for quick reference
- **THC and CBD percentages** — lab-verified potency
- **Terpene profile** — the actual compounds driving the experience
- **Effect descriptions** — what consumers can expect
- **Weight options** — from single grams to bulk ounces

This layered approach gives beginners a familiar starting point while giving experienced consumers the detailed data they need.

Browse our complete flower collection at mohawkmedibles.co/shop to find your ideal strain by terpene profile, not just a label.`,
    },
    {
        slug: "hash-guide-types-potency-canada",
        title: "The Ultimate Hash Guide: Types, Potency, and How to Choose (2026)",
        metaDescription: "Complete guide to cannabis hash types: Afghan, Moroccan, bubble hash, temple balls, and more. Expert breakdown of potency, effects, and prices from Mohawk Medibles.",
        excerpt: "From centuries-old Afghan traditions to modern full-melt techniques, hash is cannabis in its most concentrated traditional form. Here's everything you need to know about choosing the right hash.",
        category: "Product Guides",
        image: "/assets/blog/hash-guide-types-potency-canada.jpg",
        imageAlt: "Premium hashish varieties on wooden board including pressed hash, bubble hash, and temple balls — ultimate hash guide",
        author: "Mohawk Medibles Team",
        authorCredentials: "Hash specialists with expertise in traditional and modern extraction methods",
        datePublished: "2026-03-01",
        dateModified: "2026-03-04",
        readTime: "9 min",
        tags: ["hash", "concentrates", "Afghan hash", "temple ball", "bubble hash", "full melt"],
        content: `## What Is Hash?

Hash (hashish) is a cannabis concentrate made by separating trichomes — the resin glands containing cannabinoids and terpenes — from the plant material and compressing them. The result is a potent, flavourful concentrate that has been used for centuries across Central Asia, the Middle East, and North Africa.

Unlike modern concentrates like shatter or live resin that use chemical solvents, traditional hash relies on mechanical separation through sieving, ice water extraction, or hand-rolling.

## Types of Hash Available at Mohawk Medibles

### Afghan Hash
**Potency:** 25-45% THC
**Texture:** Soft, pliable, dark exterior with lighter interior
**Production:** Traditional dry sift through silk screens, then hand-pressed with heat

Afghan hash represents centuries of craftsmanship. Our Afghan varieties include:
- [**AFG Gold Hash**](/shop/afg-gold-hash-canada) — Classic golden-brown, smooth smoke, balanced effects
- [**AFG Horseman Hash**](/shop/afg-horseman-hash-canada) — Dense, dark, high potency
- **Gevalia Afghan Hash** — Premium grade, creamy texture

### Moroccan Style Hash
**Potency:** 20-40% THC
**Texture:** Light brown to blonde, crumbly to pressed
**Production:** Dry sift through progressively finer screens

### La Mousse Hash
**Potency:** 35-55% THC
**Texture:** Light, fluffy, almost mousse-like consistency
**Production:** Advanced dry sift technique producing ultra-fine trichome collection

Our La Mousse collection is one of our most popular:
- Banana Sherbert La Mousse
- Biscotti La Mousse
- Grumpy Tiger La Mousse
- Holy Grail La Mousse
- Ice Cream La Mousse
- Larry Burger La Mousse
- Wonder Woman La Mousse
- Zealousy La Mousse

### 24K Full Melt Hash
**Potency:** 75-80% THC
**Texture:** Greasy, melts completely when heated
**Production:** Premium ice water extraction producing nearly pure trichome heads

Full melt is the pinnacle of hash making. "Full melt" means it melts completely on a heated surface with zero residue — indicating pure trichome heads with no plant material contamination. Our 24K Full Melt line includes 10+ varieties ranging from Death Bubba to Orange Zkittlez.

### Temple Ball Hash
**Potency:** 35-50% THC
**Texture:** Smooth, dark, ball-shaped, slightly glossy
**Production:** Hand-rolled from fresh or dried trichomes, aged for potency

Our [Nepalese Temple Ball](/shop/nepalese-temple-ball-hash-2) and Chara Temple Coins follow traditional hand-rolling methods passed down through generations.

### Specialty Hash
- **Chocolate Hash** — Sweet, smooth, beginner-friendly
- **Honey Hash** — Golden, aromatic, moderate potency
- **Red Velvet Hash** — Unique flavour profile, premium quality
- **Cognac Hash** — Rich, complex, for the connoisseur
- **Tequila Sunrise Hash** — Unique flavour, conversation starter

## How to Consume Hash

### 1. In a Joint or Bowl
Crumble hash and mix with flower, or place a piece on top of a packed bowl. The hash adds potency and flavour complexity.

### 2. Hot Knives (Traditional)
Heat two butter knives on a stove element, press hash between them, and inhale the vapour. Old school but effective.

### 3. Vaporizer
Some vaporizers have concentrate settings suitable for hash. Full melt hash works particularly well in vaporizers.

### 4. Dabbing (Full Melt Only)
24K Full Melt hash can be dabbed like other concentrates. Lower temperature dabs (315-400°F) preserve the terpene profile.

## Hash vs. Other Concentrates

| Type | THC Range | Solvent? | Flavour | Price |
|------|-----------|----------|---------|-------|
| Hash | 25-80% | No | Complex, earthy | $$ |
| Shatter | 70-90% | BHO | Clean, mild | $$$ |
| Live Resin | 65-95% | BHO/PHO | Terpene-rich | $$$$ |
| Rosin | 60-80% | No | Full spectrum | $$$$ |
| Distillate | 85-99% | Various | Neutral | $$ |

Hash offers a unique advantage: **no chemical solvents** are used in production. For consumers who prefer solventless concentrates, hash (along with rosin) represents the cleanest option.

## Choosing the Right Hash

**For beginners:** Start with Chocolate Hash or Honey Hash (lower potency, approachable flavours)

**For flavour chasers:** La Mousse varieties offer incredible terpene expression

**For potency seekers:** 24K Full Melt Hash at 75-80% THC delivers concentrate-level effects

**For traditionalists:** Afghan, Temple Ball, and Kabul hash honour centuries of craftsmanship

**For value:** Our bulk hash options (140/oz) offer excellent price-to-quality ratios

Browse our complete hash collection at mohawkmedibles.co/shop — over 40 varieties with detailed potency and terpene data on every product page.`,
    },
    {
        slug: "cbd-oil-guide-benefits-dosing-canada",
        title: "CBD Oil Guide: Benefits, Dosing, and How to Choose the Right Product",
        metaDescription: "Expert CBD oil guide covering benefits, dosing charts, full-spectrum vs isolate, and product recommendations. Lab-tested CBD from Mohawk Medibles, shipped Canada-wide.",
        excerpt: "CBD oil has become one of the most popular wellness products in Canada. But with so many options, how do you choose? Our comprehensive guide covers everything from benefits to dosing.",
        category: "Wellness",
        image: "/assets/blog/cbd-oil-guide-benefits-dosing-canada.jpg",
        imageAlt: "CBD oil dropper with golden liquid against dark background — comprehensive CBD oil guide",
        author: "Mohawk Medibles Team",
        authorCredentials: "Cannabis wellness specialists with expertise in cannabinoid therapy and CBD formulations",
        datePublished: "2026-02-28",
        dateModified: "2026-03-04",
        readTime: "7 min",
        tags: ["CBD", "CBD oil", "wellness", "dosing", "full spectrum", "tincture"],
        content: `## What Is CBD Oil?

CBD (cannabidiol) is a non-intoxicating cannabinoid found in cannabis. Unlike THC, CBD does not produce a "high." CBD oil is typically made by extracting CBD from cannabis plants and diluting it with a carrier oil like MCT (medium-chain triglyceride) oil.

Research into CBD's therapeutic potential has expanded dramatically. The World Health Organization's 2018 report stated that CBD "exhibits no effects indicative of any abuse or dependence potential" and "is generally well tolerated with a good safety profile."

## Types of CBD Oil

### Full Spectrum CBD
Contains the complete range of cannabinoids (including trace THC under 0.3%), terpenes, and flavonoids from the cannabis plant. The **entourage effect** means these compounds work synergistically for enhanced therapeutic benefit.

**Our picks:**
- [Full Spectrum CBD Oil 60ml](/shop/full-spectrum-cbd-oil-60ml-canada)
- Plant of Life Full Spectrum Organic CBD Oil
- Full Spectrum CBD Tincture 6000mg

### Broad Spectrum CBD
Contains multiple cannabinoids and terpenes but with THC completely removed. Good for those who want the entourage effect without any THC.

**Our picks:**
- Plant of Life Broad Spectrum Hemp CBD Vape
- Plant of Life Broad Spectrum CBD Heal Stick

### CBD Isolate
Pure CBD (99%+) with no other cannabinoids. Odourless, flavourless, and THC-free. Best for those who need high-dose CBD without any other compounds.

## CBD Benefits Supported by Research

### Pain and Inflammation
A 2020 review in *Frontiers in Pharmacology* analyzed 25 studies and concluded that CBD shows "promising results" for chronic pain management, particularly for neuropathic and inflammatory pain.

### Anxiety and Stress
A landmark 2019 study published in *The Permanente Journal* found that 79.2% of patients reported decreased anxiety scores within the first month of CBD use.

### Sleep
Research published in *The Permanente Journal* (2019) reported that 66.7% of patients experienced improved sleep scores with CBD supplementation.

### Skin Health
CBD's anti-inflammatory properties make it effective for topical applications. A 2019 study in *Clinical Therapeutics* found CBD ointment significantly improved skin conditions.

## CBD Dosing Guide

There is no universal CBD dose — optimal dosing varies based on body weight, condition being treated, and individual biology. Here are general guidelines:

### By Body Weight

| Body Weight | Low Dose | Medium Dose | High Dose |
|------------|----------|-------------|-----------|
| Under 130 lbs | 10-15mg | 15-25mg | 25-45mg |
| 130-230 lbs | 15-25mg | 25-50mg | 50-75mg |
| Over 230 lbs | 25-35mg | 35-60mg | 60-100mg |

### By Condition
- **Mild anxiety/stress:** 10-25mg daily
- **Moderate pain:** 25-50mg daily
- **Chronic pain:** 50-100mg daily
- **Sleep support:** 25-75mg (30-60 min before bed)
- **General wellness:** 10-25mg daily

### How to Dose
1. **Start with a low dose** (10-15mg) for 3-5 days
2. **Increase gradually** by 5mg every 3-5 days
3. **Track your results** in a journal
4. **Find your sweet spot** — the minimum effective dose
5. **Split doses** if needed (morning + evening)

## How to Choose CBD Oil

### Check the Certificate of Analysis (COA)
Every legitimate CBD product should have third-party lab testing confirming:
- CBD content matches the label
- THC content (if full spectrum)
- No pesticides, heavy metals, or solvents

All CBD products at Mohawk Medibles are lab-tested under our Empire Standard™ protocol.

### Consider the Carrier Oil
MCT oil (from coconut) is the most common and offers good bioavailability. Some products use hemp seed oil or olive oil as carriers.

### Read the Concentration
A 60ml bottle with 2000mg CBD contains approximately 33mg per ml (one full dropper). Higher concentration bottles offer better value for higher-dose users.

### Choose Your Administration Method
- **Tinctures (sublingual):** Fastest onset (15-30 min), easy to dose precisely
- **Capsules:** Convenient, consistent dosing, slower onset (45-90 min)
- **Topicals:** Localized relief, no systemic effects
- **Vapes:** Fastest onset (minutes), but shorter duration

## CBD for Pets

CBD is also used for pet wellness. Our [Peaceful Pawz Hemp Dog Treats](/shop/peaceful-pawz-hemp-dog-treats-canada) and [Plant of Life THC-Free Organic Pet CBD Oil](/shop/plant-of-life-thc-free-organic-cbd-canada) are formulated specifically for animals with appropriate dosing.

**Important:** Always use pet-specific CBD products. Human CBD products may contain ingredients that are harmful to animals (like xylitol or certain terpenes).

## Shipping CBD Across Canada

All CBD products ship Canada-wide via Canada Post Xpresspost. CBD is legal across Canada and ships with full tracking in discreet packaging. Browse our complete CBD collection at mohawkmedibles.co/shop.`,
    },
    {
        slug: "buying-cannabis-online-canada-guide",
        title: "How to Buy Cannabis Online in Canada: Complete 2026 Guide",
        metaDescription: "Step-by-step guide to buying cannabis online in Canada. Learn about quality standards, safe shipping, payment options, and why Mohawk Medibles is trusted by thousands.",
        excerpt: "Buying cannabis online in Canada has never been easier — or more confusing. With hundreds of options, how do you find a trusted source? Here's our complete guide to shopping smart.",
        category: "Guides",
        image: "/assets/blog/buying-cannabis-online-canada-guide.jpg",
        imageAlt: "Modern laptop showing online dispensary with Canadian flag — how to buy cannabis online in Canada",
        author: "Mohawk Medibles Team",
        authorCredentials: "Indigenous-owned cannabis dispensary operators with years of online retail experience",
        datePublished: "2026-03-04",
        dateModified: "2026-03-04",
        readTime: "6 min",
        tags: ["buy cannabis online", "online dispensary", "Canada", "shipping", "quality", "guide"],
        content: `## The Canadian Online Cannabis Landscape in 2026

Canada made history by legalizing recreational cannabis nationwide in October 2018. Since then, the online cannabis market has grown dramatically, with both government-operated and private dispensaries offering delivery across the country.

Indigenous dispensaries like Mohawk Medibles operate on sovereign territory under Indigenous rights and self-governance, providing premium products with quality standards that often exceed provincial requirements.

## What to Look for in an Online Dispensary

### 1. Lab Testing and Quality Standards
The single most important factor. Every legitimate dispensary should be able to demonstrate:
- **Third-party lab testing** for potency (THC/CBD percentages)
- **Contaminant screening** (pesticides, heavy metals, mould)
- **Accurate labeling** that matches test results

At Mohawk Medibles, every product meets our **Empire Standard™** — a quality benchmark that includes full lab testing, terpene profiling, and contaminant screening.

### 2. Product Selection
A well-stocked dispensary should offer:
- Multiple flower strains across indica, sativa, and hybrid
- Various concentrate types (hash, shatter, live resin, vapes)
- Edibles with precise dosing information
- CBD and wellness products
- Accessories

Mohawk Medibles carries 360+ verified products across all major categories.

### 3. Transparent Pricing
Watch out for hidden fees. The price you see should be close to what you pay. Look for:
- Clear pricing per gram or per unit
- Visible shipping costs (or free shipping thresholds)
- No surprise taxes at checkout

### 4. Shipping Speed and Discretion
**Canada Post Xpresspost** is the gold standard for cannabis shipping in Canada:
- 1-3 business day delivery across most of the country
- Full tracking on every package
- Reliable and temperature-controlled

All Mohawk Medibles orders ship in **plain, unmarked packaging** with no exterior branding or indication of contents.

### 5. Customer Reviews and Reputation
Check for:
- Google reviews
- Social media presence and engagement
- How the dispensary handles complaints
- Length of time in business

## How to Order from Mohawk Medibles

### Step 1: Browse the Catalog
Visit mohawkmedibles.co/shop and filter by category, strain type, or price. Every product page includes:
- High-resolution product photos
- THC and CBD percentages
- Terpene profiles (for flower products)
- Detailed descriptions and usage guides
- Customer reviews

### Step 2: Add to Cart
Select your products and quantities. We offer multiple weight options on most flower products — from single grams to bulk ounces.

### Step 3: Checkout
Secure checkout with multiple payment options. All transactions are encrypted and private.

### Step 4: Same-Day Processing
Orders placed before 2 PM EST are processed the same business day. You'll receive a tracking number via email once your package ships.

### Step 5: Receive Your Order
Packages arrive in 1-3 business days via Canada Post Xpresspost. Discreet, unmarked packaging protects your privacy.

## Shipping to Every Province and Territory

We ship to all 13 provinces and territories:

| Region | Typical Delivery |
|--------|-----------------|
| Ontario | 1-2 business days |
| Quebec | 1-2 business days |
| Alberta | 2-3 business days |
| British Columbia | 2-3 business days |
| Manitoba & Saskatchewan | 2-3 business days |
| Atlantic Provinces | 2-3 business days |
| Northern Territories | 3-5 business days |

## Quality Guarantee

Every product sold by Mohawk Medibles is backed by our Empire Standard™ guarantee:

1. **Lab-tested potency** — what's on the label is what's in the product
2. **Contaminant-free** — screened for pesticides, heavy metals, and microbials
3. **Terpene-profiled** — full aromatic analysis on flower products
4. **Properly cured and stored** — humidity-controlled storage preserves freshness
5. **Expert-curated** — every product is selected by our team of cannabis specialists

## Why Choose an Indigenous Dispensary?

Mohawk Medibles operates from Tyendinaga Mohawk Territory, rooted in Indigenous sovereignty and self-determination. Purchasing from Indigenous-owned businesses:

- Supports Indigenous economic development
- Funds community programs and youth initiatives
- Preserves traditional cannabis knowledge
- Promotes reconciliation through commerce

## Ready to Shop?

Browse our full catalog of 360+ premium, lab-tested cannabis products at mohawkmedibles.co/shop. Every order ships Canada-wide with same-day processing and full tracking.`,
    },
];

// Merge base + expanded + PAA posts
export const BLOG_POSTS: BlogPost[] = [...BASE_BLOG_POSTS, ...EXPANDED_BLOG_POSTS, ...PAA_BLOG_POSTS];

export function getBlogPost(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
    return BLOG_POSTS.sort(
        (a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime()
    );
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
    return getAllBlogPosts().filter((p) => p.category === category);
}

export function getAllBlogCategories(): string[] {
    const cats = new Set(BLOG_POSTS.map((p) => p.category));
    return Array.from(cats).sort();
}

export function searchBlogPosts(query: string): BlogPost[] {
    const q = query.toLowerCase().trim();
    if (!q) return getAllBlogPosts();
    return getAllBlogPosts().filter(
        (p) =>
            p.title.toLowerCase().includes(q) ||
            p.excerpt.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
    );
}

export function getRelatedBlogPosts(post: BlogPost, limit: number = 3): BlogPost[] {
    return BLOG_POSTS
        .filter((p) => p.slug !== post.slug)
        .map((p) => {
            let score = 0;
            if (p.category === post.category) score += 3;
            const sharedTags = p.tags.filter((t) => post.tags.includes(t));
            score += sharedTags.length;
            return { post: p, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((r) => r.post);
}
