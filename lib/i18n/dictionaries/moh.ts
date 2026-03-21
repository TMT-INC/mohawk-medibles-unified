/**
 * Kanyen'kéha (Mohawk) Dictionary
 * ════════════════════════════════
 * Complete UI strings in Kanyen'kéha. Brand names, technical terms,
 * email addresses, phone numbers, and URLs remain in English.
 *
 * Note: Kanyen'kéha is a polysynthetic Iroquoian language.
 * These translations use common community phrasings.
 * Professional review by a Kanyen'kéha language keeper
 * is recommended before production use.
 */
import type { DictionarySchema } from "./en";

const moh: DictionarySchema = {
    // ─── Navigation ─────────────────────────────────────────
    nav: {
        shop: "Atenniónni",          // "to buy/trade"
        deals: "Ioterihwakweniéhstha", // "good offers"
        about: "Oh nahò:ten",        // "what is it / about"
        blog: "Aierihwáhtha",        // "writings / stories"
        reviews: "Ionterihwaienstáhkhwa", // "they evaluate"
        faq: "Otién:na",             // "questions"
        support: "Iethinihsnién:ni", // "they help us"
        cart: "Ka'sere'tsherá:ke",   // "carrying basket"
        search: "Iesá:iere",         // "you search"
        login: "Satahónhstat",       // "enter"
        talkToSupport: "Tasatáti",   // "speak"
    },

    // ─── Hero / Home ────────────────────────────────────────
    hero: {
        badge: "Onkwehón:we raotirihwá:ke · Tsí Ia:iak Niionkwetá:ke",
        headline: "Ón:kwe Kahionhátie, Tsi Niionkwarihó:ten Teiakotáhsawen",
        subheadline: "344+ teieiéstahkhwa. Oié:ri, kanatarowanénhtha, tsi niió:re — Canada akwékon.",
        shopNow: "Atenniónni nonwá",
        learnMore: "Sewatahonhsí:iohst",
    },

    // ─── Shop ───────────────────────────────────────────────
    shop: {
        title: "Akwékon Kahionhátie",
        filterAll: "Akwékon",
        addToCart: "Kasennón:ni",
        outOfStock: "Iáh tekanónhton",
        featured: "Iehia:ráhstha",
        sortBy: "Satié:ren",
        newest: "Á:se",
        priceLow: "Ohwistánohon",
        priceHigh: "Kaiá:ton",
        results: "kaiá:ton",
    },

    // ─── Product Detail ─────────────────────────────────────
    product: {
        thc: "THC",
        cbd: "CBD",
        weight: "Ie'nikonhriió:stha",
        terpenes: "Otsí:tsia",
        description: "Tsi nahó:ten",
        specs: "Tsi niió:re",
        reviews: "Ionterihwaienstáhkhwa",
        youMightLike: "Enhsénhake nó:nen",
        quantity: "Tó: nahé:ien",
    },

    // ─── Delivery ───────────────────────────────────────────
    delivery: {
        heroTitle: "Kahionhátie Iesá:wis",
        whyChoose: "Oh ní:ioht teiesanónhianion ne Mohawk Medibles tsi",
        browseCategories: "Satká:tho akwékon",
        alsoDelivering: "Shé:kon tó:ka nikaniatarà:ke",
        deliveryFaq: "Otién:na — Iesá:wis",
        labTested: "Teieiéstahkhwa",
        products339: "344+ kahionhátie",
        open: "Tewathón:ni 9–22",
        fastDiscreet: "Ó:nen ok tánon ionkwaterihwahkhwáhson",
        empireStandard: "Akwékon tehotiienáweron ne Empire Standard™",
        wideSelection: "Oié:ri, kanatarowanénhtha, tsi niió:re",
        orderAnyday: "Sewatiénni nià:wen tsí niioserá:ke",
    },

    // ─── Footer ─────────────────────────────────────────────
    footer: {
        tagline: "Onkwehón:we kahionhátie. Tsi niionkwarihó:ten teiakotáhsawen, teieiéstahkhwa.",
        quickLinks: "Ionterihwaién:ni",
        categories: "Nikaniatará:ke",
        contact: "Iesanónhianion",
        rights: "Akwékon tsi ionkwarihwá:ke.",
        privacy: "Tsi nikanaktiió:ten",
        terms: "Tsi niiohserá:ke",
    },

    // ─── Kaná:takon — Homepage sections ────────────────────
    home: {
        shopByCategory: "Atenniónni Nikaniatará:ke",
        categorySubtitle: "344+ teieiéstahkhwa kahionhátie",
        viewAllProducts: "Satká:tho akwékon",
        productsCount: "344+ Kahionhátie",

        whatLookingFor: "Nahò:ten iesá:iere?",
        shopByFeeling: "Atenniónni tsi naiesá:iere",
        effectRelax: "Skennen",              // "peace/calm"
        effectEnergy: "Kashatste",            // "strong/energy"
        effectCreate: "Iesakonniénhstha",     // "it inspires you"
        effectSleep: "Tá:re",                 // "sleep"
        effectParty: "Iontonhétston",         // "celebration"
        effectWellness: "Iethinonhwará:ton",  // "healing/wellness"
        effectPain: "Tekaronhiánion",         // "pain relief"

        customerRating: "Ionterihwaienstáhkhwa",
        reviewCount: "2,340+ ionterihwaienstáhkhwa",
        ordersShipped: "Iesá:wis",
        canadaWide: "Canada akwékon",
        servingCanada: "Tewatennión:ni Canada",
        yearsTrusted: "6+ niiohseratié:ri",
        indigenousDispensary: "Onkwehón:we Atenniónhstha",
        premiumQuality: "Ioianérehst",

        whyMohawk: "Oh ní:ioht Mohawk Medibles",
        trustedBy: "47,000+ Onkwehón:we Canada iehatíhstha",
        labTested: "Teieiéstahkhwa",
        everyBatch: "Akwékon",
        labTestedDesc: "Teieiéstahkhwa ne kashatste, tsi niió:re tánon tsi niiakorihwí:io. Empire Standard™.",
        indigenousOwned: "Onkwehón:we",
        andOperated: "Raotirihwá:ke",
        indigenousDesc: "Tyendinaga Mohawk Territory — 2018 tsi náhe. Onkwarihwá:ke ioianérehst.",
        discreetShipping: "Ionkwaterihwahkhwáhson",
        smellProof: "Iáh teiotsiá:ton",
        shippingDesc: "Ionkwaterihwahkhwáhson. Iáh ó:ia tekakwénion. Sanikonhrí:io.",
        taxFree: "Iáh Tekaiénthos",
        always: "Tiotkon",
        taxFreeDesc: "Onkwarihwá:ke ohwistá:ke. $5 iohtshá:te. Ioianérehst Canada.",

        todaysDeals: "Onwá Teieiéhstha",
        dealsSubtitle: "Á:se niwahsontá:ke — tóka nahé:ien",
        endsIn: "Iahtshátho:",
        shopNow: "Atenniónni nonwá",
        bestSeller: "IOIANERÉHSTON",
        promoCode: "Sá:ier ne code",
        promoDiscount: "10% tsi $100+",

        fiveStarDispensary: "5-Otsistohkwa Kahionhátie Atenniónhstha",
        thousandsSatisfied: "Tewahwátsire Canada akwékon iesanikonhrí:io",

        theCollection: "Tsi Kahionhátie.",
        collectionSubtitle: "Iehia:ráhstha ne iethinonhwará:ton. Iesakonniénhstha.",
        viewProduct: "Satká:tho",
    },

    // ─── Common ─────────────────────────────────────────────
    common: {
        loading: "Tehatihehré:tha...",
        error: "Ó:ia iakoiatatié:ren",
        viewAll: "Satká:tho akwékon",
        backToShop: "Sé:waton",
        close: "Sate:wón:ni",
        language: "Kawennà:ke",
    },

    // ─── Otién:na — FAQ Page ──────────────────────────────
    faq: {
        title: "Otién:na Ne Tiotkon Ionterihwanónhton",  // "Questions that are always asked"
        badge: "Iethinihsnién:ni",                         // "Support"
        subtitle: "Iesá:iere tsi nahó:ten ne atenniónni, iesá:wis, kahionhátie, tánon ó:ia.",
        searchPlaceholder: "Iesá:iere otién:na...",
        noResultsFor: "Iáh teiotién:ni tsi",
        noResultsHint: "Sá:ier ó:ia kawén:na, tóka",
        contactUsLink: "iesanónhianion",
        noResultsHintEnd: "iethinihsnién:ni.",
        // Section names
        orderingPayment: "Atenniónni tánon Ohwistá:ke",        // "Buying & Payment"
        shippingDelivery: "Iesá:wis tánon Iakohá:wi",          // "Shipping & Delivery"
        productsQuality: "Kahionhátie tánon Ioianérehst",      // "Products & Quality"
        returnsRefunds: "Sé:waton tánon Iakohwistanáhkhwa",    // "Returns & Refunds"
        accountPrivacy: "Satahónhstat tánon Tsi Nikanaktiió:ten", // "Account & Privacy"
        // Ordering & Payment Q&A
        faqQ1: "Oh ní:ioht tsi sewatiénni?",  // "How do I place an order?"
        faqA1: "Satká:tho ne atenniónhstha, kasennón:ni ne ka'sere'tsherá:ke, tánon sewatiénni. Visa, Mastercard, Interac e-Transfer, tánon Bitcoin tewá:iere. Akwékon ionkwaterihwahkhwáhson PayGo raonháke.",
        faqQ2: "Tó: kén niká:ien ohwistá:ke tsi sewatiénni?",  // "Is there a minimum order?"
        faqA2: "Iáh! Nek tsi $199 CAD iahsiéhste — iáh tekaiénthos iesá:wis Canada akwékon.",
        faqQ3: "Kén sewakarihwaiénthos?",  // "Do you charge tax?"
        faqA3: "Akwékon ohwistá:ke iáh tekaiénthos. Onkwehón:we atenniónhstha — Tyendinaga Kenhtè:ke onkwarihwá:ke. Iáh HST iáh ó:ia tekaiénthos.",
        faqQ4: "Kén enkatá:ti tsi wakatiénni?",  // "Can I modify/cancel my order?"
        faqA4: "1 hour á:kta tsi sewatiénni — tóka tsi iáh tha'tehatirihwahkhwáhsion. Iesanónhianion info@mohawkmedibles.ca tóka (613) 396-6728.",
        faqQ5: "Kén sewatennión:ni ne tewahwátsire?",  // "Do you offer wholesale?"
        faqA5: "Hen! Tewatennión:ni ne tewahwátsire ohwistá:ke. Iesanónhianion wholesale@mohawkmedibles.ca.",
        // Shipping & Delivery Q&A
        faqQ6: "Ka nón:we sewá:wis?",  // "Where do you ship?"
        faqA6: "Canada akwékon — 13 niiohwentsiá:ke tánon nikaniatará:ke Canada Post Xpresspost. Tsi tkanató:ken — Hamilton, Brantford, tánon Six Nations.",
        faqQ7: "Tó: niió:re tsi iesá:wis?",  // "How long does shipping take?"
        faqA7: "Tsi tkanató:ken: onwá tóka wahsón:te. Ontario: 1-3 niwahsontá:ke. Quebec/Maritimes: 2-4 niwahsontá:ke. Tsi tkaié:ri Canada: 3-5 niwahsontá:ke. Tsi iohna:tá:ke: 5-10 niwahsontá:ke.",
        faqQ8: "Tó: niká:ien ohwistá:ke tsi iesá:wis?",  // "How much is shipping?"
        faqA8: "Iáh tekaiénthos tsi tkanató:ken tánon $199+. Ontario: $15. Quebec/Maritimes: $18. Tsi tkaié:ri Canada: $20. Tsi iohna:tá:ke: $25. CAD.",
        faqQ9: "Kén ionkwaterihwahkhwáhson tsi iesá:wis?",  // "Is packaging discreet?"
        faqA9: "Hen tiotkon. Akwékon ionkwaterihwahkhwáhson — iáh tekakwénion tsi nahó:ten. Iáh teiotsiá:ton tánon ionkwarihwaié:na.",
        faqQ10: "Kén wa'katón:ni ne ID?",  // "Will I need to show ID?"
        faqA10: "Canada Post tóka enhia'takéhnha 19+ tánon iesaskwé:nihs. Satká:tho ne ID tsi iesá:wis.",
        faqQ11: "Oh ní:ioht tsi iesa'nikón:rare?",  // "How do I track my order?"
        faqA11: "Tsi iesá:wis — email Canada Post tracking number. Satká:tho ne account tóka MedAgent iesa'nikón:rare.",
        // Products & Quality Q&A
        faqQ12: "Kén teieiéstahkhwa ne kahionhátie?",  // "Are products lab-tested?"
        faqA12: "Hen. Akwékon tehotiienáweron Empire Standard™. THC/CBD teieiéstahkhwa, iáh teiokwáhson, tánon tiotkon kashatste.",
        faqQ13: "Nahò:ten nikaniatará:ke sewatennión:ni?",  // "What categories do you carry?"
        faqA13: "344+ kahionhátie — oié:ri, kanatarowanénhtha, tsi niiokwáhson, vapes, tánon ó:ia. Á:se tiotkon ionterihwakweniéhstha.",
        faqQ14: "Kén tehiatá:ti ne THC niiokwáhson?",  // "Do THC percentages vary?"
        faqA14: "Hen, nó:nen tsi niió:re tehiatá:ti. THC/CBD tsi iehiatáhrhon — teieiéstahkhwa satká:tho tóka iesá:iere.",
        faqQ15: "Oh ní:ioht tsi ionkerihwá:ienhs ne kahionhátie?",  // "How should I store products?"
        faqA15: "Oié:ri tánon kanatarowanénhtha — tsi iohstéhrhen, iáh theiohswáthe. Tsi niiokwáhson — iotó:re. Vapes — tsi iotká:te.",
        // Returns & Refunds Q&A
        faqQ16: "Nahò:ten ne sé:waton?",  // "What is your return policy?"
        faqA16: "Kahionhátie sé:waton ne — iakorihwaié:ri, ó:ia teieié:nahsen, tóka iáh tehotiienáweron. 48 hours á:kta — returns@mohawkmedibles.ca akiateníhten.",
        faqQ17: "Tó: niió:re tsi iakohwistanáhkhwa?",  // "How long do refunds take?"
        faqA17: "5-10 niwahsontá:ke tsi sewatennión:ni ne ohwistá:ke sé:waton. Email iesá:wis tsi iakohwistanáhkhwa.",
        faqQ18: "Tóka iahotiá:kton tsi iesá:wis?",  // "What if package is lost?"
        faqA18: "Iesanónhianion 48 hours á:kta. Canada Post tewá:iere tánon á:se iesá:wis tóka iakohwistanáhkhwa — iáh ó:ia ohwistá:ke.",
        // Account & Privacy Q&A
        faqQ19: "Kén katónhkwa ne account tsi sewatiénni?",  // "Do I need an account?"
        faqA19: "Iáh — tóka sewatiénni iáh ne account. Nek tsi account iesaníkonhrahseronnién:ni tsi satká:tho ne sewatiénni, iesá:wis, tánon ó:ia.",
        faqQ20: "Oh ní:ioht tsi ionkwaterihwahkhwáhson?",  // "How is my data protected?"
        faqA20: "Akwékon ionkwaterihwahkhwáhson TLS tánon PayGo PCI-DSS Level 1. Iáh tehonwatirihwá:ienhs ne credit card numbers. Satká:tho Privacy Policy.",
        faqQ21: "Nahò:ten ne MedAgent?",  // "What is MedAgent?"
        faqA21: "MedAgent ne AI iethinihsnién:ni. Kahionhátie iesá:iere, sewatiénni iesa'nikón:rare, tánon otién:na. Iáh tehakorihwaiénthos ne aonhá:tshera iontonhétston.",
        // Still have questions CTA
        stillHaveQuestions: "Shé:kon kén otién:na?",   // "Still have questions?"
        stillHaveQuestionsDesc: "Ionkhi'nisténhsera ionkhinihsnién:ni. Tasatáti, email, tóka iesanónhianion.",
        contactUs: "Iesanónhianion",
        emailSupport: "Email Iethinihsnién:ni",
    },

    // ─── Iethinihsnién:ni — Support Page ──────────────────
    support: {
        title: "Oh Ní:ioht Iethinihsnién:ni?",         // "How can we help?"
        subtitle: "Iesá:iere ne otién:na, tóka tasatáti. Ionkhi'nisténhsera tánon AI iethinihsnién:ni.",
        searchPlaceholder: "Iesá:iere — 'iesá:wis', 'iakohwistanáhkhwa', 'tó: nahé:ien'...",
        noResultsFor: "Iáh teiotién:ni tsi",
        noResultsHint: "Sá:ier ó:ia kawén:na, tóka MedAgent tasatáti.",
        // Quick Contact Cards
        liveAiChat: "AI Tasatáti",                       // "AI Chat"
        liveAiChatDesc: "Tasatáti — 24/7 tiotkon",
        emailUs: "Email Iesanónhianion",
        emailUsDesc: "info@mohawkmedibles.ca — 24 hours sé:waton",
        callUs: "Iesanónhianion",                        // "Call Us"
        callUsDesc: "(613) 396-6728 — Mon-Fri 10AM-6PM ET",
        // Topic: Shipping & Delivery
        topicShippingTitle: "Iesá:wis tánon Iakohá:wi",
        topicShippingDesc: "Ka nón:we iesá:wis, tó: niió:re, tánon iesa'nikón:rare",
        supportShipQ1: "Tó: niió:re tsi iesá:wis?",
        supportShipA1: "Onwá tsi tkanató:ken — Tyendinaga, Belleville, tánon Deseronto (2 PM á:kta). Wahsón:te — Toronto GTA, Hamilton, tánon Brantford. Canada akwékon Xpresspost 2-5 niwahsontá:ke.",
        supportShipQ2: "Kén ionkwaterihwahkhwáhson tsi iesá:wis?",
        supportShipA2: "Hen tiotkon. Akwékon ionkwaterihwahkhwáhson — iáh tekakwénion tsi nahó:ten. Sanikonhrí:io ionkwarihwá:ke.",
        supportShipQ3: "Oh ní:ioht tsi iesa'nikón:rare?",
        supportShipA3: "Tsi iesá:wis — email tracking number. Shé:kon satká:tho ne account dashboard.",
        supportShipQ4: "Kén iáh tekaiénthos tsi iesá:wis?",
        supportShipA4: "$199 CAD iahsiéhste — iáh tekaiénthos Canada akwékon. Tsi tkanató:ken — tiotkon iáh tekaiénthos.",
        // Topic: Payments & Billing
        topicPaymentsTitle: "Ohwistá:ke tánon Iakohwistanáhkhwa",  // "Payments & Billing"
        topicPaymentsDesc: "Ohwistá:ke tsi sewatiénni, otién:na, tánon iakohwistanáhkhwa",
        supportPayQ1: "Nahò:ten ohwistá:ke sewá:iere?",
        supportPayA1: "Google Pay, Interac e-Transfer, Visa, Mastercard, tánon American Express. Akwékon ionkwaterihwahkhwáhson PayGo.",
        supportPayQ2: "Kén ionkwaterihwahkhwáhson ne ohwistá:ke?",
        supportPayA2: "Hen. PayGo ionkwaterihwahkhwáhson. Iáh teionkwarihwá:ienhs ne card details.",
        supportPayQ3: "Oh ní:ioht tsi iakohwistanáhkhwa?",
        supportPayA3: "5-7 niwahsontá:ke sé:waton ne ohwistá:ke. 48 hours á:kta iesanónhianion tóka ó:ia iakoiatatié:ren.",
        // Topic: Orders & Returns
        topicOrdersTitle: "Sewatiénni tánon Sé:waton",  // "Orders & Returns"
        topicOrdersDesc: "Sewatiénni, iesatá:ti, tánon sé:waton",
        supportOrderQ1: "Kén enkatá:ti tsi wakatiénni?",
        supportOrderA1: "1 hour á:kta tsi sewatiénni — tóka tsi iáh tha'tehatirihwahkhwáhsion. Iesanónhianion info@mohawkmedibles.ca tóka (613) 396-6728.",
        supportOrderQ2: "Nahò:ten ne sé:waton?",
        supportOrderA2: "Sé:waton ne kahionhátie iáh tha'teiotshón:ni, 14 niwahsontá:ke á:kta. Iesanónhianion ne iethinihsnién:ni.",
        supportOrderQ3: "Iakorihwaié:ri tsi á:re — oh enké:ni?",  // "My order arrived damaged"
        supportOrderA3: "Ionkwanorón:khwa! Akiateníhten ne akóhsera tánon 48 hours á:kta iesanónhianion. Á:se iesá:wis tóka iakohwistanáhkhwa — ise satié:ren.",
        // Topic: Safety & Quality
        topicSafetyTitle: "Ioianérehst tánon Teieiéstahkhwa",  // "Safety & Quality"
        topicSafetyDesc: "Kahionhátie ioianérehst, teieiéstahkhwa, tánon tó: nahé:ien",
        supportSafetyQ1: "Kén teieiéstahkhwa ne kahionhátie?",
        supportSafetyA1: "Hen. Akwékon tehotiienáweron Empire Standard. Teieiéstahkhwa — kashatste, iáh teiotsiá:ton, tánon iáh teiokwáhson.",
        supportSafetyQ2: "Tó: nahé:ien kanatarowanénhtha?",  // "Recommended edible dosage?"
        supportSafetyA2: "Nikón:rihon, skennen. 5-10mg THC tánon 2 hours tá:re á:kta tsi shé:kon. Kanatarowanénhtha niió:re tsi ionthahí:ne.",
        supportSafetyQ3: "Kén 19+ katónhkwa?",  // "Do I need to be 19+?"
        supportSafetyA3: "Hen. 19 niiohseró:ten tóka iahsiéhste. Akwékon teieiéstahkhwa — iáh ó:ia.",
        // Visit Us section
        visitUs: "Takwá:wi",                    // "Come visit us"
        locationLabel: "Ka nón:we",              // "Where"
        locationAddress1: "45 Dundas Street",
        locationAddress2: "Deseronto, ON",
        locationAddress3: "Tyendinaga Mohawk Territory",
        hoursLabel: "Tó: niió:re",               // "Hours"
        hoursValue1: "Tewathón:ni 7 niwahsontá:ke",  // "Open 7 days"
        hoursValue2: "10:00 AM – 10:00 PM ET",
        hoursValue3: "Onwá sewatiénni 4 PM á:kta",
        // CTA section
        stillNeedHelp: "Shé:kon kén iethinihsnién:ni?",  // "Still need help?"
        stillNeedHelpDesc: "MedAgent AI tiotkon 24/7 — otién:na, kahionhátie iesá:iere, tánon sewatiénni iethinihsnién:ni.",
        browseFullFaq: "Satká:tho Akwékon Otién:na",
        contactUsDirectly: "Iesanónhianion",
    },

    // ─── Oh Nahò:ten — About Page ─────────────────────────
    about: {
        title: "Oh Nahò:ten",                          // "About"
        // Hero
        heroBadge: "Tsí Ia:iak Niionkwetá:ke",         // "Six Nations"
        heroHeadline1: "Onkwarihwá:ke Teiakotáhsawen.",  // "Rooted in Sovereignty"
        heroHeadline2: "Ionkhi'nisténhsera Á:kta.",       // "Built for Community"
        heroDescription: "Mohawk Medibles ne Onkwehón:we kahionhátie atenniónhstha — Tyendinaga Mohawk Territory tánon Tsí Ia:iak Niionkwetá:ke. 2019 tsi náhe, tewatennión:ni Canada akwékon ne ioianérehst, teieiéstahkhwa kahionhátie — ioianérehst, karihwí:io, tánon Onkwehón:we tsi niionkwarihó:ten.",
        // Stats
        statProducts: "Ioianérehst Kahionhátie",
        statCustomers: "Iehatíhstha",                   // "Customers served"
        statYears: "Niiohseratié:ri",                   // "Years trusted"
        statProvinces: "Niiohwentsiá:ke tánon Nikaniatará:ke",  // "Provinces & Territories"
        // Mission
        missionLabel: "Tsi Ionkwarihwá:ke",              // "Our Mission"
        missionHeadline1: "Ioianérehst Kahionhátie,",
        missionHeadline2: "Ionkhinonhwará:ton Akwékon.",  // "Dignified Access"
        missionDescription: "Tewatennión:ni Canada akwékon ne ioianérehst kahionhátie — Onkwehón:we onkwarihwá:ke tánon ionkhi'nisténhsera á:kta. Teieiéstahkhwa, ohwistánohon, tánon karihwí:io — iesá:wis, ionkwaterihwahkhwáhson, tánon iethinihsnién:ni tiotkon.",
        missionTagLabTested: "Teieiéstahkhwa",
        missionTagEmpireStandard: "Empire Standard™",
        missionTagTaxFree: "Iáh Tekaiénthos",
        missionTagCanadaWide: "Canada Akwékon",
        // Values
        valuesLabel: "Tsi Ionkwarihwanón:we",            // "Our Values"
        valuesHeadline: "Nahò:ten Ionkwathón:wi",        // "What We Stand For"
        valuesSovereigntyTitle: "Onkwehón:we Onkwarihwá:ke",  // "Indigenous Sovereignty"
        valuesSovereigntyDesc: "Haudenosaunee Confederacy tánon Kanien'kehá:ka onkwarihwá:ke tewatennión:ni. Ionkhi'nisténhsera, ionkhinikonhrahséronnion, tánon Onkwehón:we tsi niionkwarihó:ten atenniónni.",
        valuesQualityTitle: "Empire Standard™ Ioianérehst",
        valuesQualityDesc: "Akwékon kahionhátie tehotiienáweron Empire Standard™ — teieiéstahkhwa, ionkerihwá:ienhs, tánon iehia:ráhstha. Iáh nonwén:ton teionkwaté:nion ne kashatste, ioianérehst, tánon á:se.",
        valuesCommunityTitle: "Ionkhi'nisténhsera Áhsen",  // "Community First"
        valuesCommunityDesc: "Ohwistá:ke sé:waton ne Six Nations ionkhi'nisténhsera — ratiksá:ke, ionkhinikonhrahséronnion, tánon tsi niionkwarihó:ten ionkerihwá:ienhs. Tsi sewatennión:ni — Onkwehón:we iethinihsnién:ni.",
        valuesSustainabilityTitle: "Ohwén:tsia Ionkwarihwá:ke",  // "Sustainable Practices"
        valuesSustainabilityDesc: "Ohwén:tsia ionkwarihwá:ke — ionkwaterihwahkhwáhson, sé:waton, tánon iáh teiokwáhson. Ohwén:tsia ionkhinonhwará:ton tsi niionkwarihó:ten.",
        // Timeline
        journeyLabel: "Tsi Ionkwahá:wi",                // "Our Journey"
        journeyHeadline: "Tsi Teiakotáhsawen Tsi Nonwá.",  // "From Roots to Now"
        milestone2019: "Tsi Ia:iak Niionkwetá:ke teionkwatáhsawen",  // "Founded on Six Nations"
        milestone2020: "Canada akwékon iesá:wis Canada Post Xpresspost",
        milestone2021: "Kanatarowanénhtha tánon tsi niiokwáhson á:se",  // "Launched edibles & concentrates"
        milestone2022: "10,000+ iehatíhstha akwékon niiohwentsiá:ke",
        milestone2023: "Empire Standard™ ioianérehst á:se teionkwatáhsawen",
        milestone2024: "MedAgent AI iethinihsnién:ni á:se",
        milestone2025: "344+ kahionhátie 15 nikaniatará:ke",
        // Quality Promise
        qualityLabel: "Empire Standard™",
        qualityHeadline: "Ioianérehst Iáh Teionkwaté:nion.",  // "Quality Without Compromise"
        qualityDescription: "Akwékon kahionhátie 4 teieiéstahkhwa: kashatste, otsí:tsia, iáh teiokwáhson, tánon iehatká:tho. Empire Standard™ — iáh nonwén:ton teiesá:wis tsi iáh tehotiienáweron.",
        qualityLabTested: "Teieiéstahkhwa",
        qualityLabTestedDetail: "Ó:ia teieiéstahkhwa",  // "Third-party verified"
        qualityTerpeneProfiled: "Otsí:tsia Teieiéstahkhwa",
        qualityTerpeneDetail: "Akwékon otsí:tsia",
        qualityContaminantFree: "Iáh Teiokwáhson",       // "Contaminant Free"
        qualityContaminantDetail: "Iáh teiotsiá:ton tánon iáh tekana:tá:ke",
        qualityDiscreetShipping: "Ionkwaterihwahkhwáhson Iesá:wis",
        qualityDiscreetDetail: "Iáh teiotsiá:ton",
        // CTA
        readyToShop: "Kén satennión:ni?",                // "Ready to shop?"
        readyToShopDesc: "344+ ioianérehst kahionhátie. Onwá iesá:wis, Canada akwékon, tiotkon iáh tekaiénthos.",
        browseCollection: "Satká:tho Kahionhátie",
        contactUs: "Iesanónhianion",
    },

    // ─── Iesanónhianion — Contact Page ────────────────────
    contact: {
        title: "Iesanónhianion",                         // "Contact Us"
        badge: "Tasatáti",                                // "Get In Touch"
        subtitle: "Otién:na ne sewatiénni, kahionhátie, tóka ó:ia? Iethinihsnién:ni.",
        // Contact info labels
        emailLabel: "Email",
        emailValue: "info@mohawkmedibles.ca",
        emailDesc: "Otién:na — 24 hours sé:waton",
        phoneLabel: "Iesanónhianion",                    // "Phone"
        phoneValue: "(613) 396-6728",
        phoneDesc: "Mon–Fri, 10 AM – 6 PM ET",
        locationLabel: "Ka nón:we",                      // "Location"
        locationValue: "45 Dundas Street, Deseronto, ON",
        locationDesc: "Tyendinaga Mohawk Territory",
        hoursLabel: "Tó: niió:re tewathón:ni",           // "Business Hours"
        hoursValue: "Mon–Sat: 10 AM – 8 PM ET",
        hoursDesc: "Sunday: 12 PM – 6 PM ET",
        // MedAgent CTA
        needInstantHelp: "Ó:nen ok iethinihsnién:ni?",   // "Need instant help?"
        medAgentDesc: "MedAgent AI tasatáti — kahionhátie, sewatiénni, tánon ó:ia.",
        medAgentHint: "Tasatáti ne chat icon tsi iohnaké:rat",
        // Form
        sendUsMessage: "Takwatia'tóhare",                // "Send us a message"
        fullName: "Iesáhsen *",                          // "Your name"
        fullNamePlaceholder: "Iesáhsen",
        email: "Email *",
        emailPlaceholder: "you@example.com",
        department: "Ka nón:we",                         // "Department"
        subject: "Nahò:ten *",                           // "Subject"
        subjectPlaceholder: "Nahò:ten ohní:kon?",
        message: "Kawén:na *",                           // "Message"
        messagePlaceholder: "Oh ní:ioht iethinihsnién:ni...",
        sendMessage: "Takwatia'tóhare",                  // "Send message"
        sending: "Iesá:wis...",
        // Departments
        deptGeneral: "Otién:na Akwékon",                 // "General Inquiry"
        deptOrders: "Sewatiénni Iethinihsnién:ni",       // "Order Support"
        deptReturns: "Sé:waton tánon Iakohwistanáhkhwa", // "Returns & Refunds"
        deptWholesale: "Tewahwátsire",                   // "Wholesale / Bulk"
        deptPress: "Aierihwáhtha tánon Ionterihwaién:ni", // "Press & Media"
        deptTechnical: "Website / Technical",
        // Success/Error
        messageSentTitle: "Iesá:wis ne Kawén:na!",       // "Message Sent!"
        messageSentDesc: "24 hours á:kta sé:waton. Satká:tho email.",
        sendAnother: "Shé:kon Kawén:na",                 // "Send Another"
        formError: "Ó:ia iakoiatatié:ren. Sá:ier tóka email info@mohawkmedibles.ca",
    },

    // ─── Oh Ní:ioht Sewatiénni — How to Order Page ────────
    howToOrder: {
        title: "Oh Ní:ioht Sewatiénni",                 // "How to Order"
        subtitle: "Mohawk Medibles sewatiénni — ionkwaterihwahkhwáhson, tánon ó:nen ok. Áhsen tsi niiohá:ke ne ioianérehst, teieiéstahkhwa kahionhátie iesá:wis.",
        // Step 1
        step1Title: "Satká:tho tánon Satié:ren",         // "Browse & Select"
        step1Desc: "Satká:tho ne atenniónhstha tánon 344+ kahionhátie. Sá:ier ne nikaniatará:ke, kashatste, ohwistá:ke, tóka ó:ia. Oié:ri, kanatarowanénhtha, tsi niiokwáhson, vapes, hash, CBD, tánon ó:ia.",
        step1Bullet1: "Nikaniatará:ke: oié:ri, kanatarowanénhtha, tsi niiokwáhson, vapes, hash, CBD, tánon ó:ia",
        step1Bullet2: "Satié:ren THC/CBD, ohwistá:ke, tánon ionterihwaienstáhkhwa",
        step1Bullet3: "Satká:tho tsi nahó:ten tánon teieiéstahkhwa",
        step1Bullet4: "Satká:tho ionterihwaienstáhkhwa tánon otsí:tsia",
        // Step 2
        step2Title: "Kasennón:ni tánon Sewatiénni",      // "Add to Cart & Checkout"
        step2Desc: "Kasennón:ni ne ka'sere'tsherá:ke tánon sewatiénni. Ohwistá:ke ionkwaterihwahkhwáhson.",
        step2Bullet1: "Visa tánon Mastercard (PayGo ionkwaterihwahkhwáhson)",
        step2Bullet2: "Interac e-Transfer (Canada ohwistá:ke)",
        step2Bullet3: "Cryptocurrency (Bitcoin tánon Ethereum)",
        step2Bullet4: "Akwékon ionkwaterihwahkhwáhson PCI-DSS",
        // Step 3
        step3Title: "Ó:nen Ok Iesá:wis",                // "Fast Delivery"
        step3Desc: "Ó:nen ok iesá:wis Canada Post Xpresspost. Iesa'nikón:rare tánon ionkwaterihwahkhwáhson.",
        step3Bullet1: "Onwá iesá:wis tsi 2:00 PM EST á:kta sewatiénni",
        step3Bullet2: "Canada Post Xpresspost — ionkwaterihwahkhwáhson tánon iesa'nikón:rare",
        step3Bullet3: "Tracking number email ó:nen ok",
        step3Bullet4: "Ionkwaterihwahkhwáhson — iáh tekakwénion tsi nahó:ten",
        // Payment Methods
        paymentMethodsTitle: "Ohwistá:ke Tsi Sewatiénni",  // "Payment Methods"
        paymentInteracTitle: "Interac e-Transfer",
        paymentInteracDesc: "Ó:nen ok, ionkwaterihwahkhwáhson Canada ohwistá:ke.",
        paymentVisaTitle: "Visa tánon Mastercard",
        paymentVisaDesc: "Ionkwaterihwahkhwáhson credit card PayGo (PCI-DSS Level 1).",
        paymentCryptoTitle: "Cryptocurrency",
        paymentCryptoDesc: "Bitcoin tánon Ethereum.",
        paymentCashTitle: "Ohwistá:ke (Tsi Tkanató:ken)",  // "Cash (Local Pickup)"
        paymentCashDesc: "Ohwistá:ke tsi tkanató:ken — Hamilton, Brantford, tóka Six Nations.",
        // Shipping Information
        shippingInfoTitle: "Iesá:wis Tsi Nahó:ten",         // "Shipping Information"
        shippingFreeTitle: "Iáh Tekaiénthos Iesá:wis",      // "Free Shipping"
        shippingFreeDesc: "$199 CAD iahsiéhste — iáh tekaiénthos Canada akwékon Xpresspost.",
        shippingMethodTitle: "Tsi Iesá:wis",                 // "Shipping Method"
        shippingMethodDesc: "Akwékon Canada Post Xpresspost — ionkwaterihwahkhwáhson tánon iesa'nikón:rare Canada akwékon.",
        shippingDeliveryTimesTitle: "Tó: Niió:re Iesá:wis",  // "Delivery Times"
        shippingDeliveryOntario: "Ontario: 1-3 niwahsontá:ke",
        shippingDeliveryQuebec: "Quebec tánon Atlantic: 2-4 niwahsontá:ke",
        shippingDeliveryWestern: "Tsi Tkaié:ri: 3-5 niwahsontá:ke",
        shippingDeliveryNorthern: "Tsi Iohna:tá:ke: 5-10 niwahsontá:ke",
        shippingDiscreetTitle: "Ionkwaterihwahkhwáhson",      // "Discreet Packaging"
        shippingDiscreetDesc: "Akwékon ionkwaterihwahkhwáhson — iáh tekakwénion tsi nahó:ten. Iáh teiotsiá:ton tánon ionkwarihwaié:na.",
        shippingTrackingTitle: "Iesa'nikón:rare Sewatiénni",  // "Order Tracking"
        shippingTrackingDesc: "Canada Post tracking number email ó:nen ok. Iesa'nikón:rare tsi internet tóka account dashboard.",
        // Need Help
        needHelp: "Kén Iethinihsnién:ni?",
        needHelpDesc: "Otién:na ne sewatiénni, iesá:wis, tóka kahionhátie? Satká:tho FAQ tóka iesanónhianion.",
        viewFaq: "Satká:tho Otién:na",
        contactSupport: "Iesanónhianion",
        // CTA
        readyToOrder: "Kén Sewatiénni?",                // "Ready to Order?"
        readyToOrderDesc: "344+ teieiéstahkhwa kahionhátie — atenniónni nonwá.",
        startShopping: "Atenniónni Nonwá",               // "Start Shopping"
    },

    // ─── Iesá:wis Tsi Niiohserá:ke — Shipping Policy ─────
    shippingPolicy: {
        title: "Iesá:wis Tsi Niiohserá:ke",              // "Shipping Policy"
        subtitle: "Ó:nen ok, ionkwaterihwahkhwáhson, Canada akwékon.",
        // Sections
        shippingMethodsTitle: "Tsi Iesá:wis",
        shippingMethodsDesc: "Akwékon Canada Post Xpresspost — ionkwaterihwahkhwáhson, iesa'nikón:rare Canada akwékon. Tsi tkanató:ken — Hamilton, Brantford, tánon Six Nations.",
        deliveryTimesTitle: "Tó: Niió:re Iesá:wis",
        // Table headers
        tableRegion: "Ka Nón:we",                        // "Region"
        tableEstimatedDelivery: "Tó: Niió:re",           // "Estimated Delivery"
        tableCost: "Ohwistá:ke",                         // "Cost"
        // Table rows
        regionLocal: "Tsi Tkanató:ken (Hamilton/Brantford/Six Nations)",
        regionLocalTime: "Onwá / Wahsón:te",             // "Same day / Next day"
        regionLocalCost: "IÁH TEKAIÉNTHOS",              // "FREE"
        regionOntario: "Ontario",
        regionOntarioTime: "1-3 niwahsontá:ke",
        regionOntarioCost: "$15.00",
        regionQuebec: "Quebec / Maritimes",
        regionQuebecTime: "2-4 niwahsontá:ke",
        regionQuebecCost: "$18.00",
        regionWestern: "Tsi Tkaié:ri Canada (MB, SK, AB, BC)",
        regionWesternTime: "3-5 niwahsontá:ke",
        regionWesternCost: "$20.00",
        regionNorthern: "Tsi Iohna:tá:ke Canada",
        regionNorthernTime: "5-10 niwahsontá:ke",
        regionNorthernCost: "$25.00",
        freeShippingNote: "IÁH TEKAIÉNTHOS $199 CAD iahsiéhste, Canada akwékon.",
        // Other sections
        discreetPackagingTitle: "Ionkwaterihwahkhwáhson",
        discreetPackagingDesc: "Akwékon ionkwaterihwahkhwáhson — iáh tekakwénion tsi nahó:ten. Iáh ó:ia tekakwénion. Iáh teiotsiá:ton tánon ionkwarihwaié:na.",
        orderTrackingTitle: "Iesa'nikón:rare Sewatiénni",
        orderTrackingDesc: "Email Canada Post tracking number ó:nen ok iesá:wis. Satká:tho account dashboard tóka MedAgent iesa'nikón:rare.",
        ageVerificationTitle: "19+ Teieiéstahkhwa",       // "Age Verification"
        ageVerificationDesc: "19+ katónhkwa tsi iesá:wis. Canada Post tóka enhia'takéhnha tánon iesaskwé:nihs. Satká:tho ne ID.",
        processingTimesTitle: "Tó: Niió:re Tehatirihwahkhwáhsion",  // "Processing Times"
        processingTimesDesc: "2:00 PM ET á:kta — onwá iesá:wis. 2:00 PM ET iahtshátho tóka weekends — wahsón:te iesá:wis.",
        lostDamagedTitle: "Iahotiá:kton tóka Iakorihwaié:ri",  // "Lost or Damaged"
        lostDamagedDesc: "48 hours á:kta iesanónhianion. Canada Post tewá:iere tánon á:se iesá:wis. Email support@mohawkmedibles.ca ne sewatiénni number tánon akiateníhten.",
    },

    // ─── Sé:waton Tsi Niiohserá:ke — Returns Policy ──────
    returnsPolicy: {
        title: "Sé:waton tánon Iakohwistanáhkhwa",       // "Returns & Refund Policy"
        subtitle: "Sanikonhrí:io ionkwarihwá:ke.",         // "Your satisfaction is important"
        // Eligibility
        eligibilityTitle: "Tsi Niió:re Teiákonhe",        // "Eligibility"
        eligibilityDesc: "Kahionhátie tsi niió:re — tewaterihwahkhwáhsion tsi sé:waton:",
        returnsAcceptedTitle: "Sé:waton Tsi Niió:re:",    // "Returns Accepted For"
        returnsAccepted1: "Iakorihwaié:ri kahionhátie (iakokahrá:ton, iohtshién:ton)",
        returnsAccepted2: "Ó:ia kahionhátie (iáh tehotiienáweron tsi sewatiénni)",
        returnsAccepted3: "Iáh akwékon tekanónhton ne sewatiénni",
        returnsAccepted4: "Kahionhátie iáh tsi teiakotáhsawen (THC/CBD tehiatá:ti)",
        returnsNotAcceptedTitle: "Iáh Tesé:waton:",        // "Returns NOT Accepted"
        returnsNotAccepted1: "Iesanikonhrhá:ren tsi sewatiénni",  // "Change of mind"
        returnsNotAccepted2: "Kahionhátie iotshón:ni tóka iakohné:ka",  // "Opened/used"
        returnsNotAccepted3: "Iontshón:ni ne ionkwaterihwahkhwáhson",  // "Seal broken"
        returnsNotAccepted4: "Iáh tesanikonhrí:io tsi ionthahí:ne tóka otsí:tsia",  // "Subjective effects"
        // How to request
        howToRequestTitle: "Oh Ní:ioht Sé:waton",         // "How to Request a Return"
        howToRequest1: "48 hours á:kta iesanónhianion returns@mohawkmedibles.ca",
        howToRequest2: "Sewatiénni number tánon akiateníhten",
        howToRequest3: "24 hours á:kta ionkhi'nisténhsera satká:tho",
        howToRequest4: "Tóka hen — sé:waton tóka á:se iesá:wis",
        // Refund Process
        refundProcessTitle: "Iakohwistanáhkhwa",           // "Refund Process"
        refundProcessDesc: "5-10 niwahsontá:ke sé:waton ne ohwistá:ke. Email iesá:wis tsi iakohwistanáhkhwa.",
        refundFull: "Akwékon iakohwistanáhkhwa: ó:ia kahionhátie, iakorihwaié:ri tsi iesá:wis",
        refundPartial: "Nó:nen iakohwistanáhkhwa: iáh akwékon tekanónhton (ohwistá:ke ne iáh tekanónhton ok)",
        refundStoreCredit: "Store credit: tóka ó:ia satié:ren ne sé:waton",
        // Exchanges
        exchangesTitle: "Tehiatá:ti",                      // "Exchanges"
        exchangesDesc: "Iakorihwaié:ri tóka ó:ia kahionhátie — á:se iesá:wis iáh ó:ia ohwistá:ke. Tóka iáh tekanónhton — akwékon iakohwistanáhkhwa.",
        // Shipping for Returns
        shippingForReturnsTitle: "Iesá:wis Sé:waton",     // "Shipping for Returns"
        shippingForReturnsDesc: "Ionkwarihwá:ke iakoiatatié:ren — ionkhi'nisténhsera ohwistá:ke tsi sé:waton. Ó:ia sé:waton — ise ohwistá:ke. Shipping label tánon tsi nahó:ten iesá:wis.",
        // Contact
        contactTitle: "Iesanónhianion",
        contactDesc: "Email: returns@mohawkmedibles.ca. Shé:kon MedAgent tasatáti ne sé:waton iethinihsnién:ni.",
    },

    // ─── Tsi Nikanaktiió:ten — Privacy Policy ─────────────
    privacyPolicy: {
        title: "Tsi Nikanaktiió:ten",                     // "Privacy Policy"
        lastUpdated: "Iahtshátho á:se: Ehníska 2026",     // "Last updated: February 2026"
        // Section 1
        whoWeAreTitle: "1. Oh Nahò:ten Ionkhí:non",        // "Who We Are"
        whoWeAreDesc: "Mohawk Medibles ne Onkwehón:we kahionhátie atenniónhstha — Tsí Ia:iak Niionkwetá:ke, Ontario, Canada. Tsi nikanaktiió:ten — oh ní:ioht tsi ionkwaterihwahkhwáhson tsi website, sewatiénni, tánon MedAgent AI.",
        // Section 2
        infoCollectTitle: "2. Nahò:ten Ionkwaterihwá:ienhs",  // "Information We Collect"
        infoYouProvide: "Ise iesaterihwá:ienhs:",
        infoYouProvide1: "Iesáhsen, email, iesanónhianion (tsi satahónhstat tóka sewatiénni)",
        infoYouProvide2: "Iesá:wis tánon ohwistá:ke ka nón:we",
        infoYouProvide3: "Sewatiénni tsi niió:re",
        infoYouProvide4: "Iethinihsnién:ni kawén:na tánon MedAgent tasatáti",
        infoYouProvide5: "19+ teieiéstahkhwa",
        infoAutoCollected: "Ionkwaterihwá:ienhs tsi internet:",
        infoAutoCollected1: "Iesaterihwá:ienhs device, browser, tánon OS",
        infoAutoCollected2: "IP address (ionkwaterihwahkhwáhson tánon 19+ teieiéstahkhwa)",
        infoAutoCollected3: "Tsi satká:tho ne website",
        infoAutoCollected4: "Cookies tánon tracking",
        // Section 3
        howWeUseTitle: "3. Oh Ní:ioht Tsi Ionkwá:iere",   // "How We Use Your Info"
        howWeUse1: "Sewatiénni iesá:wis Canada Post Xpresspost",
        howWeUse2: "Email — sewatiénni, iesá:wis, tánon iesa'nikón:rare",
        howWeUse3: "MedAgent AI tánon ionkhi'nisténhsera iethinihsnién:ni",
        howWeUse4: "Kahionhátie, website, tánon iethinihsnién:ni á:se ionkwaié:na",
        howWeUse5: "Tsi niiohserá:ke ionkwarihwá:ke",
        howWeUse6: "Ionkwaterihwahkhwáhson tánon 19+ teieiéstahkhwa",
        // Section 4
        paymentSecurityTitle: "4. Ohwistá:ke Ionkwaterihwahkhwáhson",  // "Payment Security"
        paymentSecurityDesc: "PayGo ionkwaterihwahkhwáhson ne ohwistá:ke. Iáh teionkwarihwá:ienhs ne credit card number, CVV, tóka ohwistá:ke. TLS tánon PCI-DSS Level 1.",
        // Section 5
        dataSharingTitle: "5. Tsi Ionkwaterihwá:ienhs Ó:ia",  // "Data Sharing"
        dataSharingIntro: "Ionkwaterihwá:ienhs ne ok:",
        dataSharing1: "PayGo — ohwistá:ke",
        dataSharing2: "ShipStation / Canada Post — iesá:wis",
        dataSharing3: "Resend — email (sewatiénni, iesá:wis)",
        dataSharing4: "Tsi niiohserá:ke — tóka ionkwarihwá:ke ok",
        dataSharing5: "Anthropic (Claude AI) — MedAgent tsi iesaterihwaién:tha AI Anthropic ié:iere. Iáh teionkwarihwá:ienhs ne AI. Tsi iesaterihwaién:tha 2 ohserá:ke iá:iere. Iesanónhianion privacy@mohawkmedibles.ca tóka ensaiatatshénri.",
        dataSharingNote: "Iáh nonwén:ton teionkwatennión:ni ne iesaterihwá:ienhs ó:ia.",
        // Section 6
        yourRightsTitle: "6. Ise Tsi Ionkwarihwá:ke",      // "Your Rights"
        yourRightsIntro: "Ise ionkwarihwá:ke tsi:",
        yourRights1: "Satká:tho ne iesaterihwá:ienhs",
        yourRights2: "Saterihwaié:nahse tóka iáh teiotié:ri",
        yourRights3: "Satá:ti ne account tánon iesaterihwá:ienhs",
        yourRights4: "Saterihwátste ne marketing email",
        yourRights5: "Satenniénni ne iesaterihwá:ienhs",
        yourRightsContact: "Email privacy@mohawkmedibles.ca tsi iesaterihwá:ienhs ionkwarihwá:ke.",
        // Section 7
        cookiesTitle: "7. Cookies",
        cookiesDesc: "Cookies ionkwá:iere ne satahónhstat, ka'sere'tsherá:ke, tánon ionkwaterihwahkhwáhson. Iesatié:ren ne cookies tsi browser.",
        // Section 8
        dataRetentionTitle: "8. Tó: Niió:re Ionkwarihwá:ienhs",  // "Data Retention"
        dataRetentionDesc: "Sewatiénni — 7 niiohseró:ten ionkwarihwá:ienhs. Account — tsi satá:ti ionkwarihwá:ienhs. Iethinihsnién:ni — 2 niiohseró:ten.",
        // Section 9
        privacyContactTitle: "9. Iesanónhianion",
        privacyContactDesc: "Tsi nikanaktiió:ten otién:na — privacy@mohawkmedibles.ca tóka: Mohawk Medibles, Six Nations of the Grand River, Ontario, Canada.",
    },

    // ─── Tsi Niiohserá:ke — Terms of Service ──────────────
    termsOfService: {
        title: "Tsi Niiohserá:ke Ionkwarihwá:ke",         // "Terms of Service"
        lastUpdated: "Iahtshátho á:se: Ehníska 2026",
        // Section 1
        acceptanceTitle: "1. Sewatahonhsí:iohst",          // "Acceptance of Terms"
        acceptanceDesc: "Tsi sá:iere mohawkmedibles.co — sewatahonhsí:iohst tsi niiohserá:ke. Tóka iáh — tóhsa sá:iere ne website.",
        // Section 2
        ageRequirementTitle: "2. 19+ Katónhkwa",            // "Age Requirement"
        ageRequirementDesc: "19 niiohseró:ten tóka iahsiéhste katónhkwa tsi satká:tho, sewatiénni, tóka kahionhátie sá:iere. Tsi sá:iere — hen 19+ ise. Tóka teieiéstahkhwa — tiotkon tánon tsi iesá:wis.",
        // Section 3
        sovereigntyTitle: "3. Onkwehón:we Onkwarihwá:ke",   // "Indigenous Sovereignty"
        sovereigntyDesc: "Mohawk Medibles tewatennión:ni ne Haudenosaunee Confederacy tánon Kanien'kehá:ka onkwarihwá:ke — Tsí Ia:iak Niionkwetá:ke. Onkwehón:we ionkwarihwá:ke tánon ionkhi'nisténhsera.",
        // Section 4
        productsQualityTitle: "4. Kahionhátie tánon Ioianérehst",
        productsQualityDesc: "Akwékon kahionhátie tehotiienáweron Empire Standard™. Tsi nahó:ten, akiateníhten, tánon tsi niió:re — karihwí:io. THC/CBD tóka nó:nen tehiatá:ti.",
        // Section 5
        ordersPaymentTitle: "5. Sewatiénni tánon Ohwistá:ke",
        ordersPayment1: "Akwékon ohwistá:ke Canadian Dollars (CAD)",
        ordersPayment2: "Akwékon iáh tekaiénthos — Onkwehón:we onkwarihwá:ke, iáh HST",
        ordersPayment3: "PayGo ionkwaterihwahkhwáhson ne ohwistá:ke",
        ordersPayment4: "Ionkwarihwá:ke tsi sewatiénni satá:ti tóka sataterihwátste",
        ordersPayment5: "Sewatiénni karihwí:io tsi iesá:wis ok",
        // Section 6
        shippingTitle: "6. Iesá:wis",
        shippingDesc: "Canada akwékon Canada Post Xpresspost — ionkwaterihwahkhwáhson. 2-5 niwahsontá:ke. 19+ tóka teieiéstahkhwa tsi iesá:wis. Satká:tho Iesá:wis Tsi Niiohserá:ke.",
        // Section 7
        returnsRefundsTitle: "7. Sé:waton tánon Iakohwistanáhkhwa",
        returnsRefundsDesc: "Kahionhátie tsi niió:re — sé:waton ne iakorihwaié:ri, iáh tehotiienáweron, tóka ó:ia teieié:nahsen ok. Satká:tho Sé:waton Tsi Niiohserá:ke.",
        // Section 8
        accountTitle: "8. Account Ionkwarihwá:ke",
        accountDesc: "Ise ionkwarihwá:ke ne account ionkwaterihwahkhwáhson. Iesanónhianion ó:nen ok tóka ó:ia sá:iere ne account. Akwékon tsi account sá:iere — ise ionkwarihwá:ke.",
        // Section 9
        medAgentTitle: "9. MedAgent AI",
        medAgentDesc: "MedAgent AI iethinihsnién:ni — kahionhátie, sewatiénni iesa'nikón:rare, tánon otién:na. Iáh tehakorihwaiénthos ne aonhá:tshera iontonhétston. Tiotkon satká:tho ne doctor tsi aonhá:tshera.",
        // Section 10
        psilocybinTitle: "10. Psilocybin — Tsi Niiohserá:ke",
        psilocybinDesc: "Psilocybin kahionhátie tsi ón:wa Tyendinaga Kanien'kehá:ka ohwén:tsia ionkwarihwá:ke. Iáh Health Canada teionterihwá:ienhs. Iesewé:ienhs tsi niiohserá:ke ne psilocybin tsi nithonón:we. 19+ ok ne ronón:kwe. Tsi ensewáhninon iesewé:ienhs tsi sá:iere.",
        // Section 11
        liabilityTitle: "11. Tsi Ionkwarihwá:ke",          // "Limitation of Liability"
        liabilityDesc: "Mohawk Medibles kahionhátie tánon iethinihsnién:ni \"tsi niió:re.\" Iáh teionkwarihwá:ke ne ó:ia iakoiatatié:ren tsi sá:iere. Ohwistá:ke ionkwarihwá:ke ne kahionhátie ok sewatiénni.",
        // Section 12
        termsContactTitle: "12. Iesanónhianion",
        termsContactDesc: "Otién:na tsi niiohserá:ke — legal@mohawkmedibles.ca.",
    },

    // ─── Ioterihwakweniéhstha — Deals Page ────────────────
    deals: {
        title: "Kahionhátie Ioterihwakweniéhstha",        // "Cannabis Deals & Promotions"
        subtitle: "Ohwistánohon ne ioianérehst, teieiéstahkhwa kahionhátie. Iáh tekaiénthos iesá:wis, tewahwátsire — Empire Standard™ ioianérehst akwékon Canada.",
        // Active Offers
        activeOffers: "Nonwá Ioterihwakweniéhstha",       // "Active Offers"
        // Free Shipping offer
        freeShippingTitle: "Iáh Tekaiénthos Iesá:wis",
        freeShippingDesc: "$199 CAD iahsiéhste — iáh tekaiénthos Canada akwékon Xpresspost. Ó:nen ok, ionkwaterihwahkhwáhson.",
        // Mix & Match offer
        mixMatchTitle: "Satié:ren tánon Sá:ier",           // "Mix & Match"
        mixMatchDesc: "3 kanatarowanénhtha sewatiénni — 10% ohwistánohon. Satié:ren otsí:tsia, kashatste, tánon tó: nahé:ien.",
        // Bulk Savings offer
        bulkSavingsTitle: "Tewahwátsire Ohwistánohon",     // "Bulk Savings"
        bulkSavingsDesc: "Ounce $40 tsi teionkwatáhsawen — ioianérehst oié:ri. Iehatíhstha ioianérehst.",
        shopNow: "Atenniónni Nonwá",
        // Sections
        staffPicks: "Ionkhiia:ráhstha",                   // "Staff Picks" — "our selections"
        bestSellers: "Ioianeréhston Atennión:ni",          // "Best Sellers"
        // CTA
        browseAllProducts: "Satká:tho Akwékon 344+ Kahionhátie",
        browseAllDesc: "Satká:tho akwékon ne ioianérehst kahionhátie, akwékon Empire Standard™.",
        exploreFullShop: "Satká:tho Akwékon Atenniónhstha",  // "Explore Full Shop"
    },

    // ─── SEO Meta (Kanyen'kéha page titles & descriptions) ──
    seo: {
        siteTitle: "Mohawk Medibles | Onkwehón:we Kahionhátie — Tsí Ia:iak Niionkwetá:ke",
        siteDescription: "Onkwehón:we kahionhátie atenniónhstha Tsí Ia:iak Niionkwetá:ke. 344+ teieiéstahkhwa: oié:ri, kanatarowanénhtha, tsi niió:re. Empire Standard™. Canada akwékon.",
        shopTitle: "Atenniónni Kahionhátie | Mohawk Medibles",
        shopDescription: "Satká:tho 344+ teieiéstahkhwa kahionhátie. Oié:ri, kanatarowanénhtha, tsi niió:re — Empire Standard™. Canada akwékon iesá:wis.",
        dealsTitle: "Ioterihwakweniéhstha Kahionhátie | Mohawk Medibles",
        dealsDescription: "Ohwistánohon ne ioianérehst kahionhátie. Iáh tekaiénthos $199, tewahwátsire. Onkwehón:we, teieiéstahkhwa.",
        aboutTitle: "Oh Nahò:ten Mohawk Medibles | Onkwehón:we Kahionhátie",
        aboutDescription: "Sewatahonhsí:iohst Mohawk Medibles — Onkwehón:we kahionhátie Tyendinaga Kenhtè:ke. Tsi niionkwarihó:ten tánon tsi nihá:ti.",
        faqTitle: "Otién:na | Mohawk Medibles Kahionhátie",
        faqDescription: "Otién:na tsi niiohserá:ke — atenniónni, iesá:wis, iéhsa, tánon kahionhátie Mohawk Medibles. Canada akwékon.",
        contactTitle: "Iesanónhianion | Mohawk Medibles",
        contactDescription: "Tasatáti Mohawk Medibles. Otién:na atenniónni, kahionhátie, enhsá:ier. Tyendinaga Kenhtè:ke.",
        supportTitle: "Iethinihsnién:ni | Mohawk Medibles",
        supportDescription: "Sá:ier iesanihsnién:ni? Mohawk Medibles iethinihsnién:ni — iesá:wis, iesakaríwahton, kahionhátie.",
        blogTitle: "Aierihwáhtha Kahionhátie | Mohawk Medibles",
        blogDescription: "Kahionhátie karihwanón:ni, oié:ri, tánon Onkwehón:we aterihwá:tha Mohawk Medibles.",
        privacyTitle: "Ierihwáhkhwa Kaierihwanón:nistha | Mohawk Medibles",
        privacyDescription: "Mohawk Medibles ierihwáhkhwa. Tó: niió:re ionkwatié:renhst iesarihwáhkhwa. PIPEDA.",
        termsTitle: "Tsi Niiohserá:ke | Mohawk Medibles",
        termsDescription: "Tsi niiohserá:ke atenniónhstha Mohawk Medibles. Aosón:te, atenniónni, tánon karihwanón:ni.",
        shippingTitle: "Iesá:wis Karihwanón:ni | Mohawk Medibles",
        shippingDescription: "Mohawk Medibles iesá:wis. $199 iáh tekaiénthos. Canada akwékon Xpresspost. Ionkwaterihwahkhwáhson.",
        returnsTitle: "Iesakaríwahton | Mohawk Medibles",
        returnsDescription: "Mohawk Medibles iesakaríwahton. Kaié:ri iahsiéhste, atenniónni otién:na.",
        howToOrderTitle: "Tó: Ní:se Ensénni | Mohawk Medibles",
        howToOrderDescription: "Tó: ní:se ensénni kahionhátie Mohawk Medibles. Ohwístaha, aosón:te, tánon iesá:wis.",
        deliveryTitle: "Kahionhátie Iesá:wis Canada | Mohawk Medibles",
        deliveryDescription: "Ó:nen ok kahionhátie iesá:wis Canada akwékon. Xpresspost Tyendinaga Kenhtè:ke. Satká:tho iesá:wis.",
    },
} as const;

export default moh;
