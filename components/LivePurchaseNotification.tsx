"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

const FIRST_NAMES = [
    "Sarah", "James", "Emily", "Michael", "Sophie", "Daniel", "Chloe", "Ryan",
    "Madison", "Tyler", "Olivia", "Liam", "Emma", "Noah", "Ava", "Ethan",
    "Mia", "Lucas", "Isabella", "Mason",
];

const CITIES = [
    "Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton",
    "Winnipeg", "Halifax", "Hamilton", "Victoria", "Saskatoon", "Regina",
    "London", "Kitchener", "Mississauga",
];

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export default function LivePurchaseNotification() {
    const [visible, setVisible] = useState(false);
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [ready, setReady] = useState(false);

    // Wait 15 seconds before enabling notifications
    useEffect(() => {
        const timer = setTimeout(() => setReady(true), 15000);
        return () => clearTimeout(timer);
    }, []);

    const showNotification = useCallback(() => {
        setName(randomItem(FIRST_NAMES));
        setCity(randomItem(CITIES));
        setVisible(true);
        setTimeout(() => setVisible(false), 4000);
    }, []);

    useEffect(() => {
        if (!ready) return;

        // Show first one shortly after ready
        const initialDelay = setTimeout(() => {
            showNotification();
        }, 2000);

        // Then show on random interval (30-45s)
        let interval: ReturnType<typeof setInterval>;
        const startInterval = () => {
            interval = setInterval(() => {
                const delay = Math.random() * 15000; // 0-15s jitter within the interval
                setTimeout(showNotification, delay);
            }, 30000 + Math.random() * 15000);
        };

        const intervalDelay = setTimeout(startInterval, 5000);

        return () => {
            clearTimeout(initialDelay);
            clearTimeout(intervalDelay);
            if (interval) clearInterval(interval);
        };
    }, [ready, showNotification]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ x: -320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -320, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-6 left-4 z-[60] max-w-[280px]"
                >
                    <div className="bg-charcoal-deep/95 backdrop-blur-sm border border-lime/20 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="h-4 w-4 text-lime" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-cream font-medium leading-snug">
                                {name} from {city} just ordered
                            </p>
                            <p className="text-[10px] text-cream/50 mt-0.5">A few seconds ago</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
