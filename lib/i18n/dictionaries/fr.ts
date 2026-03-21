/**
 * French Dictionary (Français canadien / fr_CA)
 * ═══════════════════════════════════════════════
 * Traduction complète du dictionnaire anglais.
 * Terminologie cannabis québécoise/canadienne.
 */
import type { DictionarySchema } from "./en";

const fr: DictionarySchema = {
    // ─── Navigation ─────────────────────────────────────────
    nav: {
        shop: "Boutique",
        deals: "Promotions",
        about: "À propos",
        blog: "Blogue",
        reviews: "Avis",
        faq: "FAQ",
        support: "Soutien",
        cart: "Panier",
        search: "Recherche",
        login: "Connexion membre",
        talkToSupport: "Parler au soutien",
    },

    // ─── Hero / Accueil ─────────────────────────────────────
    hero: {
        badge: "Propriété autochtone · Territoire des Six Nations",
        headline: "Cannabis de qualité supérieure, enraciné dans le patrimoine",
        subheadline: "Plus de 344 produits testés en laboratoire conformes au Empire Standard™. Fleurs, comestibles, concentrés et plus — livrés partout au Canada.",
        shopNow: "Magasiner maintenant",
        learnMore: "En savoir plus",
    },

    // ─── Boutique ───────────────────────────────────────────
    shop: {
        title: "Tous les produits",
        filterAll: "Tous",
        addToCart: "Ajouter au panier",
        outOfStock: "En rupture de stock",
        featured: "En vedette",
        sortBy: "Trier par",
        newest: "Nouveautés",
        priceLow: "Prix : croissant",
        priceHigh: "Prix : décroissant",
        results: "résultats",
    },

    // ─── Détails du produit ─────────────────────────────────
    product: {
        thc: "THC",
        cbd: "CBD",
        weight: "Poids",
        terpenes: "Profil terpénique",
        description: "Description",
        specs: "Spécifications",
        reviews: "Avis",
        youMightLike: "Vous pourriez aussi aimer",
        quantity: "Quantité",
    },

    // ─── Livraison ──────────────────────────────────────────
    delivery: {
        heroTitle: "Livraison de cannabis de qualité supérieure",
        whyChoose: "Pourquoi choisir Mohawk Medibles pour la livraison de cannabis à",
        browseCategories: "Parcourir nos catégories de cannabis",
        alsoDelivering: "Nous livrons également à",
        deliveryFaq: "FAQ sur la livraison",
        labTested: "Testé en laboratoire",
        products339: "Plus de 344 produits",
        open: "Ouvert de 9 h à 22 h",
        fastDiscreet: "Livraison rapide et discrète à votre porte",
        empireStandard: "Chaque produit respecte le Empire Standard™",
        wideSelection: "Fleurs, comestibles, concentrés, vapoteuses et plus",
        orderAnyday: "Commandez tous les jours de la semaine",
    },

    // ─── Pied de page ───────────────────────────────────────
    footer: {
        tagline: "Cannabis de qualité supérieure, propriété autochtone. Enraciné dans le patrimoine, testé à la perfection.",
        quickLinks: "Liens rapides",
        categories: "Catégories",
        contact: "Contact",
        rights: "Tous droits réservés.",
        privacy: "Politique de confidentialité",
        terms: "Conditions d'utilisation",
    },

    // ─── Sections de la page d'accueil ──────────────────────
    home: {
        // Vitrine de catégories
        shopByCategory: "Magasiner par catégorie",
        categorySubtitle: "Plus de 344 produits testés en laboratoire dans nos collections",
        viewAllProducts: "Voir tout",
        productsCount: "Plus de 344 produits",

        // Filtre par effet
        whatLookingFor: "Que recherchez-vous?",
        shopByFeeling: "Magasinez selon l'effet désiré",
        effectRelax: "Détente",
        effectEnergy: "Énergie",
        effectCreate: "Créativité",
        effectSleep: "Sommeil",
        effectParty: "Fête",
        effectWellness: "Bien-être",
        effectPain: "Soulagement de la douleur",

        // Preuve sociale
        customerRating: "Évaluation des clients",
        reviewCount: "Plus de 2 340 avis",
        ordersShipped: "Commandes expédiées",
        canadaWide: "Partout au Canada",
        servingCanada: "Au service du Canada",
        yearsTrusted: "Plus de 6 ans de confiance",
        indigenousDispensary: "Dispensaire autochtone",
        premiumQuality: "Qualité supérieure",

        // Piliers de confiance
        whyMohawk: "Pourquoi Mohawk Medibles",
        trustedBy: "La confiance de plus de 47 000 Canadiens depuis 2018",
        labTested: "Testé en laboratoire",
        everyBatch: "Chaque lot",
        labTestedDesc: "Tests en laboratoire tiers pour la puissance, la pureté et la sécurité. Certifié Empire Standard™.",
        indigenousOwned: "Propriété autochtone",
        andOperated: "et exploité",
        indigenousDesc: "Fièrement au service depuis le territoire mohawk de Tyendinaga depuis 2018. Qualité souveraine.",
        discreetShipping: "Expédition discrète",
        smellProof: "Anti-odeurs",
        shippingDesc: "Emballage sous vide, anti-odeurs. Aucune marque extérieure. Votre vie privée est garantie.",
        taxFree: "Sans taxe",
        always: "Toujours",
        taxFreeDesc: "Prix en territoire souverain. Le 5 $ le gramme. Le meilleur rapport qualité-prix au Canada.",

        // Promotions
        todaysDeals: "Promotions du jour",
        dealsSubtitle: "Renouvelées quotidiennement — ne manquez rien",
        endsIn: "Se termine dans :",
        shopNow: "Magasiner maintenant",
        bestSeller: "MEILLEUR VENDEUR",
        promoCode: "Utilisez le code",
        promoDiscount: "pour 10 % de rabais sur les commandes de 100 $+",

        // Avis
        fiveStarDispensary: "Dispensaire de cannabis 5 étoiles",
        thousandsSatisfied: "Des milliers de clients satisfaits partout au Canada",

        // Collection
        theCollection: "La collection.",
        collectionSubtitle: "Sélectionnée pour le connaisseur. Conçue pour l'effet.",
        viewProduct: "Voir le produit",
    },

    // ─── Commun ─────────────────────────────────────────────
    common: {
        loading: "Chargement...",
        error: "Une erreur est survenue",
        viewAll: "Voir tout",
        backToShop: "Retour à la boutique",
        close: "Fermer",
        language: "Langue",
    },

    // ─── Page FAQ ───────────────────────────────────────────
    faq: {
        title: "Foire aux questions",
        badge: "Soutien",
        subtitle: "Trouvez les réponses aux questions fréquentes sur les commandes, la livraison, les produits et plus encore.",
        searchPlaceholder: "Rechercher une question...",
        noResultsFor: "Aucun résultat pour",
        noResultsHint: "Essayez un autre terme de recherche, ou",
        contactUsLink: "contactez-nous",
        noResultsHintEnd: "pour obtenir de l'aide.",
        // Noms des sections
        orderingPayment: "Commandes et paiement",
        shippingDelivery: "Expédition et livraison",
        productsQuality: "Produits et qualité",
        returnsRefunds: "Retours et remboursements",
        accountPrivacy: "Compte et confidentialité",
        // Commandes et paiement — Q&R
        faqQ1: "Comment passer une commande?",
        faqA1: "Parcourez notre boutique, ajoutez des articles à votre panier et passez à la caisse. Nous acceptons Visa, Mastercard, le virement Interac et le Bitcoin. Toutes les commandes sont traitées de manière sécurisée par PayGo.",
        faqQ2: "Y a-t-il un montant minimum de commande?",
        faqA2: "Aucun montant minimum requis! Cependant, les commandes de plus de 199 $ CA bénéficient de la livraison GRATUITE partout au Canada.",
        faqQ3: "Facturez-vous la taxe?",
        faqA3: "Tous les prix sont sans taxe. En tant qu'entreprise autochtone opérant sous la souveraineté du territoire mohawk de Tyendinaga, aucune TVH ni taxe de vente n'est appliquée à votre commande.",
        faqQ4: "Puis-je modifier ou annuler ma commande?",
        faqA4: "Les commandes peuvent être modifiées ou annulées dans l'heure suivant leur passation, avant qu'elles n'entrent en traitement. Contactez-nous immédiatement à info@mohawkmedibles.ca ou appelez le (613) 396-6728.",
        faqQ5: "Offrez-vous des prix de gros ou en vrac?",
        faqA5: "Oui! Nous offrons des prix en vrac pour les détaillants et dispensaires qualifiés. Contactez notre équipe de gros à wholesale@mohawkmedibles.ca pour les prix et les quantités minimales de commande.",
        // Expédition et livraison — Q&R
        faqQ6: "Où livrez-vous?",
        faqA6: "Nous livrons partout au Canada dans les 13 provinces et territoires via Postes Canada Xpresspost. La livraison locale est disponible pour Hamilton, Brantford et la région des Six Nations.",
        faqQ7: "Combien de temps prend la livraison?",
        faqA7: "Livraison locale : le jour même ou le lendemain. Ontario : 1 à 3 jours ouvrables. Québec/Maritimes : 2 à 4 jours ouvrables. Ouest canadien : 3 à 5 jours ouvrables. Nord canadien : 5 à 10 jours ouvrables.",
        faqQ8: "Combien coûte la livraison?",
        faqA8: "GRATUITE pour la livraison locale et les commandes de plus de 199 $. Ontario : 15 $. Québec/Maritimes : 18 $. Ouest canadien : 20 $. Territoires nordiques : 25 $. Tous les prix sont en CAD.",
        faqQ9: "L'emballage est-il discret?",
        faqA9: "Absolument. Toutes les commandes sont expédiées dans des boîtes neutres, sans marque, sans indication du contenu. L'adresse de retour affiche un nom d'entreprise générique. Les produits sont emballés sous vide pour la fraîcheur et le contrôle des odeurs.",
        faqQ10: "Devrai-je présenter une pièce d'identité à la livraison?",
        faqA10: "Postes Canada peut exiger une vérification de l'âge et une signature à la livraison. Veuillez avoir une pièce d'identité avec photo émise par le gouvernement confirmant que vous avez 19 ans ou plus à portée de main à l'arrivée de votre colis.",
        faqQ11: "Comment suivre ma commande?",
        faqA11: "Une fois expédiée, vous recevrez un courriel avec un numéro de suivi Postes Canada. Vous pouvez également suivre votre commande depuis votre tableau de bord de compte ou demander à MedAgent des mises à jour en temps réel.",
        // Produits et qualité — Q&R
        faqQ12: "Vos produits sont-ils testés en laboratoire?",
        faqA12: "Oui. Tous les produits respectent nos normes de qualité Empire Standard™. Nous travaillons avec des laboratoires certifiés pour vérifier la teneur en THC/CBD, détecter les contaminants et assurer une puissance constante d'un lot à l'autre.",
        faqQ13: "Quelles catégories de produits offrez-vous?",
        faqA13: "Nous offrons plus de 344 produits dans cinq catégories : Fleurs de qualité supérieure, Comestibles artisanaux, Concentrés purs, Vapoteuses haut de gamme et Accessoires. Notre catalogue est mis à jour régulièrement avec de nouvelles arrivées.",
        faqQ14: "Les pourcentages de THC varient-ils entre les lots?",
        faqA14: "Oui, de légères variations naturelles entre les lots sont normales. Les pourcentages de THC/CBD affichés sur les pages de produits représentent la plage pour le lot le plus récent. Les résultats de laboratoire sont disponibles sur demande.",
        faqQ15: "Comment devrais-je entreposer mes produits?",
        faqA15: "Entreposez les fleurs et les comestibles dans un endroit frais et sombre, à l'abri de la lumière directe du soleil. Les concentrés doivent être réfrigérés pour une consistance optimale. Les cartouches de vapoteuse doivent être entreposées debout à température ambiante.",
        // Retours et remboursements — Q&R
        faqQ16: "Quelle est votre politique de retour?",
        faqA16: "En raison de la nature des produits de cannabis, les retours ne sont acceptés que pour les articles endommagés, défectueux ou expédiés par erreur. Signalez tout problème dans les 48 heures suivant la livraison avec des photos à returns@mohawkmedibles.ca.",
        faqQ17: "Combien de temps prennent les remboursements?",
        faqA17: "Une fois le retour approuvé, les remboursements sont traités dans un délai de 5 à 10 jours ouvrables sur votre mode de paiement d'origine. Vous recevrez un courriel de confirmation lorsque le remboursement sera émis.",
        faqQ18: "Que faire si mon colis est perdu?",
        faqA18: "Contactez-nous dans les 48 heures suivant la date de livraison prévue. Nous travaillerons avec Postes Canada pour enquêter et localiser le colis ou organiser un remplacement sans frais supplémentaires.",
        // Compte et confidentialité — Q&R
        faqQ19: "Ai-je besoin d'un compte pour commander?",
        faqA19: "Non — vous pouvez passer à la caisse en tant qu'invité. Cependant, la création d'un compte vous permet de suivre vos commandes, d'enregistrer vos adresses et d'accéder à des avantages exclusifs pour les abonnés.",
        faqQ20: "Comment mes données sont-elles protégées?",
        faqA20: "Toutes les données sont chiffrées en transit (TLS) et au repos. Le traitement des paiements est assuré par PayGo (conforme PCI-DSS niveau 1). Nous ne conservons jamais les numéros complets de carte de crédit. Consultez notre politique de confidentialité pour plus de détails.",
        faqQ21: "Qu'est-ce que MedAgent?",
        faqA21: "MedAgent est notre assistant client alimenté par l'intelligence artificielle. Il peut vous aider à trouver des produits, suivre vos commandes, répondre à vos questions et fournir des renseignements généraux sur le cannabis. Cliquez sur l'icône de clavardage sur n'importe quelle page pour commencer une conversation. MedAgent ne fournit pas de conseils médicaux.",
        // Appel à l'action
        stillHaveQuestions: "Vous avez encore des questions?",
        stillHaveQuestionsDesc: "Notre équipe est prête à vous aider. Communiquez avec nous par clavardage, courriel ou téléphone.",
        contactUs: "Nous contacter",
        emailSupport: "Soutien par courriel",
    },

    // ─── Page Soutien ───────────────────────────────────────
    support: {
        title: "Comment pouvons-nous vous aider?",
        subtitle: "Trouvez les réponses aux questions fréquentes, ou communiquez directement avec nous. Notre équipe et notre assistant IA sont là pour vous aider.",
        searchPlaceholder: "Rechercher de l'aide — p. ex. « livraison », « remboursement », « dosage »...",
        noResultsFor: "Aucun résultat pour",
        noResultsHint: "Essayez d'autres mots-clés, ou clavardez avec MedAgent pour une aide instantanée.",
        // Cartes de contact rapide
        liveAiChat: "Clavardage IA en direct",
        liveAiChatDesc: "Cliquez sur la bulle de clavardage — disponible 24/7",
        emailUs: "Écrivez-nous",
        emailUsDesc: "info@mohawkmedibles.ca — réponse sous 24 h",
        callUs: "Appelez-nous",
        callUsDesc: "(613) 396-6728 — lun.–ven. 10 h à 18 h HE",
        // Sujet : Expédition et livraison
        topicShippingTitle: "Expédition et livraison",
        topicShippingDesc: "Zones de livraison, délais d'expédition et suivi",
        supportShipQ1: "Combien de temps prend la livraison?",
        supportShipA1: "Livraison le jour même à Tyendinaga, Belleville et Deseronto (commandez avant 16 h). Livraison le lendemain à Toronto (RGT), Hamilton et Brantford. Partout au Canada via Xpresspost en 2 à 5 jours ouvrables.",
        supportShipQ2: "La livraison est-elle discrète?",
        supportShipA2: "Absolument. Toutes les commandes sont expédiées dans un emballage neutre et sans marque, sans indication du contenu. Votre vie privée est notre priorité.",
        supportShipQ3: "Comment suivre ma commande?",
        supportShipA3: "Dès que votre commande est expédiée, vous recevrez un numéro de suivi par courriel. Vous pouvez également vérifier l'état de votre commande dans votre tableau de bord de compte.",
        supportShipQ4: "Offrez-vous la livraison gratuite?",
        supportShipA4: "Les commandes de plus de 199 $ CA bénéficient de la livraison gratuite partout au Canada. La livraison locale est toujours gratuite dans nos zones de livraison le jour même.",
        // Sujet : Paiements et facturation
        topicPaymentsTitle: "Paiements et facturation",
        topicPaymentsDesc: "Modes de paiement, questions de facturation et remboursements",
        supportPayQ1: "Quels modes de paiement acceptez-vous?",
        supportPayA1: "Nous acceptons Google Pay, le virement Interac, Visa, Mastercard et American Express. Tous les paiements sont traités de manière sécurisée par PayGo.",
        supportPayQ2: "Mes renseignements de paiement sont-ils sécurisés?",
        supportPayA2: "Oui. Nous utilisons PayGo pour le traitement des paiements avec un chiffrement de niveau bancaire. Nous ne conservons jamais les détails de votre carte sur nos serveurs.",
        supportPayQ3: "Comment fonctionnent les remboursements?",
        supportPayA3: "Les remboursements sont traités dans un délai de 5 à 7 jours ouvrables sur votre mode de paiement d'origine. Contactez-nous dans les 48 heures suivant la réception de votre commande en cas de problème.",
        // Sujet : Commandes et retours
        topicOrdersTitle: "Commandes et retours",
        topicOrdersDesc: "Gestion des commandes, annulations et politique de retour",
        supportOrderQ1: "Puis-je annuler ou modifier ma commande?",
        supportOrderA1: "Les commandes peuvent être modifiées ou annulées dans l'heure suivant leur passation, avant qu'elles n'entrent en traitement. Contactez-nous immédiatement à info@mohawkmedibles.ca ou appelez le (613) 396-6728.",
        supportOrderQ2: "Quelle est votre politique de retour?",
        supportOrderA2: "Nous acceptons les retours de produits non ouverts et scellés dans les 14 jours suivant la livraison. Les produits doivent être dans leur emballage d'origine. Contactez le soutien pour initier un retour.",
        supportOrderQ3: "Ma commande est arrivée endommagée — que faire?",
        supportOrderA3: "Nous en sommes désolés! Prenez des photos des articles endommagés et de l'emballage, puis contactez-nous dans les 48 heures. Nous enverrons un remplacement ou émettrons un remboursement complet — à votre choix.",
        // Sujet : Sécurité et qualité
        topicSafetyTitle: "Sécurité et qualité",
        topicSafetyDesc: "Qualité des produits, tests en laboratoire et conseils de dosage",
        supportSafetyQ1: "Vos produits sont-ils testés en laboratoire?",
        supportSafetyA1: "Oui. Tous les produits respectent nos normes de qualité Empire Standard et sont testés en laboratoire pour la puissance, les pesticides, les métaux lourds et les contaminants microbiens.",
        supportSafetyQ2: "Quelle est la dose recommandée pour les comestibles?",
        supportSafetyA2: "Commencez faiblement, allez-y doucement. Nous recommandons de commencer avec 5 à 10 mg de THC et d'attendre au moins 2 heures avant d'en consommer davantage. Les comestibles prennent plus de temps à faire effet que la fumée ou la vapoteuse.",
        supportSafetyQ3: "Dois-je avoir 19 ans ou plus pour commander?",
        supportSafetyA3: "Oui. Vous devez avoir 19 ans ou plus pour acheter des produits de cannabis. Nous vérifions l'âge pour toutes les commandes — sans exception.",
        // Section Visitez-nous
        visitUs: "Visitez-nous",
        locationLabel: "Adresse",
        locationAddress1: "45, rue Dundas",
        locationAddress2: "Deseronto (Ontario)",
        locationAddress3: "Territoire mohawk de Tyendinaga",
        hoursLabel: "Heures d'ouverture",
        hoursValue1: "Ouvert 7 jours sur 7",
        hoursValue2: "10 h à 22 h HE",
        hoursValue3: "Commandes le jour même avant 16 h",
        // Section appel à l'action
        stillNeedHelp: "Besoin d'aide supplémentaire?",
        stillNeedHelpDesc: "Notre assistant IA MedAgent est disponible 24/7 pour répondre à vos questions, vous aider à trouver des produits et vous guider lors de la commande.",
        browseFullFaq: "Consulter la FAQ complète",
        contactUsDirectly: "Nous contacter directement",
    },

    // ─── Page À propos ──────────────────────────────────────
    about: {
        title: "À propos",
        // Héros
        heroBadge: "Six Nations de la rivière Grand",
        heroHeadline1: "Enraciné dans la souveraineté.",
        heroHeadline2: "Bâti pour la communauté.",
        heroDescription: "Mohawk Medibles est un dispensaire de cannabis de propriété autochtone opérant depuis le territoire mohawk de Tyendinaga et les Six Nations de la rivière Grand. Depuis 2019, nous servons les Canadiens avec du cannabis de qualité supérieure, testé en laboratoire, soutenu par la qualité, l'intégrité et le respect des traditions autochtones.",
        // Statistiques
        statProducts: "Produits de qualité supérieure",
        statCustomers: "Clients servis",
        statYears: "Années de confiance",
        statProvinces: "Provinces et territoires",
        // Mission
        missionLabel: "Notre mission",
        missionHeadline1: "Cannabis de qualité supérieure,",
        missionHeadline2: "accès digne.",
        missionDescription: "Offrir aux Canadiens des produits de cannabis de la plus haute qualité tout en exerçant la souveraineté autochtone et en réinvestissant dans nos communautés. Nous croyons que l'accès à un cannabis de qualité supérieure, testé en laboratoire, devrait être simple, abordable et digne — avec une expédition rapide, un emballage discret et un soutien compétent à chaque étape.",
        missionTagLabTested: "Testé en laboratoire",
        missionTagEmpireStandard: "Empire Standard™",
        missionTagTaxFree: "Sans taxe",
        missionTagCanadaWide: "Partout au Canada",
        // Valeurs
        valuesLabel: "Nos valeurs",
        valuesHeadline: "Ce que nous défendons",
        valuesSovereigntyTitle: "Souveraineté autochtone",
        valuesSovereigntyDesc: "Nous opérons en vertu de la souveraineté inhérente de la Confédération haudenosaunee et de la Nation mohawk. Notre entreprise est enracinée dans l'autodétermination, l'autonomisation communautaire et la longue tradition du commerce autochtone.",
        valuesQualityTitle: "Qualité Empire Standard™",
        valuesQualityDesc: "Chaque produit que nous offrons respecte notre rigoureux Empire Standard™ — testé en laboratoire, entreposé adéquatement et soigneusement sélectionné. Nous ne faisons jamais de compromis sur la puissance, la pureté ou la fraîcheur.",
        valuesCommunityTitle: "La communauté d'abord",
        valuesCommunityDesc: "Une portion importante de nos revenus est réinvestie dans les programmes communautaires des Six Nations, les initiatives jeunesse et la préservation culturelle. Lorsque vous magasinez chez nous, vous soutenez les communautés autochtones.",
        valuesSustainabilityTitle: "Pratiques durables",
        valuesSustainabilityDesc: "Nous priorisons les fournisseurs soucieux de l'environnement, les emballages recyclables et les opérations à déchets minimaux. Notre engagement envers la terre reflète notre lien profond avec le monde naturel.",
        // Chronologie
        journeyLabel: "Notre parcours",
        journeyHeadline: "Des racines à l'empire.",
        milestone2019: "Fondé sur le territoire des Six Nations de la rivière Grand",
        milestone2020: "Expansion de la livraison partout au Canada via Postes Canada Xpresspost",
        milestone2021: "Lancement de la gamme de comestibles et de concentrés de qualité supérieure",
        milestone2022: "Plus de 10 000 clients satisfaits dans toutes les provinces",
        milestone2023: "Introduction du programme de qualité Empire Standard™",
        milestone2024: "Lancement du soutien client alimenté par l'IA MedAgent",
        milestone2025: "Plus de 344 produits sélectionnés dans 15 catégories",
        // Promesse de qualité
        qualityLabel: "Le Empire Standard™",
        qualityHeadline: "Qualité sans compromis.",
        qualityDescription: "Chaque produit de notre collection passe un rigoureux contrôle de qualité en 4 points : vérification de la puissance, profilage complet des terpènes, dépistage des contaminants et inspection visuelle par un expert. C'est le Empire Standard™ — et nous n'expédions jamais rien qui ne le respecte pas.",
        qualityLabTested: "Testé en laboratoire",
        qualityLabTestedDetail: "Vérifié par un tiers",
        qualityTerpeneProfiled: "Profil terpénique",
        qualityTerpeneDetail: "Données aromatiques complètes",
        qualityContaminantFree: "Sans contaminant",
        qualityContaminantDetail: "Dépistage pesticides et métaux",
        qualityDiscreetShipping: "Expédition discrète",
        qualityDiscreetDetail: "Emballage anti-odeurs",
        // Appel à l'action
        readyToShop: "Prêt à magasiner?",
        readyToShopDesc: "Parcourez plus de 344 produits de cannabis de qualité supérieure. Traitement le jour même, expédition partout au Canada, toujours sans taxe.",
        browseCollection: "Parcourir la collection",
        contactUs: "Nous contacter",
    },

    // ─── Page Contact ───────────────────────────────────────
    contact: {
        title: "Nous contacter",
        badge: "Communiquez avec nous",
        subtitle: "Vous avez une question au sujet d'une commande, de nos produits ou autre chose? Nous sommes là pour vous aider.",
        // Coordonnées
        emailLabel: "Courriel",
        emailValue: "info@mohawkmedibles.ca",
        emailDesc: "Demandes générales — nous répondons sous 24 heures",
        phoneLabel: "Téléphone",
        phoneValue: "(613) 396-6728",
        phoneDesc: "Disponible du lundi au vendredi, 10 h à 18 h HE",
        locationLabel: "Adresse",
        locationValue: "45, rue Dundas, Deseronto (Ontario)",
        locationDesc: "Territoire mohawk de Tyendinaga",
        hoursLabel: "Heures d'ouverture",
        hoursValue: "Lun.–sam. : 10 h à 20 h HE",
        hoursDesc: "Dimanche : 12 h à 18 h HE",
        // MedAgent
        needInstantHelp: "Besoin d'aide immédiate?",
        medAgentDesc: "Clavardez avec MedAgent, notre assistant IA, pour des réponses rapides sur les produits, les commandes et plus encore.",
        medAgentHint: "Cliquez sur l'icône de clavardage dans le coin inférieur droit",
        // Formulaire
        sendUsMessage: "Envoyez-nous un message",
        fullName: "Nom complet *",
        fullNamePlaceholder: "Votre nom",
        email: "Courriel *",
        emailPlaceholder: "vous@exemple.com",
        department: "Département",
        subject: "Sujet *",
        subjectPlaceholder: "De quoi s'agit-il?",
        message: "Message *",
        messagePlaceholder: "Dites-nous comment nous pouvons vous aider...",
        sendMessage: "Envoyer le message",
        sending: "Envoi en cours...",
        // Départements
        deptGeneral: "Demande générale",
        deptOrders: "Soutien aux commandes",
        deptReturns: "Retours et remboursements",
        deptWholesale: "Vente en gros / Volume",
        deptPress: "Presse et médias",
        deptTechnical: "Site Web / Technique",
        // Succès/Erreur
        messageSentTitle: "Message envoyé!",
        messageSentDesc: "Nous vous répondrons sous 24 heures. Vérifiez votre courriel pour une confirmation.",
        sendAnother: "Envoyer un autre message",
        formError: "Une erreur est survenue. Veuillez réessayer ou nous écrire directement à info@mohawkmedibles.ca",
    },

    // ─── Page Comment commander ─────────────────────────────
    howToOrder: {
        title: "Comment commander",
        subtitle: "Commander du cannabis chez Mohawk Medibles est simple, sécuritaire et rapide. Suivez notre processus facile en 3 étapes pour recevoir des produits de qualité supérieure, testés en laboratoire, livrés à votre porte.",
        // Étape 1
        step1Title: "Parcourir et sélectionner",
        step1Desc: "Visitez notre boutique et explorez notre vaste collection de produits. Utilisez nos filtres intelligents pour rechercher par catégorie, puissance, type de produit ou prix. Choisissez parmi plus de 344 produits de cannabis testés en laboratoire, incluant fleurs, comestibles, concentrés, vapoteuses, haschich, CBD, champignons et accessoires.",
        step1Bullet1: "Parcourez par catégorie : Fleurs, Comestibles, Concentrés, Vapoteuses, Haschich, CBD et plus",
        step1Bullet2: "Filtrez par teneur en THC/CBD, prix, marque et évaluations des clients",
        step1Bullet3: "Lisez les descriptions détaillées des produits et les résultats de laboratoire",
        step1Bullet4: "Consultez les avis des clients et les profils terpéniques",
        // Étape 2
        step2Title: "Ajouter au panier et passer à la caisse",
        step2Desc: "Ajoutez les articles sélectionnés à votre panier et passez à la caisse sécurisée. Nous offrons plusieurs modes de paiement sûrs et pratiques selon vos préférences.",
        step2Bullet1: "Visa et Mastercard (traitement sécurisé via PayGo)",
        step2Bullet2: "Virement Interac (comptes bancaires canadiens)",
        step2Bullet3: "Cryptomonnaie (Bitcoin et Ethereum)",
        step2Bullet4: "Toutes les transactions sont chiffrées et conformes PCI-DSS",
        // Étape 3
        step3Title: "Livraison rapide",
        step3Desc: "Votre commande est traitée rapidement et expédiée via Postes Canada Xpresspost. Suivez votre colis en temps réel et recevez-le à votre porte dans un emballage discret.",
        step3Bullet1: "Traitement le jour même pour les commandes passées avant 14 h HNE",
        step3Bullet2: "Expédition via Postes Canada Xpresspost pour une livraison fiable et traçable",
        step3Bullet3: "Numéro de suivi envoyé par courriel immédiatement après l'expédition",
        step3Bullet4: "Emballage neutre, sans marque, sans indication du contenu",
        // Modes de paiement
        paymentMethodsTitle: "Modes de paiement",
        paymentInteracTitle: "Virement Interac",
        paymentInteracDesc: "Virements bancaires canadiens rapides et sécurisés. Confirmation instantanée.",
        paymentVisaTitle: "Visa et Mastercard",
        paymentVisaDesc: "Paiements par carte de crédit sécurisés via PayGo (PCI-DSS niveau 1).",
        paymentCryptoTitle: "Cryptomonnaie",
        paymentCryptoDesc: "Bitcoin et Ethereum pour des paiements décentralisés.",
        paymentCashTitle: "Comptant (ramassage local)",
        paymentCashDesc: "Payez comptant pour le ramassage local à Hamilton, Brantford ou Six Nations.",
        // Renseignements sur l'expédition
        shippingInfoTitle: "Renseignements sur l'expédition",
        shippingFreeTitle: "Livraison gratuite",
        shippingFreeDesc: "Les commandes de plus de 199 $ CA sont expédiées GRATUITEMENT partout au Canada via Postes Canada Xpresspost.",
        shippingMethodTitle: "Méthode d'expédition",
        shippingMethodDesc: "Toutes les commandes sont expédiées via Postes Canada Xpresspost pour une livraison fiable et assurée partout au Canada.",
        shippingDeliveryTimesTitle: "Délais de livraison",
        shippingDeliveryOntario: "Ontario : 1 à 3 jours ouvrables",
        shippingDeliveryQuebec: "Québec et provinces de l'Atlantique : 2 à 4 jours ouvrables",
        shippingDeliveryWestern: "Provinces de l'Ouest : 3 à 5 jours ouvrables",
        shippingDeliveryNorthern: "Territoires nordiques : 5 à 10 jours ouvrables",
        shippingDiscreetTitle: "Emballage discret",
        shippingDiscreetDesc: "Toutes les commandes sont expédiées dans des boîtes neutres, sans marque, sans indication du contenu. Les produits sont emballés sous vide pour la fraîcheur et le contrôle des odeurs.",
        shippingTrackingTitle: "Suivi de commande",
        shippingTrackingDesc: "Vous recevrez un numéro de suivi complet de Postes Canada par courriel immédiatement après l'expédition. Suivez votre colis en temps réel en ligne ou dans votre tableau de bord de compte.",
        // Besoin d'aide
        needHelp: "Besoin d'aide?",
        needHelpDesc: "Vous avez des questions sur les commandes, la livraison ou les produits? Consultez notre FAQ complète ou contactez notre équipe de soutien.",
        viewFaq: "Consulter la FAQ",
        contactSupport: "Contacter le soutien",
        // Appel à l'action
        readyToOrder: "Prêt à commander?",
        readyToOrderDesc: "Parcourez plus de 344 produits de cannabis testés en laboratoire et commencez vos achats dès maintenant.",
        startShopping: "Commencer à magasiner",
    },

    // ─── Page Politique d'expédition ────────────────────────
    shippingPolicy: {
        title: "Politique d'expédition",
        subtitle: "Livraison rapide, discrète, partout au Canada.",
        // Sections
        shippingMethodsTitle: "Méthodes d'expédition",
        shippingMethodsDesc: "Toutes les commandes sont expédiées via Postes Canada Xpresspost pour une livraison fiable et suivie partout au Canada. Nous offrons également la livraison locale pour Hamilton, Brantford et la région des Six Nations.",
        deliveryTimesTitle: "Délais de livraison",
        // En-têtes du tableau
        tableRegion: "Région",
        tableEstimatedDelivery: "Livraison estimée",
        tableCost: "Coût",
        // Lignes du tableau
        regionLocal: "Local (Hamilton/Brantford/Six Nations)",
        regionLocalTime: "Jour même / Lendemain",
        regionLocalCost: "GRATUIT",
        regionOntario: "Ontario",
        regionOntarioTime: "1 à 3 jours ouvrables",
        regionOntarioCost: "15,00 $",
        regionQuebec: "Québec / Maritimes",
        regionQuebecTime: "2 à 4 jours ouvrables",
        regionQuebecCost: "18,00 $",
        regionWestern: "Ouest canadien (MB, SK, AB, C.-B.)",
        regionWesternTime: "3 à 5 jours ouvrables",
        regionWesternCost: "20,00 $",
        regionNorthern: "Nord canadien (Territoires)",
        regionNorthernTime: "5 à 10 jours ouvrables",
        regionNorthernCost: "25,00 $",
        freeShippingNote: "Livraison GRATUITE pour toutes les commandes de plus de 199 $ CA, partout au Canada.",
        // Autres sections
        discreetPackagingTitle: "Emballage discret",
        discreetPackagingDesc: "Toutes les commandes sont expédiées dans un emballage neutre, sans marque, sans indication du contenu. L'adresse de retour affiche un nom d'entreprise générique. Tous les produits sont emballés sous vide pour la fraîcheur et le contrôle des odeurs.",
        orderTrackingTitle: "Suivi de commande",
        orderTrackingDesc: "Dès l'expédition de votre commande, vous recevrez un courriel de confirmation d'expédition avec un numéro de suivi Postes Canada. Vous pouvez également suivre votre commande via votre tableau de bord de compte ou en demandant à MedAgent.",
        ageVerificationTitle: "Vérification de l'âge",
        ageVerificationDesc: "Vous devez avoir 19 ans ou plus pour recevoir les livraisons. Postes Canada peut exiger une vérification de l'âge et une signature à la livraison. Veuillez avoir une pièce d'identité avec photo émise par le gouvernement à portée de main.",
        processingTimesTitle: "Délais de traitement",
        processingTimesDesc: "Les commandes passées avant 14 h HE les jours ouvrables sont généralement traitées et expédiées le jour même. Les commandes passées après 14 h HE ou les fins de semaine et jours fériés seront traitées le jour ouvrable suivant.",
        lostDamagedTitle: "Colis perdus ou endommagés",
        lostDamagedDesc: "Si votre colis est perdu ou arrive endommagé, veuillez nous contacter dans les 48 heures suivant la livraison prévue. Nous travaillerons avec Postes Canada pour localiser le colis ou organiser un remplacement. Écrivez à support@mohawkmedibles.ca avec votre numéro de commande et des photos de tout dommage.",
    },

    // ─── Page Politique de retours ──────────────────────────
    returnsPolicy: {
        title: "Politique de retours et de remboursement",
        subtitle: "Votre satisfaction est importante pour nous.",
        // Admissibilité
        eligibilityTitle: "Admissibilité",
        eligibilityDesc: "En raison de la nature des produits de cannabis et des réglementations sanitaires, nous avons des directives de retour spécifiques :",
        returnsAcceptedTitle: "Retours acceptés pour :",
        returnsAccepted1: "Produits endommagés (arrivés brisés, écrasés ou compromis)",
        returnsAccepted2: "Articles incorrects (nous avons expédié le mauvais produit)",
        returnsAccepted3: "Articles manquants dans votre commande",
        returnsAccepted4: "Produits non conformes à la description (teneur en THC/CBD significativement différente de celle affichée)",
        returnsNotAcceptedTitle: "Retours NON acceptés pour :",
        returnsNotAccepted1: "Changement d'avis ou regret d'achat",
        returnsNotAccepted2: "Produits ouverts, utilisés ou consommés",
        returnsNotAccepted3: "Produits dont le sceau a été brisé",
        returnsNotAccepted4: "Insatisfaction subjective quant aux effets ou au goût",
        // Comment demander un retour
        howToRequestTitle: "Comment demander un retour",
        howToRequest1: "Contactez-nous dans les 48 heures suivant la réception de votre commande à returns@mohawkmedibles.ca",
        howToRequest2: "Incluez votre numéro de commande et des photos claires du problème",
        howToRequest3: "Notre équipe examinera votre demande dans les 24 heures",
        howToRequest4: "Si approuvé, nous fournirons les instructions pour le retour ou organiserons un remplacement",
        // Processus de remboursement
        refundProcessTitle: "Processus de remboursement",
        refundProcessDesc: "Les remboursements approuvés sont traités sur votre mode de paiement d'origine dans un délai de 5 à 10 jours ouvrables. Vous recevrez un courriel de confirmation lorsque le remboursement aura été initié.",
        refundFull: "Remboursement complet : article incorrect expédié, endommagé durant le transport",
        refundPartial: "Remboursement partiel : articles manquants dans la commande (remboursement pour les articles manquants seulement)",
        refundStoreCredit: "Crédit en magasin : disponible comme alternative pour tout retour admissible",
        // Échanges
        exchangesTitle: "Échanges",
        exchangesDesc: "Nous offrons des échanges pour les produits endommagés ou incorrects. Si l'article désiré est disponible, nous expédierons le remplacement sans frais supplémentaires. Si l'article est en rupture de stock, un remboursement complet sera émis.",
        // Expédition pour les retours
        shippingForReturnsTitle: "Expédition pour les retours",
        shippingForReturnsDesc: "Si le retour est dû à notre erreur (mauvais article, dommage), nous couvrons les frais d'expédition de retour. Pour les autres retours admissibles, le client est responsable des frais d'expédition de retour. Nous fournirons une étiquette d'expédition et des instructions.",
        // Contact
        contactTitle: "Contact",
        contactDesc: "Courriel : returns@mohawkmedibles.ca. Vous pouvez également demander de l'aide pour les retours à MedAgent via notre widget de clavardage.",
    },

    // ─── Page Politique de confidentialité ───────────────────
    privacyPolicy: {
        title: "Politique de confidentialité",
        lastUpdated: "Dernière mise à jour : février 2026",
        // Section 1
        whoWeAreTitle: "1. Qui sommes-nous",
        whoWeAreDesc: "Mohawk Medibles est un dispensaire de cannabis de propriété autochtone opérant depuis le territoire des Six Nations de la rivière Grand, Ontario, Canada. Cette politique explique comment nous traitons vos données personnelles lorsque vous utilisez notre site Web, passez des commandes ou interagissez avec nos services, y compris notre assistant MedAgent alimenté par l'IA.",
        // Section 2
        infoCollectTitle: "2. Renseignements que nous recueillons",
        infoYouProvide: "Renseignements que vous fournissez :",
        infoYouProvide1: "Nom, courriel, numéro de téléphone (lors de l'inscription ou du passage à la caisse)",
        infoYouProvide2: "Adresses de livraison et de facturation",
        infoYouProvide3: "Historique de commandes et préférences",
        infoYouProvide4: "Messages de demandes de soutien et conversations de clavardage avec MedAgent",
        infoYouProvide5: "Confirmation de vérification de l'âge (19+)",
        infoAutoCollected: "Renseignements recueillis automatiquement :",
        infoAutoCollected1: "Type d'appareil, navigateur et système d'exploitation",
        infoAutoCollected2: "Adresse IP (utilisée pour la prévention de la fraude et la conformité d'âge)",
        infoAutoCollected3: "Pages visitées et interactions sur notre site",
        infoAutoCollected4: "Témoins (cookies) et technologies de suivi similaires",
        // Section 3
        howWeUseTitle: "3. Comment nous utilisons vos renseignements",
        howWeUse1: "Pour traiter et exécuter vos commandes via Postes Canada Xpresspost",
        howWeUse2: "Pour envoyer les confirmations de commande, les avis d'expédition et les mises à jour de livraison",
        howWeUse3: "Pour fournir le soutien à la clientèle via notre IA MedAgent et nos agents humains",
        howWeUse4: "Pour améliorer nos produits, services et l'expérience du site Web",
        howWeUse5: "Pour se conformer aux exigences légales et réglementaires",
        howWeUse6: "Pour prévenir la fraude et vérifier l'admissibilité d'âge (19+)",
        // Section 4
        paymentSecurityTitle: "4. Sécurité des paiements",
        paymentSecurityDesc: "Tout le traitement des paiements est effectué de manière sécurisée par PayGo. Nous ne conservons jamais votre numéro complet de carte de crédit, CVV ou détails bancaires sur nos serveurs. Les données de paiement sont chiffrées en transit par TLS et au repos dans l'infrastructure conforme PCI-DSS niveau 1 de PayGo.",
        // Section 5
        dataSharingTitle: "5. Partage des données",
        dataSharingIntro: "Nous partageons les données uniquement avec :",
        dataSharing1: "PayGo — pour le traitement des paiements",
        dataSharing2: "ShipStation / Postes Canada — pour l'exécution des commandes et l'expédition",
        dataSharing3: "Resend — pour les courriels transactionnels (confirmations de commande, mises à jour d'expédition)",
        dataSharing4: "Forces de l'ordre — uniquement lorsque la loi l'exige",
        dataSharing5: "Anthropic (Claude AI) — Les conversations avec MedAgent sont traitées à l'aide de modèles de langage IA tiers fournis par Anthropic pour générer des réponses. Vos conversations ne sont pas utilisées pour entraîner des modèles d'IA. Les journaux de conversation sont conservés pendant 2 ans conformément à notre politique de conservation des données. Vous pouvez demander la suppression de votre historique de conversation à tout moment en envoyant un courriel à privacy@mohawkmedibles.ca.",
        dataSharingNote: "Nous ne vendons, ne louons et n'échangeons pas vos renseignements personnels à des tiers.",
        // Section 6
        yourRightsTitle: "6. Vos droits",
        yourRightsIntro: "Vous avez le droit de :",
        yourRights1: "Accéder aux données personnelles que nous détenons à votre sujet",
        yourRights2: "Corriger les renseignements inexacts",
        yourRights3: "Demander la suppression de votre compte et de vos données",
        yourRights4: "Vous désabonner des communications marketing",
        yourRights5: "Demander une copie de vos données dans un format portable",
        yourRightsContact: "Pour exercer l'un de ces droits, écrivez-nous à privacy@mohawkmedibles.ca.",
        // Section 7
        cookiesTitle: "7. Témoins (Cookies)",
        cookiesDesc: "Nous utilisons des témoins essentiels pour l'authentification, la fonctionnalité du panier et la sécurité du site. Des témoins analytiques optionnels peuvent être utilisés pour comprendre l'utilisation du site. Vous pouvez contrôler les témoins via les paramètres de votre navigateur.",
        // Section 8
        dataRetentionTitle: "8. Conservation des données",
        dataRetentionDesc: "Nous conservons les dossiers de commandes pendant 7 ans à des fins fiscales et de conformité réglementaire. Les données de compte sont conservées jusqu'à ce que vous demandiez leur suppression. Les journaux de clavardage et de soutien sont conservés pendant 2 ans.",
        // Section 9
        privacyContactTitle: "9. Contact",
        privacyContactDesc: "Pour les demandes relatives à la confidentialité, contactez-nous à privacy@mohawkmedibles.ca ou par courrier à : Mohawk Medibles, Six Nations de la rivière Grand, Ontario, Canada.",
    },

    // ─── Page Conditions d'utilisation ──────────────────────
    termsOfService: {
        title: "Conditions d'utilisation",
        lastUpdated: "Dernière mise à jour : février 2026",
        // Section 1
        acceptanceTitle: "1. Acceptation des conditions",
        acceptanceDesc: "En accédant et en utilisant mohawkmedibles.ca, vous acceptez les présentes conditions d'utilisation. Si vous n'êtes pas d'accord, veuillez ne pas utiliser notre site Web ou nos services.",
        // Section 2
        ageRequirementTitle: "2. Exigence d'âge",
        ageRequirementDesc: "Vous devez avoir 19 ans ou plus pour naviguer, acheter ou interagir avec tout produit sur ce site Web. En utilisant nos services, vous confirmez que vous respectez cette exigence d'âge. Nous nous réservons le droit de demander une vérification de l'âge à tout moment, y compris lors de la livraison.",
        // Section 3
        sovereigntyTitle: "3. Souveraineté autochtone",
        sovereigntyDesc: "Mohawk Medibles opère en vertu de la souveraineté inhérente de la Confédération haudenosaunee et de la Nation mohawk sur le territoire des Six Nations de la rivière Grand. Nos opérations sont régies par les droits autochtones et les principes d'autodétermination.",
        // Section 4
        productsQualityTitle: "4. Produits et qualité",
        productsQualityDesc: "Tous les produits vendus par Mohawk Medibles respectent nos normes de qualité Empire Standard™. Les descriptions, images et spécifications des produits sont fournies de la manière la plus précise possible. Les pourcentages réels de THC/CBD peuvent varier légèrement d'un lot à l'autre.",
        // Section 5
        ordersPaymentTitle: "5. Commandes et paiement",
        ordersPayment1: "Tous les prix sont en dollars canadiens (CAD) sauf indication contraire",
        ordersPayment2: "Toutes les commandes sont sans taxe en vertu de la souveraineté autochtone — aucune TVH ni taxe de vente n'est facturée",
        ordersPayment3: "Les paiements sont traités de manière sécurisée par PayGo",
        ordersPayment4: "Nous nous réservons le droit d'annuler ou de refuser toute commande",
        ordersPayment5: "La confirmation de commande ne constitue pas une acceptation tant que la commande n'a pas été expédiée",
        // Section 6
        shippingTitle: "6. Expédition",
        shippingDesc: "Les commandes sont expédiées partout au Canada via Postes Canada Xpresspost dans un emballage discret. La livraison estimée est de 2 à 5 jours ouvrables. Une vérification de l'âge (19+) peut être requise au moment de la livraison. Consultez notre politique d'expédition pour tous les détails.",
        // Section 7
        returnsRefundsTitle: "7. Retours et remboursements",
        returnsRefundsDesc: "En raison de la nature des produits de cannabis, les retours ne sont acceptés que pour les articles endommagés, défectueux ou expédiés par erreur. Consultez notre politique de retours pour tous les détails.",
        // Section 8
        accountTitle: "8. Responsabilité du compte",
        accountDesc: "Vous êtes responsable du maintien de la sécurité des identifiants de votre compte. Avisez-nous immédiatement si vous soupçonnez un accès non autorisé à votre compte. Vous êtes responsable de toute activité effectuée sous votre compte.",
        // Section 9
        medAgentTitle: "9. Assistant IA MedAgent",
        medAgentDesc: "Notre assistant MedAgent alimenté par l'IA fournit des renseignements sur les produits, le suivi des commandes et du soutien général. Les réponses de MedAgent sont à titre informatif seulement et ne constituent pas un avis médical. Consultez toujours un professionnel de la santé concernant l'utilisation du cannabis et les préoccupations de santé.",
        // Section 10
        psilocybinTitle: "10. Produits de psilocybine — Avis juridique",
        psilocybinDesc: "Les produits de psilocybine disponibles sur ce site sont vendus en vertu des droits de souveraineté autochtone inhérents du territoire mohawk de Tyendinaga. Ces produits ne sont pas approuvés par Santé Canada et n'ont pas été évalués pour leur innocuité ou leur efficacité par un organisme fédéral de réglementation. Les acheteurs sont seuls responsables de comprendre et de respecter le statut juridique de la psilocybine dans leur juridiction. Tous les produits de psilocybine sont strictement destinés aux adultes de 19 ans et plus. En achetant ces produits, vous reconnaissez et acceptez l'entière responsabilité de leur possession et utilisation.",
        // Section 11
        liabilityTitle: "11. Limitation de responsabilité",
        liabilityDesc: "Mohawk Medibles fournit des produits et des services « tels quels ». Nous ne sommes pas responsables des dommages indirects, accessoires ou consécutifs découlant de l'utilisation de nos produits ou services. Notre responsabilité totale ne dépassera pas le montant payé pour le produit spécifique en question.",
        // Section 12
        termsContactTitle: "12. Contact",
        termsContactDesc: "Pour des questions concernant les présentes conditions, contactez-nous à legal@mohawkmedibles.ca.",
    },

    // ─── Page Promotions ────────────────────────────────────
    deals: {
        title: "Promotions et rabais sur le cannabis",
        subtitle: "Économisez sur du cannabis de qualité supérieure, testé en laboratoire, grâce à nos offres en cours. De la livraison gratuite aux rabais en vrac, nous nous engageons à rendre la qualité Empire Standard™ accessible à tous les Canadiens.",
        // Offres en cours
        activeOffers: "Offres en cours",
        // Offre livraison gratuite
        freeShippingTitle: "Livraison gratuite",
        freeShippingDesc: "Livraison gratuite pour toutes les commandes de plus de 199 $ CA — partout au Canada via Xpresspost. Livraison rapide, discrète et sécurisée.",
        // Offre Mélangez et assortissez
        mixMatchTitle: "Mélangez et assortissez",
        mixMatchDesc: "Achetez 3 comestibles, obtenez 10 % de rabais sur votre total de comestibles. Mélangez les saveurs, les variétés et les puissances — à votre choix.",
        // Offre Économies en vrac
        bulkSavingsTitle: "Économies en vrac",
        bulkSavingsDesc: "Offres à l'once à partir de 40 $ — des fleurs de qualité supérieure à des prix imbattables. Parfait pour les amateurs sérieux.",
        shopNow: "Magasiner maintenant",
        // Sections
        staffPicks: "Coups de cœur de l'équipe",
        bestSellers: "Meilleurs vendeurs",
        // Appel à l'action
        browseAllProducts: "Parcourir les 344+ produits",
        browseAllDesc: "Découvrez notre sélection complète de produits de cannabis de qualité supérieure, tous conformes au Empire Standard™.",
        exploreFullShop: "Explorer la boutique complète",
    },

    // ─── SEO Meta (titres & descriptions par page pour le référencement) ──
    seo: {
        siteTitle: "Mohawk Medibles | Cannabis autochtone de qualité supérieure — Six Nations",
        siteDescription: "Dispensaire de cannabis autochtone sur le territoire des Six Nations. Plus de 344 produits testés en laboratoire : fleurs, comestibles, concentrés, vapoteuses. Qualité Empire Standard™. Livraison partout au Canada.",
        shopTitle: "Acheter du cannabis en ligne | Mohawk Medibles",
        shopDescription: "Parcourez plus de 344 produits de cannabis testés en laboratoire. Fleurs, comestibles, concentrés, vapoteuses et plus. Qualité Empire Standard™. Livraison rapide partout au Canada.",
        dealsTitle: "Promotions et rabais cannabis | Mohawk Medibles",
        dealsDescription: "Économisez sur du cannabis de qualité. Livraison gratuite dès 199 $, comestibles à mélanger, offres en vrac. Qualité autochtone, testée en laboratoire.",
        aboutTitle: "À propos de Mohawk Medibles | Patrimoine cannabis autochtone",
        aboutDescription: "Découvrez Mohawk Medibles — dispensaire de cannabis autochtone sur le territoire Mohawk de Tyendinaga. Notre histoire, nos valeurs et notre engagement envers la qualité.",
        faqTitle: "FAQ | Dispensaire de cannabis Mohawk Medibles",
        faqDescription: "Questions fréquemment posées sur les commandes, la livraison, les paiements et les produits chez Mohawk Medibles. Livraison de cannabis partout au Canada.",
        contactTitle: "Contactez-nous | Mohawk Medibles",
        contactDescription: "Communiquez avec Mohawk Medibles. Questions sur les commandes, les produits ou la vente en gros ? Nous sommes là pour vous aider. Territoire Mohawk de Tyendinaga.",
        supportTitle: "Service à la clientèle | Mohawk Medibles",
        supportDescription: "Besoin d'aide avec votre commande ? Contactez le soutien Mohawk Medibles pour la livraison, les retours, les produits et l'assistance aux comptes.",
        blogTitle: "Blogue et éducation cannabis | Mohawk Medibles",
        blogDescription: "Éducation sur le cannabis, guides des terpènes, critiques de variétés et histoires du patrimoine autochtone par Mohawk Medibles.",
        privacyTitle: "Politique de confidentialité | Mohawk Medibles",
        privacyDescription: "Politique de confidentialité de Mohawk Medibles. Comment nous recueillons, utilisons et protégeons vos renseignements personnels. Conforme à la LPRPDE.",
        termsTitle: "Conditions d'utilisation | Mohawk Medibles",
        termsDescription: "Conditions générales d'utilisation de la boutique en ligne Mohawk Medibles. Vérification de l'âge, commandes et conditions légales.",
        shippingTitle: "Politique de livraison | Mohawk Medibles",
        shippingDescription: "Informations sur la livraison Mohawk Medibles. Livraison gratuite dès 199 $. Livraison Xpresspost partout au Canada. Emballage discret.",
        returnsTitle: "Retours et remboursements | Mohawk Medibles",
        returnsDescription: "Politique de retour et de remboursement de Mohawk Medibles. Réclamations pour produits endommagés, problèmes de commande et garantie de satisfaction.",
        howToOrderTitle: "Comment commander | Mohawk Medibles",
        howToOrderDescription: "Guide étape par étape pour commander du cannabis en ligne chez Mohawk Medibles. Méthodes de paiement, vérification de l'âge et livraison.",
        deliveryTitle: "Livraison de cannabis partout au Canada | Mohawk Medibles",
        deliveryDescription: "Livraison rapide et discrète de cannabis partout au Canada. Expédition Xpresspost depuis le territoire Mohawk de Tyendinaga. Suivez votre commande.",
    },
} as const;

export default fr;
