"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  DollarSign, TrendingUp, TrendingDown, Package, Receipt,
  Plus, Trash2, Edit3, X, Check, RefreshCw, ArrowUpDown,
  ChevronDown, ChevronUp, Calendar,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);
}

function fmtPct(n: number) {
  return n.toFixed(1) + "%";
}

const EXPENSE_CATEGORIES = [
  "inventory", "shipping", "rent", "utilities", "wages",
  "marketing", "packaging", "equipment", "other",
];

const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom" },
] as const;

type Range = (typeof RANGE_OPTIONS)[number]["value"];

// ─── Page Component ─────────────────────────────────────────

export default function AccountingPage() {
  const [range, setRange] = useState<Range>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [productSort, setProductSort] = useState<"profit" | "revenue" | "margin">("profit");
  const [productSortDir, setProductSortDir] = useState<"asc" | "desc">("desc");

  const rangeInput = { range, customStart: customStart || undefined, customEnd: customEnd || undefined };

  const utils = trpc.useUtils();
  const dashboard = trpc.accounting.dashboard.useQuery(rangeInput);
  const expensesList = trpc.accounting.expensesList.useQuery({
    ...rangeInput,
    category: expenseCategory || undefined,
    limit: 100,
  });
  const profitByProduct = trpc.accounting.profitByProduct.useQuery(rangeInput);
  const profitByCategory = trpc.accounting.profitByCategory.useQuery(rangeInput);
  const monthlySummary = trpc.accounting.monthlySummary.useQuery();
  const cashFlow = trpc.accounting.cashFlow.useQuery({ days: 30 });

  const createExpense = trpc.accounting.createExpense.useMutation({
    onSuccess: () => {
      utils.accounting.expensesList.invalidate();
      utils.accounting.dashboard.invalidate();
      utils.accounting.monthlySummary.invalidate();
      utils.accounting.cashFlow.invalidate();
      setShowAddExpense(false);
    },
  });

  const updateExpense = trpc.accounting.updateExpense.useMutation({
    onSuccess: () => {
      utils.accounting.expensesList.invalidate();
      utils.accounting.dashboard.invalidate();
      utils.accounting.monthlySummary.invalidate();
      utils.accounting.cashFlow.invalidate();
      setEditingId(null);
    },
  });

  const deleteExpense = trpc.accounting.deleteExpense.useMutation({
    onSuccess: () => {
      utils.accounting.expensesList.invalidate();
      utils.accounting.dashboard.invalidate();
      utils.accounting.monthlySummary.invalidate();
      utils.accounting.cashFlow.invalidate();
    },
  });

  const d = dashboard.data;

  // Sort products
  const sortedProducts = [...(profitByProduct.data ?? [])].sort((a, b) => {
    const mul = productSortDir === "desc" ? -1 : 1;
    return mul * (a[productSort] - b[productSort]);
  });

  // Monthly summary — last 6 months
  const recentMonths = (monthlySummary.data ?? []).slice(-6);

  // Cash flow max for bar scaling
  const cfMax = Math.max(1, ...(cashFlow.data ?? []).map((d) => Math.max(d.inflow, d.outflow)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            Accounting & Profit Tracking
          </h1>
          <p className="text-zinc-500 mt-1">True profit visibility — revenue minus real costs</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRange(opt.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              range === opt.value
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-transparent"
            }`}
          >
            {opt.label}
          </button>
        ))}
        {range === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <Calendar className="h-4 w-4 text-zinc-500" />
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
            />
            <span className="text-zinc-500">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
            />
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          label="Revenue"
          value={d ? fmt(d.revenue) : "..."}
          sub={d ? `${d.orderCount} orders` : ""}
          gradient="from-green-500/20 to-emerald-500/10"
          textColor="text-green-400"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          label="COGS"
          value={d ? fmt(d.cogs) : "..."}
          sub="Cost of goods"
          gradient="from-amber-500/20 to-orange-500/10"
          textColor="text-amber-400"
          icon={<Package className="h-5 w-5" />}
        />
        <KPICard
          label="Gross Profit"
          value={d ? fmt(d.grossProfit) : "..."}
          sub={d ? `${fmtPct(d.revenue > 0 ? (d.grossProfit / d.revenue) * 100 : 0)} margin` : ""}
          gradient="from-blue-500/20 to-indigo-500/10"
          textColor="text-blue-400"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KPICard
          label="Expenses"
          value={d ? fmt(d.totalExpenses) : "..."}
          sub={d ? `${Object.keys(d.expensesByCategory).length} categories` : ""}
          gradient="from-red-500/20 to-rose-500/10"
          textColor="text-red-400"
          icon={<Receipt className="h-5 w-5" />}
        />
        <KPICard
          label="Net Profit"
          value={d ? fmt(d.netProfit) : "..."}
          sub={d && d.netProfit >= 0 ? "Profitable" : "Loss"}
          gradient={d && d.netProfit >= 0 ? "from-lime-500/20 to-green-500/10" : "from-red-600/20 to-red-500/10"}
          textColor={d && d.netProfit >= 0 ? "text-lime-400" : "text-red-400"}
          icon={d && d.netProfit >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          large
        />
        <KPICard
          label="Profit Margin"
          value={d ? fmtPct(d.profitMargin) : "..."}
          sub="Net / Revenue"
          gradient={d && d.profitMargin >= 0 ? "from-emerald-500/20 to-teal-500/10" : "from-red-500/20 to-rose-500/10"}
          textColor={d && d.profitMargin >= 0 ? "text-emerald-400" : "text-red-400"}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Revenue vs Expenses — CSS Bar Chart */}
      <section className="bg-[#0f0f18] rounded-2xl p-6 border border-white/5">
        <h2 className="text-lg font-semibold mb-4">Cash Flow — Last 30 Days</h2>
        {cashFlow.isLoading ? (
          <div className="text-zinc-500 text-sm">Loading...</div>
        ) : (
          <div className="flex items-end gap-[2px] h-48 overflow-x-auto">
            {(cashFlow.data ?? []).map((day) => (
              <div key={day.date} className="flex-1 min-w-[8px] flex flex-col items-center gap-0.5 group relative">
                {/* Inflow bar */}
                <div
                  className="w-full bg-green-500/60 rounded-t-sm transition-all"
                  style={{ height: `${(day.inflow / cfMax) * 100}%`, minHeight: day.inflow > 0 ? "2px" : "0" }}
                />
                {/* Outflow bar (stacked below) */}
                <div
                  className="w-full bg-red-500/60 rounded-b-sm transition-all"
                  style={{ height: `${(day.outflow / cfMax) * 100}%`, minHeight: day.outflow > 0 ? "2px" : "0" }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-xs z-20 whitespace-nowrap shadow-xl">
                  <div className="font-medium text-white">{day.date}</div>
                  <div className="text-green-400">In: {fmt(day.inflow)}</div>
                  <div className="text-red-400">Out: {fmt(day.outflow)}</div>
                  <div className={day.net >= 0 ? "text-lime-400" : "text-red-400"}>Net: {fmt(day.net)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500/60" /> Revenue</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500/60" /> Expenses</div>
        </div>
      </section>

      {/* Monthly P&L Table */}
      <section className="bg-[#0f0f18] rounded-2xl p-6 border border-white/5 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Monthly P&L — Last 6 Months</h2>
        {monthlySummary.isLoading ? (
          <div className="text-zinc-500 text-sm">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase border-b border-white/5">
                <th className="text-left py-3 pr-4 font-medium">Line Item</th>
                {recentMonths.map((m) => (
                  <th key={m.month} className="text-right py-3 px-3 font-medium">{m.month}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <PLRow label="Revenue" values={recentMonths.map((m) => m.revenue)} color="text-green-400" bold />
              <PLRow label="COGS" values={recentMonths.map((m) => -m.cogs)} color="text-amber-400" />
              <PLRow label="Gross Profit" values={recentMonths.map((m) => m.grossProfit)} color="text-blue-400" bold border />
              {EXPENSE_CATEGORIES.map((cat) => (
                <PLRow
                  key={cat}
                  label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                  values={recentMonths.map((m) => -(m.expenses[cat] ?? 0))}
                  color="text-red-400/70"
                />
              ))}
              <PLRow label="Total Expenses" values={recentMonths.map((m) => -m.totalExpenses)} color="text-red-400" bold />
              <PLRow label="Net Profit" values={recentMonths.map((m) => m.netProfit)} color="dynamic" bold border />
            </tbody>
          </table>
        )}
      </section>

      {/* Expense Tracker */}
      <section className="bg-[#0f0f18] rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Expense Tracker</h2>
          <div className="flex items-center gap-3">
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" /> Add Expense
            </button>
          </div>
        </div>

        {/* Add Expense Form */}
        {showAddExpense && (
          <ExpenseForm
            onSubmit={(data) => createExpense.mutate(data)}
            onCancel={() => setShowAddExpense(false)}
            loading={createExpense.isPending}
          />
        )}

        {/* Expenses List */}
        {expensesList.isLoading ? (
          <div className="text-zinc-500 text-sm">Loading...</div>
        ) : (
          <div className="space-y-2">
            {(expensesList.data?.expenses ?? []).map((exp) => (
              <div key={exp.id}>
                {editingId === exp.id ? (
                  <ExpenseForm
                    initialData={exp}
                    onSubmit={(data) => updateExpense.mutate({ id: exp.id, ...data })}
                    onCancel={() => setEditingId(null)}
                    loading={updateExpense.isPending}
                  />
                ) : (
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${categoryColor(exp.category)}`}>
                        {exp.category}
                      </span>
                      <div className="flex-1">
                        <span className="text-white font-medium">{exp.description}</span>
                        {exp.vendor && <span className="text-zinc-500 text-xs ml-2">({exp.vendor})</span>}
                        {exp.recurring && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-400">
                            <RefreshCw className="h-3 w-3" /> {exp.recurringFrequency}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-red-400 font-semibold">{fmt(exp.amount)}</span>
                      <span className="text-zinc-500 text-xs">
                        {new Date(exp.date).toLocaleDateString("en-CA")}
                      </span>
                      <button
                        onClick={() => setEditingId(exp.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this expense?")) deleteExpense.mutate({ id: exp.id }); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {(expensesList.data?.expenses ?? []).length === 0 && (
              <div className="text-center py-12 text-zinc-500">No expenses found. Add your first expense above.</div>
            )}
          </div>
        )}
      </section>

      {/* Profit by Product */}
      <section className="bg-[#0f0f18] rounded-2xl p-6 border border-white/5 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Profit by Product</h2>
        {profitByProduct.isLoading ? (
          <div className="text-zinc-500 text-sm">Loading...</div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No product data for this period.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase border-b border-white/5">
                <th className="text-left py-3 pr-4 font-medium">Product</th>
                <th className="text-right py-3 px-3 font-medium">Units Sold</th>
                <SortableHeader label="Revenue" field="revenue" current={productSort} dir={productSortDir} onSort={(f) => { if (productSort === f) setProductSortDir(productSortDir === "desc" ? "asc" : "desc"); else { setProductSort(f); setProductSortDir("desc"); } }} />
                <th className="text-right py-3 px-3 font-medium">COGS</th>
                <SortableHeader label="Profit" field="profit" current={productSort} dir={productSortDir} onSort={(f) => { if (productSort === f) setProductSortDir(productSortDir === "desc" ? "asc" : "desc"); else { setProductSort(f); setProductSortDir("desc"); } }} />
                <SortableHeader label="Margin" field="margin" current={productSort} dir={productSortDir} onSort={(f) => { if (productSort === f) setProductSortDir(productSortDir === "desc" ? "asc" : "desc"); else { setProductSort(f); setProductSortDir("desc"); } }} />
              </tr>
            </thead>
            <tbody>
              {sortedProducts.slice(0, 50).map((p) => (
                <tr key={p.productId} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-3 pr-4 text-white font-medium max-w-[300px] truncate">{p.name}</td>
                  <td className="py-3 px-3 text-right text-zinc-300">{p.unitsSold}</td>
                  <td className="py-3 px-3 text-right text-green-400">{fmt(p.revenue)}</td>
                  <td className="py-3 px-3 text-right text-amber-400">{fmt(p.cogs)}</td>
                  <td className={`py-3 px-3 text-right font-semibold ${p.profit >= 0 ? "text-lime-400" : "text-red-400"}`}>
                    {fmt(p.profit)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${marginColor(p.margin)}`}>
                      {fmtPct(p.margin)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Profit by Category */}
      <section className="bg-[#0f0f18] rounded-2xl p-6 border border-white/5">
        <h2 className="text-lg font-semibold mb-4">Profit by Category</h2>
        {profitByCategory.isLoading ? (
          <div className="text-zinc-500 text-sm">Loading...</div>
        ) : (profitByCategory.data ?? []).length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No category data for this period.</div>
        ) : (
          <div className="grid gap-3">
            {(profitByCategory.data ?? []).map((c) => {
              const barWidth = Math.max(2, (c.revenue / Math.max(1, ...(profitByCategory.data ?? []).map((x) => x.revenue))) * 100);
              return (
                <div key={c.category} className="flex items-center gap-4 py-3 px-4 rounded-xl bg-white/[0.02]">
                  <div className="w-40 font-medium text-white truncate">{c.category}</div>
                  <div className="flex-1 relative h-8 bg-white/[0.03] rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500/40 to-green-500/10 rounded-lg"
                      style={{ width: `${barWidth}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-3 text-xs">
                      <span className="text-green-400 font-medium">{fmt(c.revenue)}</span>
                      <span className="text-zinc-400">COGS: {fmt(c.cogs)}</span>
                    </div>
                  </div>
                  <div className="text-right w-28">
                    <div className={`font-semibold ${c.profit >= 0 ? "text-lime-400" : "text-red-400"}`}>{fmt(c.profit)}</div>
                    <div className={`text-xs ${marginColor(c.margin)}`}>{fmtPct(c.margin)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function KPICard({ label, value, sub, gradient, textColor, icon, large }: {
  label: string;
  value: string;
  sub: string;
  gradient: string;
  textColor: string;
  icon: React.ReactNode;
  large?: boolean;
}) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 border border-white/5 shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-400 text-xs uppercase tracking-wider font-medium">{label}</span>
        <span className={textColor}>{icon}</span>
      </div>
      <div className={`${large ? "text-3xl" : "text-2xl"} font-bold ${textColor} tracking-tight`}>{value}</div>
      <div className="text-zinc-500 text-xs mt-1">{sub}</div>
    </div>
  );
}

function PLRow({ label, values, color, bold, border }: {
  label: string;
  values: number[];
  color: string;
  bold?: boolean;
  border?: boolean;
}) {
  return (
    <tr className={`${border ? "border-t border-white/10" : "border-b border-white/[0.03]"}`}>
      <td className={`py-2.5 pr-4 ${bold ? "font-semibold text-white" : "text-zinc-400"}`}>{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`py-2.5 px-3 text-right ${bold ? "font-semibold" : ""} ${
            color === "dynamic" ? (v >= 0 ? "text-lime-400" : "text-red-400") : color
          }`}
        >
          {v < 0 ? `(${fmt(Math.abs(v))})` : fmt(v)}
        </td>
      ))}
    </tr>
  );
}

function SortableHeader({ label, field, current, dir, onSort }: {
  label: string;
  field: "profit" | "revenue" | "margin";
  current: string;
  dir: string;
  onSort: (f: "profit" | "revenue" | "margin") => void;
}) {
  return (
    <th
      className="text-right py-3 px-3 font-medium cursor-pointer hover:text-white transition-colors select-none"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {current === field ? (
          dir === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-30" />
        )}
      </span>
    </th>
  );
}

function ExpenseForm({ initialData, onSubmit, onCancel, loading }: {
  initialData?: {
    category: string;
    description: string;
    amount: number;
    date: Date | string;
    recurring: boolean;
    recurringFrequency: string | null;
    vendor: string | null;
    notes: string | null;
  };
  onSubmit: (data: {
    category: string;
    description: string;
    amount: number;
    date: string;
    recurring: boolean;
    recurringFrequency?: string | null;
    vendor?: string | null;
    notes?: string | null;
  }) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [category, setCategory] = useState(initialData?.category ?? "other");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");
  const [date, setDate] = useState(
    initialData?.date
      ? new Date(initialData.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [recurring, setRecurring] = useState(initialData?.recurring ?? false);
  const [recurringFreq, setRecurringFreq] = useState(initialData?.recurringFrequency ?? "");
  const [vendor, setVendor] = useState(initialData?.vendor ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description || !amount || !date) return;
    onSubmit({
      category,
      description,
      amount: parseFloat(amount),
      date,
      recurring,
      recurringFrequency: recurring ? recurringFreq || null : null,
      vendor: vendor || null,
      notes: notes || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/[0.03] rounded-xl p-4 mb-4 border border-white/5 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500"
          required
        />
        <input
          type="number"
          placeholder="Amount"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          required
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Vendor (optional)"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500"
        />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="accent-green-500"
            />
            Recurring
          </label>
          {recurring && (
            <select
              value={recurringFreq}
              onChange={(e) => setRecurringFreq(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
            >
              <option value="">Frequency</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          )}
        </div>
        <input
          type="text"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 col-span-2 md:col-span-1"
        />
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Style helpers ──────────────────────────────────────────

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    inventory: "bg-amber-500/15 text-amber-400",
    shipping: "bg-blue-500/15 text-blue-400",
    rent: "bg-purple-500/15 text-purple-400",
    utilities: "bg-cyan-500/15 text-cyan-400",
    wages: "bg-rose-500/15 text-rose-400",
    marketing: "bg-pink-500/15 text-pink-400",
    packaging: "bg-orange-500/15 text-orange-400",
    equipment: "bg-indigo-500/15 text-indigo-400",
    other: "bg-zinc-500/15 text-zinc-400",
  };
  return map[cat] ?? map.other;
}

function marginColor(margin: number) {
  if (margin >= 60) return "bg-lime-500/15 text-lime-400";
  if (margin >= 40) return "bg-green-500/15 text-green-400";
  if (margin >= 20) return "bg-amber-500/15 text-amber-400";
  if (margin >= 0) return "bg-orange-500/15 text-orange-400";
  return "bg-red-500/15 text-red-400";
}
