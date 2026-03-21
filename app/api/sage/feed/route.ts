/**
 * MedAgent UCP Product Feed — /api/sage/feed
 * ═══════════════════════════════════════
 * Google Merchant Center compatible product feed in JSON-LD format.
 * Exposes the product catalog for Google AI Mode, Gemini,
 * and any UCP-compatible AI agent for product discovery.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mohawkmedibles.co";

export async function GET(req: NextRequest) {
    const limited = await applyRateLimit(req, RATE_LIMITS.api);
    if (limited) return limited;

    const PRODUCTS = await getAllProducts();
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "0") || PRODUCTS.length;
    const category = req.nextUrl.searchParams.get("category");

    let filtered = PRODUCTS;
    if (category) {
        const normalized = category.toLowerCase();
        filtered = PRODUCTS.filter(
            (p) => p.category.toLowerCase() === normalized ||
                p.category.toLowerCase().includes(normalized)
        );
    }

    const products = filtered.slice(0, limit);

    // Build UCP-compatible JSON-LD product feed
    const feed = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Mohawk Medibles Product Catalog",
        description: "Premium cannabis products from Six Nations — flower, edibles, concentrates, and more.",
        url: `${SITE_URL}/shop`,
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
                "@type": "Product",
                "@id": `${SITE_URL}${product.path}`,
                name: product.name,
                description: product.shortDescription || product.metaDescription,
                url: `${SITE_URL}${product.path}`,
                image: product.image?.startsWith("http")
                    ? product.image
                    : `${SITE_URL}${product.image}`,
                sku: product.slug,
                category: product.category,
                brand: {
                    "@type": "Brand",
                    name: "Mohawk Medibles",
                },
                offers: {
                    "@type": "Offer",
                    url: `${SITE_URL}${product.path}`,
                    priceCurrency: "CAD",
                    price: product.price.toFixed(2),
                    availability: "https://schema.org/InStock",
                    seller: {
                        "@type": "Organization",
                        name: "Mohawk Medibles",
                    },
                    shippingDetails: {
                        "@type": "OfferShippingDetails",
                        shippingRate: {
                            "@type": "MonetaryAmount",
                            value: "0",
                            currency: "CAD",
                        },
                        shippingDestination: {
                            "@type": "DefinedRegion",
                            addressCountry: "CA",
                        },
                        deliveryTime: {
                            "@type": "ShippingDeliveryTime",
                            handlingTime: {
                                "@type": "QuantitativeValue",
                                minValue: 0,
                                maxValue: 1,
                                unitCode: "d",
                            },
                            transitTime: {
                                "@type": "QuantitativeValue",
                                minValue: 1,
                                maxValue: 5,
                                unitCode: "d",
                            },
                        },
                    },
                },
                additionalProperty: [
                    ...(product.specs?.thc
                        ? [{
                            "@type": "PropertyValue",
                            name: "THC",
                            value: product.specs.thc,
                        }]
                        : []),
                    ...(product.specs?.cbd
                        ? [{
                            "@type": "PropertyValue",
                            name: "CBD",
                            value: product.specs.cbd,
                        }]
                        : []),
                    ...(product.specs?.weight
                        ? [{
                            "@type": "PropertyValue",
                            name: "Weight",
                            value: product.specs.weight,
                        }]
                        : []),
                ],
            },
        })),
        // UCP metadata
        _ucp: {
            protocol: "google-ucp-v1",
            merchantId: process.env.GOOGLE_MERCHANT_ID || "",
            merchantName: "Mohawk Medibles",
            supportsAgenticCheckout: true,
            supportedPaymentMethods: ["google_pay", "stripe"],
            checkoutEndpoint: `${SITE_URL}/api/sage/checkout`,
            chatEndpoint: `${SITE_URL}/api/sage/chat`,
            currency: "CAD",
            countryCode: "CA",
            shippingRegions: ["CA"],
        },
    };

    return NextResponse.json(feed, {
        headers: {
            "Content-Type": "application/ld+json",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
            "X-UCP-Compatible": "true",
            "X-MedAgent-Version": "2.1.0",
        },
    });
}
