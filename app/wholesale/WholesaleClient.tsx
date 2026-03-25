"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Building2, TrendingUp, Truck, UserCheck, Crown,
  Send, CheckCircle, Clock, XCircle, Package,
  DollarSign, CreditCard, FileText,
} from "lucide-react";

const TIERS = [
  { name: "Bronze", discount: "10%", min: "$500+/mo", color: "from-amber-700 to-amber-900", border: "border-amber-700/30" },
  { name: "Silver", discount: "15%", min: "$2K+/mo", color: "from-gray-400 to-gray-600", border: "border-gray-400/30" },
  { name: "Gold", discount: "20%", min: "$5K+/mo", color: "from-yellow-500 to-yellow-700", border: "border-yellow-500/30" },
  { name: "Platinum", discount: "25%", min: "$10K+/mo", color: "from-purple-400 to-purple-700", border: "border-purple-400/30" },
];

const BENEFITS = [
  { icon: TrendingUp, title: "Volume Discounts", desc: "Save 10-25% on every order based on your tier" },
  { icon: CreditCard, title: "Net Terms", desc: "Qualified accounts get net 15-30 day payment terms" },
  { icon: UserCheck, title: "Dedicated Account Manager", desc: "Personal support for all your wholesale needs" },
  { icon: Truck, title: "Priority Shipping", desc: "Your orders ship first with expedited fulfillment" },
];

const BUSINESS_TYPES = [
  { value: "DISPENSARY", label: "Dispensary" },
  { value: "DELIVERY", label: "Delivery Service" },
  { value: "RETAILER", label: "Retailer" },
  { value: "OTHER", label: "Other" },
] as const;

interface ApplicationForm {
  businessName: string;
  businessType: "DISPENSARY" | "DELIVERY" | "RETAILER" | "OTHER";
  taxId: string;
  website: string;
  phone: string;
  email: string;
  estimatedMonthlyVolume: string;
  message: string;
}

const defaultForm: ApplicationForm = {
  businessName: "",
  businessType: "DISPENSARY",
  taxId: "",
  website: "",
  phone: "",
  email: "",
  estimatedMonthlyVolume: "",
  message: "",
};

function WholesaleDashboard() {
  const accountQuery = trpc.wholesale.getMyAccount.useQuery();
  const ordersQuery = trpc.wholesale.getMyOrders.useQuery();
  const utils = trpc.useUtils();
  const [orderItems, setOrderItems] = useState<Array<{ productId: number; name: string; sku: string; quantity: number; unitPrice: number }>>([]);
  const [orderNotes, setOrderNotes] = useState("");

  const placeOrder = trpc.wholesale.placeOrder.useMutation({
    onSuccess: () => {
      utils.wholesale.getMyOrders.invalidate();
      setOrderItems([]);
      setOrderNotes("");
    },
  });

  const account = accountQuery.data?.account;
  if (!account) return null;

  const orders = ordersQuery.data || [];
  const outstanding = orders.filter((o) => o.paymentStatus === "UNPAID" || o.paymentStatus === "OVERDUE");

  return (
    <div className="space-y-8">
      {/* Account Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-zinc-400">Tier</span>
          </div>
          <p className="text-2xl font-bold text-white">{account.tier}</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <span className="text-sm text-zinc-400">Discount</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{account.discountPercent}%</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-zinc-400">Credit Limit</span>
          </div>
          <p className="text-2xl font-bold text-white">${account.creditLimit.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-zinc-400">Net Terms</span>
          </div>
          <p className="text-2xl font-bold text-white">{account.netTerms > 0 ? `Net ${account.netTerms}` : "Due on Order"}</p>
        </div>
      </div>

      {/* Quick Order */}
      <div className="bg-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-green-400" /> Quick Wholesale Order
        </h3>
        <div className="space-y-3">
          {orderItems.map((item, i) => (
            <div key={i} className="grid grid-cols-5 gap-3">
              <input
                placeholder="Product name"
                value={item.name}
                onChange={(e) => {
                  const updated = [...orderItems];
                  updated[i] = { ...updated[i], name: e.target.value };
                  setOrderItems(updated);
                }}
                className="col-span-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
              />
              <input
                placeholder="SKU"
                value={item.sku}
                onChange={(e) => {
                  const updated = [...orderItems];
                  updated[i] = { ...updated[i], sku: e.target.value };
                  setOrderItems(updated);
                }}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity || ""}
                onChange={(e) => {
                  const updated = [...orderItems];
                  updated[i] = { ...updated[i], quantity: parseInt(e.target.value) || 0 };
                  setOrderItems(updated);
                }}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Price"
                  value={item.unitPrice || ""}
                  onChange={(e) => {
                    const updated = [...orderItems];
                    updated[i] = { ...updated[i], unitPrice: parseFloat(e.target.value) || 0 };
                    setOrderItems(updated);
                  }}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                />
                <button
                  onClick={() => setOrderItems(orderItems.filter((_, idx) => idx !== i))}
                  className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 text-sm"
                >
                  X
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => setOrderItems([...orderItems, { productId: 0, name: "", sku: "", quantity: 1, unitPrice: 0 }])}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/10"
          >
            + Add Item
          </button>
          <textarea
            placeholder="Order notes (optional)"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white mt-3"
            rows={2}
          />
          {orderItems.length > 0 && (
            <button
              onClick={() => placeOrder.mutate({ items: orderItems, notes: orderNotes })}
              disabled={placeOrder.isPending}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
            >
              {placeOrder.isPending ? "Placing Order..." : "Place Wholesale Order"}
            </button>
          )}
        </div>
      </div>

      {/* Outstanding Invoices */}
      {outstanding.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-400" /> Outstanding Invoices
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 border-b border-white/5">
                  <th className="text-left py-2 pr-4">Order #</th>
                  <th className="text-left py-2 pr-4">Total</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {outstanding.map((o) => (
                  <tr key={o.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-white font-mono">{o.orderNumber}</td>
                    <td className="py-3 pr-4 text-white">${o.total.toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${o.paymentStatus === "OVERDUE" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-400">
                      {o.paymentDueDate ? new Date(o.paymentDueDate).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order History */}
      <div className="bg-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-green-400" /> Order History
        </h3>
        {orders.length === 0 ? (
          <p className="text-zinc-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 border-b border-white/5">
                  <th className="text-left py-2 pr-4">Order #</th>
                  <th className="text-left py-2 pr-4">Date</th>
                  <th className="text-left py-2 pr-4">Subtotal</th>
                  <th className="text-left py-2 pr-4">Discount</th>
                  <th className="text-left py-2 pr-4">Total</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2">Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-white font-mono">{o.orderNumber}</td>
                    <td className="py-3 pr-4 text-zinc-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 text-white">${o.subtotal.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-green-400">-${o.discount.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-white font-semibold">${o.total.toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400">{o.status}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        o.paymentStatus === "PAID" ? "bg-green-500/10 text-green-400" :
                        o.paymentStatus === "OVERDUE" ? "bg-red-500/10 text-red-400" :
                        "bg-amber-500/10 text-amber-400"
                      }`}>{o.paymentStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WholesaleClient() {
  const [form, setForm] = useState<ApplicationForm>(defaultForm);
  const [submitted, setSubmitted] = useState(false);

  const accountQuery = trpc.wholesale.getMyAccount.useQuery(undefined, {
    retry: false,
  });

  const submitApp = trpc.wholesale.submitApplication.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const account = accountQuery.data?.account;
  const application = accountQuery.data?.application;
  const isLoggedIn = !accountQuery.isError;

  // If user is approved wholesale, show dashboard
  if (account?.approved) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-2">Wholesale Dashboard</h1>
            <p className="text-zinc-400">Welcome back, {account.businessName}</p>
          </div>
          <WholesaleDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/20" />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm mb-6">
            <Building2 className="h-4 w-4" /> B2B Wholesale Program
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            Wholesale Program
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Partner with Mohawk Medibles for premium cannabis products at wholesale pricing.
            Volume discounts, net terms, and dedicated support.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-white text-center mb-12">Why Partner With Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-white/5 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
              <b.icon className="h-8 w-8 text-green-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">{b.title}</h3>
              <p className="text-sm text-zinc-400">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tier Breakdown */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-white text-center mb-12">Wholesale Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map((tier) => (
            <div key={tier.name} className={`relative bg-white/5 rounded-2xl p-6 ${tier.border} border overflow-hidden`}>
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tier.color}`} />
              <h3 className="text-xl font-bold text-white mt-2 mb-1">{tier.name}</h3>
              <p className="text-3xl font-black text-green-400 mb-1">{tier.discount}</p>
              <p className="text-sm text-zinc-400">off all products</p>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-sm text-zinc-400">Minimum: <span className="text-white font-semibold">{tier.min}</span></p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Application Form */}
      <section className="max-w-3xl mx-auto px-4 py-16" id="apply">
        <div className="bg-white/5 rounded-2xl p-8">
          <h2 className="text-2xl font-black text-white mb-6">Apply for Wholesale</h2>

          {submitted || application?.status === "PENDING" ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Application Under Review</h3>
              <p className="text-zinc-400">We&apos;ll review your application and get back to you within 1-2 business days.</p>
            </div>
          ) : application?.status === "REJECTED" ? (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Application Not Approved</h3>
              <p className="text-zinc-400">Unfortunately your application was not approved at this time. Please contact us for details.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Business Name *</label>
                  <input
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                    placeholder="Your Business Name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Business Type *</label>
                  <select
                    value={form.businessType}
                    onChange={(e) => setForm({ ...form, businessType: e.target.value as ApplicationForm["businessType"] })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                  >
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Tax ID</label>
                  <input
                    value={form.taxId}
                    onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                    placeholder="Business tax ID"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Website</label>
                  <input
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                    placeholder="https://yourbusiness.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Phone *</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                    placeholder="wholesale@yourbusiness.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Estimated Monthly Volume</label>
                <input
                  value={form.estimatedMonthlyVolume}
                  onChange={(e) => setForm({ ...form, estimatedMonthlyVolume: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                  placeholder="e.g. $2,000 - $5,000"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                  rows={4}
                  placeholder="Tell us about your business and what you're looking for..."
                />
              </div>

              {submitApp.error && (
                <p className="text-red-400 text-sm">{submitApp.error.message}</p>
              )}

              <button
                onClick={() => {
                  if (!form.businessName || !form.phone || !form.email) return;
                  submitApp.mutate(form);
                }}
                disabled={submitApp.isPending || !isLoggedIn}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                {submitApp.isPending ? "Submitting..." : "Submit Application"}
              </button>

              {!isLoggedIn && (
                <p className="text-amber-400 text-sm text-center">You must be logged in to submit an application.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
