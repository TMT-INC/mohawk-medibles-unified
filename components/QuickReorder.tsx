"use client";

import { useState } from "react";
import { ShoppingBag, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

interface OrderItem {
    id: string | number;
    name: string;
    quantity: number;
    price: number;
}

interface QuickReorderProps {
    items: OrderItem[];
    orderNumber?: string;
}

export default function QuickReorder({ items, orderNumber }: QuickReorderProps) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!items || items.length === 0) return null;

    function handleReorder() {
        setLoading(true);

        // Small delay for UX feedback
        setTimeout(() => {
            for (const item of items) {
                addItem({
                    id: String(item.id),
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                });
            }

            setLoading(false);
            setAdded(true);

            const count = items.reduce((sum, i) => sum + i.quantity, 0);
            toast.success(
                `${count} item${count !== 1 ? "s" : ""} added to cart${orderNumber ? ` from order ${orderNumber}` : ""}`,
                { duration: 3000 }
            );

            // Reset after 3 seconds
            setTimeout(() => setAdded(false), 3000);
        }, 300);
    }

    return (
        <Button
            variant="outline"
            size="sm"
            className={`gap-1.5 transition-all duration-300 ${
                added
                    ? "border-green-500/50 text-green-500 bg-green-500/10"
                    : "border-lime-500/30 text-lime-500 hover:bg-lime-500/10 hover:border-lime-500/50"
            }`}
            onClick={handleReorder}
            disabled={loading || added}
        >
            {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : added ? (
                <Check className="h-3.5 w-3.5" />
            ) : (
                <ShoppingBag className="h-3.5 w-3.5" />
            )}
            {added ? "Added!" : "Reorder"}
        </Button>
    );
}
