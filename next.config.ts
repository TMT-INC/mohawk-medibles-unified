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
              "connect-src 'self' blob: https://*.mohawkmedibles.ca https://*.vercel-insights.com https://*.vercel.app wss:",
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
      // Static page aliases from WordPress
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/about-us/", destination: "/about/", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/privacy-policy/", destination: "/privacy/", permanent: true },
      { source: "/terms-of-use", destination: "/terms", permanent: true },
      { source: "/terms-of-use/", destination: "/terms/", permanent: true },
      { source: "/medibles-support", destination: "/support", permanent: true },
      { source: "/medibles-support/", destination: "/support/", permanent: true },
      { source: "/mohawk-medibles-support", destination: "/support", permanent: true },
      { source: "/mohawk-medibles-support/", destination: "/support/", permanent: true },
      { source: "/medibles-blog", destination: "/blog", permanent: true },
      { source: "/medibles-blog/", destination: "/blog/", permanent: true },
      { source: "/mohawk-medibles-shop", destination: "/shop", permanent: true },
      { source: "/mohawk-medibles-shop/", destination: "/shop/", permanent: true },
      { source: "/knowledgebase", destination: "/faq", permanent: true },
      { source: "/knowledgebase/", destination: "/faq/", permanent: true },
      // Old .co product URLs → new /shop/ pattern
      { source: "/product/:slug", destination: "/shop/:slug", permanent: true },
      { source: "/product/:slug/", destination: "/shop/:slug/", permanent: true },
      // SEO pillar page aliases
      { source: "/buy-weed-online", destination: "/buy-weed-online-canada", permanent: true },
      { source: "/buy-weed-online/", destination: "/buy-weed-online-canada/", permanent: true },
      { source: "/cannabis-laws-canada", destination: "/cannabis-laws", permanent: true },
      { source: "/cannabis-laws-canada/", destination: "/cannabis-laws/", permanent: true },
    ];
  },

  // ─── Performance ────────────────────────────────────────
  poweredByHeader: false, // Remove X-Powered-By
  compress: true,
};

export default nextConfig;
