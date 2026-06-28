"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import Image from "next/image";
import {
  DollarSign, Users, MousePointerClick, TrendingUp, Copy, Check,
  Send, Clock, Gift, Headphones, Zap, ArrowRight, Loader2,
  Wallet, BarChart3, Link2, ChevronRight, Star, Target,
  Trophy, Flame, Calculator,
} from "lucide-react";

// Earnings calculator helper
const EARNING_EXAMPLES = [
  { followers: "1K", orders: 5, avgOrder: 80, monthly: 40 },
  { followers: "5K", orders: 25, avgOrder: 85, monthly: 212 },
  { followers: "10K", orders: 60, avgOrder: 90, monthly: 540 },
  { followers: "50K", orders: 200, avgOrder: 95, monthly: 1900 },
  { followers: "100K+", orders: 500, avgOrder: 100, monthly: 5000 },
];

const AFFILIATE_TIERS = [
  { name: "Starter", rate: "10%", min: "$0", color: "from-emerald-500 to-green-600", requirement: "All affiliates" },
  { name: "Rising Star", rate: "12%", min: "$500/mo", color: "from-blue-500 to-cyan-600", requirement: "$500+ monthly sales" },
  { name: "Pro", rate: "15%", min: "$2K/mo", color: "from-purple-500 to-violet-600", requirement: "$2,000+ monthly sales" },
  { name: "Elite", rate: "20%", min: "$5K/mo", color: "from-amber-500 to-orange-600", requirement: "$5,000+ monthly sales" },
];

export default function AffiliateClientContent() {
  const status = trpc.affiliate.getMyStatus.useQuery(undefined, { retry: false });

  // If user is an approved affiliate, show dashboard
  if (status.data?.affiliate && status.data.affiliate.status === "ACTIVE") {
    return <AffiliateDashboard />;
  }

  // If application is pending
  if (status.data?.application?.status === "PENDING") {
    return <ApplicationPending />;
  }

  // If application was rejected
  if (status.data?.application?.status === "REJECTED") {
    return <ApplicationRejected />;
  }

  // Show public landing + application form
  return <AffiliateLanding isLoggedIn={!status.isError} />;
}

function ApplicationPending() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <section className="relative bg-gradient-to-b from-[#1a1a22] to-[var(--background)] py-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-black mb-4">
            Application Under Review
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] mb-8">
            Your affiliate application has been submitted and is currently being reviewed
            by our team. We typically review applications within 24-48 hours.
          </p>
          <div className="bg-[var(--card)] rounded-2xl p-6 shadow-xl shadow-black/20">
            <p className="text-sm text-[var(--muted-foreground)]">
              You will receive an email notification once your application has been
              reviewed. In the meantime, feel free to browse our product catalog.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ApplicationRejected() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <section className="relative bg-gradient-to-b from-[#1a1a22] to-[var(--background)] py-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-black mb-4">
            Application Not Approved
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] mb-8">
            Unfortunately, your affiliate application was not approved at this time.
            Please contact our support team at{" "}
            <a href="mailto:support@mohawkmedibles.ca" className="text-[var(--lime)] hover:underline">
              support@mohawkmedibles.ca
            </a>{" "}
            for more information.
          </p>
        </div>
      </section>
    </div>
  );
}

function AffiliateLanding({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [calcOrders, setCalcOrders] = useState(30);
  const [calcAvgOrder, setCalcAvgOrder] = useState(85);
  const calcEarnings = (calcOrders * calcAvgOrder * 0.1);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#1a1a22] to-[var(--background)] py-28 md:py-36 px-4 overflow-hidden">
        {/* Hero background image */}
        <Image
            src="/assets/pages/affiliate-hero.jpg"
            alt=""
            fill
            className="object-cover opacity-20"
            priority
        />
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.12),transparent_60%)]" />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[120px]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-bold uppercase tracking-widest">
            <Zap className="w-4 h-4" />
            Affiliate Program
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-black mb-6 text-white leading-tight">
            EARN{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
              10% COMMISSION
            </span>
            <span className="block text-3xl md:text-5xl mt-2 text-zinc-300">On Every Single Sale</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Partner with Canada&apos;s leading Indigenous-owned cannabis dispensary.
            Share your unique link, and earn commission on every order -- it&apos;s that simple.
            Top affiliates earn $5,000+/month.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#apply"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25"
            >
              Start Earning Today <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-white/10 transition-colors"
            >
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-[var(--card)] rounded-2xl shadow-xl shadow-black/20 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Commission Rate", value: "10%", icon: DollarSign, desc: "Starting rate" },
            { label: "Cookie Window", value: "30 Days", icon: Clock, desc: "Attribution period" },
            { label: "Min. Payout", value: "$50", icon: Wallet, desc: "Low threshold" },
            { label: "Payout Frequency", value: "Monthly", icon: BarChart3, desc: "Reliable income" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - Visual Flow */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-black text-white mb-4">
              Three Simple Steps
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
              Start earning in minutes. No inventory, no risk, no limits.
            </p>
          </div>

          {/* Large Visual Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: "1",
                title: "Share",
                desc: "Share your unique affiliate link with your audience on social media, your website, or via direct message.",
                icon: Link2,
                color: "from-blue-500 to-cyan-500",
                glow: "bg-blue-500/10",
              },
              {
                step: "2",
                title: "They Buy",
                desc: "When someone clicks your link, a 30-day cookie tracks their purchase. Any order in that window counts.",
                icon: Target,
                color: "from-amber-500 to-orange-500",
                glow: "bg-amber-500/10",
              },
              {
                step: "3",
                title: "You Earn",
                desc: "Earn 10-20% commission on every sale. Payouts are sent monthly via e-Transfer or crypto. No cap on earnings.",
                icon: DollarSign,
                color: "from-green-500 to-emerald-500",
                glow: "bg-green-500/10",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative group">
                <div className="bg-[var(--card)] rounded-2xl p-8 shadow-lg shadow-black/10 h-full text-center hover:shadow-xl hover:shadow-black/20 transition-all">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-6xl font-black text-white/5 absolute top-4 right-6">{item.step}</div>
                  <h3 className="text-2xl font-heading font-black text-white mb-3">{item.title}</h3>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 z-10 w-8 h-8 rounded-full bg-amber-500/20 items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-amber-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.03] to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
              <Calculator className="w-8 h-8 inline-block mr-3 text-amber-400" />
              Earnings Calculator
            </h2>
            <p className="text-[var(--muted-foreground)]">See how much you could earn each month.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Interactive Calculator */}
            <div className="bg-[var(--card)] rounded-2xl p-8 shadow-xl shadow-black/20">
              <h3 className="text-lg font-bold text-white mb-6">Customize Your Projection</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-[var(--muted-foreground)]">Orders per month from your referrals</label>
                    <span className="text-amber-400 font-bold">{calcOrders}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={200}
                    value={calcOrders}
                    onChange={(e) => setCalcOrders(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-zinc-600 mt-1">
                    <span>1</span><span>50</span><span>100</span><span>150</span><span>200</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-[var(--muted-foreground)]">Average order value</label>
                    <span className="text-amber-400 font-bold">${calcAvgOrder}</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={250}
                    step={5}
                    value={calcAvgOrder}
                    onChange={(e) => setCalcAvgOrder(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-zinc-600 mt-1">
                    <span>$30</span><span>$100</span><span>$175</span><span>$250</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">Your Estimated Monthly Earnings</p>
                    <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                      ${calcEarnings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-2">
                      = ${(calcEarnings * 12).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/year at 10% commission
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Earnings Table */}
            <div className="bg-[var(--card)] rounded-2xl p-8 shadow-xl shadow-black/20">
              <h3 className="text-lg font-bold text-white mb-6">Example Earnings by Audience Size</h3>
              <div className="space-y-3">
                {EARNING_EXAMPLES.map((ex) => (
                  <div key={ex.followers} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span className="text-white font-semibold">{ex.followers} followers</span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        ~{ex.orders} orders/mo at ${ex.avgOrder} avg
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-green-400">${ex.monthly.toLocaleString()}</span>
                      <p className="text-xs text-[var(--muted-foreground)]">/month</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Progression */}
      <section className="max-w-5xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
            Earn More as You Grow
          </h2>
          <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
            Top-performing affiliates unlock higher commission rates. The more you sell, the more you earn per sale.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {AFFILIATE_TIERS.map((tier, i) => (
            <div key={tier.name} className="relative group">
              <div className="bg-[var(--card)] rounded-2xl p-6 shadow-lg shadow-black/10 h-full hover:shadow-xl hover:shadow-black/20 transition-all hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {i === 0 ? <Star className="w-6 h-6 text-white" /> :
                   i === 1 ? <TrendingUp className="w-6 h-6 text-white" /> :
                   i === 2 ? <Flame className="w-6 h-6 text-white" /> :
                   <Trophy className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">{tier.rate}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{tier.requirement}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-[2px] bg-gradient-to-r from-amber-500/30 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
              Why Partner With Us?
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
              We provide everything you need to succeed as an affiliate.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: DollarSign,
                title: "Passive Income",
                desc: "Earn 10-20% on every sale from your referrals. No cap on earnings.",
                color: "from-green-500 to-emerald-600",
              },
              {
                icon: BarChart3,
                title: "Real-Time Tracking",
                desc: "Monitor clicks, conversions, and earnings from your personal dashboard.",
                color: "from-blue-500 to-cyan-600",
              },
              {
                icon: Headphones,
                title: "Dedicated Support",
                desc: "Get priority access to our affiliate management team for any questions.",
                color: "from-purple-500 to-violet-600",
              },
              {
                icon: Gift,
                title: "Exclusive Promos",
                desc: "Access exclusive discount codes and promotional materials for your audience.",
                color: "from-amber-500 to-orange-600",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="bg-[var(--card)] rounded-2xl p-6 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 rounded-2xl p-8 md:p-12 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-amber-500/20 rounded-full text-amber-400 text-sm font-bold">
            <Users className="w-4 h-4" /> Growing Network
          </div>
          <h3 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
            Join 250+ Active Affiliates
          </h3>
          <p className="text-[var(--muted-foreground)] max-w-xl mx-auto mb-8">
            Content creators, influencers, bloggers, and cannabis enthusiasts are already earning
            passive income with our affiliate program. Average affiliates earn $300+/month.
          </p>
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
            <div>
              <div className="text-3xl font-black text-amber-400">250+</div>
              <div className="text-xs text-[var(--muted-foreground)]">Affiliates</div>
            </div>
            <div>
              <div className="text-3xl font-black text-green-400">$180K+</div>
              <div className="text-xs text-[var(--muted-foreground)]">Paid Out</div>
            </div>
            <div>
              <div className="text-3xl font-black text-orange-400">4.9/5</div>
              <div className="text-xs text-[var(--muted-foreground)]">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="max-w-2xl mx-auto px-4 py-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
            Apply to Become an Affiliate
          </h2>
          <p className="text-[var(--muted-foreground)]">
            {isLoggedIn
              ? "Fill out the form below to get started. Approval takes 24-48 hours."
              : "You need to be signed in to apply."}
          </p>
        </div>
        {isLoggedIn ? (
          <AffiliateApplicationForm />
        ) : (
          <div className="text-center">
            <a
              href="/login?redirect=/affiliate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/25"
            >
              Sign In to Apply <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

function AffiliateApplicationForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    socialMedia: "",
    audience: "",
    howPromote: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const apply = trpc.affiliate.submitApplication.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <div className="bg-[var(--card)] rounded-2xl p-8 shadow-xl shadow-black/20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Application Submitted!</h3>
        <p className="text-[var(--muted-foreground)]">
          We&apos;ll review your application within 24-48 hours and notify you via email.
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    apply.mutate({
      name: form.name,
      email: form.email,
      website: form.website || undefined,
      socialMedia: form.socialMedia || undefined,
      audience: form.audience || undefined,
      howPromote: form.howPromote || undefined,
    });
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all";

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--card)] rounded-2xl p-8 shadow-xl shadow-black/20 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="John Smith"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
            Email *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="john@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
          Website or Blog URL
        </label>
        <input
          type="url"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          placeholder="https://yoursite.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
          Social Media Links
        </label>
        <input
          type="text"
          value={form.socialMedia}
          onChange={(e) => setForm({ ...form, socialMedia: e.target.value })}
          placeholder="Instagram, TikTok, YouTube URLs"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
          Audience Size
        </label>
        <select
          value={form.audience}
          onChange={(e) => setForm({ ...form, audience: e.target.value })}
          className={`${inputClass} appearance-none`}
        >
          <option value="">Select audience size</option>
          <option value="under-1k">Under 1,000</option>
          <option value="1k-5k">1,000 - 5,000</option>
          <option value="5k-10k">5,000 - 10,000</option>
          <option value="10k-50k">10,000 - 50,000</option>
          <option value="50k-100k">50,000 - 100,000</option>
          <option value="100k+">100,000+</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
          How Will You Promote Mohawk Medibles?
        </label>
        <textarea
          value={form.howPromote}
          onChange={(e) => setForm({ ...form, howPromote: e.target.value })}
          placeholder="Tell us about your promotional strategy..."
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      {apply.error && (
        <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">
          {apply.error.message}
        </div>
      )}

      <button
        type="submit"
        disabled={apply.isPending || !form.name || !form.email}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
      >
        {apply.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Submit Application
          </>
        )}
      </button>
    </form>
  );
}

function AffiliateDashboard() {
  const stats = trpc.affiliate.getMyStats.useQuery();
  const conversions = trpc.affiliate.getMyConversions.useQuery({ limit: 20 });
  const payouts = trpc.affiliate.getMyPayouts.useQuery({ limit: 20 });

  const [copied, setCopied] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"ETRANSFER" | "CRYPTO">("ETRANSFER");

  const requestPayout = trpc.affiliate.requestPayout.useMutation({
    onSuccess: () => {
      payouts.refetch();
      stats.refetch();
    },
  });

  const affiliateLink = stats.data
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://mohawkmedibles.ca"}/?ref=${stats.data.code}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (stats.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  const s = stats.data;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#1a1a22] to-[var(--background)] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-black text-white">
                Affiliate Dashboard
              </h1>
              <p className="text-sm text-[var(--muted-foreground)]">
                Code: <span className="text-amber-400 font-mono font-bold">{s?.code}</span>
                {" "}&middot;{" "}
                {s?.commissionRate}% commission
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-2 space-y-8 pb-24">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Earnings", value: `$${(s?.totalEarnings ?? 0).toFixed(2)}`, icon: DollarSign, color: "from-green-500 to-emerald-600" },
            { label: "Pending Commission", value: `$${(s?.pendingCommission ?? 0).toFixed(2)}`, icon: Clock, color: "from-amber-500 to-orange-600" },
            { label: "Total Referrals", value: String(s?.totalReferrals ?? 0), icon: Users, color: "from-purple-500 to-violet-600" },
            { label: "Total Clicks", value: String(s?.totalClicks ?? 0), icon: MousePointerClick, color: "from-blue-500 to-cyan-600" },
            { label: "Conversion Rate", value: `${s?.conversionRate ?? "0.0"}%`, icon: TrendingUp, color: "from-pink-500 to-rose-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--card)] rounded-2xl p-5 shadow-lg shadow-black/10"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Affiliate Link */}
        <div className="bg-[var(--card)] rounded-2xl p-6 shadow-lg shadow-black/10">
          <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
            Your Affiliate Link
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 bg-white/5 rounded-xl text-white font-mono text-sm truncate">
              {affiliateLink}
            </div>
            <button
              onClick={copyLink}
              className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 font-bold text-sm shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Request Payout */}
        <div className="bg-[var(--card)] rounded-2xl p-6 shadow-lg shadow-black/10">
          <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
            Request Payout
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value as "ETRANSFER" | "CRYPTO")}
              className="px-4 py-3 bg-white/5 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="ETRANSFER">Interac e-Transfer</option>
              <option value="CRYPTO">Cryptocurrency</option>
            </select>
            <button
              onClick={() => requestPayout.mutate({ method: payoutMethod })}
              disabled={requestPayout.isPending}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {requestPayout.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              Request Payout (min $50)
            </button>
          </div>
          {requestPayout.error && (
            <p className="mt-3 text-sm text-red-400">{requestPayout.error.message}</p>
          )}
          {requestPayout.isSuccess && (
            <p className="mt-3 text-sm text-green-400">Payout request submitted successfully!</p>
          )}
        </div>

        {/* Recent Conversions */}
        <div className="bg-[var(--card)] rounded-2xl shadow-lg shadow-black/10 overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
              Recent Conversions
            </h3>
          </div>
          {conversions.data && conversions.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Commission</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {conversions.data.map((c) => (
                    <tr key={c.id} className="text-white hover:bg-white/[0.02]">
                      <td className="px-6 py-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-3 font-mono text-xs">{c.orderId.slice(0, 12)}...</td>
                      <td className="px-6 py-3">${c.orderTotal.toFixed(2)}</td>
                      <td className="px-6 py-3 text-green-400 font-bold">${c.commission.toFixed(2)}</td>
                      <td className="px-6 py-3">
                        <ConversionBadge status={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-[var(--muted-foreground)]">
              No conversions yet. Start sharing your affiliate link!
            </div>
          )}
        </div>

        {/* Payout History */}
        <div className="bg-[var(--card)] rounded-2xl shadow-lg shadow-black/10 overflow-hidden">
          <div className="px-6 py-4">
            <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
              Payout History
            </h3>
          </div>
          {payouts.data && payouts.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Method</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payouts.data.map((p) => (
                    <tr key={p.id} className="text-white hover:bg-white/[0.02]">
                      <td className="px-6 py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-3 font-bold">${p.amount.toFixed(2)}</td>
                      <td className="px-6 py-3">
                        {p.method === "ETRANSFER" ? "e-Transfer" : "Crypto"}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          p.status === "COMPLETED"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {p.status === "COMPLETED" ? "Completed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-[var(--muted-foreground)]">
              No payouts yet. Earn at least $50 in approved commissions to request a payout.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversionBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400",
    APPROVED: "bg-green-500/10 text-green-400",
    PAID: "bg-blue-500/10 text-blue-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${styles[status] || styles.PENDING}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
