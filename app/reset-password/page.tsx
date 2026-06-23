"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { KeyRound, Check, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiClient";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!token) {
            setError("Invalid or missing reset token. Please request a new link.");
            return;
        }

        setLoading(true);

        try {
            const res = await apiFetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reset-password", token, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Reset failed");

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6 max-w-md mx-auto px-6"
                >
                    <AlertCircle className="h-16 w-16 text-amber-500 mx-auto" />
                    <h1 className="text-2xl font-bold text-forest dark:text-cream">Invalid Reset Link</h1>
                    <p className="text-muted-foreground">
                        This password reset link is missing or expired. Please request a new one.
                    </p>
                    <Link href="/login">
                        <Button variant="brand" className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Login
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 max-w-md mx-auto px-6"
                >
                    <Check className="h-16 w-16 text-green-500 mx-auto" />
                    <h1 className="text-2xl font-bold text-forest dark:text-cream">Password Updated!</h1>
                    <p className="text-muted-foreground">
                        Your password has been reset. You can now log in with your new password.
                    </p>
                    <Link href="/login">
                        <Button variant="brand" className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Go to Login
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md mx-auto px-6"
            >
                <div className="text-center mb-8">
                    <KeyRound className="h-12 w-12 text-forest mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-forest dark:text-cream">Set New Password</h1>
                    <p className="text-muted-foreground mt-2">Choose a strong password for your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-forest dark:text-cream mb-1">
                            New Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-white dark:bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-forest/50"
                            placeholder="At least 8 characters"
                            required
                            minLength={8}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm" className="block text-sm font-medium text-forest dark:text-cream mb-1">
                            Confirm Password
                        </label>
                        <input
                            id="confirm"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-white dark:bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-forest/50"
                            placeholder="Repeat password"
                            required
                            minLength={8}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="brand"
                        size="lg"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Reset Password"}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
}
