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

export default nextConfig;
