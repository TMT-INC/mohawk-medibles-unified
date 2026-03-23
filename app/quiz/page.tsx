"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Sparkles, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

// Lightweight product type matching the quiz API response
interface QuizProduct {
    id: number;
    slug: string;
    name: string;
    category: string;
    price: number;
    image: string;
    altText: string;
    path: string;
    shortDescription: string;
    metaDescription: string;
    specs: {
        thc: string;
        cbd: string;
        type: string;
        weight: string;
        terpenes: string[];
        lineage: string;
    };
    effects: string[];
    eeatNarrative: string;
}

// ─── Quiz Data ───────────────────────────────────────────

interface QuizQuestion {
    id: string;
    title: string;
    subtitle: string;
    options: { label: string; value: string; emoji: string }[];
}

const QUESTIONS: QuizQuestion[] = [
    {
        id: "experience",
        title: "What experience are you looking for?",
        subtitle: "Choose the vibe that speaks to you",
        options: [
            { label: "Relaxation", value: "relaxation", emoji: "\u{1F9D8}" },
            { label: "Energy", value: "energy", emoji: "\u26A1" },
            { label: "Creativity", value: "creativity", emoji: "\u{1F3A8}" },
            { label: "Pain Relief", value: "pain-relief", emoji: "\u{1FA79}" },
            { label: "Sleep", value: "sleep", emoji: "\u{1F31C}" },
        ],
    },
    {
        id: "consumption",
        title: "How do you prefer to consume?",
        subtitle: "Pick your preferred method",
        options: [
            { label: "Flower / Smoke", value: "flower", emoji: "\u{1F33F}" },
            { label: "Edibles", value: "edibles", emoji: "\u{1F36B}" },
            { label: "Concentrates / Dabs", value: "concentrates", emoji: "\u{1F4A7}" },
            { label: "Vapes", value: "vapes", emoji: "\u{1F32C}\uFE0F" },
            { label: "Capsules / Oils", value: "oils", emoji: "\u{1F48A}" },
        ],
    },
    {
        id: "level",
        title: "What\u2019s your experience level?",
        subtitle: "No judgment \u2014 we\u2019ll tailor recommendations to you",
        options: [
            { label: "New to cannabis", value: "beginner", emoji: "\u{1F331}" },
            { label: "Occasional user", value: "occasional", emoji: "\u{1F44C}" },
            { label: "Regular user", value: "regular", emoji: "\u{1F44D}" },
            { label: "Experienced", value: "experienced", emoji: "\u{1F525}" },
        ],
    },
    {
        id: "budget",
        title: "What\u2019s your budget?",
        subtitle: "We have quality options at every price point",
        options: [
            { label: "Under $30", value: "under-30", emoji: "\u{1F4B5}" },
            { label: "$30 \u2013 $60", value: "30-60", emoji: "\u{1F4B0}" },
            { label: "$60 \u2013 $100", value: "60-100", emoji: "\u{1F48E}" },
            { label: "$100+", value: "100-plus", emoji: "\u{1F451}" },
        ],
    },
    {
        id: "flavor",
        title: "Any flavor preferences?",
        subtitle: "Terpene profiles shape the taste and experience",
        options: [
            { label: "Fruity", value: "fruity", emoji: "\u{1F353}" },
            { label: "Earthy", value: "earthy", emoji: "\u{1FAB5}" },
            { label: "Citrus", value: "citrus", emoji: "\u{1F34B}" },
            { label: "Sweet", value: "sweet", emoji: "\u{1F36C}" },
            { label: "No preference", value: "none", emoji: "\u{1F937}" },
        ],
    },
];

// ─── Category Mapping ────────────────────────────────────

const CONSUMPTION_TO_CATEGORIES: Record<string, string[]> = {
    flower: ["Flower"],
    edibles: ["Edibles"],
    concentrates: ["Concentrates"],
    vapes: ["Vapes"],
    oils: ["CBD", "Bath & Body"],
};

const BUDGET_RANGES: Record<string, [number, number]> = {
    "under-30": [0, 30],
    "30-60": [30, 60],
    "60-100": [60, 100],
    "100-plus": [100, Infinity],
};

const EXPERIENCE_EFFECTS: Record<string, string[]> = {
    relaxation: ["relaxing", "calming", "chill", "indica"],
    energy: ["energizing", "uplifting", "sativa", "focus"],
    creativity: ["creative", "euphoric", "uplifting", "sativa"],
    "pain-relief": ["pain", "relief", "body", "indica", "cbd"],
    sleep: ["sleep", "sedating", "indica", "relaxing", "night"],
};

const FLAVOR_TERPENES: Record<string, string[]> = {
    fruity: ["myrcene", "limonene", "linalool", "berry", "fruit", "grape", "mango"],
    earthy: ["caryophyllene", "humulene", "pinene", "earth", "wood", "pine"],
    citrus: ["limonene", "terpinolene", "lemon", "orange", "citrus", "lime"],
    sweet: ["linalool", "myrcene", "sweet", "candy", "vanilla", "cookie"],
    none: [],
};

// ─── Component ───────────────────────────────────────────

export default function QuizPage() {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [products, setProducts] = useState<QuizProduct[]>([]);
    const [loadingResults, setLoadingResults] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const { addItem } = useCart();

    const currentQuestion = QUESTIONS[step];
    const totalSteps = QUESTIONS.length;
    const progress = showResults ? 100 : ((step) / totalSteps) * 100;

    function handleSelect(value: string) {
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);

        if (step < totalSteps - 1) {
            setTimeout(() => setStep(step + 1), 300);
        } else {
            // Final question answered — fetch results
            setLoadingResults(true);
            fetchResults(newAnswers);
        }
    }

    async function fetchResults(finalAnswers: Record<string, string>) {
        try {
            const res = await fetch("/api/products/quiz");
            if (!res.ok) throw new Error("Failed to load products");
            const data = await res.json();
            const allProducts: QuizProduct[] = data.products || [];
            const matched = matchProducts(allProducts, finalAnswers);
            setProducts(matched);
        } catch {
            // Fallback: try loading from window or show empty
            setProducts([]);
        }
        setLoadingResults(false);
        setShowResults(true);
    }

    function matchProducts(allProducts: QuizProduct[], ans: Record<string, string>): QuizProduct[] {
        const targetCategories = CONSUMPTION_TO_CATEGORIES[ans.consumption] || [];
        const [minPrice, maxPrice] = BUDGET_RANGES[ans.budget] || [0, Infinity];
        const desiredEffects = EXPERIENCE_EFFECTS[ans.experience] || [];
        const desiredTerpenes = FLAVOR_TERPENES[ans.flavor] || [];

        // Score each product
        const scored = allProducts.map((product) => {
            let score = 0;

            // Category match (strongest signal)
            if (targetCategories.some((cat) => product.category.toLowerCase() === cat.toLowerCase())) {
                score += 10;
            }

            // Price range match
            if (product.price >= minPrice && product.price <= maxPrice) {
                score += 5;
            } else if (product.price >= minPrice * 0.8 && product.price <= maxPrice * 1.2) {
                score += 2; // close to range
            }

            // Effects match
            const productText = [
                product.name,
                product.shortDescription,
                product.specs?.type || "",
                ...(product.effects || []),
                product.eeatNarrative || "",
            ].join(" ").toLowerCase();

            for (const effect of desiredEffects) {
                if (productText.includes(effect)) score += 2;
            }

            // Terpene match
            const productTerpenes = (product.specs?.terpenes || []).map((t) => t.toLowerCase());
            const allTerpText = [...productTerpenes, productText].join(" ");
            for (const terp of desiredTerpenes) {
                if (allTerpText.includes(terp)) score += 1.5;
            }

            // Experience level adjustment
            if (ans.level === "beginner" && product.price < 40) score += 1;
            if (ans.level === "experienced" && product.price > 50) score += 1;

            return { product, score };
        });

        // Filter to at least category match, sort by score, take top 6
        const results = scored
            .filter((s) => s.score >= 5)
            .sort((a, b) => b.score - a.score)
            .slice(0, 6)
            .map((s) => s.product);

        // If not enough results, fill with top-scored products regardless
        if (results.length < 4) {
            const extras = scored
                .filter((s) => !results.find((r) => r.id === s.product.id))
                .sort((a, b) => b.score - a.score)
                .slice(0, 6 - results.length)
                .map((s) => s.product);
            return [...results, ...extras];
        }

        return results;
    }

    function handleRetake() {
        setStep(0);
        setAnswers({});
        setProducts([]);
        setShowResults(false);
        setLoadingResults(false);
    }

    function handleAddToCart(product: QuizProduct) {
        addItem({
            id: String(product.id),
            name: product.name,
            price: product.price,
            quantity: 1,
        });
        toast.success(`${product.name} added to cart`);
    }

    function handleGoBack() {
        if (step > 0) setStep(step - 1);
    }

    return (
        <div className="min-h-screen bg-background pt-20 pb-16">
            <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            {showResults ? "Your Results" : `Question ${step + 1} of ${totalSteps}`}
                        </span>
                        {!showResults && step > 0 && (
                            <button
                                onClick={handleGoBack}
                                className="text-xs text-lime-500 hover:text-lime-400 flex items-center gap-1 transition-colors"
                            >
                                <ArrowLeft className="h-3 w-3" /> Back
                            </button>
                        )}
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-lime-500 to-lime-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {/* Loading State */}
                {loadingResults && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <Sparkles className="h-12 w-12 mx-auto mb-4 text-lime-500 animate-pulse" />
                        <p className="text-lg font-medium text-foreground">Analyzing your preferences...</p>
                        <p className="text-sm text-muted-foreground mt-1">Finding your perfect match</p>
                    </motion.div>
                )}

                {/* Questions */}
                {!showResults && !loadingResults && currentQuestion && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                    {currentQuestion.title}
                                </h1>
                                <p className="text-muted-foreground mt-2">{currentQuestion.subtitle}</p>
                            </div>

                            <div className="space-y-3">
                                {currentQuestion.options.map((option) => {
                                    const isSelected = answers[currentQuestion.id] === option.value;
                                    return (
                                        <motion.button
                                            key={option.value}
                                            onClick={() => handleSelect(option.value)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-left transition-all duration-200 ${
                                                isSelected
                                                    ? "bg-lime-500/20 border-2 border-lime-500 shadow-lg shadow-lime-500/10"
                                                    : "bg-zinc-900/60 border-2 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80"
                                            }`}
                                        >
                                            <span className="text-2xl">{option.emoji}</span>
                                            <span className={`text-base font-medium ${isSelected ? "text-lime-400" : "text-foreground"}`}>
                                                {option.label}
                                            </span>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="ml-auto w-6 h-6 rounded-full bg-lime-500 flex items-center justify-center"
                                                >
                                                    <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* Results */}
                {showResults && !loadingResults && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="text-center mb-8">
                            <Sparkles className="h-8 w-8 mx-auto mb-3 text-lime-500" />
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                Your Perfect Products
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Based on your preferences, we think you&apos;ll love these
                            </p>
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-12 bg-zinc-900/60 rounded-xl">
                                <p className="text-muted-foreground mb-4">
                                    We couldn&apos;t find exact matches. Browse our full collection instead!
                                </p>
                                <Link href="/shop">
                                    <Button variant="brand">Browse All Products</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {products.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-zinc-900/60 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-lime-500/5 transition-all duration-300 group"
                                    >
                                        <Link href={product.path}>
                                            <div className="relative aspect-square bg-zinc-800 overflow-hidden">
                                                <Image
                                                    src={product.image}
                                                    alt={product.altText || product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    sizes="(max-width: 640px) 100vw, 50vw"
                                                />
                                                {idx === 0 && (
                                                    <div className="absolute top-3 left-3 bg-lime-500 text-black text-xs font-bold px-2.5 py-1 rounded-full">
                                                        Best Match
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                        <div className="p-4">
                                            <Link href={product.path}>
                                                <h3 className="font-bold text-foreground group-hover:text-lime-400 transition-colors line-clamp-1">
                                                    {product.name}
                                                </h3>
                                            </Link>
                                            <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {product.shortDescription || product.metaDescription}
                                            </p>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-lg font-bold text-lime-400">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1.5 border-lime-500/30 text-lime-400 hover:bg-lime-500/10"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleAddToCart(product);
                                                    }}
                                                >
                                                    <ShoppingBag className="h-3.5 w-3.5" /> Add
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                            <Button
                                variant="outline"
                                className="gap-2 border-zinc-700 hover:border-lime-500/30"
                                onClick={handleRetake}
                            >
                                <RotateCcw className="h-4 w-4" /> Retake Quiz
                            </Button>
                            <Link href="/shop">
                                <Button variant="brand" className="gap-2">
                                    <ShoppingBag className="h-4 w-4" /> Browse All Products
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
