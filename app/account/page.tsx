"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    User, Package, MapPin, Settings, LogOut,
    ChevronRight, Clock, Truck, CheckCircle, XCircle,
    Plus, Trash2, Loader2, AlertCircle, RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import QuickReorder from "@/components/QuickReorder";

type Tab = "orders" | "addresses" | "settings";

interface OrderItemDetail {
    id: string | number;
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    date: string;
    status: string;
    total: number;
    items: number;
    tracking: string | null;
    itemDetails?: OrderItemDetail[];
}

interface Address {
    id: string;
    firstName: string;
    lastName: string;
    street1: string;
    street2: string | null;
    city: string;
    province: string;
    postalCode: string;
    phone: string | null;
    isDefault: boolean;
}

interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    role: string;
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
    pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", label: "Pending" },
    payment_confirmed: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", label: "Confirmed" },
    processing: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", label: "Processing" },
    shipped: { icon: Truck, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", label: "Shipped" },
    in_transit: { icon: Truck, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", label: "In Transit" },
    delivered: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", label: "Delivered" },
    cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", label: "Cancelled" },
    refunded: { icon: RefreshCcw, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", label: "Refunded" },
};

const DEFAULT_STATUS = { icon: Clock, color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState<Tab>("orders");
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Settings state
    const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
    const [passwordForm, setPasswordForm] = useState({ current: "", new: "" });
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");

    // Address form state
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({
        firstName: "", lastName: "", street1: "", street2: "",
        city: "", province: "ON", postalCode: "", phone: "", isDefault: false,
    });

    // ─── Fetch Data ──────────────────────────────────────────
    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch("/api/account?action=profile");
            if (!res.ok) {
                if (res.status === 401) {
                    window.location.href = "/login";
                    return;
                }
                throw new Error("Failed to load profile");
            }
            const data = await res.json();
            setProfile(data.user);
            setProfileForm({
                name: data.user.name || "",
                phone: data.user.phone || "",
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch("/api/account?action=orders");
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch { /* silent fail — orders not critical */ }
    }, []);

    const fetchAddresses = useCallback(async () => {
        try {
            const res = await fetch("/api/account?action=addresses");
            if (res.ok) {
                const data = await res.json();
                setAddresses(data.addresses || []);
            }
        } catch { /* silent fail */ }
    }, []);

    useEffect(() => {
        Promise.all([fetchProfile(), fetchOrders(), fetchAddresses()])
            .finally(() => setLoading(false));
    }, [fetchProfile, fetchOrders, fetchAddresses]);

    // ─── Actions ─────────────────────────────────────────────
    async function handleLogout() {
        await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "logout" }),
        });
        window.location.href = "/";
    }

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setSaveMsg("");
        try {
            const res = await fetch("/api/account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "update-profile", ...profileForm }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSaveMsg("Profile updated successfully!");
            setProfile((prev) => prev ? { ...prev, ...data.user } : prev);
        } catch (e) {
            setSaveMsg(e instanceof Error ? e.message : "Failed to update");
        }
        setSaving(false);
    }

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setSaveMsg("");
        try {
            const res = await fetch("/api/account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "update-password",
                    currentPassword: passwordForm.current,
                    newPassword: passwordForm.new,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSaveMsg("Password updated successfully!");
            setPasswordForm({ current: "", new: "" });
        } catch (e) {
            setSaveMsg(e instanceof Error ? e.message : "Failed to update password");
        }
        setSaving(false);
    }

    async function handleAddAddress(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "add-address", ...addressForm }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            await fetchAddresses();
            setShowAddressForm(false);
            setAddressForm({ firstName: "", lastName: "", street1: "", street2: "", city: "", province: "ON", postalCode: "", phone: "", isDefault: false });
        } catch (e) {
            setSaveMsg(e instanceof Error ? e.message : "Failed to add address");
        }
        setSaving(false);
    }

    async function handleDeleteAddress(id: string) {
        try {
            const res = await fetch("/api/account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete-address", addressId: id }),
            });
            if (res.ok) await fetchAddresses();
        } catch { /* silent */ }
    }

    const tabs: { id: Tab; label: string; icon: typeof User }[] = [
        { id: "orders", label: "Order History", icon: Package },
        { id: "addresses", label: "Saved Addresses", icon: MapPin },
        { id: "settings", label: "Account Settings", icon: Settings },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-forest" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-forest dark:text-cream">My Account</h1>
                        <p className="text-muted-foreground mt-1">
                            {profile ? (profile.name || profile.email) : "Manage your account"}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 text-red-500 hover:text-red-600" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" /> Sign Out
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white dark:bg-card rounded-xl border border-border p-4 space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setSaveMsg(""); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === tab.id
                                        ? "bg-forest/10 text-forest dark:text-leaf font-medium"
                                        : "text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

                            {/* ─── ORDERS TAB ─── */}
                            {activeTab === "orders" && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-forest dark:text-cream">Order History</h2>
                                    {orders.length === 0 ? (
                                        <div className="bg-white dark:bg-card rounded-xl border border-border p-10 text-center text-muted-foreground">
                                            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                            <p className="mb-4">No orders yet. Start shopping to see your order history here.</p>
                                            <Link href="/shop">
                                                <Button variant="brand" size="sm">Browse Collection</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        orders.map((order) => {
                                            const config = STATUS_CONFIG[order.status] || DEFAULT_STATUS;
                                            const Icon = config.icon;
                                            return (
                                                <div key={order.id} className="bg-white dark:bg-card rounded-xl border border-border p-5">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <span className="font-bold text-forest dark:text-cream">{order.id}</span>
                                                            <span className="text-sm text-muted-foreground ml-3">
                                                                {new Date(order.date).toLocaleDateString("en-CA", {
                                                                    year: "numeric", month: "short", day: "numeric",
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                                                            <Icon className="h-3.5 w-3.5" />
                                                            {config.label}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">{order.items} item{order.items !== 1 ? "s" : ""}</span>
                                                        <div className="flex items-center gap-3">
                                                            {order.itemDetails && order.itemDetails.length > 0 && (
                                                                <QuickReorder items={order.itemDetails} orderNumber={order.id} />
                                                            )}
                                                            <span className="font-bold text-lg">${order.total.toFixed(2)} CAD</span>
                                                        </div>
                                                    </div>
                                                    {order.tracking && (
                                                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                                                            <span className="text-xs text-muted-foreground">Tracking: {order.tracking}</span>
                                                            <Link
                                                                href={`https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${order.tracking}`}
                                                                target="_blank"
                                                                className="text-xs text-forest dark:text-leaf font-medium hover:underline flex items-center gap-1"
                                                            >
                                                                Track <ChevronRight className="h-3 w-3" />
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {/* ─── ADDRESSES TAB ─── */}
                            {activeTab === "addresses" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-forest dark:text-cream">Saved Addresses</h2>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1"
                                            onClick={() => setShowAddressForm(!showAddressForm)}
                                        >
                                            <Plus className="h-4 w-4" /> Add Address
                                        </Button>
                                    </div>

                                    {showAddressForm && (
                                        <form onSubmit={handleAddAddress} className="bg-white dark:bg-card rounded-xl border border-border p-6 space-y-4">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <input required placeholder="First Name" value={addressForm.firstName}
                                                    onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                                                    className="px-4 py-3 rounded-lg border border-border bg-muted outline-none text-sm" />
                                                <input required placeholder="Last Name" value={addressForm.lastName}
                                                    onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                                                    className="px-4 py-3 rounded-lg border border-border bg-muted outline-none text-sm" />
                                            </div>
                                            <input required placeholder="Street Address" value={addressForm.street1}
                                                onChange={(e) => setAddressForm({ ...addressForm, street1: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted outline-none text-sm" />
                                            <input placeholder="Apt / Suite (optional)" value={addressForm.street2}
                                                onChange={(e) => setAddressForm({ ...addressForm, street2: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted outline-none text-sm" />
                                            <div className="grid sm:grid-cols-3 gap-4">
                                                <input required placeholder="City" value={addressForm.city}
                                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                    className="px-4 py-3 rounded-lg border border-border bg-muted outline-none text-sm" />
                                                <select value={addressForm.province}
                                                    onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                                                    className="px-4 py-3 rounded-lg border border-border bg-muted outline-none text-sm">
                                                    {["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"].map((p) => (
                                                        <option key={p} value={p}>{p}</option>
                                                    ))}
                                                </select>
                                                <input required placeholder="Postal Code" value={addressForm.postalCode}
                                                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                                    className="px-4 py-3 rounded-lg border border-border bg-muted outline-none text-sm" />
                                            </div>
                                            <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <input type="checkbox" checked={addressForm.isDefault}
                                                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
                                                Set as default shipping address
                                            </label>
                                            <div className="flex gap-3">
                                                <Button type="submit" variant="brand" size="sm" disabled={saving}>
                                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Address"}
                                                </Button>
                                                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                                            </div>
                                        </form>
                                    )}

                                    {addresses.length === 0 && !showAddressForm ? (
                                        <div className="bg-white dark:bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">
                                            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                            <p>No saved addresses yet. Add one above or addresses will be saved from your checkout history.</p>
                                        </div>
                                    ) : (
                                        addresses.map((addr) => (
                                            <div key={addr.id} className="bg-white dark:bg-card rounded-xl border border-border p-5 flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-forest dark:text-cream">
                                                        {addr.firstName} {addr.lastName}
                                                        {addr.isDefault && (
                                                            <span className="ml-2 text-[10px] uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{addr.street1}</p>
                                                    {addr.street2 && <p className="text-sm text-muted-foreground">{addr.street2}</p>}
                                                    <p className="text-sm text-muted-foreground">{addr.city}, {addr.province} {addr.postalCode}</p>
                                                    {addr.phone && <p className="text-xs text-muted-foreground mt-1">{addr.phone}</p>}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteAddress(addr.id)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* ─── SETTINGS TAB ─── */}
                            {activeTab === "settings" && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-forest dark:text-cream">Account Settings</h2>

                                    {saveMsg && (
                                        <div className={`p-3 rounded-lg text-sm ${saveMsg.includes("success") ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-red-50 dark:bg-red-900/20 text-red-600"}`}>
                                            {saveMsg}
                                        </div>
                                    )}

                                    {/* Profile Form */}
                                    <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-card rounded-xl border border-border p-6 space-y-4">
                                        <h3 className="font-bold text-forest dark:text-cream">Personal Information</h3>
                                        <div>
                                            <label className="text-sm font-medium text-forest dark:text-cream mb-1.5 block">Full Name</label>
                                            <input type="text" value={profileForm.name}
                                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-forest dark:text-cream mb-1.5 block">Email</label>
                                            <input type="email" value={profile?.email || ""} disabled
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-muted-foreground cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-forest dark:text-cream mb-1.5 block">Phone</label>
                                            <input type="tel" value={profileForm.phone}
                                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                placeholder="(613) 555-0000"
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition" />
                                        </div>
                                        <Button type="submit" variant="brand" className="mt-2" disabled={saving}>
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            Save Changes
                                        </Button>
                                    </form>

                                    {/* Password Form */}
                                    <form onSubmit={handleUpdatePassword} className="bg-white dark:bg-card rounded-xl border border-border p-6">
                                        <h3 className="font-bold text-forest dark:text-cream mb-3">Change Password</h3>
                                        <div className="space-y-3">
                                            <input type="password" placeholder="Current Password" required
                                                value={passwordForm.current}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted outline-none" />
                                            <input type="password" placeholder="New Password (min 8 chars)" required minLength={8}
                                                value={passwordForm.new}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted outline-none" />
                                            <Button type="submit" variant="outline" disabled={saving}>
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                Update Password
                                            </Button>
                                        </div>
                                    </form>

                                    {/* Account Info */}
                                    <div className="bg-muted rounded-xl p-4 text-xs text-muted-foreground">
                                        <p>Account created: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" }) : "—"}</p>
                                        <p className="mt-1">Account type: {profile?.role || "CUSTOMER"}</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
