import type { NextConfig } from "next";

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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mohawkmedibles.ca",
      },
      {
        protocol: "https",
        hostname: "*.wpengine.com",
      },
    ],
  },

  // ─── Trailing Slashes (match WordPress URL structure) ───
  trailingSlash: true,

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

  // ─── Redirects (old WordPress page paths → new paths) ──
  async redirects() {
    return [
      // ── Static page aliases from WordPress ──
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/about-us/", destination: "/about", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/privacy-policy/", destination: "/privacy", permanent: true },
      { source: "/terms-of-use", destination: "/terms", permanent: true },
      { source: "/terms-of-use/", destination: "/terms", permanent: true },
      { source: "/return-policy", destination: "/returns-policy", permanent: true },
      { source: "/return-policy/", destination: "/returns-policy", permanent: true },
      { source: "/medibles-blog", destination: "/blog", permanent: true },
      { source: "/medibles-blog/", destination: "/blog", permanent: true },
      { source: "/knowledgebase", destination: "/faq", permanent: true },
      { source: "/knowledgebase/", destination: "/faq", permanent: true },
      { source: "/medibles-support", destination: "/support", permanent: true },
      { source: "/medibles-support/", destination: "/support", permanent: true },
      { source: "/mohawk-medibles-support", destination: "/support", permanent: true },
      { source: "/mohawk-medibles-support/", destination: "/support", permanent: true },
      { source: "/contact-medibles-wholesale", destination: "/wholesale", permanent: true },
      { source: "/contact-medibles-wholesale/", destination: "/wholesale", permanent: true },
      { source: "/my-account", destination: "/account", permanent: true },
      { source: "/my-account/", destination: "/account", permanent: true },
      { source: "/my-account/:path*", destination: "/account", permanent: true },
      { source: "/mohawk-medibles-shop", destination: "/shop", permanent: true },
      { source: "/mohawk-medibles-shop/", destination: "/shop", permanent: true },

      // ── Blog post redirects (WP root-level slugs → /blog) ──
      { source: "/benefits-uses-of-cbd", destination: "/blog", permanent: true },
      { source: "/benefits-uses-of-thc-oil", destination: "/blog", permanent: true },
      { source: "/cbd-oil-for-pain", destination: "/blog", permanent: true },
      { source: "/cbd-vs-thc-know-the-differences", destination: "/blog", permanent: true },
      { source: "/dispensary-near-me-canada-2026-guide", destination: "/blog", permanent: true },
      { source: "/facts-about-cannabis-strains", destination: "/blog", permanent: true },
      { source: "/how-long-premium-edibles-take-to-kick-in-canada", destination: "/blog", permanent: true },
      { source: "/why-customers-choose-our-deseronto-dispensary-on-tyendinaga-mohawk-territory-for-the-best-weed-and-cannabis", destination: "/blog", permanent: true },

      // ── Knowledge base pattern redirects ──
      { source: "/knowledge-base/:path*", destination: "/faq", permanent: true },
      { source: "/knowledge-base-category/:path*", destination: "/faq", permanent: true },
      { source: "/knowledge-base-tag/:path*", destination: "/faq", permanent: true },

      // ── WordPress taxonomy pattern redirects ──
      { source: "/product-category/:path*", destination: "/shop", permanent: true },
      { source: "/brand/:path*", destination: "/shop", permanent: true },
      { source: "/author/:path*", destination: "/blog", permanent: true },

      // ── Delivery page redirects (old flat → new nested) ──
      { source: "/alberta-delivery", destination: "/delivery/alberta", permanent: true },
      { source: "/british-columbia-delivery", destination: "/delivery/british-columbia", permanent: true },
      { source: "/manitoba-delivery", destination: "/delivery/manitoba", permanent: true },
      { source: "/new-brunswick-delivery", destination: "/delivery/new-brunswick", permanent: true },
      { source: "/newfoundland-delivery", destination: "/delivery/newfoundland-and-labrador", permanent: true },
      { source: "/northwest-territories-delivery", destination: "/delivery/northwest-territories", permanent: true },
      { source: "/nova-scotia-delivery", destination: "/delivery/nova-scotia", permanent: true },
      { source: "/nunavut-delivery", destination: "/delivery/nunavut", permanent: true },
      { source: "/ontario-delivery", destination: "/delivery/ontario", permanent: true },
      { source: "/pei-delivery", destination: "/delivery/prince-edward-island", permanent: true },
      { source: "/quebec-delivery", destination: "/delivery/quebec", permanent: true },
      { source: "/saskatchewan-delivery", destination: "/delivery/saskatchewan", permanent: true },
      { source: "/yukon-delivery", destination: "/delivery/yukon", permanent: true },

      // ── WordPress product URL redirects ──
      { source: "/product/:slug", destination: "/shop/:slug", permanent: true },
      { source: "/product/:slug/", destination: "/shop/:slug", permanent: true },

      // ── WordPress misc redirects ──
      { source: "/shop-2", destination: "/shop", permanent: true },
      { source: "/shop-2/", destination: "/shop", permanent: true },
      { source: "/cart", destination: "/checkout", permanent: true },
      { source: "/cart/", destination: "/checkout", permanent: true },
      { source: "/checkout-2", destination: "/checkout", permanent: true },
      { source: "/checkout-2/", destination: "/checkout", permanent: true },

      // ── SEO pillar page aliases ──
      { source: "/buy-weed-online", destination: "/buy-weed-online-canada", permanent: true },
      { source: "/buy-weed-online/", destination: "/buy-weed-online-canada", permanent: true },
      { source: "/cannabis-laws-canada", destination: "/cannabis-laws", permanent: true },
      { source: "/cannabis-laws-canada/", destination: "/cannabis-laws", permanent: true },
    ];
  },

  // ─── Performance ────────────────────────────────────────
  poweredByHeader: false, // Remove X-Powered-By
  compress: true,
};

export default nextConfig;
