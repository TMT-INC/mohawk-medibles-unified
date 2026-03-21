# Mohawk Medibles SEO — Project Directives

## Mission
Indigenous-owned cannabis dispensary. $3.17M annual revenue. 344 products. 25,918 customers. Dominate Canadian cannabis SEO.

## Stack
- Next.js 16 + React 19 + Tailwind 4 + Prisma + Neon Postgres
- Deployed on Vercel: mohawkmedibles.ca
- WooCommerce backend: mohawkmedibles.ca (REST API sync)
- 3 payment gateways: Credit Card (PayGo), Interac e-Transfer, Crypto

## Key Data
- Neon DB: ep-patient-brook-ajrkbipr-pooler.c-3.us-east-2.aws.neon.tech
- Products synced via Store API v1 (v3 broken by plugin)
- Real-time webhooks: orders, customers, products, coupons
- Multi-tenant niche site system (Phase 2 live)

## Directives
- USE_DB_PRODUCTS=true (always read from Neon, not JSON fallback)
- Use `printf` NOT `echo` when piping to `vercel env add`
- API routes need trailing slash (308 redirects on mohawkmedibles.ca)
- tsconfig has noImplicitAny: false (pre-existing type issues)
- All WC sync uses lib/wc-api.ts (pure fetch, zero SDKs)

## SEO Priority
- Product pages need unique meta descriptions (not generic)
- Schema markup (Product, BreadcrumbList, FAQ) on every product page
- Internal linking: every product links to 2-3 related products
- Target: page 1 for "[strain name] Canada", "[product] online Canada"
- Follow ~/clawd/directives/content_evolution_system.md for content quality
