/**
 * Mohawk Medibles — robots.txt
 * ═══════════════════════════════
 * Controls crawler access. Allows all public pages,
 * blocks admin/api/checkout from indexing.
 */
import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mohawkmedibles.ca";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin/", "/api/", "/checkout/", "/login", "/register", "/account"],
            },
            {
                // Allow AI crawlers explicitly
                userAgent: ["GPTBot", "Google-Extended", "PerplexityBot", "ClaudeBot", "Anthropic-AI", "Applebot", "Amazonbot", "ChatGPT-User", "cohere-ai", "Bytespider"],
                allow: ["/", "/llms.txt"],
                disallow: ["/admin/", "/api/", "/checkout/"],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
