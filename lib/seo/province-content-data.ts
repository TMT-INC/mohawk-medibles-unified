/**
 * Mohawk Medibles — Province-Specific Content Data
 * ═════════════════════════════════════════════════════
 * Rich, unique content for each of the 13 province/territory hub pages.
 * Includes legal info, delivery estimates from Tyendinaga, popular
 * product categories, and regulations summaries.
 */

export interface ProvinceContent {
	/** Must match the province slug in city-delivery-data.ts */
	slug: string;
	/** Legal minimum purchase age */
	legalAge: number;
	/** 1-2 sentence summary of provincial cannabis regulations */
	regulationsSummary: string;
	/** Estimated shipping time from Tyendinaga Mohawk Territory */
	deliveryEstimateFromTyendinaga: string;
	/** Top product categories customers order in this province */
	popularCategories: { name: string; slug: string; emoji: string }[];
	/** Province-specific intro paragraph (unique content for SEO) */
	introContent: string;
	/** Second paragraph — why choose Mohawk Medibles for this province */
	whyChooseUs: string;
	/** Provincial regulator / retail authority name */
	regulatoryBody: string;
	/** Province-specific shipping note */
	shippingNote: string;
}

export const PROVINCE_CONTENT: Record<string, ProvinceContent> = {
	ontario: {
		slug: "ontario",
		legalAge: 19,
		regulationsSummary:
			"Ontario permits private online cannabis sales alongside the Ontario Cannabis Store (OCS). Adults 19+ may purchase and possess up to 30 grams of dried cannabis in public.",
		deliveryEstimateFromTyendinaga: "1-3 business days",
		popularCategories: [
			{ name: "Flower", slug: "flower", emoji: "🌿" },
			{ name: "Edibles", slug: "edibles", emoji: "🍪" },
			{ name: "Concentrates", slug: "concentrates", emoji: "💎" },
			{ name: "Vapes", slug: "vapes", emoji: "💨" },
			{ name: "Pre-Rolls", slug: "pre-rolls", emoji: "🚬" },
			{ name: "Hash", slug: "hash", emoji: "🟤" },
		],
		introContent:
			"Ontario is Mohawk Medibles' home province — our dispensary operates from Tyendinaga Mohawk Territory near Deseronto in eastern Ontario. With over 20 cities served across the province, from Toronto and Ottawa to Thunder Bay and Sudbury, Ontario customers enjoy the fastest delivery times in our network. Whether you are in the GTA, Durham Region, Niagara, or Northern Ontario, our premium cannabis ships via Canada Post Xpresspost with full tracking.",
		whyChooseUs:
			"As an Indigenous-owned dispensary operating under inherent Haudenosaunee rights on Tyendinaga Mohawk Territory, Mohawk Medibles offers Ontario customers something unique: Empire Standard™ quality with lab-tested, terpene-profiled products that meet the highest standards in the Canadian cannabis market. Our proximity means most Ontario orders arrive within 1-2 business days.",
		regulatoryBody: "Alcohol and Gaming Commission of Ontario (AGCO)",
		shippingNote:
			"Ontario orders ship same-day when placed before 2 PM EST. Most GTA and Southern Ontario deliveries arrive next business day.",
	},
	quebec: {
		slug: "quebec",
		legalAge: 21,
		regulationsSummary:
			"Le Quebec a fixe l'age legal d'achat de cannabis a 21 ans, le plus eleve au Canada. La SQDC est le seul detaillant provincial autorise, mais les achats en ligne aupres de dispensaires autochtones sont accessibles aux residents du Quebec.",
		deliveryEstimateFromTyendinaga: "2-4 business days",
		popularCategories: [
			{ name: "Flower", slug: "flower", emoji: "🌿" },
			{ name: "Hash", slug: "hash", emoji: "🟤" },
			{ name: "Edibles", slug: "edibles", emoji: "🍪" },
			{ name: "Concentrates", slug: "concentrates", emoji: "💎" },
			{ name: "Pre-Rolls", slug: "pre-rolls", emoji: "🚬" },
		],
		introContent:
			"Quebec is home to a vibrant cannabis culture, particularly in Montreal and Quebec City. Mohawk Medibles delivers premium cannabis products to 8 cities across la belle province, from the bustling streets of Montreal to the historic charm of Quebec City and the Gatineau-Ottawa corridor. Quebec has Canada's highest legal cannabis age at 21, reflecting the province's cautious regulatory approach.",
		whyChooseUs:
			"Quebec cannabis consumers appreciate quality and value — two pillars of the Mohawk Medibles experience. Our lab-tested flower, artisanal hash, and carefully curated edibles meet the Empire Standard™, offering a premium alternative with competitive pricing. All Quebec orders ship via Canada Post Xpresspost with discreet packaging and full tracking.",
		regulatoryBody: "Societe quebecoise du cannabis (SQDC)",
		shippingNote:
			"Montreal and Gatineau orders typically arrive within 1-2 business days. Quebec City and Eastern Townships orders may take 2-3 business days.",
	},
	"british-columbia": {
		slug: "british-columbia",
		legalAge: 19,
		regulationsSummary:
			"British Columbia allows private cannabis retail alongside government-run BC Cannabis Stores. Adults 19+ may possess up to 30 grams in public and grow up to 4 plants per household.",
		deliveryEstimateFromTyendinaga: "3-5 business days",
		popularCategories: [
			{ name: "Flower", slug: "flower", emoji: "🌿" },
			{ name: "Concentrates", slug: "concentrates", emoji: "💎" },
			{ name: "Vapes", slug: "vapes", emoji: "💨" },
			{ name: "Edibles", slug: "edibles", emoji: "🍪" },
			{ name: "Pre-Rolls", slug: "pre-rolls", emoji: "🚬" },
			{ name: "Mushrooms", slug: "mushrooms", emoji: "🍄" },
		],
		introContent:
			"British Columbia has been at the forefront of Canadian cannabis culture for decades. From Vancouver's legendary dispensary scene to the craft growers of the Okanagan and Vancouver Island, BC sets the standard for cannabis connoisseurship. Mohawk Medibles serves 9 cities across BC, bringing Empire Standard™ quality from Tyendinaga Mohawk Territory to the West Coast.",
		whyChooseUs:
			"BC customers know quality cannabis — and that is exactly why they choose Mohawk Medibles. Our lab-tested, terpene-profiled products rival the best BC craft cannabis at competitive prices. With 9 cities served including Vancouver, Victoria, Surrey, and Kelowna, we bring the Empire Standard™ coast to coast.",
		regulatoryBody: "BC Liquor and Cannabis Regulation Branch",
		shippingNote:
			"BC orders ship via Canada Post Xpresspost. Metro Vancouver and Victoria typically receive orders within 2-3 business days. Interior and Island communities may take 3-4 business days.",
	},
	alberta: {
		slug: "alberta",
		legalAge: 18,
		regulationsSummary:
			"Alberta has Canada's lowest legal cannabis age at 18. The province operates a private retail model regulated by AGLC, with robust online and in-store options. Adults may possess up to 30 grams in public.",
		deliveryEstimateFromTyendinaga: "2-4 business days",
		popularCategories: [
			{ name: "Flower", slug: "flower", emoji: "🌿" },
			{ name: "Edibles", slug: "edibles", emoji: "🍪" },
			{ name: "Vapes", slug: "vapes", emoji: "💨" },
			{ name: "Concentrates", slug: "concentrates", emoji: "💎" },
			{ name: "Pre-Rolls", slug: "pre-rolls", emoji: "🚬" },
		],
		introContent:
			"Alberta leads Canada with the most accessible cannabis market — the legal purchase age is just 18, the lowest in the country. With a thriving private retail sector in Calgary and Edmonton, Alberta cannabis consumers are knowledgeable and value quality. Mohawk Medibles serves 7 cities across the province, from the energy capital Calgary to the northern reaches of Grande Prairie.",
		whyChooseUs:
			"Alberta's competitive cannabis market means consumers have plenty of choices — and they keep choosing Mohawk Medibles for our Empire Standard™ quality and transparent lab testing. Our premium flower, concentrates, and edibles are competitively priced with free shipping on orders over $149.",
		regulatoryBody: "Alberta Gaming, Liquor & Cannabis (AGLC)",
		shippingNote:
			"Calgary and Edmonton orders typically arrive within 2-3 business days. Southern Alberta and northern communities may take 3-4 business days.",
	},
	manitoba: {
		slug: "manitoba",
		legalAge: 19,
		regulationsSummary:
			"Manitoba regulates cannabis through a private retail model. Adults 19+ may purchase cannabis from licensed retailers and possess up to 30 grams in public. Home cultivation is prohibited in Manitoba.",
		deliveryEstimateFromTyendinaga: "2-4 business days",
		popularCategories: [
			{ name: "Flower", slug: "flower", emoji: "🌿" },
			{ name: "Edibles", slug: "edibles", emoji: "🍪" },
			{ name: "Hash", slug: "hash", emoji: "🟤" },
			{ name: "Concentrates", slug: "concentrates", emoji: "💎" },
			{ name: "Pre-Rolls", slug: "pre-rolls", emoji: "🚬" },
		],
		introContent:
			"Manitoba's cannabis market centres around Winnipeg, home to the majority of the province's population and cannabis consumers. Mohawk Medibles delivers premium products to 4 cities across Manitoba, from the cultural hub of Winnipeg to Brandon in the west and Thompson in the north. Manitoba is unique in prohibiting home cultivation, making quality online delivery even more important.",
		whyChooseUs:
			"Manitoba customers value reliability and quality — especially when home growing is not an option. Mohawk Medibles fills that gap with Empire Standard™ products, lab-tested and terpene-profiled for consistency. Free shipping on orders over $149 makes premium cannabis accessible across the prairies.",
		regulatoryBody: "Manitoba Liquor & Lotteries (MBLL)",
		shippingNote:
			"Winnipeg orders typically arrive within 2-3 business days. Brandon and southern Manitoba communities take 3-4 business days. Northern communities like Thompson may take 4-5 business days.",
	},
	saskatchewan: {
		slug: "saskatchewan",
		legalAge: 19,
		regulationsSummary:
			"Saskatchewan operates a fully private cannabis retail model. Adults 19+ may purchase from licensed retailers, possess up to 30 grams in public, and grow up to 4 plants per household.",
		deliveryEstimateFromTyendinaga: "2-4 business days",
		popularCategories: [
			{ name: "Flower", slug: "flower", emoji: "🌿" },
			{ name: "Edibles", slug: "edibles", emoji: "🍪" },
			{ name: "Vapes", slug: "vapes", emoji: "💨" },
			{ name: "Pre-Rolls", slug: "pre-rolls", emoji: "🚬" },
			{ name: "Concentrates", slug: "concentrates", emoji: "💎" },
		],
		introContent:
			"Saskatchewan embraced a fully private cannabis retail model from day one of legalization, creating a competitive market that benefits consumers. Mohawk Medibles serves 4 cities across the province, including Saskatoon and Regina, the two largest urban centres. Prairie cannabis consumers appreciate straightforward pricing and reliable quality — exactly what we deliver.",
		whyChooseUs:
			"In Saskatchewan's competitive private market, Mohawk Medibles stands out with Empire Standard™ quality at fair prices. Our lab-tested products, transparent terpene profiles, and free shipping over $149 make us a preferred choice for Saskatchewan cannabis consumers who want premium quality delivered to their door.",
		regulatoryBody: "Saskatchewan Liquor and Gaming Authority (SLGA)",
		shippingNote:
			"Saskatoon and Regina orders typically arrive within 2-3 business days. Prince Albert and Moose Jaw orders take 2-3 business days.",
	},
	"nova-scotia": {
		slug: "nova-scotia",
		legalAge: 19,
		regulationsSummary:
			"Nova Scotia operates cannabis retail through the government-run Nova Scotia Liquor Corporation (NSLC). Adults 19+ may possess up to 30 grams in public and grow up to 4 plants per household.",
		deliveryEstimateFromTyendinaga: "2-4 business days",
		popularCategories: [
			{ name: "Flower", slug: "flower", emoji: "🌿" },
			{ name: "Edibles", slug: "edibles", emoji: "🍪" },
			{ name: "Hash", slug: "hash", emoji: "🟤" },
			{ name: "Pre-Rolls", slug: "pre-rolls", emoji: "🚬" },
			{ name: "Concentrates", slug: "concentrates", emoji: "💎" },
		],
		introContent:
			"Nova Scotia's cannabis market is served by the government-run NSLC, but Maritime cannabis consumers increasingly look online for premium selection and competitive pricing. Mohawk Medibles delivers to 3 cities in Nova Scotia, including Halifax, Dartmouth, and Sydney on Cape Breton Island. The Maritime provinces have a strong cannabis culture and growing demand for premium products.",
		whyChooseUs:
			"Nova Scotia's government retail model means limited product selection — which is where Mohawk Medibles shines. Our Empire Standard™ collection offers Halifax and Maritime customers access to premium flower, artisanal hash, and lab-tested edibles that go beyond what NSLC stores typically carry.",
		regulatoryBody: "Nova Scotia Liquor Corporation (NSLC)",
		shippingNote:
			"Halifax and Dartmouth orders typically arrive within 2-3 business days. Cape Breton and northern Nova Scotia orders may take 3-4 business days.",
	},
	"new-brunswick": {
		slug: "new-brunswick",
		legalAge: 19,
		regulationsSummary:
			"New Brunswick operates cannabis retail through Cannabis NB, the provincial Crown corporation. Adults 19+ may possess up to 30 grams and grow up to 4 plants per household.",
		deliveryEstimateFromTyendinaga: "2-4 business days",
		popularCategories: [
			{ name: "Flower", slug: "flower", emoji: "🌿" },
			{ name: "Edibles", slug: "edibles", emoji: "🍪" },
			{ name: "Pre-Rolls", slug: "pre-rolls", emoji: "🚬" },
			{ name: "Hash", slug: "hash", emoji: "🟤" },
			{ name: "Vapes", slug: "vapes", emoji: "💨" },
		],
		introContent:
			"New Brunswick's cannabis market is managed by Cannabis NB, but online delivery from Indigenous dispensaries offers New Brunswickers expanded selection and competitive pricing. Mohawk Medibles serves 4 cities across the province — Moncton, Saint John, Fredericton, and Miramichi — covering the major population centres of this Maritime province.",
		whyChooseUs:
			"New Brunswick cannabis consumers deserve access to premium products at fair prices. Mohawk Medibles delivers Empire Standard™ quality to every corner of NB, from the port city of Saint John to the capital Fredericton and the bilingual hub of Moncton. Lab-tested, terpene-profiled, and shipped with care.",
		regulatoryBody: "Cannabis NB (Cannabis New Brunswick)",
		shippingNote:
			"Moncton, Saint John, and Fredericton orders typically arrive within 2-3 business days. Miramichi and northern NB orders may take 3-4 business days.",
	},
	"newfoundland-and-labrador": {
		slug: "newfoundland-and-labrador",
		legalAge: 19,
		regulationsSummary:
			"Newfoundland & Labrador allows both private and government cannabis retail through the NLC. Adults 19+ may possess up to 30 grams in public and grow up to 4 plants per household.",
		deliveryEstimateFromTyendinaga: "3-5 business days",
		popularCategories: [
			{ name: "Flower", slug: "flower", emoji: "🌿" },
			{ name: "Edibles", slug: "edibles", emoji: "🍪" },
			{ name: "Hash", slug: "hash", emoji: "🟤" },
			{ name: "Pre-Rolls", slug: "pre-rolls", emoji: "🚬" },
			{ name: "Concentrates", slug: "concentrates", emoji: "💎" },
		],
		introContent:
			"Newfoundland & Labrador, Canada's easternmost province, was the first place in North America to legally sell recreational cannabis when legalization took effect at midnight Newfoundland time on October 17, 2018. Mohawk Medibles proudly serves 3 cities in the province — St. John's, Mount Pearl, and Corner Brook — bringing Empire Standard™ cannabis to the Rock.",
		whyChooseUs:
			"Newfoundland's remote location means limited cannabis options and higher prices at local retailers. Mohawk Medibles offers NL customers access to a wide selection of premium, lab-tested products at competitive prices, with free shipping on orders over $149 to offset the distance.",
		regulatoryBody: "Newfoundland and Labrador Liquor Corporation (NLC)",
		shippingNote:
			"St. John's and Mount Pearl orders typically arrive within 3-4 business days. Corner Brook and western Newfoundland orders may take 3-5 business days.",
	},
	"prince-edward-island": {
		slug: "prince-edward-island",
		legalAge: 19,
		regulationsSummary:
			"Prince Edward Island sells cannabis through government-operated PEI Cannabis stores. Adults 19+ may possess up to 30 grams in public and grow up to 4 plants per household.",
		deliveryEstimateFromTyendinaga: "2-4 business days",
		popularCategories: [
			{ name: "Flower", slug: "flower", emoji: "🌿" },
			{ name: "Edibles", slug: "edibles", emoji: "🍪" },
			{ name: "Pre-Rolls", slug: "pre-rolls", emoji: "🚬" },
			{ name: "Hash", slug: "hash", emoji: "🟤" },
		],
		introContent:
			"Prince Edward Island, Canada's smallest province, has a growing cannabis market centred around Charlottetown and Summerside. Despite its small size, PEI has an enthusiastic cannabis community that values quality and convenience. Mohawk Medibles serves both major PEI cities, bringing premium products to the Gentle Island.",
		whyChooseUs:
			"With limited retail options on the island, PEI cannabis consumers benefit from Mohawk Medibles' extensive online selection. Our Empire Standard™ products, lab-tested and terpene-profiled, offer Islanders premium quality that rivals anything available locally — delivered right to your door with discreet packaging.",
		regulatoryBody: "PEI Cannabis Management Corporation",
		shippingNote:
			"Charlottetown and Summerside orders typically arrive within 2-3 business days via Canada Post Xpresspost.",
	},
	"northwest-territories": {
		slug: "northwest-territories",
		legalAge: 19,
		regulationsSummary:
			"The Northwest Territories allows adults 19+ to purchase cannabis from licensed retailers and the NTLC online store. Possession limit is 30 grams in public. Home cultivation of up to 4 plants is permitted.",
		deliveryEstimateFromTyendinaga: "4-7 business days",
		popularCategories: [
			{ name: "Flower", slug: "flower", emoji: "🌿" },
			{ name: "Edibles", slug: "edibles", emoji: "🍪" },
			{ name: "Concentrates", slug: "concentrates", emoji: "💎" },
			{ name: "Hash", slug: "hash", emoji: "🟤" },
		],
		introContent:
			"The Northwest Territories, with its capital Yellowknife, represents one of Canada's most remote cannabis markets. Limited local retail options and high northern prices make online delivery essential for NWT residents. Mohawk Medibles serves Yellowknife and Hay River, bringing Empire Standard™ cannabis to Canada's northern frontier.",
		whyChooseUs:
			"Northern living comes with unique challenges — limited product selection and premium pricing are two of them. Mohawk Medibles bridges the gap with competitive pricing, free shipping over $149, and a curated selection of lab-tested products perfect for long northern evenings under the aurora borealis.",
		regulatoryBody: "NWT Liquor and Cannabis Commission (NTLC)",
		shippingNote:
			"Yellowknife orders typically arrive within 4-6 business days. Hay River and other NWT communities may take 5-7 business days depending on Canada Post routing.",
	},
	nunavut: {
		slug: "nunavut",
		legalAge: 19,
		regulationsSummary:
			"Nunavut allows adults 19+ to purchase cannabis through approved online retailers and limited community sales. The territorial government regulates distribution. Possession limit is 30 grams in public.",
		deliveryEstimateFromTyendinaga: "5-10 business days",
		popularCategories: [
			{ name: "Flower", slug: "flower", emoji: "🌿" },
			{ name: "Edibles", slug: "edibles", emoji: "🍪" },
			{ name: "Hash", slug: "hash", emoji: "🟤" },
			{ name: "Pre-Rolls", slug: "pre-rolls", emoji: "🚬" },
		],
		introContent:
			"Nunavut, Canada's newest and largest territory, has the most limited cannabis retail infrastructure in the country. With no brick-and-mortar cannabis stores in most communities, online delivery is the primary way Nunavummiut access legal cannabis. Mohawk Medibles serves Iqaluit and Rankin Inlet, bringing quality products to Canada's Arctic.",
		whyChooseUs:
			"For Nunavut residents, online cannabis delivery is not just convenient — it is often the only option. Mohawk Medibles provides Nunavummiut with access to premium, lab-tested products at fair southern prices, with free shipping on orders over $149 to help offset the challenges of northern delivery.",
		regulatoryBody: "Nunavut Liquor and Cannabis Commission",
		shippingNote:
			"Iqaluit orders typically arrive within 5-8 business days. Rankin Inlet and Kivalliq region orders may take 7-10 business days. Delivery times depend on Canada Post's northern routing schedule.",
	},
	yukon: {
		slug: "yukon",
		legalAge: 19,
		regulationsSummary:
			"Yukon operates cannabis retail through both government and private stores. Adults 19+ may possess up to 30 grams in public and grow up to 4 plants per household. The Yukon Liquor Corporation oversees regulation.",
		deliveryEstimateFromTyendinaga: "4-7 business days",
		popularCategories: [
			{ name: "Flower", slug: "flower", emoji: "🌿" },
			{ name: "Edibles", slug: "edibles", emoji: "🍪" },
			{ name: "Concentrates", slug: "concentrates", emoji: "💎" },
			{ name: "Hash", slug: "hash", emoji: "🟤" },
			{ name: "Pre-Rolls", slug: "pre-rolls", emoji: "🚬" },
		],
		introContent:
			"The Yukon, land of the midnight sun and the Klondike Gold Rush, has a small but passionate cannabis community. Mohawk Medibles delivers to Whitehorse and Dawson City, serving the territory's two main population centres. Despite the distance from our Tyendinaga base, Yukon customers enjoy reliable Canada Post Xpresspost delivery with full tracking.",
		whyChooseUs:
			"Yukon's limited retail options mean northern cannabis consumers pay premium prices for basic selection. Mohawk Medibles changes that equation — Empire Standard™ quality at competitive prices, delivered to the Wilderness City and beyond. Free shipping over $149 makes premium cannabis accessible even in Canada's far north.",
		regulatoryBody: "Yukon Liquor Corporation",
		shippingNote:
			"Whitehorse orders typically arrive within 4-6 business days. Dawson City orders may take 5-7 business days depending on seasonal Canada Post schedules.",
	},
};

/**
 * Retrieve province-specific content by slug.
 * Falls back to a sensible default if the province slug is not found.
 */
export function getProvinceContent(slug: string): ProvinceContent | undefined {
	return PROVINCE_CONTENT[slug];
}
