"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    MessageCircle, X, Send, Mic, MicOff, Leaf,
    Truck, Sparkles, ChevronDown, Heart,
    Zap, Volume2, VolumeX, ShoppingCart, CreditCard,
    MapPin, HelpCircle, Package, Tag, Home, Phone,
    ArrowRight, Plus, Minus, Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import TypingIndicator from "@/components/ui/TypingIndicator";
import { getBehavior, trackPageVisit } from "@/lib/sage/behavioral";
import {
    getMemory, recordSessionStart, rememberName, rememberPreference,
    rememberTopic, recordMood, acknowledgePrivacy, clearMemory,
    detectNameInMessage, detectPreferences,
} from "@/lib/sage/memory";
import { emitCartEvent, emitNavEvent, emitFilterEvent, onCartEvent } from "@/lib/medagent-events";

// ─── Types ──────────────────────────────────────────────────

interface Message {
    id: number;
    text: string;
    sender: "user" | "medagent";
    mood?: string;
    products?: MedAgentProduct[];
    quickNav?: QuickNavItem[];
    cartAction?: CartActionCard;
}

interface MedAgentProduct {
    id: string;
    name: string;
    shortName: string;
    category: string;
    price: number;
    slug: string;
    path: string;
    image?: string;
}

interface MedAgentAction {
    type: "NAVIGATE" | "ADD_TO_CART" | "REMOVE_FROM_CART" | "CLEAR_CART" | "SEARCH" | "FILTER" | "CHECKOUT";
    payload: string;
}

interface QuickNavItem {
    label: string;
    href: string;
    icon: string;
}

interface CartActionCard {
    type: "added" | "removed" | "checkout_ready";
    productName?: string;
    cartTotal?: number;
    itemCount?: number;
}

// ─── Persona Definitions ───────────────────────────────────

type PersonaId = "medagent" | "turtle" | "trickster";

interface Persona {
    id: PersonaId;
    name: string;
    tagline: string;
    icon: React.ReactNode;
    greeting: string;
    inputPlaceholder: string;
    headerGradient: string;
}

const PERSONAS: Record<PersonaId, Persona> = {
    "medagent": {
        id: "medagent",
        name: "MedAgent",
        tagline: "Cannabis Guide",
        icon: <Leaf className="h-4 w-4 text-green-300" />,
        greeting: "Hey there! I'm MedAgent, your personal cannabis guide at Mohawk Medibles. What are you looking for today?",
        inputPlaceholder: "Ask MedAgent anything...",
        headerGradient: "from-green-900 to-green-800",
    },
    "turtle": {
        id: "turtle",
        name: "Wise Turtle",
        tagline: "Ancient Wisdom, Modern Herb",
        icon: <span className="text-base leading-none">🐢</span>,
        greeting: "Ah, welcome, young one. I am Turtle — I have watched these lands for many seasons, and I have learned a thing or two about the medicine plants. Come, tell me what your spirit needs today.",
        inputPlaceholder: "Speak to the Turtle...",
        headerGradient: "from-emerald-900 to-teal-800",
    },
    "trickster": {
        id: "trickster",
        name: "Coyote",
        tagline: "Chaotic Good Vibes Only",
        icon: <Zap className="h-4 w-4 text-orange-300" />,
        greeting: "YOOO what's good?! Coyote in the building! I'm the fun one around here — MedAgent's cool but they follow the rules. Me? I follow the VIBES. So what are we getting into today?",
        inputPlaceholder: "What are we getting into?",
        headerGradient: "from-orange-900 to-amber-800",
    },
};

// ─── Quick Navigation Routes ──────────────────────────────

const NAV_ROUTES = [
    { label: "Shop All", href: "/shop", icon: "🛒" },
    { label: "Flower", href: "/shop?category=Flower", icon: "🌿" },
    { label: "Edibles", href: "/shop?category=Edibles", icon: "🍬" },
    { label: "Concentrates", href: "/shop?category=Concentrates", icon: "💎" },
    { label: "Vapes", href: "/shop?category=Vapes", icon: "💨" },
    { label: "Deals", href: "/deals", icon: "🔥" },
    { label: "Delivery", href: "/delivery", icon: "🚚" },
    { label: "Cart", href: "/checkout", icon: "🛍️" },
    { label: "Support", href: "/support", icon: "💬" },
    { label: "FAQ", href: "/faq", icon: "❓" },
];

// ─── Suggestion Chips ───────────────────────────────────────

const SUGGESTION_CHIPS = [
    { label: "Browse Flower", icon: Leaf, message: "Show me your best flower strains" },
    { label: "What's Popular", icon: Zap, message: "What are your most popular products?" },
    { label: "Delivery Info", icon: Truck, message: "What are your delivery zones and shipping times?" },
    { label: "Help Me Choose", icon: Heart, message: "I'm not sure what to get — can you help me pick something?" },
    { label: "View My Cart", icon: ShoppingCart, message: "What's in my cart right now?" },
    { label: "Checkout Help", icon: CreditCard, message: "Help me checkout and complete my order" },
];

// ─── Streaming Text Hook ───────────────────────────────────

function useStreamingText(text: string, speed = 8) {
    const [displayed, setDisplayed] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        if (!text) return;
        setIsStreaming(true);
        setDisplayed("");
        let i = 0;
        const chunkSize = text.length > 200 ? 5 : text.length > 100 ? 4 : 3;
        const interval = setInterval(() => {
            const variance = Math.random() > 0.5 ? 1 : 0;
            const chunk = text.slice(i, i + chunkSize + variance);
            setDisplayed((prev) => prev + chunk);
            i += chunk.length;
            if (i >= text.length) {
                clearInterval(interval);
                setDisplayed(text);
                setIsStreaming(false);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return { displayed, isStreaming };
}

function StreamingMessage({ text, isLatest }: { text: string; isLatest: boolean }) {
    const { displayed, isStreaming } = useStreamingText(isLatest ? text : "", 8);
    return (
        <span>
            {isLatest ? displayed : text}
            {isStreaming && <span className="inline-block w-1 h-3.5 bg-green-600 ml-0.5 animate-pulse rounded-sm" />}
        </span>
    );
}

// ─── Category emoji fallback ──────────────────────────────

function categoryEmoji(category: string) {
    switch (category) {
        case "Flower": return "🌿";
        case "Edibles": return "🍬";
        case "Concentrates": return "💎";
        case "Vapes": return "💨";
        case "Pre-Rolls": return "🚬";
        case "CBD": return "💚";
        case "Mushrooms": return "🍄";
        case "Bath & Body": return "🛁";
        case "Capsules": return "💊";
        case "Accessories": return "🔧";
        default: return "📦";
    }
}

// ─── Product Card (in-chat) — with real images ────────────

function ProductCard({ product, onAddToCart, onNavigate }: {
    product: MedAgentProduct;
    onAddToCart: (p: MedAgentProduct) => void;
    onNavigate: (path: string) => void;
}) {
    const productUrl = `/product/${product.slug}`;
    const hasImage = product.image && product.image.startsWith("http");

    return (
        <div
            className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/50 border border-border/50 hover:border-green-600/30 transition-colors group cursor-pointer"
            onClick={() => onNavigate(productUrl)}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onNavigate(productUrl)}
        >
            {/* Product image or emoji fallback */}
            {hasImage ? (
                <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={product.image}
                        alt={product.shortName || product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            ) : (
                <div className="w-11 h-11 rounded-lg bg-green-900/20 flex items-center justify-center flex-shrink-0 text-lg">
                    {categoryEmoji(product.category)}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-foreground group-hover:text-green-600 transition-colors truncate block text-left w-full">
                    {product.shortName || product.name}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{product.category}</span>
                    <span className="text-xs font-bold text-green-600">${product.price.toFixed(2)}</span>
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                className="h-7 w-7 rounded-full bg-green-800 hover:bg-green-700 text-white flex items-center justify-center flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                title="Add to cart"
            >
                <Plus className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

// ─── Cart Status Card (in-chat) ────────────────────────────

function CartStatusCard({ items, total, onCheckout, onClear }: {
    items: { id: string; name: string; price: number; quantity: number }[];
    total: number;
    onCheckout: () => void;
    onClear: () => void;
}) {
    if (items.length === 0) return null;
    return (
        <div className="rounded-lg border border-green-600/20 bg-green-900/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" /> Your Cart ({items.length})
                </span>
                <button onClick={onClear} className="text-[9px] text-red-400 hover:text-red-300 transition-colors">
                    Clear
                </button>
            </div>
            {items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="truncate flex-1 text-foreground/80">{item.name}</span>
                    <span className="text-green-600 font-semibold ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            ))}
            {items.length > 3 && (
                <p className="text-[10px] text-muted-foreground">+{items.length - 3} more items</p>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-green-600/10">
                <span className="text-sm font-bold text-foreground">Total: ${total.toFixed(2)}</span>
                <button
                    onClick={onCheckout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-800 hover:bg-green-700 text-white text-xs font-semibold transition-colors"
                >
                    <CreditCard className="h-3 w-3" /> Checkout
                </button>
            </div>
            {total < 199 && (
                <p className="text-[9px] text-lime/60 text-center">
                    Add ${(199 - total).toFixed(2)} more for FREE shipping!
                </p>
            )}
        </div>
    );
}

// ─── Quick Nav Bar (in-chat) ───────────────────────────────

function QuickNavBar({ onNavigate }: { onNavigate: (href: string) => void }) {
    return (
        <div className="flex gap-1 overflow-x-auto py-1 px-0.5 scrollbar-none">
            {NAV_ROUTES.map((r) => (
                <button
                    key={r.href}
                    onClick={() => onNavigate(r.href)}
                    className="flex items-center gap-1 px-2 py-1 rounded-full border border-border/60 bg-card text-[10px] font-medium text-muted-foreground hover:text-green-600 hover:border-green-600/30 transition-all whitespace-nowrap flex-shrink-0"
                >
                    <span>{r.icon}</span> {r.label}
                </button>
            ))}
        </div>
    );
}

// ─── Welcome Popup (first visit) ────────────────────────────

function WelcomePopup({ onDismiss, onOpen }: { onDismiss: () => void; onOpen: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-16 right-0 w-[280px] rounded-2xl bg-card border border-border shadow-xl p-4"
        >
            <div className="flex items-start gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                    <Leaf className="h-4 w-4 text-green-700 dark:text-green-400" />
                </div>
                <div>
                    <p className="text-sm font-bold text-foreground">Hey! I&apos;m MedAgent</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Your personal cannabis guide</p>
                </div>
            </div>
            <ul className="space-y-1.5 mb-3 text-xs text-foreground">
                <li className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-green-600 shrink-0" /> Find products by effects or category</li>
                <li className="flex items-center gap-2"><ShoppingCart className="h-3 w-3 text-green-600 shrink-0" /> Add to cart & checkout by voice</li>
                <li className="flex items-center gap-2"><Mic className="h-3 w-3 text-green-600 shrink-0" /> Two-way voice — talk naturally</li>
                <li className="flex items-center gap-2"><MapPin className="h-3 w-3 text-green-600 shrink-0" /> Navigate anywhere on the site</li>
            </ul>
            <div className="flex gap-2">
                <button
                    onClick={onOpen}
                    className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-green-800 text-white hover:bg-green-700 transition-colors"
                >
                    Chat Now
                </button>
                <button
                    onClick={onDismiss}
                    className="text-xs px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                >
                    Later
                </button>
            </div>
        </motion.div>
    );
}

// ─── Component ──────────────────────────────────────────────

export default function AgentChatWidget() {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [activePersona, setActivePersona] = useState<PersonaId>("medagent");
    const [showPersonaSelector, setShowPersonaSelector] = useState(false);
    const [showQuickNav, setShowQuickNav] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [latestMsgId, setLatestMsgId] = useState<number | null>(null);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [voiceConversationMode, setVoiceConversationMode] = useState(false);

    // Voice input state
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const sendMessageRef = useRef<(msg: string) => Promise<void>>(undefined);
    const { items: cartItems, addItem, removeItem, clearCart, total: cartTotal } = useCart();

    const persona = PERSONAS[activePersona];

    // Track page visit for behavioral intelligence
    useEffect(() => {
        if (typeof window !== "undefined") {
            trackPageVisit(window.location.pathname);
        }
    }, [pathname]);

    // Show welcome popup for first-time visitors (after 3s delay)
    useEffect(() => {
        if (typeof window === "undefined") return;
        const dismissed = localStorage.getItem("mm_welcome_dismissed");
        if (dismissed) return;
        const timer = setTimeout(() => {
            if (!isOpen) setShowWelcome(true);
        }, 15000);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Initialize greeting with memory-aware personalization
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const memory = recordSessionStart();
            let greeting = persona.greeting;

            if (memory.sessionCount > 1 && memory.preferredName) {
                greeting = `Welcome back, ${memory.preferredName}! Great to see you again. What can I help you with today?`;
            } else if (memory.sessionCount > 1) {
                greeting = `Hey, welcome back! Good to see you again. What are you looking for today?`;
            }

            const msgs: Message[] = [{ id: 0, text: greeting, sender: "medagent" }];

            if (!memory.privacyAcknowledged && memory.sessionCount <= 1) {
                msgs.push({
                    id: 1,
                    text: "Your conversations with me are completely private. I don't share your information with anyone — I'm just here to help you find what you need.",
                    sender: "medagent",
                });
                acknowledgePrivacy();
            }

            setMessages(msgs);
            setLatestMsgId(msgs[msgs.length - 1].id);
        }
    }, [isOpen, persona.greeting, messages.length]);

    // ── Text-to-Speech with API TTS (browser fallback) ──
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const speakWithBrowser = useCallback((text: string, onEnd?: () => void) => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
            onEnd?.();
            return;
        }
        window.speechSynthesis.cancel();
        const clean = text.replace(/\*\*/g, "").replace(/\n/g, ". ").replace(/•/g, "").replace(/[#_~`]/g, "");
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.85;
        utterance.lang = "en-CA";
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => { setIsSpeaking(false); onEnd?.(); };
        utterance.onerror = () => { setIsSpeaking(false); onEnd?.(); };
        window.speechSynthesis.speak(utterance);
    }, []);

    const speak = useCallback((text: string, onEnd?: () => void) => {
        if (!ttsEnabled) { onEnd?.(); return; }

        window.speechSynthesis?.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        setIsSpeaking(true);

        const currentPersona = localStorage.getItem("medagent_persona") || "medagent";
        // Clean markdown for natural speech
        const clean = text.replace(/\*\*/g, "").replace(/\n/g, ". ").replace(/•/g, "").replace(/[#_~`]/g, "");

        const controller = new AbortController();

        fetch("/api/sage/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: clean, persona: currentPersona }),
            signal: controller.signal,
        })
            .then(async (res) => {
                if (!res.ok || !res.body) throw new Error(`tts-${res.status}`);

                // Try streaming playback via MediaSource (Chrome/Edge), fall back to full buffer (Safari/Firefox)
                const canStream = typeof MediaSource !== "undefined" && MediaSource.isTypeSupported("audio/mpeg");

                let audio: HTMLAudioElement;
                let url: string;

                if (canStream) {
                    const mediaSource = new MediaSource();
                    url = URL.createObjectURL(mediaSource);
                    audio = new Audio(url);
                    audioRef.current = audio;

                    await new Promise<void>((resolve, reject) => {
                        mediaSource.addEventListener("sourceopen", async () => {
                            try {
                                const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
                                const reader = res.body!.getReader();
                                let started = false;

                                const appendChunk = (chunk: Uint8Array) =>
                                    new Promise<void>((res) => {
                                        const buf = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength) as ArrayBuffer;
                                        if (sourceBuffer.updating) {
                                            sourceBuffer.addEventListener("updateend", () => { sourceBuffer.appendBuffer(buf); res(); }, { once: true });
                                        } else {
                                            sourceBuffer.appendBuffer(buf);
                                            sourceBuffer.addEventListener("updateend", () => res(), { once: true });
                                        }
                                    });

                                while (true) {
                                    const { done, value } = await reader.read();
                                    if (done) break;
                                    await appendChunk(value);
                                    if (!started) {
                                        audio.play().catch(() => {});
                                        started = true;
                                    }
                                }
                                if (sourceBuffer.updating) {
                                    await new Promise<void>((r) => sourceBuffer.addEventListener("updateend", () => r(), { once: true }));
                                }
                                mediaSource.endOfStream();
                                resolve();
                            } catch (e) { reject(e); }
                        }, { once: true });
                    });
                } else {
                    // Fallback: buffer full stream then play
                    const blob = await new Response(res.body).blob();
                    url = URL.createObjectURL(blob);
                    audio = new Audio(url);
                    audioRef.current = audio;
                }

                const handleEnd = () => {
                    URL.revokeObjectURL(url);
                    audioRef.current = null;
                    setIsSpeaking(false);
                    onEnd?.();
                    if (voiceConversationMode) setTimeout(() => startListeningRound(), 150);
                };
                audio.onended = handleEnd;
                audio.onerror = () => {
                    URL.revokeObjectURL(url);
                    audioRef.current = null;
                    setIsSpeaking(false);
                    speakWithBrowser(text, () => {
                        onEnd?.();
                        if (voiceConversationMode) setTimeout(() => startListeningRound(), 150);
                    });
                };

                await audio.play().catch(() => {
                    URL.revokeObjectURL(url);
                    audioRef.current = null;
                    setIsSpeaking(false);
                    speakWithBrowser(text, () => {
                        onEnd?.();
                        if (voiceConversationMode) setTimeout(() => startListeningRound(), 150);
                    });
                });
            })
            .catch((err) => {
                if (err.name === "AbortError") return;
                speakWithBrowser(text, () => {
                    onEnd?.();
                    if (voiceConversationMode) setTimeout(() => startListeningRound(), 150);
                });
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ttsEnabled, speakWithBrowser, voiceConversationMode]);

    // ── Session persistence ─────────────────────────────────
    useEffect(() => {
        if (typeof window === "undefined") return;
        const saved = sessionStorage.getItem("medagent_session_id");
        if (saved) setSessionId(saved);
        const savedPersona = localStorage.getItem("medagent_persona");
        if (savedPersona && savedPersona in PERSONAS) setActivePersona(savedPersona as PersonaId);
    }, []);

    useEffect(() => {
        if (sessionId && typeof window !== "undefined") {
            sessionStorage.setItem("medagent_session_id", sessionId);
        }
    }, [sessionId]);

    // Listen for cart events from other parts of the app (real-time sync)
    useEffect(() => {
        return onCartEvent((e) => {
            if (e.source === "medagent") return; // ignore our own events
            if (e.action === "add" && e.item && isOpen) {
                const notifyId = Date.now() + 400;
                setMessages((prev) => [...prev, {
                    id: notifyId,
                    text: `I see you added **${e.item!.name}** to your cart! Need help finding anything else? 🛒`,
                    sender: "medagent",
                }]);
                setLatestMsgId(notifyId);
            }
        });
    }, [isOpen]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // ── Navigate helper ──────────────────────────────────────
    const navigateTo = useCallback((href: string) => {
        router.push(href);
        // Add nav confirmation message
        const navId = Date.now() + 100;
        setMessages((prev) => [...prev, {
            id: navId,
            text: `Navigating you to ${href.replace(/\?.*/, "").replace(/^\//, "") || "home"}...`,
            sender: "medagent",
        }]);
        setLatestMsgId(navId);
    }, [router]);

    // ── Add to cart helper (real-time sync) ─────────────────
    const addProductToCart = useCallback((product: MedAgentProduct) => {
        const item = {
            id: product.id,
            name: product.shortName || product.name,
            price: product.price,
            quantity: 1,
        };
        addItem(item);
        emitCartEvent({ action: "add", item, source: "medagent" });
        const cartMsgId = Date.now() + 200;
        setMessages((prev) => [...prev, {
            id: cartMsgId,
            text: `Added ${product.shortName || product.name} ($${product.price.toFixed(2)}) to your cart! 🛒`,
            sender: "medagent",
            cartAction: { type: "added", productName: product.shortName || product.name },
        }]);
        setLatestMsgId(cartMsgId);
        speak(`Added ${product.shortName || product.name} to your cart.`);
    }, [addItem, speak]);

    // ── Switch persona ──────────────────────────────────────
    const switchPersona = useCallback((id: PersonaId) => {
        setActivePersona(id);
        localStorage.setItem("medagent_persona", id);
        setShowPersonaSelector(false);
        const p = PERSONAS[id];
        const greetId = Date.now();
        setMessages([{ id: greetId, text: p.greeting, sender: "medagent" }]);
        setLatestMsgId(greetId);
        setSessionId(null);
        sessionStorage.removeItem("medagent_session_id");
    }, []);

    // ── Handle actions (real-time — minimal delay) ──────────
    const handleActions = useCallback((actions: MedAgentAction[]) => {
        // Short delay so user sees the start of the response before navigation
        const NAV_DELAY = 300;

        for (const action of actions) {
            switch (action.type) {
                case "ADD_TO_CART":
                    try {
                        const product = JSON.parse(action.payload);
                        addItem({ ...product, quantity: 1 });
                        emitCartEvent({ action: "add", item: { ...product, quantity: 1 }, source: "medagent" });
                    } catch { /* invalid payload */ }
                    break;
                case "REMOVE_FROM_CART": {
                    const query = action.payload.trim().toLowerCase();
                    const match = cartItems.find((item) =>
                        item.name.toLowerCase().includes(query) ||
                        query.includes(item.name.toLowerCase()) ||
                        item.name.toLowerCase().split(/\s+/).some((w) => query.includes(w) && w.length > 3)
                    );
                    if (match) {
                        removeItem(match.id);
                        emitCartEvent({ action: "remove", item: match, source: "medagent" });
                    }
                    break;
                }
                case "CLEAR_CART":
                    clearCart();
                    emitCartEvent({ action: "clear", source: "medagent" });
                    break;
                case "NAVIGATE":
                    setTimeout(() => {
                        router.push(action.payload.trim());
                        emitNavEvent({ path: action.payload.trim(), source: "medagent" });
                    }, NAV_DELAY);
                    break;
                case "SEARCH":
                    setTimeout(() => {
                        const searchPath = `/shop?search=${encodeURIComponent(action.payload.trim())}`;
                        router.push(searchPath);
                        emitFilterEvent({ search: action.payload.trim(), source: "medagent" });
                    }, NAV_DELAY);
                    break;
                case "FILTER":
                    setTimeout(() => {
                        const filterPath = `/shop?category=${encodeURIComponent(action.payload.trim())}`;
                        router.push(filterPath);
                        emitFilterEvent({ category: action.payload.trim(), source: "medagent" });
                    }, NAV_DELAY);
                    break;
                case "CHECKOUT":
                    setTimeout(() => {
                        router.push("/checkout");
                        emitNavEvent({ path: "/checkout", source: "medagent" });
                    }, NAV_DELAY);
                    break;
            }
        }
    }, [addItem, removeItem, clearCart, cartItems, router]);

    // ── Start listening (single round) ──────────────────────
    const startListeningRound = useCallback(() => {
        if (typeof window === "undefined") return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;

        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch { /* ignore */ }
            recognitionRef.current = null;
        }

        window.speechSynthesis?.cancel();
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        setIsSpeaking(false);

        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-CA";

        let finalTranscript = "";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setInputValue(transcript);

            if (event.results[event.results.length - 1].isFinal) {
                finalTranscript = transcript;
                // Send immediately on isFinal — don't wait for onend (saves 500-1000ms)
                if (finalTranscript.trim()) {
                    try { recognition.abort(); } catch { /* ignore */ }
                    recognitionRef.current = null;
                    setIsListening(false);
                    sendMessageRef.current?.(finalTranscript.trim());
                }
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            // finalTranscript already sent on isFinal above
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (e: any) => {
            console.error("[MedAgent Voice]", e.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    }, []);

    // ── Send message ─────────────────────────────────────────
    const sendMessageDirect = useCallback(async (msg: string) => {
        if (!msg.trim()) return;

        setMessages((prev) => [...prev, { id: Date.now(), text: msg, sender: "user" }]);
        setInputValue("");
        setIsTyping(true);

        try {
            const currentSessionId = sessionStorage.getItem("medagent_session_id");
            const currentPersona = localStorage.getItem("medagent_persona") || "medagent";

            const behavior = getBehavior();
            const customerMemory = getMemory();

            const detectedName = detectNameInMessage(msg);
            if (detectedName) rememberName(detectedName);
            const detectedPrefs = detectPreferences(msg);
            detectedPrefs.forEach(p => rememberPreference(p));

            const res = await fetch("/api/sage/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: msg,
                    sessionId: currentSessionId,
                    persona: currentPersona,
                    behavioralData: behavior,
                    cartTotal: cartTotal > 0 ? cartTotal : undefined,
                    cartItems: cartItems.length > 0 ? cartItems : undefined,
                    memory: customerMemory,
                    currentPage: pathname,
                }),
            });

            const data = await res.json();

            if (data.sessionId) {
                setSessionId(data.sessionId);
                sessionStorage.setItem("medagent_session_id", data.sessionId);
            }

            if (data.sentiment?.mood) {
                recordMood(data.sentiment.mood);
            }

            if (msg.length > 5) {
                const topicWords = msg.replace(/[^\w\s]/g, "").trim().slice(0, 60);
                if (topicWords) rememberTopic(topicWords);
            }

            const responseId = Date.now();
            const responseMsg: Message = {
                id: responseId,
                text: data.text,
                sender: "medagent",
                mood: data.sentiment?.mood,
            };

            // Attach product cards if returned (show up to 6 for better discovery)
            if (data.products?.length > 0) {
                responseMsg.products = data.products.slice(0, 6);
            }

            // Sync server-side cart actions back to client cart in real-time
            if (data.cart?.items?.length > 0) {
                const serverItems = data.cart.items;
                for (const si of serverItems) {
                    const exists = cartItems.find(ci =>
                        ci.name.toLowerCase() === si.name.toLowerCase() ||
                        ci.id === String(si.productId)
                    );
                    if (!exists) {
                        addItem({ id: String(si.productId || si.slug), name: si.name, price: si.price, quantity: si.quantity });
                    }
                }
                emitCartEvent({ action: "sync", items: cartItems, total: cartTotal, source: "medagent" });
            }

            setMessages((prev) => [...prev, responseMsg]);
            setLatestMsgId(responseId);

            // Start TTS immediately while actions execute in parallel (saves ~300ms)
            speak(data.text);
            if (data.actions?.length > 0) {
                handleActions(data.actions);
            }

        } catch {
            const errId = Date.now();
            setMessages((prev) => [...prev, {
                id: errId,
                text: "I'm having a moment — please try again shortly.",
                sender: "medagent",
            }]);
            setLatestMsgId(errId);
        } finally {
            setIsTyping(false);
        }
    }, [handleActions, speak, cartTotal, cartItems, pathname]);

    useEffect(() => { sendMessageRef.current = sendMessageDirect; }, [sendMessageDirect]);

    const sendMessage = useCallback(async (text?: string) => {
        const msg = (text || inputValue).trim();
        if (!msg) return;
        setInputValue("");
        await sendMessageDirect(msg);
    }, [inputValue, sendMessageDirect]);

    // ── Toggle mic (single tap) ─────────────────────────────
    const toggleMic = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            startListeningRound();
        }
    }, [isListening, startListeningRound]);

    // ── Toggle voice conversation mode (long press / double tap) ──
    const toggleVoiceConversation = useCallback(() => {
        const next = !voiceConversationMode;
        setVoiceConversationMode(next);
        if (next) {
            // Start conversation mode — listen immediately
            startListeningRound();
            const modeId = Date.now() + 300;
            setMessages((prev) => [...prev, {
                id: modeId,
                text: "🎙️ Voice conversation mode ON — I'll keep listening after each response. Say \"stop listening\" to end.",
                sender: "medagent",
            }]);
            setLatestMsgId(modeId);
        } else {
            recognitionRef.current?.abort();
            setIsListening(false);
            window.speechSynthesis?.cancel();
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
            setIsSpeaking(false);
        }
    }, [voiceConversationMode, startListeningRound]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            recognitionRef.current?.abort();
            window.speechSynthesis?.cancel();
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        };
    }, []);

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end" style={{ contain: "layout" }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="medagent-chat-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${persona.name} chat assistant`}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[400px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-card border border-border shadow-2xl"
                    >
                        {/* ── Header ─────────────────────────────────── */}
                        <div className={cn("flex items-center justify-between p-3 text-white bg-gradient-to-r", persona.headerGradient)}>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
                                    {persona.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-tight leading-none">{persona.name}</h3>
                                    <span className="text-[10px] uppercase tracking-widest opacity-70 font-medium">
                                        {isListening ? "Listening..." : isSpeaking ? "Speaking..." : voiceConversationMode ? "Voice Mode" : persona.tagline}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                                <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full mr-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
                                    <span className="text-[9px] uppercase tracking-wider font-bold opacity-80">Live</span>
                                </div>
                                {/* Cart indicator */}
                                {cartItems.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-white hover:bg-white/20 rounded-full relative"
                                        onClick={() => sendMessage("What's in my cart?")}
                                        title="View cart"
                                    >
                                        <ShoppingCart className="h-3.5 w-3.5" />
                                        <span className="absolute -top-0.5 -right-0.5 bg-lime text-charcoal-deep text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                                            {cartItems.length}
                                        </span>
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                                    onClick={() => setTtsEnabled(!ttsEnabled)}
                                    title={ttsEnabled ? "Mute voice" : "Unmute voice"}
                                    aria-label={ttsEnabled ? "Mute voice" : "Unmute voice"}
                                >
                                    {ttsEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5 opacity-50" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                                    onClick={() => setShowQuickNav(!showQuickNav)}
                                    title="Quick navigation"
                                >
                                    <MapPin className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                                    onClick={() => setShowPersonaSelector(!showPersonaSelector)}
                                    title="Switch personality"
                                    aria-expanded={showPersonaSelector}
                                >
                                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showPersonaSelector && "rotate-180")} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                                    onClick={() => { setIsOpen(false); recognitionRef.current?.abort(); window.speechSynthesis?.cancel(); setIsListening(false); setIsSpeaking(false); setVoiceConversationMode(false); }}
                                    aria-label="Close chat"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* ── Quick Nav Bar ──────────────────────────── */}
                        <AnimatePresence>
                            {showQuickNav && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-b border-border bg-muted px-2 py-1.5"
                                >
                                    <QuickNavBar onNavigate={(href) => { navigateTo(href); setShowQuickNav(false); }} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Persona Selector ──────────────────────── */}
                        <AnimatePresence>
                            {showPersonaSelector && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-b border-border"
                                >
                                    <div className="bg-muted p-3 space-y-1.5">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1">Choose your guide</p>
                                        {(Object.values(PERSONAS) as Persona[]).map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => switchPersona(p.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200",
                                                    activePersona === p.id
                                                        ? "bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 text-green-900 dark:text-green-200"
                                                        : "bg-card border border-border text-foreground hover:bg-muted hover:border-border"
                                                )}
                                            >
                                                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-sm shrink-0">
                                                    {p.icon}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold leading-tight">{p.name}</div>
                                                    <div className="text-[10px] text-muted-foreground">{p.tagline}</div>
                                                </div>
                                                {activePersona === p.id && (
                                                    <div className="ml-auto text-green-600 text-xs font-bold">Active</div>
                                                )}
                                            </button>
                                        ))}
                                        <div className="border-t border-border pt-2 mt-2">
                                            <button
                                                onClick={() => {
                                                    clearMemory();
                                                    localStorage.removeItem("mm_browsing_behavior");
                                                    setMessages([{ id: Date.now(), text: "Your conversation data has been cleared. Fresh start!", sender: "medagent" }]);
                                                    setShowPersonaSelector(false);
                                                }}
                                                className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                Clear My Data
                                                <span className="block text-[10px] text-muted-foreground/60 mt-0.5">Remove all saved preferences and history</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Messages ────────────────────────────────── */}
                        <div className="h-[320px] sm:h-[360px] overflow-y-auto bg-muted p-3 space-y-2.5">
                            {messages.map((msg) => (
                                <div key={msg.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={cn(
                                            "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm whitespace-pre-line",
                                            msg.sender === "user"
                                                ? "ml-auto bg-green-800 text-white rounded-br-none"
                                                : "mr-auto bg-card text-foreground rounded-bl-none border border-border"
                                        )}
                                    >
                                        {msg.sender === "medagent" ? (
                                            <StreamingMessage text={msg.text} isLatest={msg.id === latestMsgId} />
                                        ) : (
                                            msg.text
                                        )}
                                    </motion.div>

                                    {/* Product cards */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="mr-auto max-w-[85%] mt-1.5 space-y-1">
                                            {msg.products.map((p) => (
                                                <ProductCard
                                                    key={p.id}
                                                    product={p}
                                                    onAddToCart={addProductToCart}
                                                    onNavigate={navigateTo}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Cart action card */}
                                    {msg.cartAction?.type === "added" && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="mr-auto max-w-[85%] mt-1.5 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-900/20 border border-green-600/20 text-xs text-green-600"
                                        >
                                            <ShoppingCart className="h-3.5 w-3.5" />
                                            <span className="font-medium">{msg.cartAction.productName} added!</span>
                                            <button
                                                onClick={() => navigateTo("/checkout")}
                                                className="ml-auto flex items-center gap-1 text-[10px] font-bold hover:underline"
                                            >
                                                Checkout <ArrowRight className="h-3 w-3" />
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                            {isTyping && <TypingIndicator />}

                            {/* Inline cart summary when cart context is relevant */}
                            {cartItems.length > 0 && messages.length > 2 && /cart|checkout|order|added|buy|purchase|pay/i.test(messages[messages.length - 1]?.text || "") && (
                                <CartStatusCard
                                    items={cartItems}
                                    total={cartTotal}
                                    onCheckout={() => navigateTo("/checkout")}
                                    onClear={clearCart}
                                />
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* ── Suggestion Chips ────────────────────────── */}
                        {messages.length <= 2 && !isTyping && (
                            <div className="bg-muted px-3 py-2 border-t border-border">
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1.5 px-1">Quick actions</p>
                                <div className="flex flex-wrap gap-1.5 overflow-x-auto">
                                    {SUGGESTION_CHIPS.map((chip) => (
                                        <button
                                            key={chip.label}
                                            onClick={() => sendMessage(chip.message)}
                                            className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-green-200 dark:border-green-800 bg-card text-green-800 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                                        >
                                            <chip.icon className="h-3 w-3" />
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Input Bar ──────────────────────────────── */}
                        <div className="bg-card p-3 border-t border-border">
                            <div className="flex gap-2">
                                {/* Mic Button — tap = one-shot, double-tap = conversation mode */}
                                <Button
                                    size="icon"
                                    variant={voiceConversationMode ? "default" : isListening ? "destructive" : "outline"}
                                    className={cn(
                                        "rounded-full h-9 w-9 flex-shrink-0 transition-all",
                                        isListening && "animate-pulse",
                                        voiceConversationMode && "bg-green-600 hover:bg-green-500 border-green-600 ring-2 ring-green-400/30"
                                    )}
                                    onClick={toggleMic}
                                    onDoubleClick={toggleVoiceConversation}
                                    title={voiceConversationMode ? "Voice conversation ON (double-tap to stop)" : isListening ? "Stop listening" : "Tap: voice input | Double-tap: conversation mode"}
                                    aria-label={isListening ? "Stop listening" : "Voice input"}
                                >
                                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                </Button>

                                <label htmlFor="medagent-input" className="sr-only">Message {persona.name}</label>
                                <input
                                    id="medagent-input"
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                    placeholder={isListening ? "Listening..." : voiceConversationMode ? "Voice mode active..." : persona.inputPlaceholder}
                                    className="flex-1 rounded-full bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-green-600/50"
                                    aria-label={`Message ${persona.name}`}
                                />
                                <Button
                                    size="icon"
                                    className="rounded-full h-9 w-9 bg-green-800 hover:bg-green-700"
                                    onClick={() => sendMessage()}
                                    disabled={isTyping}
                                    aria-label="Send message"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Voice Status */}
                            <AnimatePresence>
                                {(isListening || voiceConversationMode) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 flex items-center justify-center gap-2 text-[11px] text-muted-foreground"
                                    >
                                        {isListening && (
                                            <span className="flex gap-0.5">
                                                {[0, 150, 300, 100, 200].map((d, i) => (
                                                    <span key={i} className={`w-1 rounded-full bg-red-${i % 2 ? 500 : 400} animate-pulse`} style={{ height: `${8 + (i * 3) % 12}px`, animationDelay: `${d}ms` }} />
                                                ))}
                                            </span>
                                        )}
                                        <span>
                                            {isSpeaking ? "Speaking..." : isListening ? "Listening — speak now" : "Voice mode — waiting..."}
                                        </span>
                                        {voiceConversationMode && (
                                            <button
                                                onClick={toggleVoiceConversation}
                                                className="text-red-400 hover:text-red-300 text-[10px] font-semibold ml-2"
                                            >
                                                Stop
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Welcome Popup ─────────────────────────────── */}
            <AnimatePresence>
                {showWelcome && !isOpen && (
                    <WelcomePopup
                        onDismiss={() => {
                            setShowWelcome(false);
                            localStorage.setItem("mm_welcome_dismissed", "1");
                        }}
                        onOpen={() => {
                            setShowWelcome(false);
                            localStorage.setItem("mm_welcome_dismissed", "1");
                            setIsOpen(true);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ── FAB ────────────────────────────────────────── */}
            <Button
                size="lg"
                data-medagent-fab
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-white",
                    voiceConversationMode
                        ? "bg-green-600 hover:bg-green-500 ring-2 ring-green-400/40 animate-pulse"
                        : "bg-green-800 hover:bg-green-700"
                )}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
                aria-expanded={isOpen}
                aria-controls="medagent-chat-panel"
            >
                <div className="absolute -top-1 -right-1 bg-green-400 text-green-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5" aria-hidden="true">
                    <Sparkles className="h-2.5 w-2.5" />
                    AI
                </div>
                {cartItems.length > 0 && (
                    <div className="absolute -top-1 -left-1 bg-lime text-charcoal-deep text-[9px] font-bold w-4.5 h-4.5 rounded-full shadow-sm flex items-center justify-center" aria-hidden="true">
                        {cartItems.length}
                    </div>
                )}
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>
        </div>
    );
}
