import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // ─── Security Headers (merged from .cc + existing) ──────
  async headers() {
    return [
      {
        // Apply to all routes — full security headers
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(self), geolocation=(), payment=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob:",
              "connect-src 'self' blob: https://*.mohawkmedibles.ca https://*.mohawkmedibles.co https://*.vercel-insights.com https://*.vercel.app wss:",
              "worker-src 'self' blob:",
              "frame-src 'none'",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      {
        // Service worker — no-cache (from .cc)
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        // Prevent admin caching
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ─── Image Optimization ─────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mohawkmedibles.ca",
      },
      {
        protocol: "https",
        hostname: "*.wpengine.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },

  // ─── Trailing Slashes (match WordPress URL structure) ───
  trailingSlash: true,

  // ─── Redirects (indexed WordPress URLs with no Next.js page) ───
  // Every URL in the live WP sitemap must keep resolving after cutover.
  // Products (/shop/:slug) and categories (/product-category/*) are
  // handled elsewhere; these cover blog posts, knowledge base, and
  // archive pages. 301s preserve the link equity.
  async redirects() {
    return [
      // WP blog posts → closest new blog content
      { source: "/cbd-vs-thc-know-the-differences/", destination: "/blog/cbd-vs-thc-science-guide/", permanent: true },
      { source: "/facts-about-cannabis-strains/", destination: "/blog/indica-vs-sativa-vs-hybrid-guide/", permanent: true },
      { source: "/benefits-uses-of-cbd/", destination: "/blog/cbd-oil-guide-benefits-dosing-canada/", permanent: true },
      { source: "/cbd-oil-for-pain/", destination: "/blog/cbd-oil-guide-benefits-dosing-canada/", permanent: true },
      { source: "/benefits-uses-of-thc-oil/", destination: "/blog/", permanent: true },
      { source: "/how-long-premium-edibles-take-to-kick-in-canada/", destination: "/blog/edible-dosing-guide-beginners-canada/", permanent: true },
      { source: "/guide-to-premium-cannabis-concentrates-canada/", destination: "/blog/cannabis-concentrates-guide-shatter-wax/", permanent: true },
      { source: "/thc-pens-canada/", destination: "/product-category/vapes/", permanent: true },
      { source: "/dispensary-near-me-canada-2026-guide/", destination: "/locations/", permanent: true },
      { source: "/why-customers-choose-our-deseronto-dispensary-on-tyendinaga-mohawk-territory-for-the-best-weed-and-cannabis/", destination: "/about/", permanent: true },

      // Knowledge base → closest guide or FAQ
      { source: "/knowledge-base/proper-vape-storage/", destination: "/blog/how-to-store-cannabis-properly/", permanent: true },
      { source: "/knowledge-base/proper-methods-for-storing-hash/", destination: "/blog/how-to-store-cannabis-properly/", permanent: true },
      { source: "/knowledge-base/proper-storage-of-gummies/", destination: "/blog/how-to-store-cannabis-properly/", permanent: true },
      { source: "/knowledge-base/proper-flower-storage/", destination: "/blog/how-to-store-cannabis-properly/", permanent: true },
      { source: "/knowledge-base/looking-for-flavour-list-of-high-terpene-strains/", destination: "/blog/terpene-guide-cannabis-effects/", permanent: true },
      { source: "/knowledge-base/the-facts-about-terpenes/", destination: "/blog/terpene-guide-cannabis-effects/", permanent: true },
      { source: "/knowledge-base/:slug/", destination: "/faq/", permanent: true },
      { source: "/knowledgebase/", destination: "/faq/", permanent: true },
      { source: "/knowledge-base-category/:slug/", destination: "/faq/", permanent: true },
      { source: "/knowledge-base-tag/:slug/", destination: "/faq/", permanent: true },

      // Blog category + author archives
      { source: "/category/:slug/", destination: "/blog/", permanent: true },
      { source: "/author/:slug/", destination: "/blog/", permanent: true },

      // Legacy WP shop listing
      { source: "/mohawk-medibles-shop/", destination: "/shop/", permanent: true },
    ];
  },

  // ─── Rewrites (serve old WordPress URL patterns) ───────
  // These map old .ca URLs to the existing Next.js routes
  // without changing the URL shown to the user/Google.
  async rewrites() {
    return {
      // Check rewrites AFTER filesystem routes
      // so /shop (listing) still hits app/shop/page.tsx
      afterFiles: [
        // WordPress product URLs: /shop/slug/ → renders /product/slug/
        {
          source: "/shop/:slug/",
          destination: "/product/:slug/",
        },
        // WordPress category URLs: /product-category/slug/ → renders /product-category/slug/
        // (handled by the new catch-all route we'll create)
      ],
    };
  },


  // ─── Performance ────────────────────────────────────────
  poweredByHeader: false, // Remove X-Powered-By
  compress: true,

  // ─── Bundle Optimization ──────────────────────────────
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    optimizeCss: true,
    scrollRestoration: true,
  },
};

export default withSentryConfig(nextConfig, {
  org: "vakaygo",
  project: "mohawk-medibles-unified",
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
});
