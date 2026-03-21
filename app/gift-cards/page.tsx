"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";

const PRESET_AMOUNTS = [25, 50, 100, 150, 200];

const DESIGNS = [
    { id: "classic", label: "Classic Green", colors: "from-[#2D5016] to-[#C8E63E]" },
    { id: "gold", label: "Gold Edition", colors: "from-[#8B4513] to-[#D4A574]" },
    { id: "midnight", label: "Midnight", colors: "from-[#141418] to-[#2D5016]" },
    { id: "heritage", label: "Heritage", colors: "from-[#6B2FA0] to-[#C8E63E]" },
    { id: "celebration", label: "Celebration", colors: "from-[#ef4444] to-[#f97316]" },
];

interface GiftCardForm {
    amount: number;
    customAmount: string;
    recipientEmail: string;
    recipientName: string;
    senderName: string;
    personalMessage: string;
    design: string;
}

export default function GiftCardsPage() {
    const [form, setForm] = useState<GiftCardForm>({
        amount: 50,
        customAmount: "",
        recipientEmail: "",
        recipientName: "",
        senderName: "",
        personalMessage: "",
        design: "classic",
    });
    const [isCustom, setIsCustom] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeAmount = isCustom ? Number(form.customAmount) || 0 : form.amount;
    const selectedDesign = DESIGNS.find((d) => d.id === form.design) ?? DESIGNS[0];

    function updateField(field: keyof GiftCardForm, value: string | number) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        if (activeAmount < 10) {
            setError("Minimum gift card amount is $10.");
            return;
        }
        if (activeAmount > 500) {
            setError("Maximum gift card amount is $500.");
            return;
        }
        if (!form.recipientEmail || !form.recipientName || !form.senderName) {
            setError("Please fill in all required fields.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/gift-cards/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: activeAmount,
                    recipientEmail: form.recipientEmail,
                    recipientName: form.recipientName,
                    senderName: form.senderName,
                    personalMessage: form.personalMessage,
                    design: form.design,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? "Failed to purchase gift card. Please try again.");
            }

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen pt-32 pb-20 page-glass text-foreground">
                <div className="container mx-auto px-6 max-w-xl text-center">
                    <div className="text-6xl mb-6">&#127873;</div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-4">
                        Gift Card Sent!
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        A ${activeAmount.toFixed(2)} gift card has been sent to{" "}
                        <strong className="text-foreground">{form.recipientEmail}</strong>.
                        They&apos;ll receive it in their inbox shortly.
                    </p>
                    <button
                        onClick={() => {
                            setSuccess(false);
                            setForm({
                                amount: 50,
                                customAmount: "",
                                recipientEmail: "",
                                recipientName: "",
                                senderName: "",
                                personalMessage: "",
                                design: "classic",
                            });
                            setIsCustom(false);
                        }}
                        className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
                    >
                        Send Another Gift Card
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 page-glass text-foreground">
            {/* Hero */}
            <section className="container mx-auto px-6 mb-16">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground uppercase mb-6">
                        Gift Cards
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        Give the gift of premium, lab-tested cannabis. Delivered by email, redeemable on 344+
                        products. The perfect gift for any occasion.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-6 max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Gift Card Preview */}
                    <div className="order-2 lg:order-1">
                        <div className="sticky top-32">
                            <div
                                className={`aspect-[1.6/1] rounded-2xl bg-gradient-to-br ${selectedDesign.colors} p-8 flex flex-col justify-between shadow-2xl`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-white/70 text-xs uppercase tracking-widest mb-1">
                                            Gift Card
                                        </p>
                                        <p className="text-white text-2xl font-bold">
                                            Mohawk Medibles
                                        </p>
                                    </div>
                                    <p className="text-white text-3xl font-bold">
                                        ${activeAmount > 0 ? activeAmount.toFixed(2) : "0.00"}
                                    </p>
                                </div>
                                <div>
                                    {form.recipientName && (
                                        <p className="text-white/90 text-sm mb-1">
                                            To: {form.recipientName}
                                        </p>
                                    )}
                                    {form.senderName && (
                                        <p className="text-white/70 text-xs">
                                            From: {form.senderName}
                                        </p>
                                    )}
                                    {form.personalMessage && (
                                        <p className="text-white/60 text-xs mt-2 italic line-clamp-2">
                                            &ldquo;{form.personalMessage}&rdquo;
                                        </p>
                                    )}
                                </div>
                            </div>
                            <p className="text-center text-xs text-muted-foreground mt-4">
                                Live preview of your gift card
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="order-1 lg:order-2 space-y-8">
                        {/* Amount Selection */}
                        <fieldset>
                            <legend className="text-lg font-semibold text-foreground mb-4">
                                Select Amount
                            </legend>
                            <div className="grid grid-cols-3 gap-3 mb-3">
                                {PRESET_AMOUNTS.map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => {
                                            updateField("amount", amt);
                                            setIsCustom(false);
                                        }}
                                        className={`py-3 px-4 rounded-xl font-semibold text-sm border transition-all duration-200 ${
                                            !isCustom && form.amount === amt
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-card border-border text-foreground hover:border-primary/50"
                                        }`}
                                    >
                                        ${amt}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setIsCustom(true)}
                                    className={`py-3 px-4 rounded-xl font-semibold text-sm border transition-all duration-200 ${
                                        isCustom
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-card border-border text-foreground hover:border-primary/50"
                                    }`}
                                >
                                    Custom
                                </button>
                            </div>
                            {isCustom && (
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        min={10}
                                        max={500}
                                        step={5}
                                        placeholder="Enter amount ($10 - $500)"
                                        value={form.customAmount}
                                        onChange={(e) => updateField("customAmount", e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            )}
                        </fieldset>

                        {/* Design Selection */}
                        <fieldset>
                            <legend className="text-lg font-semibold text-foreground mb-4">
                                Choose Design
                            </legend>
                            <div className="grid grid-cols-5 gap-3">
                                {DESIGNS.map((design) => (
                                    <button
                                        key={design.id}
                                        type="button"
                                        onClick={() => updateField("design", design.id)}
                                        className={`aspect-square rounded-xl bg-gradient-to-br ${design.colors} border-2 transition-all duration-200 ${
                                            form.design === design.id
                                                ? "border-white ring-2 ring-primary scale-105"
                                                : "border-transparent hover:scale-105"
                                        }`}
                                        title={design.label}
                                        aria-label={design.label}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {selectedDesign.label}
                            </p>
                        </fieldset>

                        {/* Recipient Details */}
                        <fieldset className="space-y-4">
                            <legend className="text-lg font-semibold text-foreground mb-4">
                                Recipient Details
                            </legend>
                            <div>
                                <label htmlFor="recipientName" className="block text-sm font-medium text-foreground mb-1.5">
                                    Recipient Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    id="recipientName"
                                    type="text"
                                    required
                                    value={form.recipientName}
                                    onChange={(e) => updateField("recipientName", e.target.value)}
                                    placeholder="Who is this for?"
                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label htmlFor="recipientEmail" className="block text-sm font-medium text-foreground mb-1.5">
                                    Recipient Email <span className="text-red-400">*</span>
                                </label>
                                <input
                                    id="recipientEmail"
                                    type="email"
                                    required
                                    value={form.recipientEmail}
                                    onChange={(e) => updateField("recipientEmail", e.target.value)}
                                    placeholder="recipient@example.com"
                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </fieldset>

                        {/* Sender Details */}
                        <fieldset className="space-y-4">
                            <legend className="text-lg font-semibold text-foreground mb-4">
                                Your Details
                            </legend>
                            <div>
                                <label htmlFor="senderName" className="block text-sm font-medium text-foreground mb-1.5">
                                    Your Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    id="senderName"
                                    type="text"
                                    required
                                    value={form.senderName}
                                    onChange={(e) => updateField("senderName", e.target.value)}
                                    placeholder="Your name"
                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label htmlFor="personalMessage" className="block text-sm font-medium text-foreground mb-1.5">
                                    Personal Message <span className="text-muted-foreground">(optional)</span>
                                </label>
                                <textarea
                                    id="personalMessage"
                                    rows={3}
                                    maxLength={250}
                                    value={form.personalMessage}
                                    onChange={(e) => updateField("personalMessage", e.target.value)}
                                    placeholder="Add a personal message..."
                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                />
                                <p className="text-xs text-muted-foreground text-right mt-1">
                                    {form.personalMessage.length}/250
                                </p>
                            </div>
                        </fieldset>

                        {/* Error */}
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || activeAmount < 10}
                            className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting
                                ? "Processing..."
                                : `Purchase Gift Card — $${activeAmount > 0 ? activeAmount.toFixed(2) : "0.00"}`}
                        </button>

                        <p className="text-xs text-muted-foreground text-center">
                            Gift cards are non-refundable. No expiry date.
                            Redeemable on mohawkmedibles.ca.
                        </p>
                    </form>
                </div>
            </div>

            {/* SEO Content */}
            <section className="container mx-auto px-6 max-w-3xl mt-20">
                <div className="prose prose-invert max-w-none">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                        Mohawk Medibles Gift Cards
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Mohawk Medibles gift cards are the perfect way to share premium, lab-tested cannabis
                        with friends and family. Choose from preset amounts of $25, $50, $100, $150, or $200
                        &mdash; or set a custom amount up to $500. Each gift card is delivered instantly via
                        email with a unique redemption code. Redeemable on our full catalogue of 344+ products
                        including flower, edibles, concentrates, vapes, and more. As an Indigenous-owned
                        dispensary from Six Nations territory, every gift card supports community economic
                        sovereignty.
                    </p>
                </div>
            </section>
        </div>
    );
}
