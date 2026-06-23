"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Leaf, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, CheckCircle, Gift, Zap, ShoppingBag, Shield, Users } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

const ACCOUNT_BENEFITS = [
    { icon: <Gift className="h-4 w-4" />, title: "Earn Rewards", description: "Points on every order toward free products" },
    { icon: <ShoppingBag className="h-4 w-4" />, title: "Track Orders", description: "Real-time updates on your shipments" },
    { icon: <Zap className="h-4 w-4" />, title: "Faster Checkout", description: "Saved addresses and payment preferences" },
];

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [ageVerified, setAgeVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const passwordStrength = password.length >= 12 ? "strong" : password.length >= 8 ? "medium" : "weak";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (password !== confirm) { setError("Passwords don't match"); return; }
        if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
        if (!ageVerified) { setError("You must be 19+ to create an account"); return; }

        setLoading(true);
        try {
            const res = await apiFetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "register", name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.push("/account");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side — Branding + Benefits (desktop only) */}
            <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-forest via-forest/90 to-emerald-800 dark:from-forest dark:via-emerald-900 dark:to-black items-center justify-center p-12 overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-white/5 rounded-full" />
                <div className="absolute bottom-[-15%] left-[-5%] w-96 h-96 bg-white/5 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-leaf/5 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-sm text-white space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Leaf className="h-10 w-10 text-leaf" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Mohawk Medibles</h2>
                            <p className="text-white/60 text-sm">Tyendinaga Mohawk Territory</p>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold leading-tight">
                        Create your account<br />
                        and start <span className="text-leaf">saving today</span>
                    </h1>

                    {/* Benefits */}
                    <div className="space-y-4">
                        {ACCOUNT_BENEFITS.map((b) => (
                            <div key={b.title} className="flex items-start gap-3">
                                <div className="p-2 bg-white/10 rounded-lg mt-0.5">
                                    {b.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-white">{b.title}</h3>
                                    <p className="text-white/60 text-xs">{b.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Social proof */}
                    <div className="pt-6 border-t border-white/10 flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-forest flex items-center justify-center">
                                    <Users className="h-3 w-3 text-white/70" />
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Join 25,900+ customers</p>
                            <p className="text-xs text-white/50">across Canada</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side — Registration Form */}
            <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile-only header */}
                    <div className="text-center mb-6">
                        <div className="lg:hidden flex items-center justify-center gap-2.5 mb-6">
                            <div className="p-2.5 bg-forest/10 dark:bg-leaf/10 rounded-xl">
                                <Leaf className="h-8 w-8 text-forest dark:text-leaf" />
                            </div>
                            <span className="text-xl font-bold text-forest dark:text-cream">Mohawk Medibles</span>
                        </div>
                        <h1 className="text-3xl font-bold text-forest dark:text-cream">Create Account</h1>
                        <p className="text-muted-foreground mt-2">Join the Mohawk Medibles community</p>
                    </div>

                    {/* Mobile-only social proof */}
                    <div className="lg:hidden mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 text-forest/50 dark:text-leaf/50" />
                        <span><strong className="text-foreground">25,900+</strong> customers across Canada</span>
                    </div>

                    {/* Mobile-only benefits strip */}
                    <div className="lg:hidden grid grid-cols-3 gap-2 mb-6">
                        {ACCOUNT_BENEFITS.map((b) => (
                            <div key={b.title} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-forest/5 dark:bg-leaf/5 text-center">
                                <div className="text-forest dark:text-leaf">{b.icon}</div>
                                <span className="text-[10px] font-semibold text-forest/80 dark:text-leaf/80">{b.title}</span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white dark:bg-card rounded-2xl shadow-lg dark:shadow-none dark:ring-1 dark:ring-zinc-800 p-8 space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">{error}</div>
                        )}

                        <div>
                            <label htmlFor="name" className="text-sm font-medium text-forest dark:text-cream mb-1.5 block">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="name" type="text" required value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border dark:border-zinc-600 bg-muted dark:bg-zinc-800 text-foreground dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-leaf/40 dark:focus:ring-leaf/50 outline-none transition"
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-forest dark:text-cream mb-1.5 block">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="email" type="email" required value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border dark:border-zinc-600 bg-muted dark:bg-zinc-800 text-foreground dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-leaf/40 dark:focus:ring-leaf/50 outline-none transition"
                                    placeholder="you@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-forest dark:text-cream mb-1.5 block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="password" type={showPass ? "text" : "password"} required value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-border dark:border-zinc-600 bg-muted dark:bg-zinc-800 text-foreground dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-leaf/40 dark:focus:ring-leaf/50 outline-none transition"
                                    placeholder="Min 8 characters"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-leaf">
                                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {password.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex gap-1 flex-1">
                                        <div className={`h-1.5 rounded-full flex-1 transition-colors ${passwordStrength !== "weak" ? "bg-green-500" : "bg-red-300 dark:bg-red-800"}`} />
                                        <div className={`h-1.5 rounded-full flex-1 transition-colors ${passwordStrength === "medium" || passwordStrength === "strong" ? "bg-green-500" : "bg-muted"}`} />
                                        <div className={`h-1.5 rounded-full flex-1 transition-colors ${passwordStrength === "strong" ? "bg-green-500" : "bg-muted"}`} />
                                    </div>
                                    <span className={`text-xs font-medium capitalize ${
                                        passwordStrength === "strong" ? "text-green-600" :
                                        passwordStrength === "medium" ? "text-amber-600" : "text-red-500"
                                    }`}>{passwordStrength}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirm" className="text-sm font-medium text-forest dark:text-cream mb-1.5 block">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="confirm" type="password" required value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-border dark:border-zinc-600 bg-muted dark:bg-zinc-800 text-foreground dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-leaf/40 dark:focus:ring-leaf/50 outline-none transition"
                                    placeholder="Re-enter password"
                                />
                                {confirm.length > 0 && password === confirm && (
                                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                                )}
                            </div>
                        </div>

                        {/* Age Verification */}
                        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-forest/5 dark:bg-leaf/5 hover:bg-forest/10 dark:hover:bg-leaf/10 transition-colors">
                            <input
                                type="checkbox" checked={ageVerified}
                                onChange={(e) => setAgeVerified(e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-border accent-forest"
                            />
                            <span className="text-sm text-muted-foreground">
                                I confirm I am <strong className="text-foreground">19 years of age or older</strong> as required by Ontario law to purchase cannabis products.
                            </span>
                        </label>

                        <Button type="submit" variant="brand" size="lg" className="w-full gap-2 py-3 text-base font-semibold" disabled={loading || !ageVerified}>
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                            {loading ? "Creating Account..." : "Create Account"}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-white dark:bg-card px-3 text-muted-foreground">already a member?</span>
                            </div>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            <Link href="/login" className="text-forest dark:text-leaf font-semibold hover:underline underline-offset-2">Sign in to your account</Link>
                        </p>
                    </form>

                    {/* Trust message below form */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-3.5 w-3.5 text-forest/50 dark:text-leaf/50" />
                        <span>Your data is encrypted and never shared with third parties</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
