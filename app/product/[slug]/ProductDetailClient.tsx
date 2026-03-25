"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import {
    ShoppingCart, ChevronRight, Minus, Plus,
    Beaker, Shield, Truck, Star, ChevronDown, Send, CheckCircle,
    Link as LinkIcon, Share2, Sparkles,
} from "lucide-react";
import type { Product } from "@/lib/productData";
import { getShortName } from "@/lib/productData";
import ProductImage from "@/components/ProductImage";
import { trackProductView, trackServerEvent } from "@/lib/sage/behavioral";
import { trackViewItem, trackAddToCart } from "@/lib/analytics";
import WishlistButton from "@/components/WishlistButton";
import RecommendationCarousel from "@/components/RecommendationCarousel";
import BulkPricingTiers from "@/components/BulkPricingTiers";
import type { BulkPricingTier } from "@/lib/bulkPricing";

/** Strip script tags and inline event handlers from WooCommerce HTML */
function sanitizeHTML(html: string): string {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '');
}

interface ReviewData {
    id: number;
    rating: number;
    title: string | null;
    content: string;
    verified: boolean;
    status: string;
    authorName: string;
    createdAt: string;
}

interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    distribution: Record<number, number>;
}

interface Props {
    product: Product;
    related: Product[];
    shortName: string;
    faqs: { question: string; answer: string }[];
    stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
    stockQuantity?: number | null;
    reviewStats?: ReviewStats;
}

// Terpene → color mapping for visual chips
const TERPENE_COLORS: Record<string, string> = {
    Myrcene: "bg-amber-100 text-amber-800 border-amber-300",
    Limonene: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Caryophyllene: "bg-orange-100 text-orange-800 border-orange-300",
    Pinene: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Linalool: "bg-purple-100 text-purple-800 border-purple-300",
    Terpinolene: "bg-teal-100 text-teal-800 border-teal-300",
    Humulene: "bg-lime-100 text-lime-800 border-lime-300",
    Ocimene: "bg-rose-100 text-rose-800 border-rose-300",
};

function getTerpeneColor(terpene: string) {
    return TERPENE_COLORS[terpene] || "bg-green-100 text-green-800 border-green-300";
}

export default function ProductDetailClient({ product, related, shortName, faqs, stockStatus = "in_stock", stockQuantity, reviewStats: initialStats }: Props) {
    const { addItem, items } = useCart();
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState<"details" | "specs" | "reviews" | "faq">("details");
    const [added, setAdded] = useState(false);
    const [selectedTier, setSelectedTier] = useState<BulkPricingTier | null>(null);

    // Reviews state
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [stats, setStats] = useState<ReviewStats>(initialStats || { totalReviews: 0, averageRating: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
    const [reviewsLoaded, setReviewsLoaded] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", content: "" });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewMessage, setReviewMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Share
    const [copied, setCopied] = useState(false);
    const shareUrl = `https://mohawkmedibles.ca/shop/${product.slug}`;
    const shareText = `Check out ${product.name} from Mohawk Medibles!`;

    function handleCopyLink() {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    function handleShareTwitter() {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank", "noopener,noreferrer");
    }

    function handleShareFacebook() {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank", "noopener,noreferrer");
    }

    function handleNativeShare() {
        if (navigator.share) {
            navigator.share({ title: product.name, text: shareText, url: shareUrl }).catch(() => {});
        } else {
            handleCopyLink();
        }
    }

    // Frequently bought together
    const [boughtTogether, setBoughtTogether] = useState<any[]>([]);

    // Save to recently viewed in localStorage
    useEffect(() => {
        try {
            const key = "mm-recently-viewed";
            const stored = localStorage.getItem(key);
            let slugs: string[] = stored ? JSON.parse(stored) : [];
            slugs = [product.slug, ...slugs.filter((s) => s !== product.slug)].slice(0, 12);
            localStorage.setItem(key, JSON.stringify(slugs));
        } catch {
            /* ignore */
        }
    }, [product.slug]);

    // Track product view for behavioral intelligence
    useEffect(() => {
        trackProductView(product.slug);
        trackServerEvent("product_view", { slug: product.slug, category: product.category });
        trackViewItem({ id: String(product.id), name: product.name, price: product.price, category: product.category });

        // Fetch "Frequently Bought Together"
        fetch(`/api/recommendations?type=bought-together&slug=${product.slug}&limit=4`)
            .then((r) => r.ok ? r.json() : { products: [] })
            .then((d) => setBoughtTogether(d.products || []))
            .catch(() => {});
    }, [product.slug, product.category, product.id, product.name, product.price]);

    // Fetch reviews when tab is opened
    const loadReviews = useCallback(async () => {
        if (reviewsLoaded) return;
        try {
            const res = await fetch(`/api/reviews?productId=${product.id}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews);
                setStats(data.stats);
                setReviewsLoaded(true);
            }
        } catch { /* ignore */ }
    }, [product.id, reviewsLoaded]);

    useEffect(() => {
        if (activeTab === "reviews") loadReviews();
    }, [activeTab, loadReviews]);

    async function handleReviewSubmit(e: React.FormEvent) {
        e.preventDefault();
        setReviewSubmitting(true);
        setReviewMessage(null);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: product.id,
                    rating: reviewForm.rating,
                    title: reviewForm.title || undefined,
                    content: reviewForm.content,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setReviewMessage({ type: "success", text: data.message });
                setReviewForm({ rating: 5, title: "", content: "" });
            } else {
                setReviewMessage({ type: "error", text: data.error || "Failed to submit review" });
            }
        } catch {
            setReviewMessage({ type: "error", text: "Network error. Please try again." });
        } finally {
            setReviewSubmitting(false);
        }
    }

    const inCart = items.find((i) => i.id === String(product.id));

    const displayPrice = selectedTier ? selectedTier.totalPrice : product.price;
    const displayName = selectedTier ? `${product.name} (${selectedTier.weight})` : product.name;

    function handleTierSelect(tier: BulkPricingTier) {
        setSelectedTier(tier);
    }

    function handleAdd() {
        addItem({
            id: selectedTier ? `${product.id}-${selectedTier.grams}g` : String(product.id),
            name: displayName,
            price: displayPrice,
            quantity: qty,
            image: product.image,
        });
        trackAddToCart({ id: String(product.id), name: displayName, price: displayPrice, category: product.category, quantity: qty });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    }

    return (
        <div className="min-h-screen page-glass pt-20">
            <div className="container mx-auto px-4 sm:px-6 py-8">

                {/* ── Breadcrumbs ─────────────────────────────── */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-forest transition-colors">Home</Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link href="/shop" className="hover:text-forest transition-colors">Shop</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-forest font-medium">{shortName}</span>
                </nav>

                {/* ── Main Grid ──────────────────────────────── */}
                <div className="grid lg:grid-cols-2 gap-12 mb-16">

                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <ProductImage
                                src={product.image}
                                alt={product.altText || product.name}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                                variant="hero"
                            >
                                {/* Type badge */}
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-card/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium text-forest shadow-sm z-20">
                                    {product.specs.type}
                                </div>
                                {/* Category badge */}
                                <div className="absolute bottom-4 left-4 bg-forest/90 text-white backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium z-20">
                                    {product.category}
                                </div>
                            </ProductImage>
                        </motion.div>
                    </div>

                    {/* Right — Product Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col"
                    >
                        <div className="text-sm text-muted-foreground mb-2">{product.category}</div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-forest dark:text-cream mb-4">
                            {product.name}
                        </h1>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            {product.shortDescription}
                        </p>

                        {/* Rating summary (above the fold) */}
                        {stats.totalReviews > 0 && (
                            <button
                                onClick={() => setActiveTab("reviews")}
                                className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
                            >
                                <StarRating rating={stats.averageRating} />
                                <span className="text-sm text-muted-foreground">
                                    {stats.averageRating} ({stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"})
                                </span>
                            </button>
                        )}

                        {/* Price + Stock Status */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-3xl font-bold text-forest dark:text-leaf">
                                {displayPrice > 0 ? `$${displayPrice.toFixed(2)} CAD` : "Contact for Pricing"}
                            </div>
                            {stockStatus === "in_stock" && (
                                <span className="px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800">
                                    In Stock
                                </span>
                            )}
                            {stockStatus === "low_stock" && stockQuantity !== null && (
                                <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800">
                                    Low Stock ({stockQuantity} left)
                                </span>
                            )}
                            {stockStatus === "out_of_stock" && (
                                <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-800">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Loyalty Points */}
                        {product.price > 0 && (
                            <div className="flex items-center gap-1.5 mb-4 -mt-3">
                                <Sparkles className="h-3.5 w-3.5 text-lime dark:text-leaf" />
                                <span className="text-xs text-lime dark:text-leaf font-medium">
                                    Earn {Math.floor(product.price)} points with this purchase
                                </span>
                            </div>
                        )}

                        {/* Bulk Pricing Tiers */}
                        <BulkPricingTiers
                            product={{
                                price: product.price,
                                category: product.category,
                                specs: { weight: product.specs.weight },
                            }}
                            onTierSelect={handleTierSelect}
                        />

                        {/* THC / CBD / Weight badges */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            {product.specs.thc && product.specs.thc !== "TBD" && (
                                <div className="px-4 py-2 rounded-xl bg-forest/10 dark:bg-leaf/20 border border-forest/20">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">THC</div>
                                    <div className="font-bold text-forest dark:text-leaf text-lg">{product.specs.thc}</div>
                                </div>
                            )}
                            {product.specs.cbd && product.specs.cbd !== "TBD" && (
                                <div className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CBD</div>
                                    <div className="font-bold text-blue-700 dark:text-blue-400 text-lg">{product.specs.cbd}</div>
                                </div>
                            )}
                            {product.specs.weight && product.specs.weight !== "TBD" && (
                                <div className="px-4 py-2 rounded-xl bg-muted border border-border">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Weight</div>
                                    <div className="font-bold text-lg">{product.specs.weight}</div>
                                </div>
                            )}
                        </div>

                        {/* Terpene Profile */}
                        {product.specs.terpenes.length > 0 && (
                            <div className="mb-6">
                                <div className="text-sm font-semibold text-forest dark:text-cream mb-2 flex items-center gap-2">
                                    <Beaker className="h-4 w-4" /> Terpene Profile
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {product.specs.terpenes.map((t) => (
                                        <span key={t} className={`px-3 py-1 rounded-full text-xs font-medium border ${getTerpeneColor(t)}`}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Lineage */}
                        {product.specs.lineage && product.specs.lineage !== "TBD" && (
                            <div className="mb-6 text-sm">
                                <span className="font-semibold text-forest dark:text-cream">Lineage:</span>{" "}
                                <span className="text-muted-foreground">{product.specs.lineage}</span>
                            </div>
                        )}

                        {/* Add to Cart */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                                    className="px-3 py-2 hover:bg-muted transition-colors"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="px-4 py-2 font-mono font-bold min-w-[48px] text-center">{qty}</span>
                                <button
                                    onClick={() => setQty((q) => Math.min(10, q + 1))}
                                    className="px-3 py-2 hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    aria-label="Increase quantity"
                                    disabled={qty >= 10}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <Button
                                variant="brand"
                                size="lg"
                                className="flex-1 gap-2 text-base"
                                onClick={handleAdd}
                                disabled={product.price === 0 || stockStatus === "out_of_stock"}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {stockStatus === "out_of_stock"
                                    ? "Out of Stock"
                                    : added
                                        ? "Added ✓"
                                        : inCart
                                            ? `Update Cart (${inCart.quantity})`
                                            : "Add to Cart"}
                            </Button>
                            <WishlistButton
                                product={{
                                    id: product.id,
                                    slug: product.slug,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image,
                                    category: product.category,
                                }}
                                size="md"
                            />
                        </div>

                        {/* Share Buttons */}
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-xs text-muted-foreground mr-1">Share:</span>
                            <button
                                onClick={handleCopyLink}
                                className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                aria-label="Copy link"
                                title="Copy link"
                            >
                                {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />}
                            </button>
                            <button
                                onClick={handleShareTwitter}
                                className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                aria-label="Share on X"
                                title="Share on X"
                            >
                                <span className="text-xs font-bold text-muted-foreground">X</span>
                            </button>
                            <button
                                onClick={handleShareFacebook}
                                className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                aria-label="Share on Facebook"
                                title="Share on Facebook"
                            >
                                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button
                                onClick={handleNativeShare}
                                className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                aria-label="Share"
                                title="Share"
                            >
                                <Send className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Shield className="h-4 w-4 text-forest" /> Lab Tested
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Truck className="h-4 w-4 text-forest" /> Ships Canada-Wide
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Star className="h-4 w-4 text-forest" /> Empire Standard™
                            </div>
                        </div>

                        {/* Lab Results / COA Badge */}
                        <div className="mt-4 p-4 rounded-xl bg-card border border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-lime/10 flex items-center justify-center">
                                    <Beaker className="w-5 h-5 text-lime" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">Lab Tested & Verified</p>
                                    <p className="text-xs text-muted-foreground">
                                        Third-party tested for potency, purity & safety. Empire Standard™ certified.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 rounded-lg bg-background">
                                    <p className="text-xs text-muted-foreground">THC</p>
                                    <p className="text-sm font-bold text-foreground">{product.specs.thc || "Tested"}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-background">
                                    <p className="text-xs text-muted-foreground">CBD</p>
                                    <p className="text-sm font-bold text-foreground">{product.specs.cbd || "Tested"}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-background">
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <p className="text-sm font-bold text-lime">Passed ✓</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── Tabs: Details / Specs / Reviews / FAQ ──── */}
                <div className="mb-16">
                    <div className="flex border-b border-border mb-6 overflow-x-auto">
                        {(["details", "specs", "reviews", "faq"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                                    ? "border-forest text-forest dark:border-leaf dark:text-leaf"
                                    : "border-transparent text-muted-foreground hover:text-forest"
                                    }`}
                            >
                                {tab === "details" ? "Details" : tab === "specs" ? "Specifications" : tab === "reviews" ? `Reviews (${stats.totalReviews})` : `FAQ (${faqs.length})`}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "details" && (
                                <div className="prose prose-green dark:prose-invert max-w-none">
                                    {product.descriptionHTML ? (
                                        <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(product.descriptionHTML || '') }} />
                                    ) : (
                                        <>
                                            <p className="text-muted-foreground leading-relaxed">{product.eeatNarrative}</p>
                                            <p className="text-muted-foreground leading-relaxed mt-4">{product.metaDescription}</p>
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === "specs" && (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[
                                        { label: "Type", value: product.specs.type },
                                        { label: "THC", value: product.specs.thc },
                                        { label: "CBD", value: product.specs.cbd },
                                        { label: "Weight", value: product.specs.weight },
                                        { label: "Lineage", value: product.specs.lineage },
                                        { label: "Category", value: product.category },
                                        { label: "Subcategory", value: product.subcategory || "—" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between py-3 px-4 bg-white dark:bg-card rounded-lg border border-border">
                                            <span className="font-medium text-forest dark:text-cream">{label}</span>
                                            <span className="text-muted-foreground">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "reviews" && (
                                <div className="space-y-8">
                                    {/* Rating Summary */}
                                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                                        {/* Average Rating */}
                                        <div className="text-center sm:text-left">
                                            <div className="text-5xl font-bold text-forest dark:text-cream mb-1">
                                                {stats.averageRating || "—"}
                                            </div>
                                            <StarRating rating={stats.averageRating} size="lg" />
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
                                            </div>
                                        </div>

                                        {/* Distribution Bars */}
                                        <div className="flex-1 space-y-1.5 w-full sm:w-auto">
                                            {[5, 4, 3, 2, 1].map((star) => {
                                                const count = stats.distribution[star] || 0;
                                                const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                                                return (
                                                    <div key={star} className="flex items-center gap-2 text-sm">
                                                        <span className="w-6 text-right text-muted-foreground">{star}</span>
                                                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                                        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="w-8 text-xs text-muted-foreground">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Reviews List */}
                                    {reviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {reviews.map((review) => (
                                                <div key={review.id} className="bg-white dark:bg-card border border-border rounded-lg p-5">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <StarRating rating={review.rating} />
                                                            {review.title && (
                                                                <h4 className="font-semibold text-forest dark:text-cream mt-1">{review.title}</h4>
                                                            )}
                                                        </div>
                                                        {review.verified && (
                                                            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                                                <CheckCircle className="h-3 w-3" /> Verified Purchase
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">{review.content}</p>
                                                    <div className="text-xs text-muted-foreground">
                                                        {review.authorName} · {new Date(review.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Star className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                            <h3 className="font-semibold text-forest dark:text-cream mb-1">No reviews yet</h3>
                                            <p className="text-sm text-muted-foreground">Be the first to review this product!</p>
                                        </div>
                                    )}

                                    {/* Review Form */}
                                    <div className="bg-muted border border-border rounded-lg p-6">
                                        <h3 className="font-bold text-forest dark:text-cream mb-4">Write a Review</h3>
                                        {reviewMessage && (
                                            <div className={`mb-4 p-3 rounded-lg text-sm ${reviewMessage.type === "success" ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"}`}>
                                                {reviewMessage.text}
                                            </div>
                                        )}
                                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                                            {/* Star Selector */}
                                            <div>
                                                <label className="text-sm font-medium text-forest dark:text-cream mb-2 block">Rating</label>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                                                            className="p-0.5 transition-transform hover:scale-110"
                                                            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                                                        >
                                                            <Star className={`h-7 w-7 ${star <= reviewForm.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/60"}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Title */}
                                            <div>
                                                <label htmlFor="review-title" className="text-sm font-medium text-forest dark:text-cream mb-1 block">Title (optional)</label>
                                                <input
                                                    id="review-title"
                                                    type="text"
                                                    maxLength={150}
                                                    value={reviewForm.title}
                                                    onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                                                    placeholder="Summarize your experience"
                                                    className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-card text-sm focus:outline-none focus:ring-2 focus:ring-forest/50"
                                                />
                                            </div>
                                            {/* Content */}
                                            <div>
                                                <label htmlFor="review-content" className="text-sm font-medium text-forest dark:text-cream mb-1 block">Your Review</label>
                                                <textarea
                                                    id="review-content"
                                                    required
                                                    minLength={10}
                                                    maxLength={2000}
                                                    rows={4}
                                                    value={reviewForm.content}
                                                    onChange={(e) => setReviewForm((f) => ({ ...f, content: e.target.value }))}
                                                    placeholder="Share your experience with this product..."
                                                    className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-card text-sm focus:outline-none focus:ring-2 focus:ring-forest/50 resize-none"
                                                />
                                                <div className="text-xs text-muted-foreground mt-1 text-right">{reviewForm.content.length}/2000</div>
                                            </div>
                                            <Button
                                                type="submit"
                                                variant="brand"
                                                className="gap-2"
                                                disabled={reviewSubmitting || reviewForm.content.length < 10}
                                            >
                                                <Send className="h-4 w-4" />
                                                {reviewSubmitting ? "Submitting..." : "Submit Review"}
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {activeTab === "faq" && (
                                <div className="space-y-4">
                                    {faqs.map((faq, i) => (
                                        <FAQAccordion key={i} question={faq.question} answer={faq.answer} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ── Frequently Bought Together ─────────────── */}
                {boughtTogether.length > 0 && (
                    <RecommendationCarousel
                        title="Frequently Bought Together"
                        products={boughtTogether}
                    />
                )}

                {/* ── Related Products ────────────────────────── */}
                {related.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold text-forest dark:text-cream mb-8">You Might Also Like</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {related.map((r) => (
                                <Link
                                    key={r.id}
                                    href={`/shop/${r.slug}`}
                                    className="group bg-white dark:bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
                                >
                                    <ProductImage
                                        src={r.image}
                                        alt={r.altText || r.name}
                                        sizes="(max-width: 640px) 50vw, 25vw"
                                    />
                                    <div className="p-4">
                                        <div className="text-sm text-foreground/70 dark:text-cream/70 mb-1 font-medium">
                                            {r.category} • {r.specs.thc} THC
                                        </div>
                                        <h3 className="font-bold text-forest dark:text-cream text-sm mb-2 line-clamp-2">
                                            {getShortName(r)}
                                        </h3>
                                        <div className="font-bold text-lg text-forest dark:text-cream">${r.price.toFixed(2)}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Star Rating Display ────────────────────────────────────
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
    const starSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";
    return (
        <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${starSize} ${star <= Math.round(rating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/60"}`}
                />
            ))}
        </div>
    );
}

// ─── FAQ Accordion ──────────────────────────────────────────
function FAQAccordion({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors"
            >
                <span className="font-medium text-forest dark:text-cream pr-4">{question}</span>
                <ChevronDown className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
