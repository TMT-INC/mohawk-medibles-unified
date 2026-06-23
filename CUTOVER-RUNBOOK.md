# Mohawk Medibles — WordPress → Unified Cutover Runbook

**Target date: 2026-07-01.** Goal: make the unified Next.js site (Vercel project
`mohawk-medibles-unified`, prod DB Neon `ep-lingering-meadow`) the live site at
`mohawkmedibles.ca`, replacing the WordPress/WooCommerce site on Njalla `web-01`.

Launch payment rails: **Interac e-Transfer (Wampum) + Crypto (BTCPay)**. Credit
card (BluePeak) is a **fast-follow** after the flip — `DIGIPAY_ENABLED` stays
unset, CC is hidden at checkout.

> ⚠️ **Shared-tunnel warning:** mohawk WP **and** Wampum share ONE cloudflared
> tunnel on web-01. Any restart/reload blips the WP storefront. Do not touch the
> tunnel during business hours; warn before any web-01 service action.

Every **outward-facing / destructive** step below is marked 🔶 and must be
confirmed before running.

---

## 0. Pre-flight (day before — verify, don't change)
- [ ] Unified prod deploy is green on `.co` and the e2e buy-flow passed (see
      VERIFY checklist below). 
- [ ] Vercel env present (already confirmed 2026-06-23): `WC_WEBHOOK_SECRET`,
      `AUTH_SECRET`, `DATABASE_URL`, `WAMPUM_HMAC_SECRET`, `WAMPUM_LOOKUP_SECRET`,
      `CRON_SECRET`, `BTCPAY_WEBHOOK_SECRET`. `GIFT_CARDS_ENABLED` / `DIGIPAY_ENABLED`
      / `SKIP_CSRF` intentionally **unset**.
- [ ] GitHub Actions cron (`.github/workflows/cron-triggers.yml`) green (Vercel
      crons are dead behind SSO — schedules run via GH Action hitting the domain).
- [ ] Take a fresh WP DB backup on web-01 (`/root/backup-mohawk.sh`) — fallback.
- [ ] Confirm Wampum tenant id `23b424f5-9d77-4da5-8196-0ccac15258c3` and have the
      cutover secrets ready (see step 3).

## 1. 🔶 Final data sync from WooCommerce (just before flip)
While WP is still authoritative, pull the last deltas into Neon so nothing is lost:
- [ ] Orders delta: drive `/api/sync/orders` (header `x-sync-secret: $AUTH_SECRET`),
      `maxPages:1` per call in a loop until caught up (bigger chunks time out).
- [ ] Products: final `/api/sync/products` (or `/api/cron/wc-sync`) pass so the
      catalog matches WP at flip.
- [ ] Customers: final `/api/sync/customers` pass.
- [ ] Spot-check counts (orders/products/customers) Neon vs WC for parity.

## 2. 🔶 DNS flip (Cloudflare)
- [ ] Point `mohawkmedibles.ca` apex **and** `www` → Vercel
      (A `76.76.21.21` / CNAME `cname.vercel-dns.com`; SSL mode **Full**).
- [ ] **Keep `wampum.mohawkmedibles.ca` on web-01** (Wampum middleware stays there).
- [ ] Add `mohawkmedibles.ca` + `www` as domains on the Vercel project and let
      certs issue. (Lower the DNS TTL the day before so propagation is fast.)
- [ ] Verify: `https://mohawkmedibles.ca/` serves the Next.js site (Server: Vercel),
      `/shop` lists products, `/api/products` returns the catalog.

## 3. 🔶 Repoint the Wampum tenant
Run **from `~/wampum`** with prod `DATABASE_URL` + `WAMPUM_MASTER_KEY` + the two
new secrets in env (retrieve via `vercel env pull` on the unified project →
`NEW_HMAC_SECRET` = `WAMPUM_HMAC_SECRET`, `NEW_LOOKUP_SECRET` = `WAMPUM_LOOKUP_SECRET`):
- [ ] Dry run: `node scripts/cutover-mohawk-tenant.mjs`
- [ ] 🔶 Apply: `node scripts/cutover-mohawk-tenant.mjs --execute`
      - repoints postbackUrl/rejectionUrl/webhookPathPrefix → new-site paths
        (WITH trailing slashes — the new site 308s slashless API paths and
        Wampum's dispatcher doesn't follow redirects),
      - `orderNumberRegex` → `\b(MM-[A-Z0-9]{4,}|\d{5})\b` (keeps legacy 5-digit
        during the transition tail),
      - rotates `hmacSecret`, switches `lookupAdapter` wc_db → http.
      - It checks pending webhook deliveries first (they 401 after rotation).
- [ ] Follow the script's printed post-cutover checklist.

## 4. 🔶 Retire WordPress sync + crons
- [ ] Disable the WooCommerce webhooks pointing at the unified site
      (`/api/webhooks/woocommerce`) and any WP→.co product/order/customer webhooks —
      WP is no longer the source of truth.
- [ ] Disable the WP wp-cron / external cron for sync jobs.
- [ ] Leave WP running but **un-indexed / not customer-facing** as a read-only
      fallback for a few days (don't decommission immediately).

## 5. 🔶 Smoke test on the live domain (post-flip)
- [ ] Place a **real $1–$5 e-Transfer test order** end to end:
      checkout → instructions → send transfer → Wampum matches → `deposit-confirmed`
      postback lands → order flips to PAYMENT_CONFIRMED/PAID → confirmation email →
      `/track-order` (order# + email) shows it → admin sees it. Then refund/cancel.
- [ ] Crypto: create a BTCPay invoice from checkout, confirm the webhook links it.
- [ ] Verify `mohawkmedibles.ca/api/health` OK, login/register/password-reset work
      (CSRF), order tracking requires email, gift-card + CC are correctly disabled.
- [ ] Confirm order confirmation + ShipStation flow on a real paid order.

## 6. Post-cutover (week of July 1)
- [ ] **CC fast-follow:** port the BluePeak/ADG card rail (Spirit Fire `card-gateway`
      iframe pattern), prove e2e with a low-value charge, then set `DIGIPAY_ENABLED`
      appropriately / re-add CC to checkout.
- [ ] **Compliance sweep** (counsel): broader Cannabis-Act therapeutic-claim cleanup
      (terpene/dosing guides, productData `pain-relief` tags, `/reviews` testimonial,
      `layout.tsx` SEO keywords) — see AUDIT-UNIFIED-2026-06-23.md backlog.
- [ ] Work the post-launch backlog (checkout-verify enum, fire-and-forget emails →
      `after()`, a11y checkout labels, sitemap 404s, CSP `unsafe-inline`, etc.).
- [ ] After a clean fallback window, decommission the WP stack on web-01 (keep the
      final DB backup).

## Rollback
If something is wrong post-flip: revert the Cloudflare DNS for `mohawkmedibles.ca`
apex/www back to the web-01 tunnel (WP is still running), and re-run the Wampum
cutover script's reverse (or restore the tenant's previous postback config). WP +
its DB are intact as the fallback.
