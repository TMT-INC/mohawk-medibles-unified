"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { emitCartEvent } from "@/lib/medagent-events";
import { decodeHtmlEntities } from "@/lib/utils";

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Persist cart to local storage (Simple mock for now)
    useEffect(() => {
        const saved = localStorage.getItem("mohawk-cart");
        if (saved) {
            const parsed: CartItem[] = JSON.parse(saved);
            // Decode any HTML entities left over from old cached names
            setItems(parsed.map(item => ({ ...item, name: decodeHtmlEntities(item.name) })));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("mohawk-cart", JSON.stringify(items));
    }, [items]);

    // Sync cart to server for abandoned cart tracking (debounced 5s)
    const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        syncTimerRef.current = setTimeout(() => {
            if (items.length === 0) return;
            fetch("/api/cart/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            }).catch(() => { /* silent — fire and forget */ });
        }, 5000);
        return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
    }, [items]);

    const addItem = React.useCallback((newItem: CartItem) => {
        setItems((current) => {
            const existing = current.find((i) => i.id === newItem.id);
            if (existing) {
                const newQty = existing.quantity + (newItem.quantity || 1);
                if (newQty <= 0) return current.filter((i) => i.id !== newItem.id);
                return current.map((i) =>
                    i.id === newItem.id ? { ...i, quantity: Math.min(newQty, 10) } : i
                );
            }
            const qty = Math.max(1, Math.min(newItem.quantity || 1, 10));
            return [...current, { ...newItem, quantity: qty }];
        });

        // Emit cart event for MedAgent real-time awareness
        emitCartEvent({ action: "add", item: newItem, source: "shop" });

        // Haptic feedback for "Premium" feel (Mobile)
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
    }, []);

    const removeItem = React.useCallback((id: string) => {
        setItems((current) => {
            const item = current.find((i) => i.id === id);
            if (item) emitCartEvent({ action: "remove", item, source: "shop" });
            return current.filter((i) => i.id !== id);
        });
    }, []);

    const updateQuantity = React.useCallback((id: string, quantity: number) => {
        if (quantity <= 0) {
            setItems((current) => {
                const item = current.find((i) => i.id === id);
                if (item) emitCartEvent({ action: "remove", item, source: "shop" });
                return current.filter((i) => i.id !== id);
            });
        } else {
            setItems((current) =>
                current.map((i) => i.id === id ? { ...i, quantity: Math.min(quantity, 10) } : i)
            );
        }
    }, []);

    const clearCart = React.useCallback(() => {
        emitCartEvent({ action: "clear", source: "shop" });
        setItems([]);
    }, []);

    const [isOpen, setIsOpen] = useState(false);
    const openCart = React.useCallback(() => setIsOpen(true), []);
    const closeCart = React.useCallback(() => setIsOpen(false), []);
    const itemCount = React.useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

    const total = React.useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

    const contextValue = React.useMemo(() => ({
        items, addItem, removeItem, updateQuantity, clearCart, total, isOpen, openCart, closeCart, itemCount
    }), [items, addItem, removeItem, updateQuantity, clearCart, total, isOpen, openCart, closeCart, itemCount]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
