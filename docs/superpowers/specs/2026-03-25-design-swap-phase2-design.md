# Design Swap Phase 2 — Shop Page, Product Detail, Cart Drawer

**Date:** 2026-03-25
**Status:** Approved
**Approach:** Surgical refactor — edit existing files, one new component

## Context

Phase 1 replaced the ProductCard component with Ian's .cc design system (charcoal + lime). Phase 2 extends that design to the three remaining customer-facing pages: Shop, Product Detail, and Cart Drawer. The goal is to match mohawkmedibles.ca's visual identity while surfacing our cannabis data intelligence (THC/CBD, terpenes, effects, reviews).

All data already exists in the database. All reusable components already work. This is a UI reskin + one new component.

## Design System Reference (Ian's .cc)

- **Background:** #1e1e26 (charcoal)
- **Card background:** #252530
- **Border:** #3a3a48
- **Primary accent:** #c8e63e (acid lime)
- **Accessible lime:** #9abf2e (WCAG AA)
- **Sale badge:** #ef4444 (red)
- **Star rating:** #f59e0b (amber)
- **CBD accent:** #60a5fa (blue)
- **No glassmorphism in dark mode** — flat surfaces, solid borders
- **Fonts:** Inter (body), Barlow (headings), Sora (display)
- **Animations:** kinetic-reveal, neon-glow, hover scale-105

## Files Changed

| File | Action | Risk |
|------|--------|------|
| `app/shop/ShopClient.tsx` | Modify | Low |
| `app/product/[slug]/ProductDetailClient.tsx` | Modify | Low |
| `hooks/useCart.tsx` | Modify (add open/close state) | Low |
| `components/CartDrawer.tsx` | Create | None |

### Files NOT changed

- `components/ProductCard.tsx` — already Phase 1
- `app/shop/page.tsx` — SSR + SEO schemas untouched
- `app/product/[slug]/page.tsx` — SSR + SEO schemas untouched
- `app/checkout/page.tsx` — checkout flow untouched
- `app/globals.css` — design tokens already correct
- All API routes — no backend changes
- `lib/products.ts`, `lib/productData.ts` — data layer untouched

## 1. Shop Page (ShopClient.tsx)

### Remove

- Left sidebar filter panel on desktop
- `lg:grid` split layout that creates sidebar + content columns

### Add

- **Promo deal banner** at top — horizontal scrolling ticker matching mohawkmedibles.ca deals ($40 Ounces, Hash $140/OZ, Free Ship $199+). Uses existing `animate-scroll` CSS class. **Hardcoded content** — matches Ian's current deals. Can be made dynamic later via admin panel.
- **Category image cards** — horizontal row of clickable category cards with product images. Each card shows category name + product count. Clicking sets `activeCategory`. Styled with charcoal bg, lime border when active.
- **Compact filter bar** — sort dropdown + "Filters" button that opens a Sheet/modal with strain type, price range, grade, territory grown filters. Replaces sidebar. Mobile: same Sheet behavior.

### Keep (unchanged)

- Intent/mood pill bar (Relax, Energy, Nature, Sleep, Joy) — not on Ian's site but adds discovery value
- Search input
- All filtering logic (category, intent, strain, price, grade, territory)
- Sort options (featured, price-asc, price-desc, name-asc, name-desc, newest)
- ProductCard component (Phase 1)
- Pagination (24 per page, Load More)
- Free shipping progress bar

### Modify

- Grid columns: 3-col → **4-col on desktop** (`lg:grid-cols-4`), keep 2-col on mobile
- Category navigation: sidebar list → **horizontal image cards**
- Filter controls: sidebar panels → **dropdown Sheet**

## 2. Product Detail Page (ProductDetailClient.tsx)

### Add

- **Vertical thumbnail gallery** — left side of image area. 3-4 thumbnails stacked vertically. Active thumbnail gets lime border. Click to swap main image. Uses `product.images[]` array already in data.
- **Image zoom** — hover/click on main image to zoom. Use CSS `transform: scale(2)` with `overflow: hidden` container — no external library needed.
- **THC/CBD visual bars** — horizontal progress bars with gradient fill. THC uses lime gradient, CBD uses blue gradient. Values from `product.specs.thc` and `product.specs.cbd`.
- **Terpene profile pills** — color-coded pill badges using existing TERPENE_COLORS mapping (Myrcene→amber, Limonene→yellow, Caryophyllene→orange, Pinene→emerald, Linalool→purple, Terpinolene→teal). Data from `product.specs.terpenes[]`.
- **Effects tags** — row of effect tags with emoji (😌 Relaxed, ⚡ Energetic, etc.). Data from `product.effects[]`.
- **Inline star rating** — 5-star visual + review count + "Sold: X" count next to product title. Uses existing `reviewStats` prop.
- **Sale percentage badge** — red badge showing discount % when `salePrice` exists. Calculated: `Math.round((1 - salePrice/price) * 100)`.
- **Trust badges row** — 3 badges below Add to Cart: Free Shipping $199+, Quality Guarantee, Expert Support. Matches mohawkmedibles.ca.
- **Wishlist button** — heart icon next to Add to Cart button. Uses existing WishlistButton component.

### Keep (unchanged)

- 55/45 two-column layout structure
- 4-tab system (Details, Specs, Reviews, FAQ)
- Review form and submitted reviews
- Share buttons (Twitter, Facebook, copy link)
- Bulk pricing tiers (BulkPricingTiers component)
- Quantity selector (1-10)
- Cart add logic and haptic feedback
- Related products carousel (RecommendationCarousel)
- All props interface — no changes needed

### Modify

- Image section: single image → **vertical thumbnail gallery + main image with zoom**
- Category + strain display: separate lines → **combined "FLOWER • INDICA" label**
- Price display: simple price → **price + strikethrough + sale badge**
- Info hierarchy: title-price-description → **title-rating-price-THC/CBD-terpenes-effects-cart**

## 3. Cart Drawer (NEW: CartDrawer.tsx)

### Create

New component: `components/CartDrawer.tsx`

**Structure:**
- Slide-in panel from right edge, 400px wide on desktop, full-width on mobile
- **Transition:** 300ms ease-out slide + backdrop fade
- Dark backdrop overlay (black/50) that closes drawer on click
- Close button (X) in header
- Scrollable cart items area

**Sections (top to bottom):**
1. **Header** — "Your Cart (N)" + close button
2. **Free shipping progress** — reuse existing FreeShippingBar component. Shows distance to $199 threshold.
3. **Cart items** — scrollable list. Each item shows: product thumbnail (48x48), name, category, quantity controls (−/+), price, delete button (trash icon). Uses `useCart` items.
4. **Upsell nudge** — reuse CartUpsellNudge or ComboSuggestions. Dashed border card, "Frequently bought together" with quick-add button.
5. **Summary** — Subtotal, Savings (if sale items), Total
6. **Checkout CTA** — lime green button "CHECKOUT — $XX.XX" linking to /checkout
7. **Continue Shopping** — text link that closes drawer

**Integration:**
- Add `isOpen`, `openCart()`, `closeCart()` to useCart context
- Header cart icon: change from `<Link href="/checkout">` to `onClick={openCart}`
- ProductCard quick-add: call `openCart()` after `addItem()`
- CartDrawer renders at layout level (inside CartProvider in layout.tsx)
- Focus trap and Escape key to close
- Body scroll lock when open

### Reused Components

- `FreeShippingBar` — shipping progress indicator
- `CartUpsellNudge` — cross-sell suggestions
- `ComboSuggestions` — frequently bought together
- `useCart` hook — all cart state and operations

## Data Dependencies

All data already exists — no new API routes, no schema changes:

| Data | Source | Location |
|------|--------|----------|
| Product images[] | WooCommerce sync | productData.ts / Prisma |
| THC/CBD specs | WooCommerce sync | product.specs.thc/cbd |
| Terpenes | WooCommerce sync | product.specs.terpenes[] |
| Effects | WooCommerce sync | product.effects[] |
| Review stats | Prisma aggregation | page.tsx reviewStats prop |
| Sale price | WooCommerce sync | product.salePrice |
| Cart items | localStorage + server sync | useCart hook |
| Upsell data | Existing component logic | CartUpsellNudge |

## SEO Impact

None — all schema markup lives in the server-side `page.tsx` files which are not modified. Existing schemas:
- ProductSchema (with AggregateRating)
- BreadcrumbList
- FAQPage (auto-generated)
- SpeakableSpecification
- CollectionPage (shop)
- ItemList (shop)

## Testing

- Visual: verify shop grid renders 4 columns on desktop, 2 on mobile
- Visual: verify product detail shows THC/CBD bars, terpene pills, effects
- Functional: cart drawer opens on cart icon click and quick-add
- Functional: cart drawer quantity controls work (−/+/delete)
- Functional: cart drawer checkout button navigates to /checkout
- Functional: existing filters (category, intent, sort, search) still work
- Functional: existing checkout flow unchanged
- Mobile: all three pages responsive
- A11y: cart drawer has focus trap, Escape to close, aria-labels
