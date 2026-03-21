"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Copy, Check, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useSearchParams } from "next/navigation";
import { trackPurchase } from "@/lib/analytics";

const PAYMENT_LABELS: Record<string, string> = {
    paygobillingcc: "Credit Card",
    wcpg_crypto: "Crypto",
    digipay_etransfer_manual: "Interac e-Transfer",
    etransfer: "Interac e-Transfer",
};

export default function CheckoutSuccessPage() {
    const { clearCart } = useCart();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order");
    const orderKey = searchParams.get("key");

    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [loading, setLoading] = useState(!!orderId);
    const [copied, setCopied] = useState(false);
    const [isGuest, setIsGuest] = useState(true);

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
        <div className="min-h-screen bg-background flex items-center justify-center">
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
                    <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
                </motion.div>

                <h1 className="text-3xl font-bold text-forest dark:text-cream">Order Confirmed!</h1>

                {/* Order Number */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-white dark:bg-card rounded-xl border border-border"
                >
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order Number</div>
                    <div className="flex items-center justify-center gap-2">
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : orderNumber ? (
                            <>
                                <span className="text-xl font-mono font-bold text-forest dark:text-leaf tracking-wide">
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

                <p className="text-muted-foreground">
                    Thank you for your order. You&apos;ll receive a confirmation email shortly with your tracking details.
                </p>

                <div className="p-4 bg-forest/5 rounded-xl text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 justify-center mb-2">
                        <Package className="h-4 w-4 text-forest" />
                        <span className="font-medium text-forest dark:text-cream">Shipping via Canada Post Xpresspost</span>
                    </div>
                    <p>Estimated delivery: 2-5 business days. Age verification (19+) required at delivery.</p>
                </div>

                {/* Guest Account Creation CTA */}
                {isGuest && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                    >
                        <div className="flex items-center gap-2 justify-center mb-2">
                            <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-sm text-blue-700 dark:text-blue-300">
                                Create an account to track your order
                            </span>
                        </div>
                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mb-3">
                            View order history, save addresses, and check out faster next time.
                        </p>
                        <Link href="/register">
                            <Button variant="outline" size="sm" className="w-full border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 gap-2">
                                <UserPlus className="h-3.5 w-3.5" /> Create Account
                            </Button>
                        </Link>
                    </motion.div>
                )}

                <div className="flex gap-4 justify-center pt-4">
                    <Link href="/shop">
                        <Button variant="brand" className="gap-2">
                            Continue Shopping <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
