/**
 * /delivery/[province] — Dynamic Province-Level Cannabis Delivery Landing Page
 * =============================================================================
 * Enhanced province hub pages with unique content, province-specific legal info,
 * expanded FAQs, popular product categories, delivery estimates, and rich
 * structured data (Store, BreadcrumbList, FAQPage, Service schemas).
 *
 * Server Component (RSC) — params are Promises in Next.js 16
 */

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getProvince, getAllProvinces } from "@/lib/seo/city-delivery-data";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schemas";
import { getProvinceCityServiceSchemas } from "@/lib/seo/local-seo";
import { getProvinceContent } from "@/lib/seo/province-content-data";
import { getProvinceHeroData } from "@/lib/city-hero-images";
import DeliveryMapLoader from "@/components/DeliveryMapLoader";

// --- Static Params Generation ------------------------------------------------

export async function generateStaticParams() {
	const provinces = getAllProvinces();
	return provinces.map((province) => ({
		province: province.slug,
	}));
}

// --- Metadata Generation -----------------------------------------------------

export async function generateMetadata({
	params,
}: {
	params: Promise<{ province: string }>;
}): Promise<Metadata> {
	const { province: provinceSlug } = await params;
	const province = getProvince(provinceSlug);

	if (!province) {
		return {
			title: "Province Not Found",
			description: "The province you're looking for doesn't exist.",
		};
	}

	const cityCount = province.cities.length;
	const canonical = `https://mohawkmedibles.ca/delivery/${province.slug}`;
	const ogImageUrl = `/delivery/${province.slug}/opengraph-image`;

	// Quebec gets French-language metadata
	if (province.slug === "quebec") {
		const title = `Cannabis Delivery ${province.name} | Free Shipping Over $149 to ${cityCount} Cities`;
		const description = `Livraison de cannabis premium au Quebec. Fleurs, comestibles, concentres et plus. Livraison rapide a ${cityCount} villes dont Montreal et Quebec. Age legal ${province.legalAge}+.`;
		const ogAlt = "Livraison de Cannabis au Quebec - Mohawk Medibles";

		return {
			title,
			description,
			alternates: {
				canonical,
				languages: {
					"fr-CA": "/delivery/quebec",
				},
			},
			openGraph: {
				title: "Livraison de Cannabis au Quebec",
				description: `Cannabis premium livre a votre porte partout au Quebec. Livraison discrete a Montreal, Quebec, Laval, Gatineau et ${cityCount - 4} autres villes. Age legal ${province.legalAge}+.`,
				type: "website",
				url: canonical,
				siteName: "Mohawk Medibles",
				locale: "fr_CA",
				images: [
					{
						url: ogImageUrl,
						width: 1200,
						height: 630,
						alt: ogAlt,
						type: "image/png",
					},
				],
			},
			twitter: {
				card: "summary_large_image",
				title: "Livraison de Cannabis au Quebec",
				description,
				images: [
					{
						url: ogImageUrl,
						width: 1200,
						height: 630,
						alt: ogAlt,
					},
				],
			},
			keywords: [
				"livraison cannabis quebec",
				"acheter cannabis en ligne quebec",
				`cannabis delivery ${province.name.toLowerCase()}`,
				`buy weed online ${province.abbreviation}`,
				"cannabis montreal",
				"cannabis quebec city",
				"mohawk medibles quebec",
				"premium cannabis",
				"lab-tested",
			],
		};
	}

	// All other provinces
	const title = `Cannabis Delivery ${province.name} | Free Shipping Over $149 to ${cityCount} Cities`;
	const description = `Premium cannabis delivery to ${province.name}. Lab-tested flower, edibles, concentrates & more. Free shipping over $149 to ${cityCount}+ cities. Legal age ${province.legalAge}+. Empire Standard quality.`;
	const ogAlt = `Cannabis Delivery to ${province.name} - Mohawk Medibles`;

	return {
		title,
		description,
		alternates: {
			canonical,
		},
		openGraph: {
			title,
			description,
			type: "website",
			url: canonical,
			siteName: "Mohawk Medibles",
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: ogAlt,
					type: "image/png",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: ogAlt,
				},
			],
		},
		keywords: [
			`cannabis delivery ${province.name.toLowerCase()}`,
			`buy weed online ${province.abbreviation}`,
			`weed delivery ${province.name.toLowerCase()}`,
			`cannabis shop ${province.name.toLowerCase()}`,
			`mail order cannabis ${province.abbreviation.toLowerCase()}`,
			"premium cannabis",
			"lab-tested",
			"free shipping cannabis canada",
		],
	};
}

// --- Store Schema (Static, Province-Aware) -----------------------------------

function createStoreSchema(provinceName: string, cityCount: number) {
	return {
		"@context": "https://schema.org",
		"@type": "Store",
		name: "Mohawk Medibles",
		url: "https://mohawkmedibles.ca",
		image: "https://mohawkmedibles.ca/logo.png",
		description: `Indigenous-owned premium cannabis dispensary delivering to ${cityCount} cities across ${provinceName}. Lab-tested, terpene-profiled products meeting the Empire Standard.`,
		address: {
			"@type": "PostalAddress",
			streetAddress: "Tyendinaga Mohawk Territory",
			addressLocality: "Deseronto",
			addressRegion: "ON",
			postalCode: "K0K 1X0",
			addressCountry: "CA",
		},
		areaServed: {
			"@type": "State",
			name: provinceName,
		},
		priceRange: "$$",
		contactPoint: {
			"@type": "ContactPoint",
			contactType: "customer service",
			email: "support@mohawkmedibles.ca",
			availableLanguage: ["English", "French"],
		},
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: `Cannabis Products - ${provinceName} Delivery`,
			itemListElement: [
				{ "@type": "OfferCatalog", name: "Flower", url: "https://mohawkmedibles.ca/shop/flower" },
				{ "@type": "OfferCatalog", name: "Edibles", url: "https://mohawkmedibles.ca/shop/edibles" },
				{ "@type": "OfferCatalog", name: "Concentrates", url: "https://mohawkmedibles.ca/shop/concentrates" },
				{ "@type": "OfferCatalog", name: "Vapes", url: "https://mohawkmedibles.ca/shop/vapes" },
				{ "@type": "OfferCatalog", name: "Pre-Rolls", url: "https://mohawkmedibles.ca/shop/pre-rolls" },
			],
		},
	};
}

// --- Province FAQ Data (Expanded to 5 questions) -----------------------------

function getProvinceFaqs(
	provinceName: string,
	legalAge: number,
	deliveryTime: string,
	cityCount: number,
	regulationsSummary: string,
) {
	return [
		{
			question: `Is cannabis delivery legal in ${provinceName}?`,
			answer: `Yes, cannabis delivery is legal in ${provinceName} for adults ${legalAge} and older. ${regulationsSummary} Mohawk Medibles operates as an Indigenous-owned dispensary under inherent Haudenosaunee rights on Tyendinaga Mohawk Territory, delivering premium cannabis to ${cityCount} cities across ${provinceName} via Canada Post Xpresspost with full tracking.`,
		},
		{
			question: `How long does delivery take to ${provinceName}?`,
			answer: `Delivery to ${provinceName} typically takes ${deliveryTime} with Canada Post Xpresspost. Orders are processed and shipped same-day when placed before 2 PM EST. All shipments include full tracking information, and you will receive an email notification with your tracking number as soon as your order ships.`,
		},
		{
			question: `What is the legal cannabis age in ${provinceName}?`,
			answer: `The legal age to purchase and possess cannabis in ${provinceName} is ${legalAge}+. You must provide valid government-issued photo ID confirming your age to complete your purchase. Mohawk Medibles verifies age compliance on all orders. By placing an order, you certify that you meet ${provinceName}'s legal age requirement.`,
		},
		{
			question: `Do you offer free shipping to ${provinceName}?`,
			answer: `Yes! Mohawk Medibles offers free shipping on all orders over $149 CAD delivered anywhere in ${provinceName}. For orders under $149, a flat $15 shipping fee applies. All orders ship via Canada Post Xpresspost with discreet packaging - plain, unmarked boxes with no cannabis branding or indication of contents.`,
		},
		{
			question: `What cannabis products can I order in ${provinceName}?`,
			answer: `Mohawk Medibles offers a wide selection of premium cannabis products available for delivery to ${provinceName}, including lab-tested flower (indica, sativa, and hybrid strains), edibles (gummies, chocolates, beverages), concentrates (shatter, wax, live resin), vape cartridges, pre-rolls, hash, and accessories. All products meet our Empire Standard for quality, with full lab testing and terpene profiling.`,
		},
	];
}

// --- Main Server Component ---------------------------------------------------

export default async function ProvinceDeliveryPage({
	params,
}: {
	params: Promise<{ province: string }>;
}) {
	const { province: provinceSlug } = await params;
	const province = getProvince(provinceSlug);

	if (!province) {
		notFound();
	}

	// Get province-specific content & hero data
	const content = getProvinceContent(province.slug);
	const hero = getProvinceHeroData(province.name, province.slug, province.cities.length);

	// Fallback values if content data not found for this province
	const regulationsSummary =
		content?.regulationsSummary ??
		`${province.name} permits adults ${province.legalAge}+ to purchase and possess up to 30 grams of cannabis in public.`;
	const deliveryEstimate = content?.deliveryEstimateFromTyendinaga ?? province.deliveryTime;
	const introContent =
		content?.introContent ??
		`Mohawk Medibles delivers premium, lab-tested cannabis to ${province.cities.length} cities across ${province.name}. Our Empire Standard products ship via Canada Post Xpresspost with discreet packaging and full tracking.`;
	const whyChooseUs =
		content?.whyChooseUs ??
		`As an Indigenous-owned dispensary on Tyendinaga Mohawk Territory, Mohawk Medibles offers ${province.name} customers lab-tested, terpene-profiled products at competitive prices with free shipping over $149.`;
	const popularCategories = content?.popularCategories ?? [
		{ name: "Flower", slug: "flower", emoji: "🌿" },
		{ name: "Edibles", slug: "edibles", emoji: "🍪" },
		{ name: "Concentrates", slug: "concentrates", emoji: "💎" },
		{ name: "Vapes", slug: "vapes", emoji: "💨" },
		{ name: "Pre-Rolls", slug: "pre-rolls", emoji: "🚬" },
	];
	const regulatoryBody = content?.regulatoryBody ?? "";
	const shippingNote = content?.shippingNote ?? "";

	// Generate schemas
	const breadcrumbs = breadcrumbSchema([
		{ name: "Home", url: "https://mohawkmedibles.ca" },
		{ name: "Delivery", url: "https://mohawkmedibles.ca/delivery" },
		{ name: province.name, url: `https://mohawkmedibles.ca/delivery/${province.slug}` },
	]);

	const provinceFaqs = getProvinceFaqs(
		province.name,
		province.legalAge,
		province.deliveryTime,
		province.cities.length,
		regulationsSummary,
	);
	const faqs = faqSchema(provinceFaqs);

	const storeSchema = createStoreSchema(province.name, province.cities.length);

	// Service schemas for all cities in this province (local SEO)
	const cityServiceSchemas = getProvinceCityServiceSchemas(province.slug);
	const serviceGraphSchema = {
		"@context": "https://schema.org",
		"@graph": cityServiceSchemas,
	};

	// Get ALL sibling provinces for navigation (not just 5)
	const allProvinces = getAllProvinces();
	const siblingProvinces = allProvinces.filter((p) => p.slug !== province.slug);

	const storeSchemaJson = JSON.stringify(storeSchema);
	const breadcrumbsJson = JSON.stringify(breadcrumbs);
	const faqsJson = JSON.stringify(faqs);
	const serviceGraphJson = JSON.stringify(serviceGraphSchema);

	return (
		<>
			{/* JSON-LD Schemas - Safe JSON serialization */}
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: storeSchemaJson }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbsJson }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqsJson }} />
			{cityServiceSchemas.length > 0 && (
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serviceGraphJson }} />
			)}

			<main className="min-h-screen pt-32 pb-20 page-glass text-foreground">
				<div className="container mx-auto px-6">
					{/* Breadcrumb Navigation */}
					<nav className="mb-12 text-sm text-muted-foreground" aria-label="breadcrumb">
						<div className="flex items-center gap-3">
							<Link href="/" className="hover:text-foreground transition-colors">
								Home
							</Link>
							<span>&rarr;</span>
							<Link href="/delivery" className="hover:text-foreground transition-colors">
								Delivery
							</Link>
							<span>&rarr;</span>
							<span className="text-forest dark:text-lime font-medium">{province.name}</span>
						</div>
					</nav>

					{/* Hero Section - Province-Themed Gradient */}
					<section
						className="relative h-72 md:h-80 overflow-hidden rounded-2xl mb-12"
						role="img"
						aria-label={hero.heroAlt}
					>
						{/* Province-specific gradient background */}
						<div className={`absolute inset-0 bg-gradient-to-br ${hero.theme.gradient}`} />
						{/* Depth overlay */}
						<div className={`absolute inset-0 bg-gradient-to-t ${hero.theme.overlay}`} />
						{/* Smoke/haze texture overlay for brand consistency */}
						<div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[radial-gradient(ellipse_at_30%_20%,rgba(132,204,22,0.15)_0%,transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(132,204,22,0.1)_0%,transparent_50%)]" />
						{/* Decorative cross pattern */}
						<div
							className="absolute inset-0 opacity-[0.03]"
							style={{
								backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
								backgroundSize: '60px 60px',
							}}
						/>

						{/* Hero content */}
						<div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-12">
							<div className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-4 w-fit">
								{province.abbreviation} &mdash; {province.cities.length} Cities Served
							</div>
							<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white uppercase mb-4 drop-shadow-lg">
								{hero.heroTitle}
							</h1>
							<p className="text-base md:text-lg text-white/80 max-w-2xl leading-relaxed mb-6 drop-shadow-md">
								{hero.heroSubtitle}
							</p>

							{/* Info badges */}
							<div className="flex flex-wrap gap-3">
								<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-white">
									<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
									{deliveryEstimate}
								</span>
								<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-white">
									<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
									Free Shipping $149+
								</span>
								<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-white">
									<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
									Lab-Tested
								</span>
								<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-white">
									<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
									{province.cities.length} Cities
								</span>
							</div>
						</div>
					</section>

					{/* Intro content below hero */}
					<p className="text-xl text-muted-foreground max-w-3xl leading-relaxed mb-16">
						{introContent}
					</p>

					{/* Stats Section */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
						<div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all">
							<div className="text-4xl font-bold text-forest dark:text-lime mb-2">{province.cities.length}</div>
							<p className="text-muted-foreground text-sm">Cities Served</p>
						</div>
						<div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all">
							<div className="text-4xl font-bold text-forest dark:text-lime mb-2">{province.legalAge}+</div>
							<p className="text-muted-foreground text-sm">Legal Age</p>
						</div>
						<div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all">
							<div className="text-lg font-bold text-forest dark:text-lime mb-2">{deliveryEstimate}</div>
							<p className="text-muted-foreground text-sm">From Tyendinaga</p>
						</div>
						<div className="glass-card p-6 rounded-2xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all">
							<div className="text-lg font-bold text-forest dark:text-lime mb-2">$149+</div>
							<p className="text-muted-foreground text-sm">Free Shipping</p>
						</div>
					</div>

					{/* Legal Info Box */}
					<div className="mb-20">
						<div className="glass-card p-8 rounded-2xl border border-forest/30 dark:border-lime/30 bg-forest/5 dark:bg-lime/5">
							<h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
								<span className="w-10 h-10 rounded-full bg-forest/20 dark:bg-lime/20 flex items-center justify-center text-forest dark:text-lime text-lg">
									&sect;
								</span>
								Cannabis Regulations in {province.name}
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<p className="text-muted-foreground leading-relaxed mb-4">
										{regulationsSummary}
									</p>
									{regulatoryBody && (
										<p className="text-sm text-muted-foreground">
											<span className="font-medium text-foreground">Regulatory body:</span>{" "}
											{regulatoryBody}
										</p>
									)}
								</div>
								<div className="space-y-3">
									<div className="flex items-center gap-3">
										<span className="w-8 h-8 rounded-lg bg-forest/10 dark:bg-lime/10 flex items-center justify-center text-forest dark:text-lime text-sm font-bold">
											{province.legalAge}+
										</span>
										<span className="text-muted-foreground text-sm">Minimum purchase age</span>
									</div>
									<div className="flex items-center gap-3">
										<span className="w-8 h-8 rounded-lg bg-forest/10 dark:bg-lime/10 flex items-center justify-center text-forest dark:text-lime text-sm font-bold">
											30g
										</span>
										<span className="text-muted-foreground text-sm">Public possession limit</span>
									</div>
									<div className="flex items-center gap-3">
										<span className="w-8 h-8 rounded-lg bg-forest/10 dark:bg-lime/10 flex items-center justify-center text-forest dark:text-lime text-sm font-bold">
											ID
										</span>
										<span className="text-muted-foreground text-sm">Government photo ID required</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Why Choose Us / Province Content */}
					<div className="mb-20">
						<h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase text-foreground mb-6">
							Why {province.name} Chooses Mohawk Medibles
						</h2>
						<p className="text-lg text-muted-foreground max-w-4xl leading-relaxed mb-4">
							{whyChooseUs}
						</p>
						{shippingNote && (
							<p className="text-sm text-forest dark:text-lime font-medium mt-4 glass-card inline-block px-4 py-2 rounded-lg border border-forest/20 dark:border-lime/20">
								{shippingNote}
							</p>
						)}
					</div>

					{/* Delivery Time Estimate */}
					<div className="mb-20">
						<div className="glass-card p-8 rounded-2xl border border-border">
							<h2 className="text-3xl font-bold tracking-tighter uppercase text-foreground mb-6">
								Delivery Time to {province.name}
							</h2>
							<div className="flex flex-col md:flex-row items-start md:items-center gap-6">
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 rounded-full bg-forest/10 dark:bg-lime/10 flex items-center justify-center">
										<span className="text-forest dark:text-lime text-xl">&rarr;</span>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">From Tyendinaga Mohawk Territory</p>
										<p className="text-2xl font-bold text-forest dark:text-lime">{deliveryEstimate}</p>
									</div>
								</div>
								<div className="hidden md:block h-12 w-px bg-border" />
								<div className="flex-1 space-y-2 text-sm text-muted-foreground">
									<p>All orders ship via <span className="font-medium text-foreground">Canada Post Xpresspost</span> with full tracking.</p>
									<p>Orders placed before <span className="font-medium text-foreground">2 PM EST</span> ship same business day.</p>
									<p>Discreet packaging &mdash; plain, unmarked boxes with no cannabis branding.</p>
								</div>
							</div>
						</div>
					</div>

					{/* Popular Product Categories */}
					<div className="mb-20">
						<h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase text-foreground mb-4">
							Popular in {province.name}
						</h2>
						<p className="text-muted-foreground mb-8">
							Top cannabis categories ordered by {province.name} customers
						</p>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
							{popularCategories.map((category) => (
								<Link
									key={category.slug}
									href={`/shop?category=${encodeURIComponent(category.name)}`}
									className="group"
								>
									<div className="glass-card p-6 rounded-2xl border border-border group-hover:border-forest/50 dark:group-hover:border-lime/50 transition-all text-center">
										<span className="text-3xl mb-3 block">{category.emoji}</span>
										<p className="font-bold text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors">
											{category.name}
										</p>
									</div>
								</Link>
							))}
						</div>
					</div>

					{/* Interactive Province Map */}
					<div className="mb-20">
						<h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase text-foreground mb-8">
							Delivery Map
						</h2>
						<DeliveryMapLoader
							cities={province.cities.map((city) => ({
								name: city.name,
								provinceName: province.name,
								provinceSlug: province.slug,
								citySlug: city.slug,
								lat: city.lat,
								lng: city.lng,
								population: city.population,
								deliveryTime: city.deliveryTime,
							}))}
							center={[province.cities[0].lat, province.cities[0].lng]}
							zoom={province.cities.length > 5 ? 6 : 5}
							heightClass="h-[400px]"
						/>
					</div>

					{/* Cities Grid Section */}
					<div className="mb-20">
						<h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase text-foreground mb-4">
							{province.cities.length} Cities We Deliver To in {province.name}
						</h2>
						<p className="text-muted-foreground mb-12">
							Click any city for local delivery details, product availability, and estimated shipping times.
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{province.cities.map((city) => (
								<Link
									key={city.slug}
									href={`/delivery/${province.slug}/${city.slug}`}
									className="group"
								>
									<div className="glass-card p-6 rounded-2xl border border-border group-hover:border-forest/50 dark:group-hover:border-lime/50 transition-all h-full flex flex-col">
										<h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-forest dark:group-hover:text-lime transition-colors">
											{city.name}
										</h3>
										<p className="text-sm text-muted-foreground mb-3">{city.landmark}</p>
										<p className="text-muted-foreground text-sm mb-4 flex-grow">{city.description}</p>
										<div className="flex items-center justify-between pt-4 border-t border-border">
											<span className="text-xs text-muted-foreground">Pop: {city.population}</span>
											<span className="text-xs text-forest dark:text-lime font-medium">{city.deliveryTime}</span>
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>

					{/* FAQ Section */}
					<div className="mb-20">
						<h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase text-foreground mb-4">
							{province.name} Cannabis Delivery FAQs
						</h2>
						<p className="text-muted-foreground mb-12">
							Common questions about ordering cannabis online in {province.name}
						</p>
						<div className="space-y-4">
							{provinceFaqs.map((faq, idx) => (
								<details key={idx} className="glass-card p-6 rounded-2xl border border-border group" {...(idx === 0 ? { open: true } : {})}>
									<summary className="cursor-pointer font-bold text-lg text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors flex items-center justify-between">
										{faq.question}
										<span className="text-forest dark:text-lime transition-transform group-open:rotate-180 flex-shrink-0 ml-4">&darr;</span>
									</summary>
									<p className="mt-4 text-muted-foreground leading-relaxed">{faq.answer}</p>
								</details>
							))}
						</div>
					</div>

					{/* Other Provinces Section - Show ALL */}
					<div className="mb-20">
						<h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase text-foreground mb-4">
							We Also Deliver To
						</h2>
						<p className="text-muted-foreground mb-8">
							Mohawk Medibles delivers premium cannabis across all Canadian provinces and territories.
						</p>
						<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
							{siblingProvinces.map((prov) => (
								<Link key={prov.slug} href={`/delivery/${prov.slug}`}>
									<div className="glass-card p-4 rounded-xl border border-border hover:border-forest/50 dark:hover:border-lime/50 transition-all text-center group">
										<p className="text-xs text-muted-foreground mb-1">{prov.abbreviation}</p>
										<p className="font-bold text-foreground group-hover:text-forest dark:group-hover:text-lime transition-colors text-sm">
											{prov.name}
										</p>
										<p className="text-xs text-muted-foreground mt-1">{prov.cities.length} cities</p>
									</div>
								</Link>
							))}
						</div>
					</div>

					{/* CTA Section */}
					<div className="glass-card p-12 rounded-3xl border border-border text-center">
						<h2 className="text-4xl font-bold text-foreground mb-4 uppercase tracking-tighter">
							Ready to Order in {province.name}?
						</h2>
						<p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
							Browse our full selection of premium, lab-tested cannabis products. Free shipping to {province.name} on orders over $149.
							Fast {deliveryEstimate} delivery, discreet packaging, and 100% secure checkout.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Button asChild variant="brand" size="lg">
								<Link href="/shop">Shop Premium Cannabis</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="/delivery">View All Delivery Areas</Link>
							</Button>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
