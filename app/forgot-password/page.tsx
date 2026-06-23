"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Check, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiClient";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus("loading");
        try {
            const res = await apiFetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "forgot-password", email }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus("success");
                setMessage("If an account exists with that email, you'll receive a password reset link shortly.");
            } else {
                setStatus("error");
                setMessage(data.error || "Something went wrong. Please try again.");
            }
        } catch {
            setStatus("error");
            setMessage("Network error. Please try again.");
        }
    };

    return (
        <div className="min-h-screen page-glass flex items-center justify-center px-4 pt-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass-card backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-lime/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-7 h-7 text-forest dark:text-lime" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground font-heading">Forgot Password?</h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            Enter your email and we&apos;ll send you a reset link.
                        </p>
                    </div>

                    {status === "success" ? (
                        <div className="text-center space-y-4">
                            <div className="w-12 h-12 bg-lime/10 rounded-full flex items-center justify-center mx-auto">
                                <Check className="w-6 h-6 text-lime" />
                            </div>
                            <p className="text-muted-foreground text-sm">{message}</p>
                            <Link href="/login">
                                <Button variant="outline" className="mt-4 rounded-full border-border text-foreground hover:bg-muted">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {status === "error" && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {message}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="text-muted-foreground text-xs font-bold tracking-widest uppercase mb-2 block">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full h-12 px-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-forest/50 dark:focus:border-lime/50 focus:ring-1 focus:ring-forest/30 dark:focus:ring-lime/30 transition-all"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full h-12 rounded-xl bg-forest dark:bg-lime text-white dark:text-charcoal-deep font-bold hover:bg-forest/90 dark:hover:bg-lime-light transition-all"
                            >
                                {status === "loading" ? "Sending..." : "Send Reset Link"}
                            </Button>

                            <div className="text-center">
                                <Link href="/login" className="text-muted-foreground hover:text-forest dark:hover:text-lime text-sm transition-colors">
                                    <ArrowLeft className="w-3 h-3 inline mr-1" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
