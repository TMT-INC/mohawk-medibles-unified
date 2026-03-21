/**
 * Mohawk Medibles — Local SEO & Service Area Schema Generator
 * ═════════════════════════════════════════════════════════════
 * Dynamically generates Service + GeoCircle structured data for ALL 72+
 * cities in the delivery network. Powered by city-delivery-data.ts — no
 * hardcoded city lists.
 */

import {
    PROVINCES,
    getAllCities,
    getCity,
    type CityData,
    type ProvinceData,
} from "./city-delivery-data";

const BASE_URL = "https://mohawkmedibles.ca";

// Default delivery radius when only lat/lng are available (km)
const DEFAULT_RADIUS_KM = 20;

// ─── Legacy ServiceArea type (kept for backward compat) ──────

export interface ServiceArea {
    slug: string;
    city: string;
    region: string;
    province: string;
    lat: number;
    lng: number;
    radiusKm: number;
    keywords: string[];
    description: string;
    deliveryTime: string;
}

/**
 * Build the legacy SERVICE_AREAS array dynamically from city-delivery-data.
 * Any code still referencing SERVICE_AREAS gets the full 72+ city set.
 */
export const SERVICE_AREAS: ServiceArea[] = getAllCities().map(({ province, city }) => ({
    slug: city.slug,
    city: city.name,
    region: province.name,
    province: province.name,
    lat: city.lat,
    lng: city.lng,
    radiusKm: DEFAULT_RADIUS_KM,
    keywords: [
        `cannabis delivery ${city.name.toLowerCase()}`,
        `weed delivery ${city.name.toLowerCase()}`,
        `dispensary ${city.name.toLowerCase()}`,
        `buy cannabis ${city.name.toLowerCase()} ${province.abbreviation.toLowerCase()}`,
    ],
    description: city.description,
    deliveryTime: city.deliveryTime,
}));

// ─── Single-City Service Schema ──────────────────────────────

/**
 * Generates a Schema.org Service JSON-LD object for a single city.
 *
 * If the city has lat/lng coordinates, the `areaServed` includes a
 * GeoCircle with a default 20 km radius. Otherwise it falls back to
 * a plain City + Province representation.
 *
 * @param citySlug    — city slug (e.g. "toronto")
 * @param cityName    — optional override; if omitted, looked up from data
 * @param provinceName — optional override; if omitted, looked up from data
 */
export function getCityServiceSchema(
    citySlug: string,
    cityName?: string,
    provinceName?: string,
): Record<string, unknown> | null {
    // Find the city across all provinces
    let matchedCity: CityData | undefined;
    let matchedProvince: ProvinceData | undefined;

    for (const province of PROVINCES) {
        const city = province.cities.find((c) => c.slug === citySlug);
        if (city) {
            matchedCity = city;
            matchedProvince = province;
            break;
        }
    }

    if (!matchedCity || !matchedProvince) return null;

    const name = cityName ?? matchedCity.name;
    const provName = provinceName ?? matchedProvince.name;
    const hasCoords = matchedCity.lat !== 0 && matchedCity.lng !== 0;

    // Build areaServed — GeoCircle when coordinates available, plain City otherwise
    const areaServed: Record<string, unknown> = hasCoords
        ? {
              "@type": "GeoCircle",
              geoMidpoint: {
                  "@type": "GeoCoordinates",
                  latitude: matchedCity.lat,
                  longitude: matchedCity.lng,
              },
              geoRadius: `${DEFAULT_RADIUS_KM} km`,
          }
        : {
              "@type": "City",
              name,
              containedInPlace: {
                  "@type": "AdministrativeArea",
                  name: `${provName}, Canada`,
              },
          };

    return {
        "@type": "Service",
        "@id": `${BASE_URL}/delivery/${matchedProvince.slug}/${matchedCity.slug}/#service`,
        name: `Cannabis Delivery — ${name}`,
        description: matchedCity.description,
        serviceType: "Cannabis Delivery",
        provider: { "@id": `${BASE_URL}/#store` },
        areaServed: {
            "@type": "City",
            name,
            containedInPlace: {
                "@type": "AdministrativeArea",
                name: `${provName}, Canada`,
            },
            ...(hasCoords && {
                geo: {
                    "@type": "GeoCoordinates",
                    latitude: matchedCity.lat,
                    longitude: matchedCity.lng,
                },
            }),
        },
        availableChannel: {
            "@type": "ServiceChannel",
            serviceUrl: `${BASE_URL}/delivery/${matchedProvince.slug}/${matchedCity.slug}`,
        },
        offers: {
            "@type": "Offer",
            priceCurrency: "CAD",
            price: "0",
            description: `Free delivery on qualifying orders to ${name}`,
            ...(hasCoords && {
                eligibleRegion: areaServed,
            }),
        },
        additionalProperty: [
            {
                "@type": "PropertyValue",
                name: "Estimated Delivery Time",
                value: matchedCity.deliveryTime,
            },
        ],
    };
}

// ─── All-Cities Service Schemas ──────────────────────────────

/**
 * Returns an array of Service schemas for every city in the delivery
 * network. Intended for inclusion in a top-level @graph (e.g. on the
 * /delivery hub page or the site-wide schema).
 */
export function getAllCityServiceSchemas(): Record<string, unknown>[] {
    return getAllCities()
        .map(({ city }) => getCityServiceSchema(city.slug))
        .filter((schema): schema is Record<string, unknown> => schema !== null);
}

// ─── Province-Filtered Service Schemas ───────────────────────

/**
 * Returns Service schemas for all cities within a given province.
 * Useful on /delivery/[province] pages.
 */
export function getProvinceCityServiceSchemas(provinceSlug: string): Record<string, unknown>[] {
    const province = PROVINCES.find((p) => p.slug === provinceSlug);
    if (!province) return [];

    return province.cities
        .map((city) => getCityServiceSchema(city.slug))
        .filter((schema): schema is Record<string, unknown> => schema !== null);
}

// ─── Legacy Helper — kept for backward compat ────────────────

export function serviceAreaSchema(area: ServiceArea) {
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${BASE_URL}/delivery/${area.slug}/#service`,
        name: `Cannabis Delivery — ${area.city}`,
        description: area.description,
        provider: { "@id": `${BASE_URL}/#store` },
        areaServed: {
            "@type": "City",
            name: area.city,
            containedInPlace: {
                "@type": "AdministrativeArea",
                name: `${area.region}, ${area.province}, Canada`,
            },
            geo: {
                "@type": "GeoCoordinates",
                latitude: area.lat,
                longitude: area.lng,
            },
        },
        serviceType: "Cannabis Delivery",
        availableChannel: {
            "@type": "ServiceChannel",
            serviceUrl: `${BASE_URL}/shop`,
        },
        offers: {
            "@type": "Offer",
            priceCurrency: "CAD",
            price: "0",
            description: "Free delivery on qualifying orders",
            eligibleRegion: {
                "@type": "GeoCircle",
                geoMidpoint: {
                    "@type": "GeoCoordinates",
                    latitude: area.lat,
                    longitude: area.lng,
                },
                geoRadius: `${area.radiusKm} km`,
            },
        },
    };
}

// ─── Local Landing Page Metadata Generator ───────────────────

export function localLandingPageMetadata(area: ServiceArea) {
    return {
        title: `Cannabis Delivery ${area.city} | Mohawk Medibles`,
        description: `Premium indigenous cannabis delivered to ${area.city}, ${area.province}. ${area.deliveryTime} delivery. 344+ lab-tested products. Empire Standard™ quality.`,
        keywords: area.keywords,
        openGraph: {
            title: `Cannabis Delivery ${area.city} | Mohawk Medibles`,
            description: area.description,
            url: `${BASE_URL}/delivery/${area.slug}`,
            locale: "en_CA",
            type: "website" as const,
        },
    };
}
