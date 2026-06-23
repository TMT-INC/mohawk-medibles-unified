/**
 * Contact Us — Client Content
 * Warm, inviting split layout with rich visual design.
 * Uses i18n translation system for all text content.
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle,
    Loader2, Zap, Shield, Heart, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/LocaleProvider";
import { apiFetch } from "@/lib/apiClient";

export default function ContactClientContent() {
    const { t } = useLocale();

    const CONTACT_INFO = [
        {
            icon: Phone,
            label: t("contact.phoneLabel"),
            value: t("contact.phoneValue"),
            href: "tel:+16133966728",
            description: t("contact.phoneDesc"),
            color: "from-lime/20 to-forest/10",
        },
        {
            icon: Mail,
            label: t("contact.emailLabel"),
            value: t("contact.emailValue"),
            href: "mailto:info@mohawkmedibles.ca",
            description: t("contact.emailDesc"),
            color: "from-purple-500/15 to-purple-700/5",
        },
        {
            icon: MapPin,
            label: t("contact.locationLabel"),
            value: t("contact.locationValue"),
            href: "https://maps.google.com/?q=45+Dundas+Street+Deseronto+Ontario",
            description: t("contact.locationDesc"),
            color: "from-rose-500/15 to-rose-700/5",
        },
        {
            icon: Clock,
            label: t("contact.hoursLabel"),
            value: t("contact.hoursValue"),
            href: null,
            description: t("contact.hoursDesc"),
            color: "from-amber-500/15 to-amber-700/5",
        },
    ];

    const DEPARTMENTS = [
        { value: "general", label: t("contact.deptGeneral") },
        { value: "orders", label: t("contact.deptOrders") },
        { value: "returns", label: t("contact.deptReturns") },
        { value: "wholesale", label: t("contact.deptWholesale") },
        { value: "press", label: t("contact.deptPress") },
        { value: "technical", label: t("contact.deptTechnical") },
    ];

    const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        department: "general",
        subject: "",
        message: "",
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormState("sending");

        try {
            const res = await apiFetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to send");
            setFormState("sent");
            setFormData({ name: "", email: "", department: "general", subject: "", message: "" });
        } catch {
            setFormState("error");
        }
    }

    return (
        <div className="min-h-screen page-glass text-foreground">

            {/* ═══ HERO — Cinematic gradient with layered depth ═══ */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background layers */}
                <div className="absolute inset-0">
                    <Image
                        src="/assets/pages/contact-hero.jpg"
                        alt=""
                        fill
                        className="object-cover opacity-25"
                        sizes="100vw"
                        priority
                        aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white dark:from-charcoal-deep/70 dark:via-charcoal-deep/90 dark:to-charcoal-deep" />
                </div>
                {/* Accent glow orbs */}
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full bg-lime/5 blur-[120px]" />
                <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-forest/5 blur-[100px]" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime/10 border border-lime/25 text-lime text-[10px] font-bold tracking-[0.25em] uppercase mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        {t("contact.badge")}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight font-display mb-4 leading-tight">
                        {t("contact.title")}
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        {t("contact.subtitle")}
                    </p>

                    {/* Trust signal */}
                    <div className="inline-flex items-center gap-3 mt-8 px-5 py-2.5 rounded-full bg-lime/5 border border-lime/15">
                        <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-lime" />
                            <span className="text-sm font-bold text-forest dark:text-lime">Typically respond within 2 hours</span>
                        </div>
                        <span className="w-px h-4 bg-border" />
                        <div className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-xs text-muted-foreground">Real humans, real answers</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CONTACT CARDS — Icon-driven, colorful ═══ */}
            <section className="relative z-10 -mt-4 mb-16">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {CONTACT_INFO.map((info) => (
                            <div
                                key={info.label}
                                className="glass-card border border-border rounded-2xl p-6 group hover:border-lime/30 transition-all duration-300 relative overflow-hidden"
                            >
                                {/* Gradient background on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-forest/10 dark:bg-lime/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <info.icon className="h-6 w-6 text-forest dark:text-lime" />
                                    </div>
                                    <h3 className="font-bold text-sm text-foreground mb-1">{info.label}</h3>
                                    {info.href ? (
                                        <a
                                            href={info.href}
                                            target={info.href.startsWith("http") ? "_blank" : undefined}
                                            rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                            className="text-forest dark:text-lime text-sm font-medium hover:underline block"
                                        >
                                            {info.value}
                                        </a>
                                    ) : (
                                        <p className="text-sm font-medium text-foreground">{info.value}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-2">{info.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ MAIN CONTENT — Split layout: Form + Sidebar ═══ */}
            <section className="max-w-6xl mx-auto px-6 pb-20">
                <div className="grid lg:grid-cols-5 gap-10">

                    {/* ── Contact Form — Left 3 cols ── */}
                    <div className="lg:col-span-3">
                        <div className="glass-card border border-border rounded-2xl p-8 md:p-10 relative overflow-hidden">
                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-lime/5 to-transparent rounded-bl-full" />

                            <div className="relative z-10">
                                <h2 className="text-2xl font-black text-foreground font-display mb-2">{t("contact.sendUsMessage")}</h2>
                                <p className="text-muted-foreground text-sm mb-8">
                                    Fill out the form below and we will get back to you as soon as possible. Every message is read by a real person.
                                </p>

                                {formState === "sent" ? (
                                    <div className="text-center py-16 space-y-5">
                                        <div className="w-20 h-20 rounded-full bg-lime/15 flex items-center justify-center mx-auto">
                                            <CheckCircle className="h-10 w-10 text-lime" />
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground font-display">{t("contact.messageSentTitle")}</h3>
                                        <p className="text-muted-foreground max-w-sm mx-auto">
                                            {t("contact.messageSentDesc")}
                                        </p>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime/10 border border-lime/20 text-sm">
                                            <Zap className="w-4 h-4 text-lime" />
                                            <span className="text-forest dark:text-lime font-medium">We typically respond within 2 hours</span>
                                        </div>
                                        <div className="pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => setFormState("idle")}
                                            >
                                                {t("contact.sendAnother")}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-foreground mb-1.5 block">
                                                    {t("contact.fullName")}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-muted/50 focus:ring-2 focus:ring-lime/30 focus:border-lime/50 outline-none transition text-foreground placeholder:text-muted-foreground/60"
                                                    placeholder={t("contact.fullNamePlaceholder")}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-foreground mb-1.5 block">
                                                    {t("contact.email")}
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-muted/50 focus:ring-2 focus:ring-lime/30 focus:border-lime/50 outline-none transition text-foreground placeholder:text-muted-foreground/60"
                                                    placeholder={t("contact.emailPlaceholder")}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-foreground mb-1.5 block">
                                                    {t("contact.department")}
                                                </label>
                                                <select
                                                    value={formData.department}
                                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-muted/50 focus:ring-2 focus:ring-lime/30 focus:border-lime/50 outline-none transition text-foreground"
                                                >
                                                    {DEPARTMENTS.map((d) => (
                                                        <option key={d.value} value={d.value}>{d.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-foreground mb-1.5 block">
                                                    {t("contact.subject")}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-muted/50 focus:ring-2 focus:ring-lime/30 focus:border-lime/50 outline-none transition text-foreground placeholder:text-muted-foreground/60"
                                                    placeholder={t("contact.subjectPlaceholder")}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                                                {t("contact.message")}
                                            </label>
                                            <textarea
                                                required
                                                rows={6}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full px-4 py-3.5 rounded-xl border border-border bg-muted/50 focus:ring-2 focus:ring-lime/30 focus:border-lime/50 outline-none transition resize-none text-foreground placeholder:text-muted-foreground/60"
                                                placeholder={t("contact.messagePlaceholder")}
                                            />
                                        </div>

                                        {formState === "error" && (
                                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-xl text-sm flex items-center gap-2">
                                                <Shield className="w-4 h-4 flex-shrink-0" />
                                                {t("contact.formError")}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2">
                                            <Button
                                                type="submit"
                                                variant="brand"
                                                size="lg"
                                                className="gap-2 px-8 shadow-[0_0_30px_rgba(200,230,62,0.2)] hover:shadow-[0_0_40px_rgba(200,230,62,0.3)]"
                                                disabled={formState === "sending"}
                                            >
                                                {formState === "sending" ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" /> {t("contact.sending")}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4" /> {t("contact.sendMessage")}
                                                    </>
                                                )}
                                            </Button>
                                            <span className="text-xs text-muted-foreground hidden sm:block">
                                                We never share your information
                                            </span>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Sidebar — Right 2 cols ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* MedAgent / Instant Help */}
                        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-forest/10 via-lime/5 to-transparent dark:from-lime/10 dark:via-forest/5 dark:to-transparent border border-forest/15 dark:border-lime/15">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-lime/10 rounded-full blur-2xl" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-forest/15 dark:bg-lime/15 flex items-center justify-center mb-4">
                                    <MessageSquare className="h-6 w-6 text-forest dark:text-lime" />
                                </div>
                                <h3 className="font-bold text-lg text-forest dark:text-lime mb-2">{t("contact.needInstantHelp")}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                    {t("contact.medAgentDesc")}
                                </p>
                                <div className="inline-flex items-center gap-1 text-sm text-forest dark:text-lime font-medium">
                                    {t("contact.medAgentHint")} <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Map placeholder */}
                        <div className="relative rounded-2xl overflow-hidden border border-border h-56">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2862.5!2d-77.0833!3d44.2167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDTCsDEzJzAwLjAiTiA3N8KwMDUnMDAuMCJX!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Mohawk Medibles Location"
                                className="absolute inset-0"
                            />
                        </div>

                        {/* Visit us card */}
                        <div className="glass-card border border-border rounded-2xl p-6">
                            <h3 className="font-bold text-foreground mb-4">Visit Our Store</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-forest/10 dark:bg-lime/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <MapPin className="w-4 h-4 text-forest dark:text-lime" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">45 Dundas St</p>
                                        <p className="text-xs text-muted-foreground">Deseronto, ON K0K 1X0</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-forest/10 dark:bg-lime/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Clock className="w-4 h-4 text-forest dark:text-lime" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Open Daily</p>
                                        <p className="text-xs text-muted-foreground">8:00 AM - 10:00 PM, 7 days a week</p>
                                    </div>
                                </div>
                            </div>
                            <a
                                href="https://www.google.com/maps/dir/?api=1&destination=45+Dundas+St+Deseronto+ON+K0K+1X0"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-forest/10 dark:bg-lime/10 text-forest dark:text-lime font-medium text-sm hover:bg-forest/15 dark:hover:bg-lime/15 transition-colors"
                            >
                                <MapPin className="w-4 h-4" /> Get Directions
                            </a>
                        </div>

                        {/* Trust signals */}
                        <div className="glass-card border border-border rounded-2xl p-6 space-y-4">
                            <h3 className="font-bold text-foreground">Why Customers Trust Us</h3>
                            {[
                                { icon: Shield, text: "Indigenous-owned & operated since Feb 2018" },
                                { icon: Zap, text: "Average response time under 2 hours" },
                                { icon: Heart, text: "47,000+ happy customers served" },
                            ].map((item) => (
                                <div key={item.text} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-lime/10 flex items-center justify-center flex-shrink-0">
                                        <item.icon className="w-4 h-4 text-lime" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
