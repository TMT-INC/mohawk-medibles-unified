"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Package } from "lucide-react";

export default function MixMatchCTA() {
    return (
        <section className="container mx-auto px-6 py-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-950/80 via-emerald-900/50 to-green-950/80 border border-green-500/10 p-8 md:p-14">
                {/* Background decorations — layered glows */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/15 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-lime-500/5 rounded-full blur-[120px]" />

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-bold tracking-wider uppercase mb-5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Custom Bundles
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
                            Build Your Own
                            <br />
                            <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-lime-400 bg-clip-text text-transparent">
                                Ounce
                            </span>
                        </h2>
                        <p className="text-white/60 text-sm md:text-base max-w-lg leading-relaxed mb-6">
                            Mix your favorite strains and save up to{" "}
                            <span className="text-green-400 font-bold text-lg">20% off</span>.
                            Choose from 40+ premium flower strains and build a custom bundle.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            {[
                                { label: "Half Oz", discount: "10% Off", icon: "1/2" },
                                { label: "Full Oz", discount: "15% Off", icon: "1" },
                                { label: "Double Oz", discount: "20% Off", icon: "2" },
                            ].map((tier) => (
                                <div
                                    key={tier.label}
                                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-sm hover:bg-white/[0.1] hover:border-green-500/20 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-500/20 text-green-400 text-xs font-black">
                                        {tier.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white/90 text-xs font-semibold">{tier.label}</span>
                                        <span className="text-green-400 text-[10px] font-bold">{tier.discount}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-3 shrink-0">
                        <Link
                            href="/mix-match"
                            className="group relative flex items-center gap-2.5 px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-400 text-black font-bold text-sm uppercase tracking-wider rounded-full transition-all duration-300 shadow-[0_8px_32px_-4px_rgba(34,197,94,0.4)] hover:shadow-[0_12px_48px_-4px_rgba(34,197,94,0.6)] hover:scale-105 active:scale-100"
                        >
                            {/* Shimmer overlay */}
                            <span className="absolute inset-0 rounded-full overflow-hidden">
                                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                            </span>
                            <Package className="w-4 h-4 relative" />
                            <span className="relative">Start Building</span>
                            <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <span className="text-white/30 text-[11px] font-medium">40+ strains available</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
