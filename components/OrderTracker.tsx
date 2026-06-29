"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Bell,
} from "lucide-react";
import { useOrderTracking } from "@/hooks/useOrderTracking";

// ─── Status step definitions ────────────────────────────────

interface StepDef {
  key: string;
  label: string;
  icon: typeof Clock;
  statuses: string[]; // Which OrderStatus values map to this step
}

const STEPS: StepDef[] = [
  {
    key: "placed",
    label: "Order Placed",
    icon: ShoppingBag,
    statuses: ["PENDING", "PENDING_REVIEW"],
  },
  {
    key: "processing",
    label: "Processing",
    icon: CreditCard,
    statuses: ["PROCESSING", "PAYMENT_CONFIRMED", "LABEL_PRINTED"],
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: Package,
    statuses: ["SHIPPED"],
  },
  {
    key: "in_transit",
    label: "In Transit",
    icon: Truck,
    statuses: ["IN_TRANSIT"],
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: CheckCircle,
    statuses: ["DELIVERED", "COMPLETED"],
  },
];

function getStepIndex(status: string): number {
  const idx = STEPS.findIndex((s) => s.statuses.includes(status));
  return idx >= 0 ? idx : 0;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const CARRIER_LABELS: Record<string, string> = {
  canada_post: "Canada Post",
  purolator: "Purolator",
  ups: "UPS",
  fedex: "FedEx",
};

// ─── Search Form ────────────────────────────────────────────

function TrackingSearchForm({
  defaultOrder,
  defaultEmail,
  onSearch,
}: {
  defaultOrder?: string;
  defaultEmail?: string;
  onSearch: (orderNumber: string, email: string) => void;
}) {
  const [orderValue, setOrderValue] = useState(defaultOrder || "");
  const [emailValue, setEmailValue] = useState(defaultEmail || "");

  // Keep fields in sync when defaults arrive after mount (URL / sessionStorage).
  useEffect(() => { if (defaultOrder) setOrderValue(defaultOrder); }, [defaultOrder]);
  useEffect(() => { if (defaultEmail) setEmailValue(defaultEmail); }, [defaultEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order = orderValue.trim();
    const email = emailValue.trim();
    if (order && email) onSearch(order, email);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-10 space-y-3">
      <div className="relative">
        <label htmlFor="track-order-number" className="sr-only">Order number</label>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          id="track-order-number"
          type="text"
          value={orderValue}
          onChange={(e) => setOrderValue(e.target.value)}
          placeholder="Order number (e.g. MM-...)"
          required
          className="w-full bg-card/60 backdrop-blur rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-lg shadow-black/20 transition-shadow"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <label htmlFor="track-order-email" className="sr-only">Email used on the order</label>
          <input
            id="track-order-email"
            type="email"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            placeholder="Email used on the order"
            required
            className="w-full bg-card/60 backdrop-blur rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-lg shadow-black/20 transition-shadow"
          />
        </div>
        <button
          type="submit"
          className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-sm rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
        >
          Track
        </button>
      </div>
    </form>
  );
}

// ─── Status Stepper ─────────────────────────────────────────

function StatusStepper({
  currentStatus,
  statusHistory,
}: {
  currentStatus: string;
  statusHistory: { status: string; createdAt: string }[];
}) {
  const currentIdx = getStepIndex(currentStatus);
  const isCancelled = ["CANCELLED", "REFUNDED", "FAILED"].includes(currentStatus);
  // ON_HOLD is the normal pre-payment state of an Interac e-Transfer order (our
  // primary rail) until Blacfin confirms the deposit — NOT a failure. Show it as
  // an amber "awaiting payment" notice, never the red contact-support card.
  const isAwaitingPayment = currentStatus === "ON_HOLD";

  // Build a map from step key to the earliest timestamp for that step
  const stepTimestamps = new Map<string, string>();
  for (const entry of statusHistory) {
    const idx = getStepIndex(entry.status);
    if (idx >= 0) {
      const stepKey = STEPS[idx].key;
      const existing = stepTimestamps.get(stepKey);
      if (!existing || new Date(entry.createdAt) < new Date(existing)) {
        stepTimestamps.set(stepKey, entry.createdAt);
      }
    }
  }

  if (isAwaitingPayment) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 shadow-lg shadow-amber-500/5"
      >
        <Clock className="w-6 h-6 text-amber-400 shrink-0" />
        <div>
          <p className="text-amber-400 font-bold text-sm">
            Awaiting your e-Transfer payment
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            We&apos;ll update this automatically once your Interac e-Transfer is received —
            no action needed if you&apos;ve already sent it.
          </p>
        </div>
      </motion.div>
    );
  }

  if (isCancelled) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 shadow-lg shadow-red-500/5"
      >
        <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
        <div>
          <p className="text-red-400 font-bold text-sm">
            Order {currentStatus.replace(/_/g, " ").toLowerCase()}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Contact support if you have questions about this order.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="py-6">
      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:block">
        <div className="relative">
          {/* Background track */}
          <div className="absolute top-5 left-[10%] right-[10%] h-[3px] bg-white/5 rounded-full" />
          {/* Filled track */}
          <motion.div
            className="absolute top-5 left-[10%] h-[3px] bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${(currentIdx / (STEPS.length - 1)) * 80}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          <div className="relative flex justify-between">
            {STEPS.map((step, i) => {
              const isCompleted = i < currentIdx;
              const isCurrent = i === currentIdx;
              const isFuture = i > currentIdx;
              const Icon = step.icon;
              const timestamp = stepTimestamps.get(step.key);

              return (
                <div
                  key={step.key}
                  className="flex flex-col items-center w-[20%]"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                      isCompleted
                        ? "bg-gradient-to-br from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30"
                        : isCurrent
                          ? "bg-gradient-to-br from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/40"
                          : "bg-white/5 text-white/20"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {/* Pulsing ring for current step */}
                    {isCurrent && (
                      <span className="absolute inset-0 rounded-full animate-ping bg-amber-500/30" />
                    )}
                  </motion.div>

                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className={`mt-3 text-[11px] font-semibold uppercase tracking-wider text-center leading-tight ${
                      isCompleted || isCurrent
                        ? "text-amber-400"
                        : "text-white/25"
                    }`}
                  >
                    {step.label}
                  </motion.span>

                  {timestamp && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 + 0.4 }}
                      className="mt-1 text-[10px] text-muted-foreground"
                    >
                      {formatDate(timestamp)}
                    </motion.span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: vertical stepper */}
      <div className="sm:hidden space-y-0">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIdx;
          const isCurrent = i === currentIdx;
          const Icon = step.icon;
          const timestamp = stepTimestamps.get(step.key);
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.key} className="flex gap-4">
              {/* Left: icon + connector */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.08, type: "spring" }}
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? "bg-gradient-to-br from-amber-500 to-orange-500 text-black"
                      : isCurrent
                        ? "bg-gradient-to-br from-amber-500 to-orange-500 text-black"
                        : "bg-white/5 text-white/20"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-amber-500/30" />
                  )}
                </motion.div>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-[32px] my-1 rounded-full transition-colors ${
                      isCompleted
                        ? "bg-gradient-to-b from-amber-500 to-orange-500"
                        : "bg-white/5"
                    }`}
                  />
                )}
              </div>

              {/* Right: text */}
              <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                <p
                  className={`text-sm font-semibold ${
                    isCompleted || isCurrent ? "text-amber-400" : "text-white/25"
                  }`}
                >
                  {step.label}
                </p>
                {timestamp && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatDateTime(timestamp)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main OrderTracker Component ────────────────────────────

export default function OrderTracker({
  initialOrderNumber,
  initialEmail,
  compact = false,
}: {
  initialOrderNumber?: string;
  initialEmail?: string;
  compact?: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlOrder = searchParams.get("order");

  // `active*` drives the tracking fetch. In compact mode (post-checkout) we
  // already have the order + (session or stashed email), so we fetch right away.
  // On the public page we only fetch once order# + email are supplied.
  const [activeOrder, setActiveOrder] = useState<string | null>(
    compact ? initialOrderNumber || null : null
  );
  const [activeEmail, setActiveEmail] = useState<string>(initialEmail || "");

  // Form default for the email field — pre-fill from the email the customer
  // just used at checkout (stored in sessionStorage) for a smooth re-track.
  const [draftEmail, setDraftEmail] = useState<string>(initialEmail || "");

  useEffect(() => {
    if (compact) return;
    let stashedEmail = "";
    try { stashedEmail = sessionStorage.getItem("mm-last-order-email") || ""; } catch { /* ignore */ }
    if (stashedEmail) setDraftEmail((e) => e || stashedEmail);
    // If we arrived with both an order number (URL) and a known email, auto-track.
    const order = initialOrderNumber || urlOrder || "";
    if (order && (initialEmail || stashedEmail)) {
      setActiveOrder(order);
      setActiveEmail(initialEmail || stashedEmail);
    }
  }, [urlOrder, initialOrderNumber, initialEmail, compact]);

  const {
    order,
    statusHistory,
    isLoading,
    error,
    lastUpdated,
    hasNewUpdate,
    clearNewUpdate,
  } = useOrderTracking(activeOrder, activeEmail);

  const handleSearch = (orderNum: string, email: string) => {
    setActiveOrder(orderNum);
    setActiveEmail(email);
    // Reflect only the order number in the URL — never the email.
    const url = new URL(window.location.href);
    url.searchParams.set("order", orderNum);
    router.push(url.pathname + url.search);
  };

  return (
    <div className={compact ? "" : "max-w-2xl mx-auto px-4 py-12"}>
      {/* Search form (hidden in compact mode) */}
      {!compact && (
        <TrackingSearchForm
          defaultOrder={initialOrderNumber || urlOrder || undefined}
          defaultEmail={draftEmail || undefined}
          onSearch={handleSearch}
        />
      )}

      {/* Loading */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-16 gap-4"
          >
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Looking up your order...
            </p>
          </motion.div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl p-6 text-center bg-red-500/10 shadow-lg shadow-red-500/5"
          >
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-bold">{error}</p>
          </motion.div>
        )}

        {/* Order found */}
        {!isLoading && order && (
          <motion.div
            key="order"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* New update banner */}
            <AnimatePresence>
              {hasNewUpdate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={clearNewUpdate}
                    className="w-full flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 shadow-lg shadow-amber-500/5 text-amber-400 text-sm font-medium hover:bg-amber-500/15 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    Status updated to:{" "}
                    {order.status.replace(/_/g, " ")}
                    <span className="ml-auto text-xs text-amber-500/60">
                      Tap to dismiss
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main card */}
            <div className="rounded-2xl bg-card/60 backdrop-blur p-6 shadow-2xl shadow-black/30">
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {order.orderNumber}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Placed {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className="text-xl font-bold text-amber-400">
                  {formatPrice(order.total)}
                </span>
              </div>

              {/* Status stepper */}
              <StatusStepper
                currentStatus={order.status}
                statusHistory={order.statusHistory}
              />

              {/* Estimated delivery */}
              {order.estimatedDelivery && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 mb-4"
                >
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-300/80">
                    Estimated delivery:{" "}
                    <span className="font-semibold text-amber-400">
                      {formatDate(order.estimatedDelivery)}
                    </span>
                  </p>
                </motion.div>
              )}

              {/* Tracking number + carrier */}
              {order.trackingNumber && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] mb-4">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Tracking Number
                    </p>
                    <p className="font-mono font-bold text-white text-sm truncate">
                      {order.trackingNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {order.carrier && (
                      <span className="text-xs text-muted-foreground">
                        {CARRIER_LABELS[order.carrier] || order.carrier}
                      </span>
                    )}
                    {order.carrierTrackingUrl && (
                      <a
                        href={order.carrierTrackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                      >
                        Track <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Order items */}
              {order.items.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    Items
                  </p>
                  <div className="space-y-1.5">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-white/80 truncate mr-2">
                          {item.name}{" "}
                          <span className="text-muted-foreground">
                            x{item.quantity}
                          </span>
                        </span>
                        <span className="text-muted-foreground shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping address */}
              {order.shippingAddress && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03]">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="text-[10px] uppercase tracking-wider mb-0.5 text-white/40">
                      Ship To
                    </p>
                    <p className="text-white/70">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.province}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status History Timeline */}
            {statusHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl bg-card/60 backdrop-blur p-6 shadow-2xl shadow-black/30"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-4">
                  Status History
                </h3>
                <div className="space-y-0">
                  {statusHistory.map((entry, i) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                            i === 0
                              ? "bg-amber-500 shadow-md shadow-amber-500/50"
                              : "bg-white/10"
                          }`}
                        />
                        {i < statusHistory.length - 1 && (
                          <div className="w-px flex-1 bg-white/5 mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p
                          className={`text-sm font-semibold ${
                            i === 0 ? "text-amber-400" : "text-white/60"
                          }`}
                        >
                          {entry.status.replace(/_/g, " ")}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {entry.note}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {formatDateTime(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Last updated indicator */}
            {lastUpdated && (
              <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <RefreshCw className="w-3 h-3" />
                Last updated {lastUpdated.toLocaleTimeString()} — auto-refreshing
              </div>
            )}
          </motion.div>
        )}

        {/* No order searched yet */}
        {!isLoading && !error && !order && !activeOrder && !compact && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Package className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Enter your order number above to track your delivery
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
