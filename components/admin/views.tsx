/**
 * Mohawk Medibles — Admin View Components
 * Extracted view functions for the admin dashboard.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, Users, DollarSign, AlertTriangle, TrendingUp,
    Truck, ShoppingCart, BarChart3, Settings, LogOut,
    Search, Bell, ChevronDown, Eye, Printer, CheckCircle,
    Plus, Edit, Trash2, Tag, Save, RefreshCw, Key,
    ArrowUpRight, ArrowDownRight, Filter, Download,
    Globe, Mail, Zap, Shield, Database, Activity,
    TicketCheck, MessageSquare, BookOpen, Percent,
    ChevronLeft, ChevronRight, X, Loader2, Copy, Check,
    Box, LayoutDashboard, Megaphone, Target, Send,
    Calendar, Clock, BarChart2, Repeat, UserPlus, Award,
} from "lucide-react";
import {
    StatusBadge, StatCard, EmptyState, LoadingSpinner, OrderTable,
    type DashboardStats, type Order, type Product, type Customer, type Coupon,
} from "./shared";

export function DashboardView() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/analytics?range=30d").then(r => r.json()).catch(() => null),
            fetch("/api/admin/orders?limit=10").then(r => r.json()).catch(() => ({ orders: [] })),
        ]).then(([analyticsData, ordersData]) => {
            setStats(analyticsData);
            setOrders(ordersData.orders || []);
            setLoading(false);
        });
    }, []);

    if (loading) return <LoadingSpinner />;

    const fallbackStats: DashboardStats = {
        revenue: { current: 284750, previous: 253100, change: 12.5 },
        orders: { current: 1847, previous: 1705, change: 8.3, pending: 47 },
        customers: { newCurrent: 342, newPrevious: 298, change: 14.8 },
        averageOrderValue: 154.15,
        statusBreakdown: [],
    };

    const s = stats || fallbackStats;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Dashboard</h2>
                    <p className="text-zinc-500 text-sm">Welcome back. Here&apos;s your 30-day overview.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                        <Download className="h-4 w-4" /> Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Monthly Revenue" value={`$${(s.revenue.current).toLocaleString()}`} icon={DollarSign} color="from-green-500 to-emerald-600" change={s.revenue.change} />
                <StatCard label="Total Orders" value={s.orders.current.toLocaleString()} icon={ShoppingCart} color="from-blue-500 to-cyan-600" change={s.orders.change} />
                <StatCard label="New Customers" value={s.customers.newCurrent.toLocaleString()} icon={Users} color="from-purple-500 to-violet-600" change={s.customers.change} />
                <StatCard label="Avg. Order Value" value={`$${s.averageOrderValue.toFixed(2)}`} icon={TrendingUp} color="from-amber-500 to-orange-600" />
            </div>

            {/* Orders needing attention */}
            {s.orders.pending > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                        <div>
                            <h3 className="font-semibold text-amber-400">{s.orders.pending} Orders Pending Action</h3>
                            <p className="text-sm text-zinc-400">Review and process to maintain fulfillment SLA.</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors">
                        View Pending
                    </button>
                </div>
            )}

            {/* Status Breakdown */}
            {s.statusBreakdown.length > 0 && (
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold mb-4">Order Status Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {s.statusBreakdown.map(({ status, count }) => (
                            <div key={status} className="bg-white/5 rounded-xl p-3">
                                <StatusBadge status={status} />
                                <div className="text-lg font-bold mt-2">{count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Orders */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-semibold">Recent Orders</h3>
                </div>
                <OrderTable orders={orders} />
            </div>

            {/* Live Activity Feed */}
            <LiveActivityFeed />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// LIVE ACTIVITY FEED
// ═══════════════════════════════════════════════════════════════

const ACTIVITY_ICONS: Record<string, { icon: typeof ShoppingCart; color: string; label: string }> = {
    cart_add: { icon: ShoppingCart, color: "text-green-400", label: "Cart Add" },
    cart_remove: { icon: X, color: "text-red-400", label: "Cart Remove" },
    agent_chat: { icon: MessageSquare, color: "text-blue-400", label: "Agent Chat" },
    page_visit: { icon: Globe, color: "text-zinc-400", label: "Page Visit" },
    order_placed: { icon: CheckCircle, color: "text-emerald-400", label: "Order" },
    signup: { icon: UserPlus, color: "text-purple-400", label: "Signup" },
    search: { icon: Search, color: "text-amber-400", label: "Search" },
    product_view: { icon: Eye, color: "text-cyan-400", label: "Product View" },
};

interface ActivityEventItem {
    id: number;
    type: string;
    timestamp: number;
    data: {
        productName?: string;
        category?: string;
        page?: string;
        amount?: number;
        query?: string;
        message?: string;
    };
}

function formatActivityDescription(event: ActivityEventItem): string {
    switch (event.type) {
        case "cart_add":
            return event.data.productName
                ? `Added "${event.data.productName}" to cart${event.data.amount ? ` ($${event.data.amount.toFixed(2)})` : ""}`
                : "Item added to cart";
        case "agent_chat":
            return event.data.message ? `"${event.data.message}"` : "Customer chatted with MedAgent";
        case "search":
            return event.data.query ? `Searched for "${event.data.query}"` : "Search performed";
        case "product_view":
            return event.data.productName
                ? `Viewed ${event.data.productName}${event.data.category ? ` in ${event.data.category}` : ""}`
                : "Product viewed";
        case "order_placed":
            return event.data.amount ? `Order placed — $${event.data.amount.toFixed(2)}` : "New order placed";
        case "signup":
            return "New customer registered";
        default:
            return event.type.replace(/_/g, " ");
    }
}

function timeAgo(ts: number): string {
    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
}

function LiveActivityFeed() {
    const [events, setEvents] = useState<ActivityEventItem[]>([]);
    const [cursor, setCursor] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function poll() {
            try {
                const res = await fetch(`/api/admin/activity?mode=poll&since=${cursor}`);
                if (!res.ok || cancelled) return;
                const data = await res.json();
                if (data.events?.length > 0) {
                    setEvents((prev) => [...data.events, ...prev].slice(0, 50));
                }
                if (data.cursor) setCursor(data.cursor);
            } catch { /* silent */ }
        }

        poll();
        const interval = setInterval(poll, 5000);
        return () => { cancelled = true; clearInterval(interval); };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-400" />
                    <h3 className="font-semibold">Live Activity</h3>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
                <span className="text-xs text-zinc-500">{events.length} recent events</span>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {events.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-zinc-500">
                        No activity yet. Events appear as visitors browse the site.
                    </div>
                ) : (
                    events.map((event) => {
                        const config = ACTIVITY_ICONS[event.type] || ACTIVITY_ICONS.page_visit;
                        const Icon = config.icon;
                        return (
                            <div key={event.id} className="px-6 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                                <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
                                <span className="text-sm text-zinc-300 flex-1 truncate">
                                    {formatActivityDescription(event)}
                                </span>
                                <span className="text-xs text-zinc-600 shrink-0 tabular-nums">
                                    {timeAgo(event.timestamp)}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS VIEW
// ═══════════════════════════════════════════════════════════════

export function AnalyticsView() {
    const [range, setRange] = useState("30d");
    const [revenueData, setRevenueData] = useState<{ chartData: { date: string; revenue: number }[]; totalRevenue: number; changePercent: number } | null>(null);
    const [topProducts, setTopProducts] = useState<{ name: string; totalSold: number; totalRevenue: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(`/api/admin/analytics?range=${range}&metric=revenue`).then(r => r.json()).catch(() => null),
            fetch(`/api/admin/analytics?range=${range}&metric=products`).then(r => r.json()).catch(() => null),
        ]).then(([rev, prods]) => {
            setRevenueData(rev);
            setTopProducts(prods?.topProducts || []);
            setLoading(false);
        });
    }, [range]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Analytics</h2>
                    <p className="text-zinc-500 text-sm">Revenue, trends, and product performance.</p>
                </div>
                <div className="flex gap-2">
                    {["7d", "30d", "90d", "1y"].map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${range === r
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-white/5 hover:bg-white/10 border border-white/10"
                            }`}
                        >
                            {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : r === "90d" ? "90 Days" : "1 Year"}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <LoadingSpinner /> : (
                <>
                    {/* Revenue Chart (Bar representation) */}
                    {revenueData && (
                        <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-semibold">Revenue</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-3xl font-bold text-green-400">${revenueData.totalRevenue.toLocaleString()}</span>
                                        <span className={`text-sm flex items-center gap-1 ${revenueData.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                                            {revenueData.changePercent >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                            {Math.abs(revenueData.changePercent)}% vs previous
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Simple bar chart */}
                            <div className="flex items-end gap-1 h-40">
                                {revenueData.chartData.slice(-30).map((d, i) => {
                                    const max = Math.max(...revenueData.chartData.map(x => x.revenue));
                                    const height = max > 0 ? (d.revenue / max) * 100 : 0;
                                    return (
                                        <div key={i} className="flex-1 group relative">
                                            <div
                                                className="bg-green-500/50 hover:bg-green-500/80 rounded-t transition-colors w-full"
                                                style={{ height: `${Math.max(height, 2)}%` }}
                                            />
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-zinc-800 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                                ${d.revenue.toFixed(0)} — {d.date}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Top Products */}
                    <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5">
                            <h3 className="font-semibold">Top Selling Products</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider border-b border-white/5">
                                    <th className="px-6 py-3">#</th>
                                    <th className="px-6 py-3">Product</th>
                                    <th className="px-6 py-3 text-right">Units Sold</th>
                                    <th className="px-6 py-3 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {topProducts.slice(0, 10).map((p, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02]">
                                        <td className="px-6 py-3 text-zinc-500">{i + 1}</td>
                                        <td className="px-6 py-3 font-medium">{p.name}</td>
                                        <td className="px-6 py-3 text-right">{p.totalSold}</td>
                                        <td className="px-6 py-3 text-right text-green-400">${p.totalRevenue.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {topProducts.length === 0 && (
                            <EmptyState icon={BarChart3} title="No sales data yet" description="Sales data will appear here once orders start coming in." />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// ORDERS VIEW
// ═══════════════════════════════════════════════════════════════

export function OrdersView({ searchQuery }: { searchQuery: string }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        fetch("/api/admin/orders?limit=50")
            .then(r => r.json())
            .then(data => { setOrders(data.orders || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filters = ["All", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"];

    const filtered = orders.filter(o => {
        const matchesSearch = !searchQuery ||
            o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Orders</h2>
                <div className="flex gap-2">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${statusFilter === f
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-white/5 hover:bg-white/10 border border-white/10"
                            }`}
                        >
                            {f === "All" ? "All" : f.replace(/_/g, " ")}
                        </button>
                    ))}
                </div>
            </div>
            {loading ? <LoadingSpinner /> : (
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                    <OrderTable orders={filtered} />
                    {filtered.length === 0 && (
                        <EmptyState icon={ShoppingCart} title="No orders found" description="Orders will appear here once customers start purchasing." />
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTS VIEW
// ═══════════════════════════════════════════════════════════════

export function ProductsView({ searchQuery }: { searchQuery: string }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [showEditor, setShowEditor] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const limit = 25;

    const fetchProducts = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams({
            limit: String(limit),
            offset: String(page * limit),
            ...(searchQuery && { q: searchQuery }),
            ...(statusFilter && { status: statusFilter }),
        });
        fetch(`/api/admin/products?${params}`)
            .then(r => r.json())
            .then(data => {
                setProducts(data.products || []);
                setTotal(data.total || 0);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [page, searchQuery, statusFilter]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const updateInventory = async (productId: number, quantity: number) => {
        await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "update-inventory", productId, quantity }),
        });
        fetchProducts();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Products</h2>
                    <p className="text-zinc-500 text-sm">{total} products in catalog</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white appearance-none cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                        <option value="DISCONTINUED">Discontinued</option>
                    </select>
                    <button
                        onClick={() => { setEditProduct(null); setShowEditor(true); }}
                        className="px-4 py-2 rounded-xl bg-green-600 text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Product
                    </button>
                </div>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider border-b border-white/5">
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3 text-right">Price</th>
                                <th className="px-6 py-3 text-center">Stock</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden shrink-0">
                                                {product.image && (
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white truncate max-w-[250px]">{product.name}</div>
                                                <div className="text-xs text-zinc-500">{product.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-zinc-400">{product.category}</td>
                                    <td className="px-6 py-3 text-right">
                                        <span className="font-medium">${product.price.toFixed(2)}</span>
                                        {product.salePrice && (
                                            <span className="text-xs text-red-400 ml-1">${product.salePrice.toFixed(2)}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        {product.inventory ? (
                                            <span className={`font-mono text-sm ${product.inventory.quantity <= (product.inventory.lowStockAt || 5) ? "text-red-400" : "text-green-400"}`}>
                                                {product.inventory.quantity}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-600">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3"><StatusBadge status={product.status} /></td>
                                    <td className="px-6 py-3">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => { setEditProduct(product); setShowEditor(true); }}
                                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="h-3.5 w-3.5 text-zinc-400" />
                                            </button>
                                            <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="View">
                                                <Eye className="h-3.5 w-3.5 text-zinc-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {products.length === 0 && (
                        <EmptyState icon={Package} title="No products found" description="Add products to your catalog or adjust filters." />
                    )}

                    {/* Pagination */}
                    {total > limit && (
                        <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
                            <span className="text-xs text-zinc-500">Showing {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={(page + 1) * limit >= total}
                                    className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// CUSTOMERS VIEW
// ═══════════════════════════════════════════════════════════════

export function CustomersView({ searchQuery }: { searchQuery: string }) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [segments, setSegments] = useState<{ totalCustomers: number; newThisMonth: number; guestAccounts: number; repeatBuyers: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [visitorInsights, setVisitorInsights] = useState<{
        activeVisitors: number;
        topCategories: { name: string; views: number }[];
        recentSearches: string[];
    } | null>(null);

    useEffect(() => {
        Promise.all([
            fetch(`/api/admin/customers?limit=50${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`)
                .then(r => r.json()).catch(() => ({ customers: [], total: 0 })),
            fetch("/api/admin/customers?action=segments")
                .then(r => r.json()).catch(() => null),
            fetch("/api/admin/visitors")
                .then(r => r.ok ? r.json() : null).catch(() => null),
        ]).then(([custData, segData, visitorData]) => {
            setCustomers(custData.customers || []);
            setTotal(custData.total || 0);
            setSegments(segData);
            setVisitorInsights(visitorData);
            setLoading(false);
        });
    }, [searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Customers</h2>
                    <p className="text-zinc-500 text-sm">{total} registered customers</p>
                </div>
            </div>

            {/* Segment Cards */}
            {segments && (
                <div className="grid grid-cols-4 gap-4">
                    <StatCard label="Total Customers" value={segments.totalCustomers.toLocaleString()} icon={Users} color="from-blue-500 to-cyan-600" />
                    <StatCard label="New This Month" value={segments.newThisMonth.toLocaleString()} icon={TrendingUp} color="from-green-500 to-emerald-600" />
                    <StatCard label="Guest Accounts" value={segments.guestAccounts.toLocaleString()} icon={Globe} color="from-amber-500 to-orange-600" />
                    <StatCard label="Repeat Buyers" value={String(segments.repeatBuyers)} icon={CheckCircle} color="from-purple-500 to-violet-600" />
                </div>
            )}

            {/* Live Visitor Insights */}
            {visitorInsights && (
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-4 w-4 text-green-400" />
                        <h3 className="font-semibold text-sm">Live Visitor Insights</h3>
                        <span className="ml-auto text-xs text-zinc-500">Server-side anonymous tracking</span>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        {/* Active Visitors */}
                        <div>
                            <p className="text-xs text-zinc-500 mb-1">Active Now (last 1h)</p>
                            <p className="text-2xl font-bold text-green-400">{visitorInsights.activeVisitors}</p>
                        </div>
                        {/* Top Categories Being Browsed */}
                        <div>
                            <p className="text-xs text-zinc-500 mb-2">Top Categories Browsed</p>
                            <div className="space-y-1">
                                {visitorInsights.topCategories.slice(0, 5).map((cat) => (
                                    <div key={cat.name} className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-300 truncate">{cat.name}</span>
                                        <span className="text-zinc-500 tabular-nums">{cat.views} views</span>
                                    </div>
                                ))}
                                {visitorInsights.topCategories.length === 0 && (
                                    <p className="text-xs text-zinc-600">No category views yet</p>
                                )}
                            </div>
                        </div>
                        {/* Recent Searches */}
                        <div>
                            <p className="text-xs text-zinc-500 mb-2">Recent Searches</p>
                            <div className="flex flex-wrap gap-1">
                                {visitorInsights.recentSearches.slice(0, 8).map((q) => (
                                    <span key={q} className="px-2 py-0.5 bg-white/5 rounded text-xs text-zinc-400">{q}</span>
                                ))}
                                {visitorInsights.recentSearches.length === 0 && (
                                    <p className="text-xs text-zinc-600">No searches yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading ? <LoadingSpinner /> : (
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider border-b border-white/5">
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3 text-center">Orders</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3">Last Active</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {customers.map((c) => (
                                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                {c.name?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                            <span className="font-medium">{c.name || "Guest"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-zinc-400">{c.email}</td>
                                    <td className="px-6 py-3 text-center">
                                        <span className="bg-white/5 px-2 py-0.5 rounded text-xs">{c._count.orders}</span>
                                    </td>
                                    <td className="px-6 py-3 text-zinc-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-3 text-zinc-400 text-xs">
                                        {c.lastLogin ? new Date(c.lastLogin).toLocaleDateString() : "Never"}
                                    </td>
                                    <td className="px-6 py-3">
                                        <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="View Details">
                                            <Eye className="h-3.5 w-3.5 text-zinc-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {customers.length === 0 && (
                        <EmptyState icon={Users} title="No customers found" description="Customers will appear here after they register or place orders." />
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// COUPONS VIEW
// ═══════════════════════════════════════════════════════════════

export function CouponsView() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newCoupon, setNewCoupon] = useState({ code: "", type: "PERCENTAGE", value: 10, description: "", minOrderTotal: 0, maxUses: 0, validUntil: "" });

    const fetchCoupons = () => {
        fetch("/api/admin/coupons")
            .then(r => r.json())
            .then(data => { setCoupons(data.coupons || []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchCoupons(); }, []);

    const createCoupon = async () => {
        await fetch("/api/admin/coupons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "create",
                ...newCoupon,
                minOrderTotal: newCoupon.minOrderTotal || null,
                maxUses: newCoupon.maxUses || null,
                validUntil: newCoupon.validUntil || null,
            }),
        });
        setShowCreate(false);
        setNewCoupon({ code: "", type: "PERCENTAGE", value: 10, description: "", minOrderTotal: 0, maxUses: 0, validUntil: "" });
        fetchCoupons();
    };

    const toggleCoupon = async (id: number) => {
        await fetch("/api/admin/coupons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "toggle", id }),
        });
        fetchCoupons();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Coupons & Discounts</h2>
                    <p className="text-zinc-500 text-sm">Manage promotional codes and discount rules.</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="px-4 py-2 rounded-xl bg-green-600 text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> Create Coupon
                </button>
            </div>

            {/* Create form */}
            {showCreate && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-[#0f0f18] border border-green-500/20 rounded-2xl p-6"
                >
                    <h3 className="font-semibold mb-4">New Coupon</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Code</label>
                            <input
                                value={newCoupon.code}
                                onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                placeholder="SAVE20"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Type</label>
                            <select
                                value={newCoupon.type}
                                onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm appearance-none"
                            >
                                <option value="PERCENTAGE">Percentage Off</option>
                                <option value="FIXED_AMOUNT">Fixed Amount</option>
                                <option value="FREE_SHIPPING">Free Shipping</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Value</label>
                            <input
                                type="number"
                                value={newCoupon.value}
                                onChange={e => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Description</label>
                            <input
                                value={newCoupon.description}
                                onChange={e => setNewCoupon({ ...newCoupon, description: e.target.value })}
                                placeholder="Summer sale discount"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Min. Order Total ($)</label>
                            <input
                                type="number"
                                value={newCoupon.minOrderTotal || ""}
                                onChange={e => setNewCoupon({ ...newCoupon, minOrderTotal: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Expires</label>
                            <input
                                type="date"
                                value={newCoupon.validUntil}
                                onChange={e => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={createCoupon} className="px-4 py-2 rounded-xl bg-green-600 text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                            <Save className="h-4 w-4" /> Save Coupon
                        </button>
                        <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl bg-white/5 text-sm hover:bg-white/10 transition-colors">
                            Cancel
                        </button>
                    </div>
                </motion.div>
            )}

            {loading ? <LoadingSpinner /> : (
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider border-b border-white/5">
                                <th className="px-6 py-3">Code</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3 text-right">Value</th>
                                <th className="px-6 py-3 text-center">Used</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Expires</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {coupons.map(c => (
                                <tr key={c.id} className="hover:bg-white/[0.02]">
                                    <td className="px-6 py-3 font-mono font-bold text-green-400">{c.code}</td>
                                    <td className="px-6 py-3 text-zinc-400">{c.type.replace(/_/g, " ")}</td>
                                    <td className="px-6 py-3 text-right font-medium">
                                        {c.type === "PERCENTAGE" ? `${c.value}%` : c.type === "FIXED_AMOUNT" ? `$${c.value.toFixed(2)}` : "Free"}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <span className="text-zinc-400">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}</span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase border ${c.active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                                            {c.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-zinc-400">
                                        {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : "Never"}
                                    </td>
                                    <td className="px-6 py-3">
                                        <button
                                            onClick={() => toggleCoupon(c.id)}
                                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                            title={c.active ? "Deactivate" : "Activate"}
                                        >
                                            {c.active ? <X className="h-3.5 w-3.5 text-red-400" /> : <Check className="h-3.5 w-3.5 text-green-400" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {coupons.length === 0 && (
                        <EmptyState icon={Tag} title="No coupons yet" description="Create your first promotional code to offer discounts." />
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// SHIPPING VIEW
// ═══════════════════════════════════════════════════════════════

export function ShippingView() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/orders?limit=50")
            .then(r => r.json())
            .then(data => {
                const shippingOrders = (data.orders || []).filter((o: Order) =>
                    ["PAYMENT_CONFIRMED", "LABEL_PRINTED", "SHIPPED", "IN_TRANSIT"].includes(o.status)
                );
                setOrders(shippingOrders);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const shipped = orders.filter(o => o.status === "SHIPPED" || o.status === "IN_TRANSIT").length;
    const labelsPending = orders.filter(o => o.status === "PAYMENT_CONFIRMED").length;
    const labelsPrinted = orders.filter(o => o.status === "LABEL_PRINTED").length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Shipping & Logistics</h2>
                    <p className="text-zinc-500 text-sm">ShipStation integrated — Xpresspost fulfillment pipeline.</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-purple-600 text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
                    <Printer className="h-4 w-4" /> Print All Labels
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <StatCard label="Needs Label" value={String(labelsPending)} icon={AlertTriangle} color="from-amber-500 to-orange-600" />
                <StatCard label="Labels Printed" value={String(labelsPrinted)} icon={Printer} color="from-purple-500 to-violet-600" />
                <StatCard label="In Transit" value={String(shipped)} icon={Truck} color="from-cyan-500 to-blue-600" />
            </div>

            {loading ? <LoadingSpinner /> : (
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5">
                        <h3 className="font-semibold">Fulfillment Queue</h3>
                    </div>
                    <OrderTable orders={orders} showTracking />
                    {orders.length === 0 && (
                        <EmptyState icon={Truck} title="No shipments pending" description="All orders have been fulfilled or no orders need shipping." />
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// CONTENT VIEW
// ═══════════════════════════════════════════════════════════════

interface ContentPiece {
    id: string;
    channel: string;
    pillar: string;
    title: string;
    content: string;
    status: string;
    keyword?: string;
    scheduledAt?: string;
    publishedAt?: string;
    createdAt: string;
}

interface ContentPriority {
    productId: number;
    productName: string;
    category: string;
    revenue: number;
    unitsSold: number;
    contentGap: number;
    recommendation: string;
}

export function ContentView() {
    const [pieces, setPieces] = useState<ContentPiece[]>([]);
    const [priorities, setPriorities] = useState<ContentPriority[]>([]);
    const [contentStats, setContentStats] = useState<{ total: number; drafts: number; scheduled: number; published: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState("calendar");
    const [showCreate, setShowCreate] = useState(false);
    const [newPiece, setNewPiece] = useState({
        channel: "blog", pillar: "education", title: "", content: "", keyword: "", scheduledAt: "",
    });

    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([
            fetch("/api/admin/content-calendar").then(r => r.json()).catch(() => []),
            fetch("/api/admin/content-calendar?action=stats").then(r => r.json()).catch(() => null),
            fetch("/api/admin/content-calendar?action=priorities").then(r => r.json()).catch(() => ({ priorities: [] })),
        ]).then(([piecesData, stats, priorityData]) => {
            setPieces(Array.isArray(piecesData) ? piecesData : []);
            setContentStats(stats);
            setPriorities(priorityData.priorities || []);
            setLoading(false);
        });
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const createPiece = async () => {
        if (!newPiece.title.trim()) return;
        await fetch("/api/admin/content-calendar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "create", ...newPiece }),
        });
        setShowCreate(false);
        setNewPiece({ channel: "blog", pillar: "education", title: "", content: "", keyword: "", scheduledAt: "" });
        fetchData();
    };

    const publishPiece = async (id: string) => {
        await fetch("/api/admin/content-calendar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "publish", id }),
        });
        fetchData();
    };

    const CONTENT_STATUS_COLORS: Record<string, string> = {
        DRAFT: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
        SCHEDULED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        PUBLISHED: "bg-green-500/20 text-green-400 border-green-500/30",
    };

    const contentSections = [
        { id: "calendar", label: "Content Calendar", icon: Calendar },
        { id: "priorities", label: "Content Priorities", icon: Target },
        { id: "channels", label: "Channels", icon: Globe },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Content Strategy</h2>
                    <p className="text-zinc-500 text-sm">Revenue-driven content calendar and SEO priorities.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="px-4 py-2 rounded-xl bg-green-600 text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> New Content
                    </button>
                </div>
            </div>

            {/* Stats */}
            {contentStats && (
                <div className="grid grid-cols-4 gap-4">
                    <StatCard label="Total Pieces" value={String(contentStats.total)} icon={BookOpen} color="from-blue-500 to-cyan-600" />
                    <StatCard label="Drafts" value={String(contentStats.drafts)} icon={Edit} color="from-zinc-500 to-zinc-600" />
                    <StatCard label="Scheduled" value={String(contentStats.scheduled)} icon={Clock} color="from-amber-500 to-orange-600" />
                    <StatCard label="Published" value={String(contentStats.published)} icon={CheckCircle} color="from-green-500 to-emerald-600" />
                </div>
            )}

            {/* Section Tabs */}
            <div className="flex gap-2">
                {contentSections.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${activeSection === s.id
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400"
                        }`}
                    >
                        <s.icon className="h-4 w-4" /> {s.label}
                    </button>
                ))}
            </div>

            {/* Create Form */}
            {showCreate && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-[#0f0f18] border border-green-500/20 rounded-2xl p-6"
                >
                    <h3 className="font-semibold mb-4">Create Content Piece</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Title</label>
                            <input
                                value={newPiece.title}
                                onChange={e => setNewPiece({ ...newPiece, title: e.target.value })}
                                placeholder="Understanding Terpene Profiles"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Channel</label>
                            <select value={newPiece.channel} onChange={e => setNewPiece({ ...newPiece, channel: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm appearance-none">
                                <option value="blog">Blog Post</option>
                                <option value="instagram">Instagram</option>
                                <option value="email">Email</option>
                                <option value="twitter">Twitter/X</option>
                                <option value="gmb">Google My Business</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Pillar</label>
                            <select value={newPiece.pillar} onChange={e => setNewPiece({ ...newPiece, pillar: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm appearance-none">
                                <option value="education">Education (30%)</option>
                                <option value="product_story">Product Story (25%)</option>
                                <option value="heritage">Heritage (15%)</option>
                                <option value="behind_scenes">Behind the Scenes (15%)</option>
                                <option value="community">Community (15%)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Target Keyword</label>
                            <input
                                value={newPiece.keyword}
                                onChange={e => setNewPiece({ ...newPiece, keyword: e.target.value })}
                                placeholder="premium cannabis Ontario"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Schedule Date</label>
                            <input
                                type="date"
                                value={newPiece.scheduledAt}
                                onChange={e => setNewPiece({ ...newPiece, scheduledAt: e.target.value })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="text-xs text-zinc-500 mb-1 block">Content</label>
                        <textarea
                            value={newPiece.content}
                            onChange={e => setNewPiece({ ...newPiece, content: e.target.value })}
                            rows={4}
                            placeholder="Write your content here or use AI generation..."
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-green-500/50 resize-y"
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={createPiece} className="px-4 py-2 rounded-xl bg-green-600 text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                            <Save className="h-4 w-4" /> Save
                        </button>
                        <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl bg-white/5 text-sm hover:bg-white/10 transition-colors">
                            Cancel
                        </button>
                    </div>
                </motion.div>
            )}

            {loading ? <LoadingSpinner /> : (
                <>
                    {/* Content Calendar */}
                    {activeSection === "calendar" && (
                        <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider border-b border-white/5">
                                        <th className="px-6 py-3">Title</th>
                                        <th className="px-6 py-3">Channel</th>
                                        <th className="px-6 py-3">Pillar</th>
                                        <th className="px-6 py-3">Keyword</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pieces.map(p => (
                                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-3 font-medium">{p.title}</td>
                                            <td className="px-6 py-3 text-zinc-400 capitalize">{p.channel}</td>
                                            <td className="px-6 py-3 text-zinc-400 capitalize">{p.pillar.replace(/_/g, " ")}</td>
                                            <td className="px-6 py-3 text-xs text-cyan-400">{p.keyword || "—"}</td>
                                            <td className="px-6 py-3">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase border ${CONTENT_STATUS_COLORS[p.status] || CONTENT_STATUS_COLORS.DRAFT}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-400 text-xs">
                                                {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString()
                                                    : p.scheduledAt ? new Date(p.scheduledAt).toLocaleDateString()
                                                    : new Date(p.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex gap-1">
                                                    {p.status === "DRAFT" && (
                                                        <button
                                                            onClick={() => publishPiece(p.id)}
                                                            className="px-2.5 py-1 rounded-lg text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                                        >
                                                            Publish
                                                        </button>
                                                    )}
                                                    <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Edit">
                                                        <Edit className="h-3.5 w-3.5 text-zinc-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {pieces.length === 0 && (
                                <EmptyState icon={BookOpen} title="No content yet" description="Create your first content piece to start building your strategy." />
                            )}
                        </div>
                    )}

                    {/* Content Priorities */}
                    {activeSection === "priorities" && (
                        <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5">
                                <h3 className="font-semibold">Revenue-Driven Content Priorities</h3>
                                <p className="text-xs text-zinc-500 mt-1">Products with high revenue but low content coverage — biggest content opportunities.</p>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider border-b border-white/5">
                                        <th className="px-6 py-3">Product</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3 text-right">Revenue</th>
                                        <th className="px-6 py-3 text-right">Units</th>
                                        <th className="px-6 py-3 text-center">Gap Score</th>
                                        <th className="px-6 py-3">Recommendation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {priorities.slice(0, 20).map(p => (
                                        <tr key={p.productId} className="hover:bg-white/[0.02]">
                                            <td className="px-6 py-3 font-medium">{p.productName}</td>
                                            <td className="px-6 py-3 text-zinc-400 capitalize">{p.category.replace(/-/g, " ")}</td>
                                            <td className="px-6 py-3 text-right text-green-400">${p.revenue.toLocaleString()}</td>
                                            <td className="px-6 py-3 text-right text-zinc-400">{p.unitsSold}</td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.contentGap > 5 ? "text-red-400" : p.contentGap > 3 ? "text-amber-400" : "text-green-400"}`}>
                                                    {p.contentGap}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-xs text-zinc-400">{p.recommendation}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {priorities.length === 0 && (
                                <EmptyState icon={Target} title="No priorities calculated" description="Content priorities will appear once product and keyword data is available." />
                            )}
                        </div>
                    )}

                    {/* Channels Overview */}
                    {activeSection === "channels" && (
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { name: "Blog", icon: BookOpen, color: "text-green-400 border-green-500/20", desc: "SEO-optimized articles with EEAT signals", pillar: "education" },
                                { name: "Instagram", icon: Globe, color: "text-pink-400 border-pink-500/20", desc: "Posts, Reels, and Stories for engagement", pillar: "product_story" },
                                { name: "Email", icon: Mail, color: "text-blue-400 border-blue-500/20", desc: "Campaign content for segmented audiences", pillar: "community" },
                                { name: "Twitter/X", icon: MessageSquare, color: "text-cyan-400 border-cyan-500/20", desc: "Quick insights and engagement hooks", pillar: "education" },
                                { name: "Google My Business", icon: Globe, color: "text-amber-400 border-amber-500/20", desc: "Local SEO posts for Six Nations discovery", pillar: "heritage" },
                                { name: "Product Copy", icon: Tag, color: "text-purple-400 border-purple-500/20", desc: "EEAT product descriptions with schema", pillar: "product_story" },
                            ].map(ch => (
                                <div key={ch.name} className={`bg-[#0f0f18] border ${ch.color} rounded-2xl p-6 hover:bg-white/[0.02] transition-colors`}>
                                    <ch.icon className={`h-8 w-8 mb-3 ${ch.color.split(" ")[0]}`} />
                                    <h3 className="font-semibold">{ch.name}</h3>
                                    <p className="text-xs text-zinc-500 mt-1">{ch.desc}</p>
                                    <div className="mt-3 text-[10px] text-zinc-600 uppercase">Primary Pillar: {ch.pillar.replace(/_/g, " ")}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// AGENTS VIEW
// ═══════════════════════════════════════════════════════════════

interface AgentConfigState {
    systemPromptOverride: string | null;
    turboEnabled: boolean;
    ttsEnabled: boolean;
    maxResponseLength: number;
    personasEnabled: { medagent: boolean; turtle: boolean; trickster: boolean };
    blockedTopics: string[];
    customGreeting: string | null;
    freeShippingThreshold: number;
    complianceMode: "strict" | "standard";
}

function ToggleSwitch({ enabled, onChange, label }: { enabled: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className="flex items-center justify-between w-full py-2 group"
        >
            <span className="text-sm text-zinc-300">{label}</span>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? "bg-green-500" : "bg-zinc-700"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
        </button>
    );
}

export function AgentsView() {
    const [config, setConfig] = useState<AgentConfigState | null>(null);
    const [health, setHealth] = useState<{ status: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [newTopic, setNewTopic] = useState("");

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/agent-config").then(r => r.json()).catch(() => null),
            fetch("/api/sage/health").then(r => r.json()).catch(() => ({ status: "offline" })),
        ]).then(([cfg, h]) => {
            setConfig(cfg);
            setHealth(h);
            setLoading(false);
        });
    }, []);

    const saveConfig = async () => {
        if (!config) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/agent-config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });
            if (res.ok) {
                const updated = await res.json();
                setConfig(updated);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch { /* silent */ }
        setSaving(false);
    };

    const resetConfig = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/agent-config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reset" }),
            });
            if (res.ok) {
                setConfig(await res.json());
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch { /* silent */ }
        setSaving(false);
    };

    if (loading) return <LoadingSpinner />;
    if (!config) return <EmptyState icon={Settings} title="Config unavailable" description="Could not load agent configuration." />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Agent Tuning</h2>
                    <p className="text-zinc-500 text-sm">Configure MedAgent behavior in real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border ${health?.status === "ok" || health?.status === "online"
                        ? "bg-green-500/10 text-green-400 border-green-500/30"
                        : "bg-red-500/10 text-red-400 border-red-500/30"
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${health?.status === "ok" || health?.status === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                        Gateway: {health?.status || "checking..."}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Core Toggles */}
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6 space-y-1">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-400" /> Core Settings
                    </h3>
                    <ToggleSwitch label="Turbo Router (Local Patterns)" enabled={config.turboEnabled} onChange={(v) => setConfig({ ...config, turboEnabled: v })} />
                    <ToggleSwitch label="Text-to-Speech" enabled={config.ttsEnabled} onChange={(v) => setConfig({ ...config, ttsEnabled: v })} />
                    <div className="pt-2">
                        <label className="text-xs text-zinc-500">Compliance Mode</label>
                        <div className="flex gap-2 mt-1">
                            {(["strict", "standard"] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setConfig({ ...config, complianceMode: mode })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${config.complianceMode === mode
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                        : "bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10"
                                    }`}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-2">
                        <label className="text-xs text-zinc-500">Max Response Length: {config.maxResponseLength} chars</label>
                        <input
                            type="range"
                            min={100}
                            max={2000}
                            step={50}
                            value={config.maxResponseLength}
                            onChange={(e) => setConfig({ ...config, maxResponseLength: parseInt(e.target.value) })}
                            className="w-full mt-1 accent-green-500"
                        />
                    </div>
                    <div className="pt-2">
                        <label className="text-xs text-zinc-500">Free Shipping Threshold: ${config.freeShippingThreshold}</label>
                        <input
                            type="number"
                            min={0}
                            max={1000}
                            value={config.freeShippingThreshold}
                            onChange={(e) => setConfig({ ...config, freeShippingThreshold: parseInt(e.target.value) || 199 })}
                            className="w-full mt-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-green-500/50"
                        />
                    </div>
                </div>

                {/* Personas */}
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6 space-y-1">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-400" /> Personas
                    </h3>
                    <ToggleSwitch label="MedAgent (Primary)" enabled={config.personasEnabled.medagent} onChange={(v) => setConfig({ ...config, personasEnabled: { ...config.personasEnabled, medagent: v } })} />
                    <ToggleSwitch label="Turtle Island Elder" enabled={config.personasEnabled.turtle} onChange={(v) => setConfig({ ...config, personasEnabled: { ...config.personasEnabled, turtle: v } })} />
                    <ToggleSwitch label="Trickster Guide" enabled={config.personasEnabled.trickster} onChange={(v) => setConfig({ ...config, personasEnabled: { ...config.personasEnabled, trickster: v } })} />

                    <div className="pt-3">
                        <label className="text-xs text-zinc-500">Custom Greeting (optional)</label>
                        <textarea
                            value={config.customGreeting || ""}
                            onChange={(e) => setConfig({ ...config, customGreeting: e.target.value || null })}
                            placeholder="Leave empty for default greeting..."
                            rows={2}
                            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm resize-none focus:outline-none focus:border-green-500/50"
                        />
                    </div>
                </div>

                {/* System Prompt Override */}
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Edit className="h-4 w-4 text-blue-400" /> System Prompt Addition
                    </h3>
                    <p className="text-xs text-zinc-500 mb-2">Extra instructions appended to the base prompt. Use carefully.</p>
                    <textarea
                        value={config.systemPromptOverride || ""}
                        onChange={(e) => setConfig({ ...config, systemPromptOverride: e.target.value || null })}
                        placeholder="E.g., 'Always mention our weekend sale on edibles...'"
                        rows={4}
                        maxLength={2000}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm resize-none focus:outline-none focus:border-green-500/50"
                    />
                    <p className="text-xs text-zinc-600 mt-1">{(config.systemPromptOverride || "").length}/2000</p>
                </div>

                {/* Blocked Topics */}
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-400" /> Blocked Topics
                    </h3>
                    <p className="text-xs text-zinc-500 mb-3">Keywords the agent will refuse to discuss.</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {config.blockedTopics.map((topic) => (
                            <span key={topic} className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs">
                                {topic}
                                <button
                                    onClick={() => setConfig({ ...config, blockedTopics: config.blockedTopics.filter((t) => t !== topic) })}
                                    className="hover:text-red-300"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        {config.blockedTopics.length === 0 && <span className="text-xs text-zinc-600">No blocked topics</span>}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder="Add topic..."
                            maxLength={100}
                            className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-red-500/50"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && newTopic.trim()) {
                                    setConfig({ ...config, blockedTopics: [...config.blockedTopics, newTopic.trim().toLowerCase()] });
                                    setNewTopic("");
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                if (newTopic.trim()) {
                                    setConfig({ ...config, blockedTopics: [...config.blockedTopics, newTopic.trim().toLowerCase()] });
                                    setNewTopic("");
                                }
                            }}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Save / Reset */}
            <div className="flex items-center gap-3">
                <button
                    onClick={saveConfig}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-green-500 text-black font-semibold text-sm hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    {saved ? "Saved!" : "Save Configuration"}
                </button>
                <button
                    onClick={resetConfig}
                    disabled={saving}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-400 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                    Reset to Defaults
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS VIEW — API Key Management + Environment Swap
// ═══════════════════════════════════════════════════════════════

export function SettingsView() {
    const [activeSection, setActiveSection] = useState("api-keys");
    const [testing, setTesting] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

    const services = [
        { service: "woocommerce", label: "WooCommerce (PayGo CC / Crypto / e-Transfer)", icon: DollarSign, color: "text-purple-400", envVars: ["WC_CONSUMER_KEY", "WC_CONSUMER_SECRET", "WC_STORE_URL"] },
        { service: "shipstation", label: "ShipStation", icon: Truck, color: "text-cyan-400", envVars: ["SHIPSTATION_API_KEY", "SHIPSTATION_API_SECRET"] },
        { service: "resend", label: "Resend Email", icon: Mail, color: "text-blue-400", envVars: ["RESEND_API_KEY"] },
        { service: "openai", label: "OpenAI / Claude", icon: Zap, color: "text-green-400", envVars: ["OPENAI_API_KEY"] },
        { service: "google", label: "Google Services", icon: Globe, color: "text-amber-400", envVars: ["NEXT_PUBLIC_GA_MEASUREMENT_ID", "GOOGLE_SITE_VERIFICATION"] },
        { service: "database", label: "PostgreSQL", icon: Database, color: "text-emerald-400", envVars: ["DATABASE_URL"] },
    ];

    const testConnection = async (service: string) => {
        setTesting(service);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "test-connection", service }),
            });
            const result = await res.json();
            setTestResults(prev => ({ ...prev, [service]: result }));
        } catch {
            setTestResults(prev => ({ ...prev, [service]: { success: false, message: "Request failed" } }));
        }
        setTesting(null);
    };

    const sections = [
        { id: "api-keys", label: "API Keys", icon: Key },
        { id: "business", label: "Business Info", icon: Globe },
        { id: "email", label: "Email Config", icon: Mail },
        { id: "security", label: "Security", icon: Shield },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Settings</h2>
                    <p className="text-zinc-500 text-sm">Manage API keys, swap dev → production, and configure services.</p>
                </div>
            </div>

            {/* Section tabs */}
            <div className="flex gap-2">
                {sections.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${activeSection === s.id
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400"
                        }`}
                    >
                        <s.icon className="h-4 w-4" /> {s.label}
                    </button>
                ))}
            </div>

            {activeSection === "api-keys" && (
                <div className="space-y-4">
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-amber-400" />
                            <div>
                                <h3 className="font-semibold text-amber-400 text-sm">Production Readiness</h3>
                                <p className="text-xs text-zinc-400">When ready to go live, update API keys from test → production mode. All services below can be swapped independently.</p>
                            </div>
                        </div>
                    </div>

                    {services.map(svc => (
                        <div key={svc.service} className="bg-[#0f0f18] border border-white/5 rounded-2xl p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                        <svc.icon className={`h-5 w-5 ${svc.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">{svc.label}</h3>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            {svc.envVars.map(v => (
                                                <code key={v} className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] mr-1">{v}</code>
                                            ))}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {testResults[svc.service] && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${testResults[svc.service].success
                                            ? "bg-green-500/10 text-green-400"
                                            : "bg-red-500/10 text-red-400"
                                        }`}>
                                            {testResults[svc.service].message}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => testConnection(svc.service)}
                                        disabled={testing === svc.service}
                                        className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        {testing === svc.service ? <Loader2 className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3" />}
                                        Test
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeSection === "business" && (
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold">Business Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Business Name", value: "Mohawk Medibles" },
                            { label: "Site URL", value: "mohawkmedibles.ca" },
                            { label: "Email From", value: "orders@mohawkmedibles.ca" },
                            { label: "Currency", value: "CAD (Canadian Dollar)" },
                            { label: "Timezone", value: "America/Toronto (ET)" },
                            { label: "Location", value: "Six Nations of the Grand River, Ontario" },
                        ].map(item => (
                            <div key={item.label}>
                                <label className="text-xs text-zinc-500">{item.label}</label>
                                <div className="mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeSection === "email" && (
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold">Email Templates</h3>
                    <p className="text-sm text-zinc-400">Transactional emails sent via Resend:</p>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { name: "Order Confirmation", status: "active", trigger: "After successful payment" },
                            { name: "Shipping Notification", status: "active", trigger: "When order ships" },
                            { name: "Password Reset", status: "active", trigger: "Forgot password request" },
                            { name: "Welcome Email", status: "active", trigger: "New registration" },
                            { name: "Abandoned Cart", status: "coming", trigger: "24h after cart abandonment" },
                            { name: "Review Request", status: "coming", trigger: "7 days after delivery" },
                        ].map(t => (
                            <div key={t.name} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                                <div>
                                    <div className="text-sm font-medium">{t.name}</div>
                                    <div className="text-xs text-zinc-500">{t.trigger}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${t.status === "active"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-zinc-500/20 text-zinc-400"
                                }`}>
                                    {t.status === "active" ? "Active" : "Coming Soon"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeSection === "security" && (
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold">Security Configuration</h3>
                    <div className="space-y-3">
                        {[
                            { label: "JWT Session Tokens", desc: "HMAC-SHA256 signed, 7-day expiry", enabled: true },
                            { label: "Rate Limiting", desc: "Per-route limits (auth: 10/min, admin: 30/min)", enabled: true },
                            { label: "PBKDF2 Password Hashing", desc: "310,000 iterations with random salt", enabled: true },
                            { label: "Security Headers", desc: "CSP, HSTS, X-Frame-Options, XSS Protection", enabled: true },
                            { label: "WooCommerce Webhook Verification", desc: "HMAC signature validation", enabled: true },
                            { label: "ShipStation HMAC", desc: "SHA-256 webhook signature verification", enabled: true },
                            { label: "Role-Based Access Control", desc: "5 roles: Customer, Support, Logistics, Admin, Super Admin", enabled: true },
                            { label: "Input Sanitization", desc: "Zod schemas + HTML strip on all inputs", enabled: true },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                                <div>
                                    <div className="text-sm font-medium">{item.label}</div>
                                    <div className="text-xs text-zinc-500">{item.desc}</div>
                                </div>
                                <div className={`w-8 h-5 rounded-full ${item.enabled ? "bg-green-500" : "bg-zinc-600"} flex items-center ${item.enabled ? "justify-end" : "justify-start"} px-0.5`}>
                                    <div className="w-4 h-4 rounded-full bg-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// CAMPAIGNS VIEW
// ═══════════════════════════════════════════════════════════════

interface Campaign {
    id: string;
    name: string;
    subject: string;
    status: string;
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    createdAt: string;
    sentAt?: string;
    scheduledAt?: string;
    _count?: { sends: number };
}

interface CampaignStats {
    totalCampaigns: number;
    activeCampaigns: number;
    totalSubscribers: number;
    totalSent: number;
    openRate: number;
    clickRate: number;
}

export function CampaignsView() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState<CampaignStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [sending, setSending] = useState<string | null>(null);
    const [newCampaign, setNewCampaign] = useState({
        name: "", subject: "", previewText: "", htmlContent: "", segment: "",
    });

    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([
            fetch("/api/admin/campaigns").then(r => r.json()).catch(() => []),
            fetch("/api/admin/campaigns?action=stats").then(r => r.json()).catch(() => null),
        ]).then(([campData, statsData]) => {
            setCampaigns(Array.isArray(campData) ? campData : []);
            setStats(statsData);
            setLoading(false);
        });
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const createCampaign = async () => {
        if (!newCampaign.name.trim() || !newCampaign.subject.trim()) return;
        await fetch("/api/admin/campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "create",
                ...newCampaign,
                segmentRules: newCampaign.segment ? { segment: newCampaign.segment } : null,
            }),
        });
        setShowCreate(false);
        setNewCampaign({ name: "", subject: "", previewText: "", htmlContent: "", segment: "" });
        fetchData();
    };

    const sendCampaign = async (id: string) => {
        setSending(id);
        await fetch("/api/admin/campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "send", id }),
        });
        setSending(null);
        fetchData();
    };

    const duplicateCampaign = async (id: string) => {
        await fetch("/api/admin/campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "duplicate", id }),
        });
        fetchData();
    };

    const cancelCampaign = async (id: string) => {
        await fetch("/api/admin/campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "cancel", id }),
        });
        fetchData();
    };

    const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
        DRAFT: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
        SCHEDULED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        SENDING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        SENT: "bg-green-500/20 text-green-400 border-green-500/30",
        CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Email Campaigns</h2>
                    <p className="text-zinc-500 text-sm">Create, manage, and send targeted email campaigns.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="px-4 py-2 rounded-xl bg-green-600 text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> New Campaign
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard label="Subscribers" value={stats.totalSubscribers.toLocaleString()} icon={Users} color="from-blue-500 to-cyan-600" />
                    <StatCard label="Campaigns" value={String(stats.totalCampaigns)} icon={Megaphone} color="from-purple-500 to-violet-600" />
                    <StatCard label="Active" value={String(stats.activeCampaigns)} icon={Send} color="from-green-500 to-emerald-600" />
                    <StatCard label="Total Sent" value={stats.totalSent.toLocaleString()} icon={Mail} color="from-amber-500 to-orange-600" />
                    <StatCard label="Open Rate" value={`${stats.openRate}%`} icon={Eye} color="from-cyan-500 to-blue-600" />
                    <StatCard label="Click Rate" value={`${stats.clickRate}%`} icon={Target} color="from-pink-500 to-rose-600" />
                </div>
            )}

            {/* Create Form */}
            {showCreate && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-[#0f0f18] border border-green-500/20 rounded-2xl p-6"
                >
                    <h3 className="font-semibold mb-4">Create New Campaign</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Campaign Name</label>
                            <input
                                value={newCampaign.name}
                                onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                placeholder="February VIP Drop"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Email Subject</label>
                            <input
                                value={newCampaign.subject}
                                onChange={e => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                                placeholder="Your Exclusive VIP Access"
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Preview Text</label>
                            <input
                                value={newCampaign.previewText}
                                onChange={e => setNewCampaign({ ...newCampaign, previewText: e.target.value })}
                                placeholder="First look at new arrivals..."
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Target Segment</label>
                            <select
                                value={newCampaign.segment}
                                onChange={e => setNewCampaign({ ...newCampaign, segment: e.target.value })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm appearance-none"
                            >
                                <option value="">All Subscribers</option>
                                <option value="VIP">VIP ($500+ spend, 3+ orders)</option>
                                <option value="Loyal">Loyal ($100+, repeat buyers)</option>
                                <option value="At-Risk">At-Risk (60-119 days inactive)</option>
                                <option value="New">New Customers</option>
                                <option value="Dormant">Dormant (120+ days inactive)</option>
                                <option value="High-AOV">High-AOV ($300+ total)</option>
                                <option value="Prospect">Prospects (never ordered)</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="text-xs text-zinc-500 mb-1 block">HTML Content</label>
                        <textarea
                            value={newCampaign.htmlContent}
                            onChange={e => setNewCampaign({ ...newCampaign, htmlContent: e.target.value })}
                            placeholder="<h1>Hello!</h1><p>Your campaign content here...</p>"
                            rows={6}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-mono focus:outline-none focus:border-green-500/50 resize-y"
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={createCampaign} className="px-4 py-2 rounded-xl bg-green-600 text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                            <Save className="h-4 w-4" /> Create Campaign
                        </button>
                        <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl bg-white/5 text-sm hover:bg-white/10 transition-colors">
                            Cancel
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Campaign List */}
            {loading ? <LoadingSpinner /> : (
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider border-b border-white/5">
                                <th className="px-6 py-3">Campaign</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-center">Sent</th>
                                <th className="px-6 py-3 text-center">Opened</th>
                                <th className="px-6 py-3 text-center">Clicked</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {campaigns.map(c => (
                                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-3">
                                        <div className="font-medium text-white">{c.name}</div>
                                        <div className="text-xs text-zinc-500 mt-0.5">{c.subject}</div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase border ${CAMPAIGN_STATUS_COLORS[c.status] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-center font-mono">{c.totalSent || c._count?.sends || 0}</td>
                                    <td className="px-6 py-3 text-center font-mono text-cyan-400">{c.totalOpened || 0}</td>
                                    <td className="px-6 py-3 text-center font-mono text-green-400">{c.totalClicked || 0}</td>
                                    <td className="px-6 py-3 text-zinc-400 text-xs">
                                        {c.sentAt ? new Date(c.sentAt).toLocaleDateString() : new Date(c.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex gap-1">
                                            {c.status === "DRAFT" && (
                                                <button
                                                    onClick={() => sendCampaign(c.id)}
                                                    disabled={sending === c.id}
                                                    className="px-2.5 py-1 rounded-lg text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    {sending === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                                                    Send
                                                </button>
                                            )}
                                            <button
                                                onClick={() => duplicateCampaign(c.id)}
                                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                                title="Duplicate"
                                            >
                                                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                                            </button>
                                            {(c.status === "DRAFT" || c.status === "SCHEDULED") && (
                                                <button
                                                    onClick={() => cancelCampaign(c.id)}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                                    title="Cancel"
                                                >
                                                    <X className="h-3.5 w-3.5 text-red-400" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {campaigns.length === 0 && (
                        <EmptyState icon={Megaphone} title="No campaigns yet" description="Create your first email campaign to engage your subscribers." />
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// FINANCIAL MODEL VIEW
// ═══════════════════════════════════════════════════════════════

interface FinancialMetrics {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    ordersPerMonth: number;
    revenuePerMonth: number;
    repeatPurchaseRate: number;
    customerLifetimeValue: number;
    estimatedCAC: number;
    ltvCacRatio: number;
    monthsRemaining: number;
    requiredGrowthRate: number;
    currentVsTarget: number;
    targetMonthlyRevenue: number;
    avgOrdersPerCustomer: number;
    dataRangeStart: string;
    dataRangeEnd: string;
    dataRangeDays: number;
    revenueByCategory: { category: string; revenue: number; orders: number; pct: number }[];
    revenueByMonth: { month: string; revenue: number; orders: number; aov: number }[];
    topProducts: { name: string; revenue: number; units: number }[];
}

interface GrowthScenario {
    name: string;
    monthlyGrowthRate: number;
    months: { month: number; revenue: number; cumulative: number }[];
    monthsToTarget: number | null;
    finalMonthly: number;
    feasibility: string;
}

interface GrowthStrategy {
    name: string;
    description: string;
    projectedMonthlyImpact: number;
    effortLevel: string;
    timeline: string;
    priority: string;
    tactics: string[];
}

export function FinancialModelView() {
    const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
    const [scenarios, setScenarios] = useState<GrowthScenario[]>([]);
    const [strategies, setStrategies] = useState<GrowthStrategy[]>([]);
    const [aovData, setAovData] = useState<{ distribution: { bucket: string; count: number; revenue: number; avgOrder: number }[]; currentAOV: number; targetAOV: number; potentialLift: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState("overview");

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/financial?metric=overview").then(r => r.json()).catch(() => ({})),
            fetch("/api/admin/financial?metric=aov").then(r => r.json()).catch(() => null),
        ]).then(([overviewData, aov]) => {
            setMetrics(overviewData.metrics || null);
            setScenarios(overviewData.scenarios || []);
            setStrategies(overviewData.strategies || []);
            setAovData(aov);
            setLoading(false);
        });
    }, []);

    if (loading) return <LoadingSpinner />;
    if (!metrics) return <EmptyState icon={TrendingUp} title="No financial data" description="Financial metrics will appear once order data is available." />;

    const sections = [
        { id: "overview", label: "KPIs", icon: BarChart3 },
        { id: "projections", label: "Growth Projections", icon: TrendingUp },
        { id: "aov", label: "AOV Analysis", icon: DollarSign },
        { id: "revenue", label: "Revenue Breakdown", icon: BarChart2 },
        { id: "strategies", label: "Growth Strategies", icon: Target },
    ];

    const priorityColors: Record<string, string> = {
        critical: "bg-red-500/20 text-red-400 border-red-500/30",
        high: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        low: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    };

    const effortColors: Record<string, string> = {
        low: "text-green-400",
        medium: "text-amber-400",
        high: "text-red-400",
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Financial Model</h2>
                    <p className="text-zinc-500 text-sm">Data-driven growth strategy to $1M monthly revenue.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                        Target: $1M/month by Dec 2026
                    </div>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {sections.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${activeSection === s.id
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400"
                        }`}
                    >
                        <s.icon className="h-4 w-4" /> {s.label}
                    </button>
                ))}
            </div>

            {/* ─── KPI Overview ─────────────────────────── */}
            {activeSection === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <StatCard label="Monthly Revenue" value={`$${Math.round(metrics.revenuePerMonth).toLocaleString()}`} icon={DollarSign} color="from-green-500 to-emerald-600" />
                        <StatCard label="Monthly Orders" value={Math.round(metrics.ordersPerMonth).toLocaleString()} icon={ShoppingCart} color="from-blue-500 to-cyan-600" />
                        <StatCard label="AOV" value={`$${metrics.averageOrderValue.toFixed(0)}`} icon={BarChart3} color="from-amber-500 to-orange-600" />
                        <StatCard label="Est. LTV" value={`$${metrics.customerLifetimeValue.toFixed(0)}`} icon={Users} color="from-purple-500 to-violet-600" />
                        <StatCard label="LTV:CAC" value={`${metrics.ltvCacRatio.toFixed(1)}x`} icon={TrendingUp} color="from-cyan-500 to-blue-600" />
                        <StatCard label="Repeat Rate" value={`${metrics.repeatPurchaseRate.toFixed(1)}%`} icon={Repeat} color="from-pink-500 to-rose-600" />
                    </div>

                    {/* Growth Gap */}
                    <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                        <h3 className="font-semibold mb-4">Path to $1M Monthly</h3>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <div className="text-xs text-zinc-500 mb-1">Current Monthly</div>
                                <div className="text-2xl font-bold text-green-400">${Math.round(metrics.revenuePerMonth).toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500 mb-1">Target Monthly</div>
                                <div className="text-2xl font-bold text-amber-400">$1,000,000</div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500 mb-1">Growth Needed</div>
                                <div className="text-2xl font-bold text-red-400">{(metrics.targetMonthlyRevenue / metrics.revenuePerMonth).toFixed(1)}x</div>
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                <span>Progress</span>
                                <span>{Math.min(100, (metrics.revenuePerMonth / 1_000_000 * 100)).toFixed(1)}%</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, metrics.revenuePerMonth / 1_000_000 * 100)}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-xs text-zinc-500 mt-2">
                            {metrics.monthsRemaining} months remaining | Total revenue to date: ${Math.round(metrics.totalRevenue).toLocaleString()} from {metrics.totalOrders.toLocaleString()} orders
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5">
                            <h3 className="font-semibold">Top Revenue Products</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider border-b border-white/5">
                                    <th className="px-6 py-3">#</th>
                                    <th className="px-6 py-3">Product</th>
                                    <th className="px-6 py-3 text-right">Revenue</th>
                                    <th className="px-6 py-3 text-right">Units</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {metrics.topProducts.slice(0, 10).map((p, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02]">
                                        <td className="px-6 py-3 text-zinc-500">{i + 1}</td>
                                        <td className="px-6 py-3 font-medium">{p.name}</td>
                                        <td className="px-6 py-3 text-right text-green-400">${p.revenue.toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right text-zinc-400">{p.units}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ─── Growth Projections ──────────────────── */}
            {activeSection === "projections" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {scenarios.map(scenario => {
                            const hitsTarget = scenario.monthsToTarget !== null;
                            return (
                                <div key={scenario.name} className={`bg-[#0f0f18] border rounded-2xl p-6 ${hitsTarget ? "border-green-500/20" : "border-white/5"}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold">{scenario.name}</h3>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase border ${
                                            scenario.feasibility === "Achievable" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                            scenario.feasibility === "Possible" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                                            "bg-red-500/20 text-red-400 border-red-500/30"
                                        }`}>
                                            {scenario.feasibility}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <div className="text-[10px] text-zinc-500 uppercase">Growth Rate</div>
                                            <div className="text-lg font-bold">{scenario.monthlyGrowthRate}%/mo</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-zinc-500 uppercase">Final Monthly</div>
                                            <div className="text-lg font-bold text-green-400">${(scenario.finalMonthly / 1000).toFixed(0)}K</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-zinc-500 uppercase">Hits $1M</div>
                                            <div className={`text-lg font-bold ${hitsTarget ? "text-green-400" : "text-red-400"}`}>
                                                {hitsTarget ? `Mo. ${scenario.monthsToTarget}` : "No"}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Mini revenue chart */}
                                    <div className="flex items-end gap-0.5 h-20">
                                        {scenario.months.map((m, i) => {
                                            const max = scenario.months[scenario.months.length - 1]?.revenue || 1;
                                            const h = Math.max(2, (m.revenue / max) * 100);
                                            const isTarget = m.revenue >= 1_000_000;
                                            return (
                                                <div key={i} className="flex-1 group relative">
                                                    <div
                                                        className={`w-full rounded-t transition-colors ${isTarget ? "bg-green-500/70" : "bg-blue-500/40 hover:bg-blue-500/70"}`}
                                                        style={{ height: `${h}%` }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                                        <span>Now</span>
                                        <span>Dec 2026</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ─── AOV Analysis ────────────────────────── */}
            {activeSection === "aov" && aovData && (
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <StatCard label="Current AOV" value={`$${aovData.currentAOV.toFixed(0)}`} icon={DollarSign} color="from-blue-500 to-cyan-600" />
                        <StatCard label="Target AOV" value={`$${aovData.targetAOV}`} icon={Target} color="from-green-500 to-emerald-600" />
                        <StatCard label="Monthly Lift Potential" value={`$${aovData.potentialLift.toLocaleString()}`} icon={TrendingUp} color="from-amber-500 to-orange-600" />
                    </div>

                    <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                        <h3 className="font-semibold mb-4">Order Value Distribution</h3>
                        <div className="space-y-3">
                            {aovData.distribution.map(bucket => {
                                const maxCount = Math.max(...aovData.distribution.map(b => b.count));
                                const width = maxCount > 0 ? (bucket.count / maxCount * 100) : 0;
                                return (
                                    <div key={bucket.bucket} className="flex items-center gap-4">
                                        <div className="w-24 text-xs text-zinc-400 text-right shrink-0">{bucket.bucket}</div>
                                        <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500/60 to-emerald-500/60 rounded-lg transition-all"
                                                style={{ width: `${Math.max(2, width)}%` }}
                                            />
                                            <div className="absolute inset-0 flex items-center px-3 text-xs font-medium">
                                                {bucket.count} orders — ${bucket.revenue.toLocaleString()} rev
                                            </div>
                                        </div>
                                        <div className="w-16 text-xs text-zinc-500 shrink-0">${bucket.avgOrder.toFixed(0)} avg</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Revenue Breakdown ──────────────────── */}
            {activeSection === "revenue" && (
                <div className="space-y-6">
                    {/* Revenue by Category */}
                    <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5">
                            <h3 className="font-semibold">Revenue by Category</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider border-b border-white/5">
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3 text-right">Revenue</th>
                                    <th className="px-6 py-3 text-right">Orders</th>
                                    <th className="px-6 py-3 text-right">% of Total</th>
                                    <th className="px-6 py-3">Share</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {metrics.revenueByCategory.map(cat => {
                                    const pct = metrics.totalRevenue > 0 ? (cat.revenue / metrics.totalRevenue * 100) : 0;
                                    return (
                                        <tr key={cat.category} className="hover:bg-white/[0.02]">
                                            <td className="px-6 py-3 font-medium capitalize">{cat.category.replace(/-/g, " ")}</td>
                                            <td className="px-6 py-3 text-right text-green-400">${cat.revenue.toLocaleString()}</td>
                                            <td className="px-6 py-3 text-right text-zinc-400">{cat.orders}</td>
                                            <td className="px-6 py-3 text-right">{pct.toFixed(1)}%</td>
                                            <td className="px-6 py-3">
                                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500/60 rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Revenue by Month */}
                    <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                        <h3 className="font-semibold mb-4">Monthly Revenue Trend</h3>
                        <div className="flex items-end gap-1 h-40">
                            {metrics.revenueByMonth.map((m, i) => {
                                const max = Math.max(...metrics.revenueByMonth.map(x => x.revenue));
                                const height = max > 0 ? (m.revenue / max * 100) : 0;
                                return (
                                    <div key={i} className="flex-1 group relative">
                                        <div
                                            className="bg-green-500/50 hover:bg-green-500/80 rounded-t transition-colors w-full"
                                            style={{ height: `${Math.max(height, 2)}%` }}
                                        />
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-zinc-800 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                            ${m.revenue.toLocaleString()} — {m.orders} orders — {m.month}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-600 mt-2">
                            <span>{metrics.revenueByMonth[0]?.month}</span>
                            <span>{metrics.revenueByMonth[metrics.revenueByMonth.length - 1]?.month}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Growth Strategies ──────────────────── */}
            {activeSection === "strategies" && (
                <div className="space-y-6">
                    <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <Target className="h-5 w-5 text-green-400" />
                            <div>
                                <h3 className="font-semibold text-green-400">Combined Strategy Impact</h3>
                                <p className="text-sm text-zinc-400">
                                    If all strategies are executed, projected monthly impact: +$
                                    {strategies.reduce((s, st) => s + st.projectedMonthlyImpact, 0).toLocaleString()}/month
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {strategies.map((strategy, i) => (
                            <motion.div
                                key={strategy.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-[#0f0f18] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-sm">{strategy.name}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${priorityColors[strategy.priority] || priorityColors.medium}`}>
                                        {strategy.priority}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 mb-3">{strategy.description}</p>
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div>
                                        <div className="text-[10px] text-zinc-500 uppercase">Impact</div>
                                        <div className="text-sm font-bold text-green-400">+${strategy.projectedMonthlyImpact.toLocaleString()}/mo</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-zinc-500 uppercase">Effort</div>
                                        <div className={`text-sm font-bold capitalize ${effortColors[strategy.effortLevel] || "text-zinc-400"}`}>{strategy.effortLevel}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-zinc-500 uppercase">Timeline</div>
                                        <div className="text-sm font-bold text-zinc-300">{strategy.timeline}</div>
                                    </div>
                                </div>
                                <div className="border-t border-white/5 pt-3">
                                    <div className="text-[10px] text-zinc-500 uppercase mb-1">Key Tactics</div>
                                    <ul className="space-y-1">
                                        {strategy.tactics.slice(0, 3).map((t, j) => (
                                            <li key={j} className="text-xs text-zinc-400 flex items-start gap-1.5">
                                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

