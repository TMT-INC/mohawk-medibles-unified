"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Shield, Star, Truck } from "lucide-react";
import { markAuthenticated } from "@/lib/sage/memory";
import { setUserAuthenticated } from "@/lib/sage/behavioral";
import { apiFetch } from "@/lib/apiClient";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await apiFetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "login", email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            markAuthenticated();
            setUserAuthenticated();
            router.push("/account");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side — Branding Panel (desktop only) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-forest via-forest/90 to-emerald-800 dark:from-forest dark:via-emerald-900 dark:to-black items-center justify-center p-12 overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-white/5 rounded-full" />
                <div className="absolute bottom-[-15%] left-[-5%] w-96 h-96 bg-white/5 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-leaf/5 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-md text-white space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Leaf className="h-10 w-10 text-leaf" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Mohawk Medibles</h2>
                            <p className="text-white/60 text-sm">Tyendinaga Mohawk Territory</p>
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold leading-tight">
                        Welcome back to<br />
                        <span className="text-leaf">Canada&apos;s Trusted</span><br />
                        Cannabis Source
                    </h1>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Truck className="h-4 w-4 text-leaf" />
                            </div>
                            <span className="text-white/80 text-sm">Free Xpresspost shipping on orders $149+</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Star className="h-4 w-4 text-leaf" />
                            </div>
                            <span className="text-white/80 text-sm">360+ premium products, lab-tested quality</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Shield className="h-4 w-4 text-leaf" />
                            </div>
                            <span className="text-white/80 text-sm">Tax-free, Indigenous-owned, trusted since day one</span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <p className="text-xs text-white/40">Serving 25,900+ customers across Canada</p>
                    </div>
                </div>
            </div>

            {/* Right Side — Login Form */}
            <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile-only logo */}
                    <div className="text-center mb-8">
                        <div className="lg:hidden flex items-center justify-center gap-2.5 mb-6">
                            <div className="p-2.5 bg-forest/10 dark:bg-leaf/10 rounded-xl">
                                <Leaf className="h-8 w-8 text-forest dark:text-leaf" />
                            </div>
                            <span className="text-xl font-bold text-forest dark:text-cream">Mohawk Medibles</span>
                        </div>
                        <h1 className="text-3xl font-bold text-forest dark:text-cream">Welcome Back</h1>
                        <p className="text-muted-foreground mt-2">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white dark:bg-card rounded-2xl shadow-lg dark:shadow-none dark:ring-1 dark:ring-zinc-800 p-8 space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>
                        )}

                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-forest dark:text-zinc-100 mb-1.5 block">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border dark:border-zinc-600 bg-muted dark:bg-zinc-800 text-foreground dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-leaf/40 dark:focus:ring-leaf/50 outline-none transition"
                                    placeholder="you@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1.5">
                                <label htmlFor="password" className="text-sm font-medium text-forest dark:text-zinc-100">Password</label>
                                <Link href="/forgot-password" className="text-xs text-forest/70 dark:text-leaf font-medium hover:text-forest dark:hover:text-leaf/80 hover:underline underline-offset-2">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="password"
                                    type={showPass ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-border dark:border-zinc-600 bg-muted dark:bg-zinc-800 text-foreground dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-leaf/40 dark:focus:ring-leaf/50 outline-none transition"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-leaf"
                                >
                                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" variant="brand" size="lg" className="w-full gap-2 py-3 text-base font-semibold" disabled={loading}>
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-white dark:bg-card px-3 text-muted-foreground">or</span>
                            </div>
                        </div>

                        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="text-forest dark:text-leaf font-semibold hover:underline underline-offset-2">Create one</Link>
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
