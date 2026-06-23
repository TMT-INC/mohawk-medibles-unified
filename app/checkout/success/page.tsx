"use client";

import Link from "next/link";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Copy, Check, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useSearchParams } from "next/navigation";
import { trackPurchase } from "@/lib/analytics";
import OrderTracker from "@/components/OrderTracker";

const PAYMENT_LABELS: Record<string, string> = {
    paygobillingcc: "Credit Card",
    wcpg_crypto: "Crypto",
    digipay_etransfer_manual: "Interac e-Transfer",
    etransfer: "Interac e-Transfer",
};

function CheckoutSuccessContent() {
    const { clearCart } = useCart();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order");
    const orderKey = searchParams.get("key");

    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [loading, setLoading] = useState(!!orderId);
    const [copied, setCopied] = useState(false);
    const [isGuest, setIsGuest] = useState(true);
    const [showTracker, setShowTracker] = useState(false);
    const [lastOrderEmail, setLastOrderEmail] = useState<string>("");

    // The order tracker requires session ownership or a matching email; for guests
    // we pass the email they just used at checkout (stashed in sessionStorage).
    useEffect(() => {
        try { setLastOrderEmail(sessionStorage.getItem("mm-last-order-email") || ""); } catch { /* ignore */ }
    }, []);

    // Check if user is authenticated (to show/hide account creation CTA)
    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch("/api/account?action=profile");
                if (res.ok) setIsGuest(false);
            } catch {
                // Guest user
            }
        }
        checkAuth();
    }, []);

    // Clear cart on successful checkout
    useEffect(() => { clearCart(); }, [clearCart]);

    // Fetch order details
    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            return;
        }

        async function fetchOrder() {
            try {
                const res = await fetch(`/api/checkout/verify?order=${orderId}&key=${orderKey || ""}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.orderNumber) {
                        setOrderNumber(data.orderNumber);
                        setPaymentMethod(data.paymentMethod || "");
                        // GA4: Track purchase (guard against double-fire)
                        if (!sessionStorage.getItem(`mm-purchase-${orderId}`)) {
                            sessionStorage.setItem(`mm-purchase-${orderId}`, "1");
                            trackPurchase({
                                transactionId: data.orderNumber,
                                value: data.total || 0,
                                tax: data.tax || 0,
                                shipping: data.shipping || 0,
                                items: (data.items || []).map((i: { id: string; name: string; price: number; quantity: number }) => ({
                                    id: i.id, name: i.name, price: i.price, quantity: i.quantity,
                                })),
                            });
                        }
                        // Auto-show tracker once we have the order number
                        setShowTracker(true);
                    }
                }
            } catch {
                // Non-fatal — still show success page
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [orderId, orderKey]);

    const handleCopy = () => {
        navigator.clipboard.writeText(orderNumber ?? "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const paymentLabel = PAYMENT_LABELS[paymentMethod] || paymentMethod || "Online Payment";

    return (
        <div className="min-h-screen bg-background">
            <div className="flex flex-col items-center justify-center pt-12 pb-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 max-w-md mx-auto px-6"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
                    </motion.div>

                    <h1 className="text-3xl font-bold text-white">Order Confirmed!</h1>

                    {/* Order Number */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 bg-card/60 backdrop-blur rounded-xl shadow-lg shadow-black/20"
                    >
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order Number</div>
                        <div className="flex items-center justify-center gap-2">
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : orderNumber ? (
                                <>
                                    <span className="text-xl font-mono font-bold text-amber-400 tracking-wide">
                                        {orderNumber}
                                    </span>
                                    <button
                                        onClick={handleCopy}
                                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                                        title="Copy order number"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </button>
                                </>
                            ) : (
                                <span className="text-sm text-muted-foreground">
                                    Check your email for order details
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                            Paid via {paymentLabel}
                        </div>
                    </motion.div>

                    <p className="text-muted-foreground text-sm">
                        Thank you for your order. You&apos;ll receive a confirmation email shortly.
                    </p>
                </motion.div>
            </div>

            {/* Live Order Tracker */}
            {showTracker && orderNumber && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="max-w-2xl mx-auto px-4 pb-8"
                >
                    <div className="flex items-center gap-2 justify-center mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                            Your order is being prepared!
                        </span>
                    </div>
                    <OrderTracker initialOrderNumber={orderNumber} initialEmail={lastOrderEmail} compact />
                </motion.div>
            )}

            {/* Bottom actions */}
            <div className="max-w-md mx-auto px-6 pb-12 space-y-4">
                {/* Guest Account Creation CTA */}
                {isGuest && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="p-4 bg-amber-500/5 rounded-xl shadow-lg shadow-black/10"
                    >
                        <div className="flex items-center gap-2 justify-center mb-2">
                            <UserPlus className="h-4 w-4 text-amber-400" />
                            <span className="font-medium text-sm text-amber-300">
                                Create an account to track your order
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 text-center">
                            View order history, save addresses, and check out faster next time.
                        </p>
                        <Link href="/register">
                            <Button variant="outline" size="sm" className="w-full gap-2">
                                <UserPlus className="h-3.5 w-3.5" /> Create Account
                            </Button>
                        </Link>
                    </motion.div>
                )}

                <div className="flex gap-4 justify-center pt-2">
                    <Link href={orderNumber ? `/track-order?order=${orderNumber}` : "/track-order"}>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Package className="h-4 w-4" /> Full Tracking Page
                        </Button>
                    </Link>
                    <Link href="/shop">
                        <Button variant="brand" className="gap-2">
                            Continue Shopping <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
            }
        >
            <CheckoutSuccessContent />
        </Suspense>
    );
}
