"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playStatusChangeSound, triggerVibration } from "@/lib/notificationSound";
import { toast } from "sonner";

/** Statuses where we stop polling */
const TERMINAL_STATUSES = new Set(["DELIVERED", "COMPLETED", "CANCELLED", "REFUNDED", "FAILED"]);

const POLL_INTERVAL = 10_000; // 10 seconds

export interface OrderTrackingItem {
  name: string;
  quantity: number;
  price: number;
}

export interface StatusHistoryEntry {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
}

export interface TrackingData {
  orderNumber: string;
  status: string;
  total: number;
  trackingNumber: string | null;
  carrier: string | null;
  carrierTrackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  estimatedDelivery: string | null;
  items: OrderTrackingItem[];
  statusHistory: StatusHistoryEntry[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
  } | null;
}

export interface UseOrderTrackingReturn {
  order: TrackingData | null;
  status: string | null;
  statusHistory: StatusHistoryEntry[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  hasNewUpdate: boolean;
  clearNewUpdate: () => void;
}

export function useOrderTracking(orderNumber: string | null, email?: string | null): UseOrderTrackingReturn {
  const [order, setOrder] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);

  const previousStatusRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstFetchRef = useRef(true);

  const clearNewUpdate = useCallback(() => setHasNewUpdate(false), []);

  const fetchOrder = useCallback(async () => {
    if (!orderNumber) return;

    try {
      if (isFirstFetchRef.current) {
        setIsLoading(true);
      }

      const url = `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}${email ? `&email=${encodeURIComponent(email)}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Order not found. Please check your order number.");
          setOrder(null);
        } else if (res.status === 429) {
          // Rate limited — silently skip
        } else {
          setError("Unable to fetch order status. Please try again.");
        }
        return;
      }

      const data: TrackingData = await res.json();
      setOrder(data);
      setError(null);
      setLastUpdated(new Date());

      // Detect status change (skip first fetch to avoid alert on page load)
      if (!isFirstFetchRef.current && previousStatusRef.current && previousStatusRef.current !== data.status) {
        setHasNewUpdate(true);
        playStatusChangeSound();
        triggerVibration();
        const label = data.status.replace(/_/g, " ");
        toast.success(`Your order status updated to: ${label}`, {
          duration: 6000,
        });
      }

      previousStatusRef.current = data.status;
      isFirstFetchRef.current = false;

      // Stop polling if terminal status
      if (TERMINAL_STATUSES.has(data.status) && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch {
      // Network error — skip silently on polls, show on first load
      if (isFirstFetchRef.current) {
        setError("Unable to connect. Please check your internet connection.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [orderNumber, email]);

  useEffect(() => {
    if (!orderNumber) {
      setOrder(null);
      setError(null);
      return;
    }

    // Reset state for new order number
    isFirstFetchRef.current = true;
    previousStatusRef.current = null;
    setHasNewUpdate(false);

    // Initial fetch
    fetchOrder();

    // Start polling
    intervalRef.current = setInterval(fetchOrder, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [orderNumber, fetchOrder]);

  return {
    order,
    status: order?.status ?? null,
    statusHistory: order?.statusHistory ?? [],
    isLoading,
    error,
    lastUpdated,
    hasNewUpdate,
    clearNewUpdate,
  };
}
