"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
    ShoppingCart, Trash2, Plus, Minus, CreditCard,
    Shield, Truck, ArrowLeft, Loader2, Tag, X, CheckCircle, User, LogIn,
    Bitcoin, Banknote,
} from "lucide-react";
import FreeShippingBar from "@/components/FreeShippingBar";
import { CartUpsellNudge } from "@/components/CartUpsellNudge";
import GiftTierProgress from "@/components/GiftTierProgress";
import { DeliveryConfidence } from "@/components/DeliveryConfidence";
import { ComboSuggestions } from "@/components/ComboSuggestions";
import SmsOptIn from "@/components/SmsOptIn";
import ClickAndCollect, { type DeliveryMethod } from "@/components/ClickAndCollect";
import { trackBeginCheckout } from "@/lib/analytics";

interface CouponResult {
    valid: boolean;
    reason?: string;
    code?: string;
    type?: string;
    discount?: number;
    freeShipping?: boolean;
}

type PaymentMethod = "credit_card" | "etransfer";

const PAYMENT_METHODS: { id: PaymentMethod; title: string; description: string; icon: React.ReactNode }[] = [
    {
        id: "credit_card",
        title: "Credit Card",
        description: "Visa, Mastercard, or Amex",
        icon: <CreditCard className="h-5 w-5" />,
    },
    {
        id: "etransfer",
        title: "Interac e-Transfer",
        description: "Send money via e-Transfer — auto-deposit enabled",
        icon: <Banknote className="h-5 w-5" />,
    },
];

export default function CheckoutPage() {
    const { items, removeItem, addItem, updateQuantity, clearCart, total } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("credit_card");

    // Authenticated user state (for email pre-fill + faster checkout)
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Delivery method state (ship vs pickup)
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("ship");
    const [pickupTime, setPickupTime] = useState("10:00 AM");

    // Billing form state
    const [billing, setBilling] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address_1: "",
        address_2: "",
        city: "",
        state: "ON",
        postcode: "",
    });

    // e-Transfer instructions (shown after order)
    const [etransferInfo, setEtransferInfo] = useState<{
        instructions: string;
        orderReference: string;
        total: string;
    } | null>(null);

    // Fetch user profile on mount (non-blocking, silent on failure)
    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const res = await fetch("/api/account?action=profile");
                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.email) {
                        setUserEmail(data.user.email);
                        setUserName(data.user.name || null);
                        setIsAuthenticated(true);
                        setBilling((prev) => ({
                            ...prev,
                            email: data.user.email,
                            first_name: data.user.name?.split(" ")[0] || prev.first_name,
                            last_name: data.user.name?.split(" ").slice(1).join(" ") || prev.last_name,
                            phone: data.user.phone || prev.phone,
                        }));
                    }
                }
            } catch {
                // Guest checkout — no session, no problem
            }
        }
        fetchUserProfile();
    }, []);

    // GA4: Track begin_checkout
    useEffect(() => {
        if (items.length > 0) {
            trackBeginCheckout(
                items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
                total
            );
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync cart with email for abandoned cart tracking
    useEffect(() => {
        const email = billing.email || userEmail;
        if (email && items.length > 0) {
            fetch("/api/cart/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items, email }),
            }).catch(() => {});
        }
    }, [billing.email, userEmail, items]);

    // Coupon state
    const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);
    const [couponError, setCouponError] = useState("");

    // Calculate totals with coupon
    const discount = appliedCoupon?.valid ? (appliedCoupon.discount || 0) : 0;
    const subtotalAfterDiscount = Math.max(0, total - discount);
    const hasFreeShipping = appliedCoupon?.valid && appliedCoupon.freeShipping;
    const isPickup = deliveryMethod === "pickup";
    const shipping = isPickup ? 0 : (hasFreeShipping ? 0 : (total >= 149 ? 0 : 15));
    const tax = 0; // Tax-free — Indigenous sovereignty (Tyendinaga Mohawk Territory)
    const grandTotal = +(subtotalAfterDiscount + shipping + tax).toFixed(2);

    // ─── Coupon Validation ───────────────────────────────────
    async function handleApplyCoupon() {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError("");

        try {
            const res = await fetch(
                `/api/admin/coupons?action=validate&code=${encodeURIComponent(couponCode.trim())}&total=${total}`
            );
            const data = await res.json();

            if (data.valid) {
                setAppliedCoupon({
                    valid: true,
                    code: couponCode.trim().toUpperCase(),
                    type: data.type,
                    discount: data.discount || 0,
                    freeShipping: data.type === "FREE_SHIPPING",
                });
                setCouponError("");
            } else {
                setCouponError(data.reason || "Invalid coupon code");
                setAppliedCoupon(null);
            }
        } catch {
            setCouponError("Failed to validate coupon. Try again.");
        }
        setCouponLoading(false);
    }

    function handleRemoveCoupon() {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
    }

    // ─── Form Validation ──────────────────────────────────────
    function validateBilling(): string | null {
        if (!billing.first_name.trim()) return "First name is required";
        if (!billing.last_name.trim()) return "Last name is required";
        if (!billing.email.trim() || !billing.email.includes("@")) return "Valid email is required";
        if (deliveryMethod === "ship") {
            if (!billing.address_1.trim()) return "Address is required";
            if (!billing.city.trim()) return "City is required";
            if (!billing.postcode.trim()) return "Postal code is required";
        }
        return null;
    }

    // ─── Checkout ────────────────────────────────────────────
    async function handleCheckout() {
        const validationError = validateBilling();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map((item) => ({
                        productId: parseInt(item.id) || 0,
                        quantity: item.quantity,
                        name: item.name,
                    })),
                    billing: {
                        first_name: billing.first_name.trim(),
                        last_name: billing.last_name.trim(),
                        email: billing.email.trim(),
                        phone: billing.phone.trim() || undefined,
                        address_1: billing.address_1.trim(),
                        address_2: billing.address_2.trim() || undefined,
                        city: billing.city.trim(),
                        state: billing.state,
                        postcode: billing.postcode.trim(),
                    },
                    payment_method: selectedPayment,
                    coupon_codes: appliedCoupon?.valid && appliedCoupon.code ? [appliedCoupon.code] : undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Checkout failed");

            // Handle response based on payment method
            if (data.paymentMethod === "etransfer" || selectedPayment === "etransfer") {
                // Show e-Transfer instructions
                setEtransferInfo({
                    instructions: data.etransfer?.instructions || "Check your email for e-Transfer instructions.",
                    orderReference: data.etransfer?.orderReference || `WC-${data.orderNumber}`,
                    total: data.total || String(grandTotal),
                });
                clearCart();
            } else if (data.payUrl) {
                // CC or Crypto: redirect to WooCommerce payment page
                window.location.href = data.payUrl;
            } else if (data.confirmationUrl) {
                window.location.href = data.confirmationUrl;
            } else {
                // Fallback
                window.location.href = `/checkout/success?order=${data.orderId}`;
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
            setLoading(false);
        }
    }

    // ─── e-Transfer Confirmation Screen ──────────────────────
    if (etransferInfo) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6 max-w-md mx-auto p-8"
                >
                    <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
                    <h1 className="text-3xl font-bold text-forest dark:text-cream">Order Placed!</h1>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl text-left space-y-3">
                        <h2 className="font-bold text-amber-800 dark:text-amber-300">Interac e-Transfer Instructions</h2>
                        <p className="text-sm text-amber-700 dark:text-amber-400">{etransferInfo.instructions}</p>
                        <div className="text-sm">
                            <p><strong>Order Reference:</strong> {etransferInfo.orderReference}</p>
                            <p><strong>Total:</strong> ${etransferInfo.total} CAD</p>
                        </div>
                    </div>
                    <Link href="/shop">
                        <Button variant="brand" size="lg" className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Continue Shopping
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6"
                >
                    <ShoppingCart className="h-20 w-20 text-muted-foreground mx-auto" />
                    <h1 className="text-3xl font-bold text-forest dark:text-cream">Your Cart is Empty</h1>
                    <p className="text-muted-foreground">Browse our collection to find your perfect product.</p>
                    <Link href="/shop">
                        <Button variant="brand" size="lg" className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Continue Shopping
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
                <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-forest mb-8">
                    <ArrowLeft className="h-4 w-4" /> Continue Shopping
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-forest dark:text-cream">Checkout</h1>
                    <button
                        onClick={() => {
                            if (window.confirm("Remove all items from your cart?")) {
                                clearCart();
                            }
                        }}
                        className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" /> Empty Cart
                    </button>
                </div>

                {/* Authentication Status Banner */}
                {isAuthenticated ? (
                    <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 flex items-center gap-3">
                        <User className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <div className="text-sm">
                            <span className="text-green-700 dark:text-green-300">
                                Signed in as <strong>{userName || userEmail}</strong>
                            </span>
                            <span className="text-green-600/70 dark:text-green-400/70 ml-1">
                                — your details have been pre-filled
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <LogIn className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                Have an account? <Link href="/login?redirect=/checkout" className="font-bold underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-100">Sign in</Link> for faster checkout
                            </span>
                        </div>
                        <span className="text-[10px] text-blue-500 dark:text-blue-400 uppercase tracking-wider font-bold whitespace-nowrap">
                            Guest OK
                        </span>
                    </div>
                )}

                {/* Free Shipping Progress */}
                <div className="mb-6 space-y-4">
                    <CartUpsellNudge subtotal={total} />
                    <GiftTierProgress cartTotal={total} />
                    <ComboSuggestions />
                    <DeliveryConfidence />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Cart Items + Billing Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Cart Items */}
                        <div className="space-y-4">
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white dark:bg-card rounded-xl border border-border p-4 flex items-center gap-4"
                                >
                                    <div className="w-20 h-20 bg-forest/5 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <ShoppingCart className="h-8 w-8 text-forest/20" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-forest dark:text-cream truncate">{item.name}</h3>
                                        <div className="text-lg font-bold mt-1">${item.price.toFixed(2)} CAD</div>
                                    </div>
                                    <div className="flex items-center gap-1" role="group" aria-label={`Quantity for ${item.name}`}>
                                        <button
                                            onClick={() => {
                                                if (item.quantity <= 1) removeItem(item.id);
                                                else updateQuantity(item.id, item.quantity - 1);
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-muted border border-border transition-colors"
                                            aria-label={`Decrease quantity of ${item.name}`}
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <select
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                                            className="font-mono font-bold text-center w-14 py-1 rounded-lg border border-border bg-transparent text-sm focus:ring-2 focus:ring-forest/30 outline-none"
                                            aria-label={`Quantity of ${item.name}`}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-1.5 rounded-lg hover:bg-muted border border-border transition-colors disabled:opacity-30"
                                            disabled={item.quantity >= 10}
                                            aria-label={`Increase quantity of ${item.name}`}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <div className="font-bold text-lg min-w-[80px] text-right" aria-label={`Subtotal: $${(item.price * item.quantity).toFixed(2)}`}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        aria-label={`Remove ${item.name} from cart`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Delivery Method */}
                        <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
                            <h2 className="text-xl font-bold text-forest dark:text-cream mb-4">Delivery Method</h2>
                            <ClickAndCollect
                                onMethodChange={setDeliveryMethod}
                                onPickupTimeChange={setPickupTime}
                                defaultMethod={deliveryMethod}
                            />
                        </div>

                        {/* Billing Information */}
                        <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
                            <h2 className="text-xl font-bold text-forest dark:text-cream mb-4">
                                {isPickup ? "Contact Information" : "Billing Information"}
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        value={billing.first_name}
                                        onChange={(e) => setBilling({ ...billing, first_name: e.target.value })}
                                        autoComplete="given-name"
                                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Last Name *</label>
                                    <input
                                        type="text"
                                        value={billing.last_name}
                                        onChange={(e) => setBilling({ ...billing, last_name: e.target.value })}
                                        autoComplete="family-name"
                                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={billing.email}
                                        onChange={(e) => setBilling({ ...billing, email: e.target.value })}
                                        autoComplete="email"
                                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={billing.phone}
                                        onChange={(e) => setBilling({ ...billing, phone: e.target.value })}
                                        autoComplete="tel"
                                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition"
                                    />
                                </div>
                                {!isPickup && (
                                    <>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">Address *</label>
                                            <input
                                                type="text"
                                                value={billing.address_1}
                                                onChange={(e) => setBilling({ ...billing, address_1: e.target.value })}
                                                autoComplete="street-address"
                                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition"
                                                placeholder="Street address"
                                                required
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">Address Line 2</label>
                                            <input
                                                type="text"
                                                value={billing.address_2}
                                                onChange={(e) => setBilling({ ...billing, address_2: e.target.value })}
                                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition"
                                                placeholder="Apartment, suite, etc."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">City *</label>
                                            <input
                                                type="text"
                                                value={billing.city}
                                                onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                                                autoComplete="address-level2"
                                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">Province *</label>
                                            <select
                                                value={billing.state}
                                                onChange={(e) => setBilling({ ...billing, state: e.target.value })}
                                                autoComplete="address-level1"
                                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition"
                                            >
                                                <option value="AB">Alberta</option>
                                                <option value="BC">British Columbia</option>
                                                <option value="MB">Manitoba</option>
                                                <option value="NB">New Brunswick</option>
                                                <option value="NL">Newfoundland and Labrador</option>
                                                <option value="NS">Nova Scotia</option>
                                                <option value="NT">Northwest Territories</option>
                                                <option value="NU">Nunavut</option>
                                                <option value="ON">Ontario</option>
                                                <option value="PE">Prince Edward Island</option>
                                                <option value="QC">Quebec</option>
                                                <option value="SK">Saskatchewan</option>
                                                <option value="YT">Yukon</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">Postal Code *</label>
                                            <input
                                                type="text"
                                                value={billing.postcode}
                                                onChange={(e) => setBilling({ ...billing, postcode: e.target.value.toUpperCase() })}
                                                autoComplete="postal-code"
                                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition uppercase"
                                                placeholder="A1A 1A1"
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* SMS Opt-In */}
                            <SmsOptIn phone={billing.phone} isAuthenticated={isAuthenticated} />
                        </div>

                        {/* Payment Method Selection */}
                        <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
                            <h2 className="text-xl font-bold text-forest dark:text-cream mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                {PAYMENT_METHODS.map((method) => (
                                    <label
                                        key={method.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            selectedPayment === method.id
                                                ? "border-forest bg-forest/5 dark:border-leaf dark:bg-leaf/10"
                                                : "border-border hover:border-forest/30 dark:hover:border-leaf/30"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={method.id}
                                            checked={selectedPayment === method.id}
                                            onChange={() => setSelectedPayment(method.id)}
                                            className="sr-only"
                                        />
                                        <div className={`p-2 rounded-lg ${
                                            selectedPayment === method.id
                                                ? "bg-forest text-white dark:bg-leaf"
                                                : "bg-muted text-muted-foreground"
                                        }`}>
                                            {method.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm">{method.title}</div>
                                            <div className="text-xs text-muted-foreground">{method.description}</div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            selectedPayment === method.id
                                                ? "border-forest dark:border-leaf"
                                                : "border-border"
                                        }`}>
                                            {selectedPayment === method.id && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-forest dark:bg-leaf" />
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-card rounded-xl border border-border p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-forest dark:text-cream mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                                    <span className="font-medium">${total.toFixed(2)}</span>
                                </div>

                                {/* Coupon Discount */}
                                {appliedCoupon?.valid && discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <Tag className="h-3 w-3" /> Discount ({appliedCoupon.code})
                                        </span>
                                        <span className="font-medium text-green-600 dark:text-green-400">-${discount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {isPickup ? "Pickup (In-Store)" : "Shipping (Xpresspost)"}
                                    </span>
                                    <span className="font-medium">
                                        {shipping === 0 ? (
                                            <span className="text-green-600">
                                                FREE {isPickup ? <span className="text-[10px]">(pickup)</span> : hasFreeShipping && <span className="text-[10px]">(coupon)</span>}
                                            </span>
                                        ) : (
                                            `$${shipping.toFixed(2)}`
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (Tax-Free)</span>
                                    <span className="font-medium">$0.00</span>
                                </div>
                                <div className="border-t border-border pt-3 flex justify-between">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="font-bold text-lg text-forest dark:text-leaf">${grandTotal.toFixed(2)} CAD</span>
                                </div>
                            </div>

                            {/* Coupon Code Input */}
                            <div className="mb-4">
                                {appliedCoupon?.valid ? (
                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="font-medium">{appliedCoupon.code}</span>
                                            <span className="text-xs">applied</span>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="text-green-600 hover:text-green-800 dark:text-green-400">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder="Coupon code"
                                                    value={couponCode}
                                                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                                                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                                                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition uppercase"
                                                />
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponCode.trim()}
                                                className="px-4"
                                            >
                                                {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                                            </Button>
                                        </div>
                                        {couponError && (
                                            <p className="text-xs text-red-500 mt-1.5 pl-1">{couponError}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {total < 149 && !hasFreeShipping && (
                                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-xs">
                                    Add ${(149 - total).toFixed(2)} more for FREE shipping!
                                </div>
                            )}

                            {/* Age Verification */}
                            <div className="mb-4 p-3 bg-forest/5 rounded-lg text-xs text-muted-foreground">
                                By proceeding, you confirm you are <strong>19 years of age or older</strong> as required by Ontario law.
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <Button
                                variant="brand"
                                size="lg"
                                className="w-full gap-2 text-base"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        {selectedPayment === "credit_card" && <CreditCard className="h-5 w-5" />}
                                        {false /* crypto disabled for now */ && <Bitcoin className="h-5 w-5" />}
                                        {selectedPayment === "etransfer" && <Banknote className="h-5 w-5" />}
                                        {selectedPayment === "etransfer"
                                            ? `Place Order — $${grandTotal.toFixed(2)} CAD`
                                            : `Pay $${grandTotal.toFixed(2)} CAD`
                                        }
                                    </>
                                )}
                            </Button>

                            {/* Trust Signals */}
                            <div className="mt-6 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Shield className="h-3.5 w-3.5 text-forest" /> Secured by PayGo + SSL encryption
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Truck className="h-3.5 w-3.5 text-forest" /> Discreet Canada Post Xpresspost
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
