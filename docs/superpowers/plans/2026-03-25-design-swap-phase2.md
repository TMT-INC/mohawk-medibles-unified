# Design Swap Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin Shop page, Product Detail page, and add Cart Drawer to match Ian's mohawkmedibles.ca design + our cannabis data intelligence layer.

**Architecture:** Surgical edits to 3 existing files (ShopClient.tsx, ProductDetailClient.tsx, useCart.tsx) and 1 new component (CartDrawer.tsx). No backend, API, or schema changes. All data already in DB.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Framer Motion, Lucide icons, existing useCart hook

**Spec:** `docs/superpowers/specs/2026-03-25-design-swap-phase2-design.md`

---

### Task 1: Add cart drawer state to useCart hook

**Files:**
- Modify: `hooks/useCart.tsx`

- [ ] **Step 1: Add isOpen state and open/close functions to CartContextType**

In `hooks/useCart.tsx`, add `isOpen`, `openCart`, `closeCart`, and `itemCount` to the context interface and provider:

```typescript
// Add to CartContextType interface (line 15):
interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    itemCount: number;
}
```

Inside `CartProvider`, add:

```typescript
const [isOpen, setIsOpen] = useState(false);
const openCart = React.useCallback(() => setIsOpen(true), []);
const closeCart = React.useCallback(() => setIsOpen(false), []);
const itemCount = React.useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
```

Add `isOpen, openCart, closeCart, itemCount` to the `contextValue` useMemo.

- [ ] **Step 2: Verify the app still builds**

Run: `cd /Users/eugeneagyemang/projects/clients/mohawk-medibles-unified && npx next build 2>&1 | tail -20`
Expected: Build succeeds (new context fields are additive, no consumers break)

- [ ] **Step 3: Commit**

```bash
git add hooks/useCart.tsx
git commit -m "feat: add cart drawer state (isOpen/openCart/closeCart) to useCart hook"
```

---

### Task 2: Create CartDrawer component

**Files:**
- Create: `components/CartDrawer.tsx`

- [ ] **Step 1: Create CartDrawer.tsx**

```tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import FreeShippingBar from "@/components/FreeShippingBar";
import CartUpsellNudge from "@/components/CartUpsellNudge";

export default function CartDrawer() {
    const { items, removeItem, updateQuantity, total, isOpen, closeCart, itemCount } = useCart();
    const drawerRef = useRef<HTMLDivElement>(null);

    // Focus trap + Escape to close
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeCart();
        };
        document.addEventListener("keydown", handleEscape);

        // Lock body scroll
        document.body.style.overflow = "hidden";

        // Focus the drawer
        drawerRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, closeCart]);

    const savings = items.reduce((sum, item) => {
        // If item has sale pricing, calculate savings (placeholder for future)
        return sum;
    }, 0);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={closeCart}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                tabIndex={-1}
                className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] bg-background border-l border-border flex flex-col transition-transform duration-300 ease-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Your Cart ({itemCount})
                    </h2>
                    <button
                        onClick={closeCart}
                        className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                        aria-label="Close cart"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Free Shipping Progress */}
                <div className="px-4 pt-3">
                    <FreeShippingBar />
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground font-medium mb-2">Your cart is empty</p>
                            <button
                                onClick={closeCart}
                                className="text-sm text-primary hover:underline"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-3 p-3 bg-card rounded-lg border border-border"
                                >
                                    {/* Thumbnail */}
                                    {item.image && (
                                        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-foreground truncate">
                                            {item.name}
                                        </h3>
                                        <div className="flex items-center justify-between mt-2">
                                            {/* Quantity controls */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="h-7 w-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                                    aria-label={`Decrease ${item.name} quantity`}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, Math.min(item.quantity + 1, 10))}
                                                    className="h-7 w-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                                    aria-label={`Increase ${item.name} quantity`}
                                                    disabled={item.quantity >= 10}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            {/* Price */}
                                            <span className="text-sm font-bold text-primary">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Delete */}
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="self-start h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        aria-label={`Remove ${item.name} from cart`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upsell Nudge */}
                {items.length > 0 && (
                    <div className="px-4 pb-2">
                        <CartUpsellNudge />
                    </div>
                )}

                {/* Footer — only show when items exist */}
                {items.length > 0 && (
                    <div className="border-t border-border p-4 space-y-3">
                        {/* Subtotal */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Subtotal</span>
                            <span className="text-lg font-bold text-primary">
                                ${total.toFixed(2)}
                            </span>
                        </div>

                        {/* Checkout Button */}
                        <Link
                            href="/checkout"
                            onClick={closeCart}
                            className="block w-full bg-primary text-primary-foreground py-3 rounded-lg text-center font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                            CHECKOUT — ${total.toFixed(2)}
                        </Link>

                        {/* Continue Shopping */}
                        <button
                            onClick={closeCart}
                            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
```

- [ ] **Step 2: Verify it builds**

Run: `cd /Users/eugeneagyemang/projects/clients/mohawk-medibles-unified && npx next build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add components/CartDrawer.tsx
git commit -m "feat: add CartDrawer slide-out component with qty controls and free shipping bar"
```

---

### Task 3: Wire CartDrawer into layout and header

**Files:**
- Modify: `app/layout.tsx` (add CartDrawer inside CartProvider)
- Modify: Header/Navbar component (change cart icon from Link to openCart)

- [ ] **Step 1: Find the header component**

Run: `grep -rn "cart" /Users/eugeneagyemang/projects/clients/mohawk-medibles-unified/components/ --include="*.tsx" -l | head -10`

Look for the Navbar/Header component that renders the cart icon in the header.

- [ ] **Step 2: Add CartDrawer to layout.tsx**

Add `import CartDrawer from "@/components/CartDrawer";` and render `<CartDrawer />` inside the CartProvider (or body), after `{children}`:

```tsx
<CartProvider>
    {children}
    <CartDrawer />
</CartProvider>
```

- [ ] **Step 3: Update header cart icon**

In `components/Header.tsx`:

**Line 25** — change the useCart destructure:
```tsx
// FROM:
const { items } = useCart();
// TO:
const { items, openCart } = useCart();
```

**Lines 180-190** — replace the `<Link href="/checkout">` wrapping the cart button with a `<button onClick={openCart}>`:
```tsx
// FROM:
<Link href="/checkout" className="relative" aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}>
    <Button variant="brand" size="sm" aria-label="Shopping cart" className="rounded-full flex items-center gap-2 px-4 shadow-lg glow-lime">
        <ShoppingCart className="h-4 w-4" />
        <span className="hidden md:inline text-[10px] font-bold tracking-widest uppercase">Cart</span>
    </Button>
    {cartCount > 0 && (
// TO:
<button onClick={openCart} className="relative" aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}>
    <Button variant="brand" size="sm" aria-label="Shopping cart" className="rounded-full flex items-center gap-2 px-4 shadow-lg glow-lime" asChild>
        <span>
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden md:inline text-[10px] font-bold tracking-widest uppercase">Cart</span>
        </span>
    </Button>
    {cartCount > 0 && (
```

Also find the closing `</Link>` for this block and change to `</button>`.

Keep the existing `cartCount` variable (line 26) — no need to use `itemCount` since `cartCount` already computes the same thing.

- [ ] **Step 4: Wire ProductCard quick-add to open drawer**

In `app/shop/ShopClient.tsx`, update `handleQuickAdd` (line 237) to also open the cart drawer after adding:

```typescript
const handleQuickAdd = useCallback((product: Product) => {
    addItem({
        id: String(product.id),
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
    });
    trackGA4AddToCart({ id: String(product.id), name: product.name, price: product.price, category: product.category, quantity: 1 });
    setAddedIds(prev => new Set(prev).add(product.id));
    setTimeout(() => {
        setAddedIds(prev => {
            const next = new Set(prev);
            next.delete(product.id);
            return next;
        });
    }, 1500);
    openCart(); // Open the cart drawer
}, [addItem, openCart]);
```

Add `openCart` to the destructured `useCart()` call at line 113:
```typescript
const { addItem, items, total, openCart } = useCart();
```

- [ ] **Step 5: Verify build + test manually**

Run: `cd /Users/eugeneagyemang/projects/clients/mohawk-medibles-unified && npx next build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx components/CartDrawer.tsx app/shop/ShopClient.tsx
# Also add the header/navbar component file
git commit -m "feat: wire CartDrawer into layout, header icon, and shop quick-add"
```

---

### Task 4: Refactor Shop page — remove sidebar, add promo banner + category cards

**Files:**
- Modify: `app/shop/ShopClient.tsx`

- [ ] **Step 1: Add promo deal banner at the top of the return JSX**

After the `<h1>` tag (line 282), add a scrolling deal ticker:

```tsx
{/* ── Promo Deal Banner ── */}
<div className="mb-6 bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] rounded-lg overflow-hidden">
    <div className="flex animate-scroll whitespace-nowrap py-2.5 px-4">
        {[
            "🔥 $40 OUNCES of Bud or 3 For $100",
            "💎 Hash Starting at $140/OZ",
            "🚚 FREE Shipping on Orders Over $199",
            "⚡ 25,000 Puff Elf Bar Vapes — $35 Each",
            "🌿 Premium Flower Starting at $40/OZ",
        ].map((deal, i) => (
            <span key={i} className="inline-block mx-8 text-sm font-semibold text-lime">
                {deal}
            </span>
        ))}
        {/* Duplicate for seamless loop */}
        {[
            "🔥 $40 OUNCES of Bud or 3 For $100",
            "💎 Hash Starting at $140/OZ",
            "🚚 FREE Shipping on Orders Over $199",
            "⚡ 25,000 Puff Elf Bar Vapes — $35 Each",
            "🌿 Premium Flower Starting at $40/OZ",
        ].map((deal, i) => (
            <span key={`dup-${i}`} className="inline-block mx-8 text-sm font-semibold text-lime">
                {deal}
            </span>
        ))}
    </div>
</div>
```

- [ ] **Step 2: Add category image cards row**

After the promo banner, before the IntentPillBar:

```tsx
{/* ── Category Image Cards ── */}
<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
    {CATEGORIES.filter(c => c !== "All").slice(0, 6).map((cat) => {
        const count = PRODUCTS.filter(p => p.category === cat).length;
        const sampleProduct = PRODUCTS.find(p => p.category === cat);
        return (
            <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`relative overflow-hidden rounded-lg border transition-all duration-200 group ${
                    activeCategory === cat
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                }`}
            >
                <div className="aspect-[4/3] bg-card">
                    {sampleProduct?.image && (
                        <Image
                            src={sampleProduct.image}
                            alt={cat}
                            fill
                            className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                        <div className="text-xs font-bold text-white">{cat}</div>
                        <div className="text-[10px] text-white/70">{count} products</div>
                    </div>
                </div>
            </button>
        );
    })}
</div>
```

- [ ] **Step 2b: Add Image import**

At the top of ShopClient.tsx, add `Image` to imports:

```tsx
import Image from "next/image";
```

- [ ] **Step 3: Add "All Categories" pill + search + sort + filter bar**

Replace the current desktop sidebar search + sort toolbar area. After category cards, before the grid, add a unified toolbar:

```tsx
{/* ── Search + Sort + Filter Bar ── */}
<div className="flex flex-wrap items-center gap-3 mb-6">
    {/* Search */}
    <div className="relative flex-1 min-w-[200px]" role="search">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <label htmlFor="shop-search-unified" className="sr-only">Search products</label>
        <input
            id="shop-search-unified"
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search 346+ products..."
            className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {searchQuery && (
            <button onClick={() => handleSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
            </button>
        )}
    </div>

    {/* "All" reset button */}
    <button
        onClick={() => { handleCategoryChange("All"); setStrainType("All"); setPriceRange([0, 500]); setGradeFilter("All"); setTerritoryGrownOnly(false); }}
        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === "All" && strainType === "All" && gradeFilter === "All"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:bg-muted"
        }`}
    >
        All Products
    </button>

    {/* Filters button (opens sheet with strain/price/grade/territory) */}
    <button
        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
    >
        <Filter className="h-4 w-4" />
        Filters
        {(strainType !== "All" || priceRange[0] > 0 || priceRange[1] < 500 || gradeFilter !== "All" || territoryGrownOnly) && (
            <span className="w-2 h-2 rounded-full bg-primary" />
        )}
    </button>

    {/* Sort dropdown — KEEP the existing sort dropdown JSX from the current toolbar (lines 679-715). Move it here inside this new toolbar div. Do NOT delete it. */}
</div>
```

- [ ] **Step 4: Remove the desktop sidebar (`<aside>` block)**

Delete the entire `<aside className="hidden lg:block w-64 ...">` block (lines 461–653).

Remove the `<div className="flex flex-col lg:flex-row gap-12">` wrapper around sidebar + grid. The grid should now be full-width.

The filter sheet (currently `mobileFiltersOpen`) becomes the universal filter panel — it already has strain type, price range, grade, and territory grown filters. Remove the `lg:hidden` class from the mobile filters section (lines 293-457) so it works on all screen sizes as the sheet/dropdown.

- [ ] **Step 5: Change grid columns from 3 to 4 on desktop**

Change line 733:
```tsx
// FROM:
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Products">
// TO:
<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" role="list" aria-label="Products">
```

- [ ] **Step 6: Verify build**

Run: `cd /Users/eugeneagyemang/projects/clients/mohawk-medibles-unified && npx next build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add app/shop/ShopClient.tsx
git commit -m "feat: shop page — remove sidebar, add promo banner, category cards, 4-col grid"
```

---

### Task 5: Enhance Product Detail page — gallery, THC/CBD bars, effects

**Files:**
- Modify: `app/product/[slug]/ProductDetailClient.tsx`

- [ ] **Step 1: Add vertical thumbnail gallery**

Replace the single `<ProductImage>` block (lines 224-244) with a thumbnail gallery layout:

```tsx
<div className="flex gap-3">
    {/* Vertical thumbnails */}
    {product.images && product.images.length > 1 && (
        <div className="hidden sm:flex flex-col gap-2 w-16">
            {product.images.slice(0, 4).map((img, i) => (
                <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        activeImage === i ? "border-primary" : "border-border hover:border-primary/50"
                    }`}
                >
                    <Image
                        src={img}
                        alt={`${product.name} view ${i + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                    />
                </button>
            ))}
        </div>
    )}
    {/* Main image with zoom */}
    <div
        className="flex-1 relative overflow-hidden rounded-xl bg-card cursor-zoom-in group"
        onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            e.currentTarget.style.setProperty("--zoom-x", `${x}%`);
            e.currentTarget.style.setProperty("--zoom-y", `${y}%`);
        }}
    >
        <ProductImage
            src={product.images?.[activeImage] || product.image}
            alt={product.altText || product.name}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            variant="hero"
            className="group-hover:scale-150 transition-transform duration-200 origin-[var(--zoom-x,50%)_var(--zoom-y,50%)]"
        >
            {/* Type badge */}
            <div className="absolute top-4 left-4 bg-card/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium text-primary shadow-sm z-20">
                {product.category} • {product.specs.type}
            </div>
        </ProductImage>
    </div>
</div>
```

Add state at line 68: `const [activeImage, setActiveImage] = useState(0);`

Add `import Image from "next/image";` to imports.

- [ ] **Step 2: Add THC/CBD visual progress bars**

Replace the current THC/CBD/Weight badge grid (lines 318-337) with visual progress bars:

```tsx
{/* THC / CBD Visual Bars */}
{(product.specs.thc || product.specs.cbd) && (
    <div className="flex gap-6 mb-6">
        {product.specs.thc && product.specs.thc !== "TBD" && (
            <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">THC</div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-lime-dark rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(parseFloat(product.specs.thc) || 0, 100)}%` }}
                    />
                </div>
                <div className="text-sm font-bold text-primary mt-1">{product.specs.thc}</div>
            </div>
        )}
        {product.specs.cbd && product.specs.cbd !== "TBD" && (
            <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">CBD</div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(parseFloat(product.specs.cbd) || 0, 100)}%` }}
                    />
                </div>
                <div className="text-sm font-bold text-blue-500 mt-1">{product.specs.cbd}</div>
            </div>
        )}
    </div>
)}
{/* Weight badge */}
{product.specs.weight && product.specs.weight !== "TBD" && (
    <div className="inline-flex px-3 py-1.5 rounded-lg bg-muted border border-border text-sm mb-4">
        <span className="text-muted-foreground mr-1.5">Weight:</span>
        <span className="font-bold">{product.specs.weight}</span>
    </div>
)}
```

- [ ] **Step 3: Add effects tags row**

After the terpene profile section (after line 353), add:

```tsx
{/* Effects */}
{product.effects && product.effects.length > 0 && (
    <div className="mb-6">
        <div className="text-sm font-semibold text-foreground mb-2">Effects</div>
        <div className="flex flex-wrap gap-2">
            {product.effects.map((effect) => (
                <span
                    key={effect}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border text-muted-foreground"
                >
                    {effect}
                </span>
            ))}
        </div>
    </div>
)}
```

- [ ] **Step 4: Add sale percentage badge to price display**

**NOTE:** The `Product` interface in `lib/productData.ts` does NOT have a `salePrice` field. The `ProductCard` component has it as an optional prop via `ProductCardProps`, but the data layer doesn't provide it yet. For now, skip the sale badge on PDP — it will render correctly once `salePrice` is added to the Product interface in a future data sync update. No code change needed for this step — move to Step 5.

- [ ] **Step 5: Update trust badges to match Ian's site**

Replace the current trust badges (lines 450-460) with Ian's style:

```tsx
{/* Trust Badges — Ian's Style */}
<div className="flex gap-4 py-4 border-t border-border mb-6">
    <div className="flex-1 text-center">
        <Truck className="h-5 w-5 mx-auto mb-1 text-primary" />
        <div className="text-[10px] text-muted-foreground leading-tight">Free Ship $199+</div>
    </div>
    <div className="flex-1 text-center">
        <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
        <div className="text-[10px] text-muted-foreground leading-tight">Quality Guaranteed</div>
    </div>
    <div className="flex-1 text-center">
        <MessageCircle className="h-5 w-5 mx-auto mb-1 text-primary" />
        <div className="text-[10px] text-muted-foreground leading-tight">Expert Support</div>
    </div>
</div>
```

Add `MessageCircle` to the existing lucide-react import at line 8-12. Change the import to include it:
```tsx
import {
    ShoppingCart, ChevronRight, Minus, Plus,
    Beaker, Shield, Truck, Star, ChevronDown, Send, CheckCircle,
    Link as LinkIcon, Share2, Sparkles, MessageCircle,
} from "lucide-react";
```

- [ ] **Step 6: Verify build**

Run: `cd /Users/eugeneagyemang/projects/clients/mohawk-medibles-unified && npx next build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add app/product/[slug]/ProductDetailClient.tsx
git commit -m "feat: product detail — add gallery, THC/CBD bars, effects, sale badge, trust badges"
```

---

### Task 6: Visual verification and final polish

**Files:**
- All modified files from tasks 1-5

- [ ] **Step 1: Start dev server and verify shop page**

Run: `cd /Users/eugeneagyemang/projects/clients/mohawk-medibles-unified && npm run dev`

Check:
- Promo banner scrolls at top
- Category image cards render with images
- 4-column grid on desktop, 2-column on mobile
- Intent pills still work
- Filter dropdown opens with strain/price/grade/territory
- Sort dropdown works
- Search still works
- Load More pagination works
- No sidebar visible

- [ ] **Step 2: Verify product detail page**

Navigate to any product (e.g., `/shop/og-kush-premium-flower` or first product).

Check:
- Thumbnail gallery shows (if product has multiple images)
- Image zoom on hover works
- THC/CBD progress bars render
- Terpene pills show with colors
- Effects tags display
- Trust badges match Ian's layout
- Add to Cart still works
- Tabs still work (Details, Specs, Reviews, FAQ)

- [ ] **Step 3: Verify cart drawer**

Click cart icon in header or quick-add any product.

Check:
- Drawer slides in from right
- Free shipping progress bar shows
- Item thumbnail, name, qty controls, price display correctly
- +/− quantity buttons work (min 1, max 10)
- Trash icon removes items
- Total updates in real time
- Checkout button links to /checkout
- Escape key closes drawer
- Backdrop click closes drawer
- Empty cart shows "Your cart is empty" message

- [ ] **Step 4: Mobile responsiveness check**

Resize browser to mobile width.

Check:
- Shop: 2-column grid, category cards wrap to 2-col, filters in dropdown
- Product detail: single column, thumbnails hidden, image full-width
- Cart drawer: full-width on mobile

- [ ] **Step 5: Final commit**

```bash
git add hooks/useCart.tsx components/CartDrawer.tsx components/Header.tsx app/layout.tsx app/shop/ShopClient.tsx app/product/[slug]/ProductDetailClient.tsx
git commit -m "feat: Design Swap Phase 2 complete — shop, product detail, cart drawer match Ian's design"
```

---

### Task 7: Fix broken images — schema logo + add /public/logo.png

**Files:**
- Create: `public/logo.png` (copy from existing logo)
- Modify: `lib/seo/schemas.ts`

- [ ] **Step 1: Create /public/logo.png from existing logo**

```bash
cp /Users/eugeneagyemang/projects/clients/mohawk-medibles-unified/public/assets/logos/medibles-logo2.png /Users/eugeneagyemang/projects/clients/mohawk-medibles-unified/public/logo.png
```

- [ ] **Step 2: Fix BASE_URL in schemas.ts**

In `lib/seo/schemas.ts` line 11, the `BASE_URL` is hardcoded to `https://mohawkmedibles.ca`. This should use the deployment domain. Change:

```typescript
// FROM:
const BASE_URL = "https://mohawkmedibles.ca";
// TO:
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mohawkmedibles.ca";
```

This lets the schema logo resolve correctly on all deployments (`.ca`, `.co`, Vercel preview URLs).

- [ ] **Step 3: Verify logo path resolves**

Check that `/logo.png` exists and the schema references it correctly:
```bash
ls -la /Users/eugeneagyemang/projects/clients/mohawk-medibles-unified/public/logo.png
```

- [ ] **Step 4: Commit**

```bash
git add public/logo.png lib/seo/schemas.ts
git commit -m "fix: add /public/logo.png and make BASE_URL configurable for schema.org"
```

---

### Task 8: Activate Google Reviews — set env vars + verify widget

**Files:**
- No code changes needed — components already built

The Google Reviews system is fully built:
- `components/GoogleReviewsWidget.tsx` — carousel (already in HomeClient.tsx line 145)
- `components/GoogleReviewsWidget.tsx` → `GoogleReviewsBadge` export (compact badge)
- `lib/googleReviews.ts` — sync from Google Places API (New)
- `server/trpc/routers/googleReviews.ts` — tRPC endpoints
- `app/api/cron/google-reviews/route.ts` — daily sync cron
- `app/admin/google-reviews/page.tsx` — admin dashboard

**The widget renders `null` because env vars are missing.** Once set, reviews auto-appear.

- [ ] **Step 1: Get the Google Place ID**

The Place ID from your Google Maps link is embedded in the URL. Extract it:
- Maps URL: `https://maps.app.goo.gl/1TxSUnLA8eFypjud8`
- Place ID: `ChIJUa3RTdDWfYkRUbQUjhh1AWg` (from the `!1s` parameter in the redirect URL)

Alternatively, look it up at https://developers.google.com/maps/documentation/places/web-service/place-id by searching "Mohawk Medibles".

- [ ] **Step 2: Enable Google Places API (New) in Google Cloud Console**

1. Go to https://console.cloud.google.com/ (signed in as `eugeniusonlineconsultingltd@gmail.com`)
2. Select your project (or create one)
3. Enable **"Places API (New)"** from the API Library
4. Create an API key (or use existing) restricted to Places API

- [ ] **Step 3: Set env vars in Vercel**

```bash
cd /Users/eugeneagyemang/projects/clients/mohawk-medibles-unified
vercel env add GOOGLE_PLACE_ID      # Value: the Place ID from Step 1
vercel env add GOOGLE_PLACES_API_KEY # Value: API key from Step 2
vercel env add CRON_SECRET           # Value: any secure random string for cron auth
```

Set all three for Production + Preview + Development environments.

- [ ] **Step 4: Pull env vars locally**

```bash
vercel env pull
```

- [ ] **Step 5: Trigger initial sync**

Either:
- Visit `/admin/google-reviews` and click "Sync Now"
- Or call the cron endpoint directly: `curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://mohawk-medibles-unified.vercel.app/api/cron/google-reviews`

- [ ] **Step 6: Verify Google Reviews Widget renders on homepage**

Start dev server and check that:
- Google Reviews section appears with overall rating (e.g., 4.8/5)
- Individual reviews carousel auto-rotates
- Google "G" logo + star rating + review count displays
- "X reviews on Google" link goes to Google Maps listing
- Navigation arrows and dots work

- [ ] **Step 7: Update SocialProofStrip to use live rating (optional)**

If the hardcoded 4.8/5 in `SocialProofStrip.tsx` should match the live Google rating, update it to fetch from the same tRPC endpoint. Otherwise, leave as-is since the GoogleReviewsWidget shows the live data.
