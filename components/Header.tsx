"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import DealOfTheDayBanner from "@/components/DealOfTheDayBanner";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === "/";
    // On home hero (transparent bg), always use light text regardless of theme
    const onHeroTransparent = isHome && !isScrolled;
    const { t } = useLocale();
    const { items, openCart } = useCart();
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const { count: wishlistCount } = useWishlist();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            {/* Shipping Banner — .cc style lime accent bar + Price Match */}
            <div role="banner" className="bg-lime text-black text-[9px] md:text-[11px] py-2 px-4 text-center font-bold tracking-wider uppercase relative z-[60] font-sans flex items-center justify-center gap-3 flex-wrap">
                <span>{t("nav.shippingBanner")}</span>
                <span className="hidden sm:inline text-black/30">|</span>
                <Link href="/price-match" className="inline-flex items-center gap-1 hover:underline">
                    <span>Price Match + 5% Off</span>
                </Link>
            </div>

            {/* Deal of the Day Announcement Banner */}
            <DealOfTheDayBanner />

            <nav
                role="navigation"
                aria-label="Main navigation"
                className={`fixed w-full z-50 transition-all duration-500 px-4 md:px-6 py-4 flex justify-between items-center ${isScrolled || !isHome
                    ? "py-3 shadow-lg bg-white/95 dark:bg-[#1a1a22] border-b border-transparent dark:border-[#3a3a48]"
                    : "bg-transparent"
                } ${isHome ? "top-[40px]" : "top-[40px]"}`}
            >
                <div className="flex items-center gap-8">
                    <Link href="/" className="relative h-10 w-40 md:h-12 md:w-48 transition-opacity hover:opacity-80">
                        <Image
                            src="/assets/logos/medibles-photoroom.png"
                            alt="Mohawk Medibles"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-[11px] font-bold tracking-[0.15em] uppercase font-sans">
                        {(["Shop", "Deals", "About", "Blog", "FAQ", "Support"] as const).map((item) => (
                            <Link
                                key={item}
                                href={`/${item.toLowerCase()}`}
                                className={`relative group transition-colors ${
                                    pathname === `/${item.toLowerCase()}`
                                        ? "text-lime"
                                        : onHeroTransparent
                                            ? "text-white/90 hover:text-lime"
                                            : "text-charcoal-deep/80 dark:text-white/80 hover:text-forest dark:hover:text-lime"
                                }`}
                            >
                                {t(`nav.${item.toLowerCase()}`)}
                                <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-lime transition-all duration-300 ${
                                    pathname === `/${item.toLowerCase()}` ? "w-full" : "w-0 group-hover:w-full"
                                }`} />
                            </Link>
                        ))}
                        <Link
                            href="/locations"
                            className={`relative group transition-colors ${
                                pathname === "/locations"
                                    ? "text-lime"
                                    : onHeroTransparent
                                        ? "text-white/90 hover:text-lime"
                                        : "text-charcoal-deep/80 dark:text-white/80 hover:text-forest dark:hover:text-lime"
                            }`}
                        >
                            Visit Us
                            <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-lime transition-all duration-300 ${
                                pathname === "/locations" ? "w-full" : "w-0 group-hover:w-full"
                            }`} />
                        </Link>
                        <Link
                            href="/mix-match"
                            className={`relative group transition-colors ${
                                pathname === "/mix-match"
                                    ? "text-lime"
                                    : onHeroTransparent
                                        ? "text-green-400 hover:text-lime"
                                        : "text-green-600 dark:text-green-400 hover:text-forest dark:hover:text-lime"
                            }`}
                        >
                            Build Your Oz
                            <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-lime transition-all duration-300 ${
                                pathname === "/mix-match" ? "w-full" : "w-0 group-hover:w-full"
                            }`} />
                        </Link>
                        <Link
                            href="/shop-by-mood"
                            className={`relative group transition-colors ${
                                pathname === "/shop-by-mood"
                                    ? "text-lime"
                                    : onHeroTransparent
                                        ? "text-white/90 hover:text-lime"
                                        : "text-charcoal-deep/80 dark:text-white/80 hover:text-forest dark:hover:text-lime"
                            }`}
                        >
                            Mood
                            <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-lime transition-all duration-300 ${
                                pathname === "/shop-by-mood" ? "w-full" : "w-0 group-hover:w-full"
                            }`} />
                        </Link>
                        <Link
                            href="/territory-grown"
                            className={`relative group transition-colors ${
                                pathname === "/territory-grown"
                                    ? "text-lime"
                                    : onHeroTransparent
                                        ? "text-amber-300 hover:text-lime"
                                        : "text-amber-700 dark:text-amber-400 hover:text-forest dark:hover:text-lime"
                            }`}
                        >
                            Territory Grown
                            <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-lime transition-all duration-300 ${
                                pathname === "/territory-grown" ? "w-full" : "w-0 group-hover:w-full"
                            }`} />
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                    <div className={`hidden md:flex items-center gap-3 ${onHeroTransparent ? "header-on-hero" : ""}`}>
                        <LanguageSwitcher />
                        <ThemeToggle />
                        <SearchAutocomplete />
                        <Button asChild variant="ghost" size="icon" className={`rounded-xl ${onHeroTransparent ? "text-white/70 hover:text-lime hover:bg-white/10" : "text-charcoal-deep/60 dark:text-white/60 hover:text-forest dark:hover:text-lime hover:bg-charcoal-deep/5 dark:hover:bg-white/5"}`}>
                            <Link href="/account" aria-label="My account">
                                <User className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    {/* Mobile search trigger — full-screen overlay handled by SearchAutocomplete */}
                    <div className="md:hidden">
                        <SearchAutocomplete />
                    </div>

                    <span className="relative">
                        <Button asChild variant="ghost" size="icon" className={`rounded-xl ${onHeroTransparent ? "text-white/70 hover:text-red-400 hover:bg-white/10" : "text-charcoal-deep/60 dark:text-white/60 hover:text-red-500 dark:hover:text-red-400 hover:bg-charcoal-deep/5 dark:hover:bg-white/5"}`}>
                            <Link href="/wishlist" aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}>
                                <Heart className="h-4 w-4" />
                            </Link>
                        </Button>
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                                {wishlistCount > 99 ? "99+" : wishlistCount}
                            </span>
                        )}
                    </span>

                    <button onClick={openCart} className="relative rounded-full flex items-center gap-2 px-4 py-2 bg-forest text-white dark:bg-lime dark:text-charcoal-deep text-sm font-bold shadow-lg glow-lime hover:opacity-90 transition-opacity" aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}>
                        <ShoppingCart className="h-4 w-4" />
                        <span className="hidden md:inline text-[10px] font-bold tracking-widest uppercase">Cart</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                                {cartCount > 99 ? "99+" : cartCount}
                            </span>
                        )}
                    </button>

                    <button
                        className={`lg:hidden ${onHeroTransparent ? "text-white" : "text-charcoal-deep dark:text-white"}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu — glassmorphic */}
                {isMobileMenuOpen && (
                    <div id="mobile-menu" role="menu" aria-label="Mobile navigation" className="absolute top-full left-0 w-full bg-white/95 dark:bg-charcoal-deep/95 backdrop-blur-xl shadow-2xl p-8 flex flex-col gap-6 text-xl font-bold uppercase tracking-tight animate-in fade-in slide-in-from-top-4 duration-500 font-heading z-[70]">
                        {(["Shop", "Deals", "About", "Blog", "FAQ", "Contact"] as const).map((item) => (
                            <Link
                                key={item}
                                href={`/${item.toLowerCase()}`}
                                className={`flex items-center justify-between transition-colors ${
                                    pathname === `/${item.toLowerCase()}`
                                        ? "text-lime"
                                        : "text-foreground dark:text-white hover:text-lime"
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item}
                                <div className="w-8 h-[1px] bg-border" />
                            </Link>
                        ))}
                        <Link
                            href="/locations"
                            className={`flex items-center justify-between transition-colors ${
                                pathname === "/locations"
                                    ? "text-lime"
                                    : "text-foreground dark:text-white hover:text-lime"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Visit Us
                            <div className="w-8 h-[1px] bg-border" />
                        </Link>
                        <Link
                            href="/shop-by-mood"
                            className={`flex items-center justify-between transition-colors ${
                                pathname === "/shop-by-mood"
                                    ? "text-lime"
                                    : "text-foreground dark:text-white hover:text-lime"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Shop by Mood
                            <div className="w-8 h-[1px] bg-border" />
                        </Link>
                        <Link
                            href="/territory-grown"
                            className={`flex items-center justify-between transition-colors ${
                                pathname === "/territory-grown"
                                    ? "text-lime"
                                    : "text-amber-600 dark:text-amber-400 hover:text-lime"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Territory Grown
                            <div className="w-8 h-[1px] bg-amber-500/30" />
                        </Link>
                        <Link
                            href="/mix-match"
                            className={`flex items-center justify-between transition-colors ${
                                pathname === "/mix-match"
                                    ? "text-lime"
                                    : "text-green-500 dark:text-green-400 hover:text-lime"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Build Your Oz
                            <div className="w-8 h-[1px] bg-green-500/30" />
                        </Link>
                        <div className="flex flex-col gap-3 pt-6 font-sans text-sm tracking-widest border-t border-border">
                            <div className="flex items-center gap-3">
                                <LanguageSwitcher />
                                <ThemeToggle />
                            </div>
                            <Button asChild variant="outline" className="w-full rounded-2xl h-12 uppercase font-bold glass">
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>{t("nav.login")}</Link>
                            </Button>
                            <Button asChild variant="brand" className="w-full rounded-2xl h-12 uppercase font-bold glow-lime">
                                <Link href="/support" onClick={() => setIsMobileMenuOpen(false)}>{t("nav.talkToSupport")}</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
