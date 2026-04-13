import type { Metadata } from "next";
import { Inter, Barlow, Sora } from "next/font/google";
import "@/lib/env-check";
import "./globals.css";
import { getCurrentTenant } from "@/lib/tenant";
import { TenantProvider } from "@/lib/tenant-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// ─── SEO: Dynamic Metadata (tenant-aware) ───────────────────

// Fallback values used when tenant fields are null
const FALLBACK_TITLE = "Mohawk Medibles | Premium Indigenous Cannabis — Tyendinaga";
const FALLBACK_DESCRIPTION =
  "Indigenous-owned premium cannabis dispensary on Tyendinaga Mohawk Territory. 360+ lab-tested products: flower, edibles, concentrates, vapes. Empire Standard™ quality. Ships Canada-wide.";
const FALLBACK_DOMAIN = "https://mohawkmedibles.ca";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();

  const title = tenant.seoTitle || FALLBACK_TITLE;
  const description = tenant.seoDescription || FALLBACK_DESCRIPTION;
  const domainUrl = tenant.domain
    ? `https://${tenant.domain}`
    : FALLBACK_DOMAIN;
  const ogImage = tenant.ogImage || "/og-image.png";

  return {
    title: {
      default: title,
      template: `%s | ${tenant.name}`,
    },
    description,
    keywords: tenant.seoKeywords.length > 0
      ? tenant.seoKeywords
      : [
          // English
          "mohawk medibles", "indigenous cannabis", "tyendinaga dispensary",
          "buy weed online canada", "premium cannabis ontario",
          "lab tested cannabis", "cannabis edibles", "cannabis delivery canada",
          "terpene profile", "empire standard cannabis",
          "drizzle factory", "stellar edibles", "aki wellness cbd",
          "euphoria extractions", "plant of life cbd", "cannabis brands canada",
          "online dispensary brands", "canadian cannabis brands",
          "relaxing cannabis strains", "euphoric weed effects",
          "pain relief cannabis canada", "best sleep strains",
          "creative cannabis sativa", "cannabis by effect",
          "shop weed by feeling", "indica vs sativa effects",
          // French (fr_CA) — organic reach for Quebec & Francophone Canada
          "acheter cannabis en ligne canada", "dispensaire cannabis autochtone",
          "livraison cannabis canada", "comestibles cannabis",
          "fleurs cannabis qualité", "concentrés cannabis",
          "meilleur dispensaire en ligne canada", "cannabis Tyendinaga",
          "cannabis testé en laboratoire", "vapoteuse cannabis canada",
        ],
    metadataBase: new URL(domainUrl),
    alternates: {
      canonical: domainUrl,
      languages: {
        "en": domainUrl,
        "fr": domainUrl,
        "x-default": domainUrl,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // ── Open Graph ──────────────────────────────────────────
    openGraph: {
      type: "website",
      locale: "en_CA",
      alternateLocale: ["fr_CA"],
      url: domainUrl,
      siteName: tenant.name,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${tenant.name} — ${description.slice(0, 80)}`,
          type: "image/png",
        },
      ],
    },

    // ── Twitter / X Card ───────────────────────────────────
    twitter: {
      card: "summary_large_image",
      site: "@mohawkmedibles",
      creator: "@mohawkmedibles",
      title,
      description,
      images: [ogImage],
    },

    // ── Verification ───────────────────────────────────────
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    },

    // ── Category ───────────────────────────────────────────
    category: "Cannabis Dispensary",

    other: {
      "ai:brand": tenant.name,
      "ai:expertise": "Cannabis, Terpenes, THC, CBD, Indigenous Heritage, Cannabis Effects, Strain Selection, Pain Relief, Sleep Aid",
      "ai:location": "Tyendinaga Mohawk Territory, Ontario, Canada",
    },
  };
}


// ─── SEO: JSON-LD Structured Data ───────────────────────────

import { organizationSchema, localBusinessSchema, websiteSchema, faqSchema, buildSchemaGraph } from "@/lib/seo/schemas";
import { getFAQsForSchema } from "@/lib/seo/aeo";

// SiteNavigationElement — helps Google generate sitelinks in SERP
const siteNavSchema = {
  "@context": "https://schema.org",
  "@type": "SiteNavigationElement",
  "@id": "https://mohawkmedibles.ca/#sitenav",
  name: "Main Navigation",
  hasPart: [
    { "@type": "WebPage", name: "Shop Cannabis", url: "https://mohawkmedibles.ca/shop" },
    { "@type": "WebPage", name: "Cannabis Deals", url: "https://mohawkmedibles.ca/deals" },
    { "@type": "WebPage", name: "About Us", url: "https://mohawkmedibles.ca/about" },
    { "@type": "WebPage", name: "Cannabis Blog", url: "https://mohawkmedibles.ca/blog" },
    { "@type": "WebPage", name: "Customer Reviews", url: "https://mohawkmedibles.ca/reviews" },
    { "@type": "WebPage", name: "FAQ", url: "https://mohawkmedibles.ca/faq" },
    { "@type": "WebPage", name: "Support", url: "https://mohawkmedibles.ca/support" },
    { "@type": "WebPage", name: "Cannabis Delivery Canada", url: "https://mohawkmedibles.ca/delivery" },
    { "@type": "WebPage", name: "Buy Weed Online Canada", url: "https://mohawkmedibles.ca/buy-weed-online-canada" },
  ],
};

const jsonLdGraph = buildSchemaGraph(
  organizationSchema(),
  localBusinessSchema(),
  websiteSchema(),
  faqSchema(getFAQsForSchema(undefined, 8)),
  siteNavSchema,
);

// ─── Components ─────────────────────────────────────────────

import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import { Analytics } from "@/components/Analytics";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import LocaleSEOHead from "@/components/LocaleSEOHead";
import LazyWidgets from "@/components/LazyWidgets";
import { CompareProvider } from "@/hooks/useCompare";
import CompareBar from "@/components/CompareBar";
import HappyHourBanner from "@/components/HappyHourBanner";
import PopularStrainsFooter from "@/components/PopularStrainsFooter";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tenant = await getCurrentTenant();
  const domainUrl = tenant.domain ? `https://${tenant.domain}` : "https://mohawkmedibles.ca";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for faster LCP */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for CDN image domains */}
        <link rel="dns-prefetch" href="//mohawkmedibles.ca" />
        <link rel="dns-prefetch" href="//i0.wp.com" />
        {/* Preconnect to Vercel Analytics */}
        <link rel="preconnect" href="https://vitals.vercel-insights.com" />
        <link rel="dns-prefetch" href="//vitals.vercel-insights.com" />
        {/* Preload LCP hero image for faster paint */}
        <link rel="preload" as="image" type="image/webp" href="/assets/hero/hero-deals-ounces.webp" fetchPriority="high" />
        {/* LLM Discovery */}
        <link rel="alternate" type="text/plain" href="/llms.txt" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" />
        {/* Hreflang for moh — not in Next.js alternates.languages (only standard ISO codes) */}
        <link rel="alternate" hrefLang="moh" href={domainUrl} />
      </head>
      <body
        className={`${inter.className} ${inter.variable} ${barlow.variable} ${sora.variable} antialiased`}
        style={{
          '--tenant-primary': tenant.primaryColor,
          '--tenant-secondary': tenant.secondaryColor,
          '--tenant-accent': tenant.accentColor,
        } as React.CSSProperties}
      >
        {/* JSON-LD @graph — single script with all schema entities cross-referenced via @id */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- trusted server-side schema data
          dangerouslySetInnerHTML={{ __html: jsonLdGraph }}
        />
        <ThemeProvider>
          <LocaleProvider>
            <LocaleSEOHead />
            <CartProvider>
            <WishlistProvider>
            <CompareProvider>
              <TenantProvider tenant={tenant}>
              {/* Skip to main content — AODA accessibility requirement */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-forest focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-bold focus:shadow-lg"
              >
                Skip to main content
              </a>
              <Header />
              <HappyHourBanner />
              <main id="main-content">
                {children}
              </main>
              <PopularStrainsFooter />
              <Footer />
              <CompareBar />
              <LazyWidgets />
              </TenantProvider>
            </CompareProvider>
            </WishlistProvider>
            </CartProvider>
          </LocaleProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
