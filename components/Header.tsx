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

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === "/";
    // On home hero (transparent bg), always use light text regardless of theme
    const onHeroTransparent = isHome && !isScrolled;
    const { t } = useLocale();
    const { items } = useCart();
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
            {/* Shipping Banner — .cc style lime accent bar */}
            <div role="banner" className="bg-lime text-black text-[9px] md:text-[11px] py-2 px-4 text-center font-bold tracking-wider uppercase relative z-[60] font-sans">
                {t("nav.shippingBanner")}
            </div>

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
                        {(["Shop", "Deals", "About", "Blog", "Reviews", "FAQ", "Support"] as const).map((item) => (
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
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                    <div className={`hidden md:flex items-center gap-3 ${onHeroTransparent ? "header-on-hero" : ""}`}>
                        <LanguageSwitcher />
                        <ThemeToggle />
                        <SearchAutocomplete />
                        <Link href="/account">
                            <Button variant="ghost" size="icon" className={`rounded-xl ${onHeroTransparent ? "text-white/70 hover:text-lime hover:bg-white/10" : "text-charcoal-deep/60 dark:text-white/60 hover:text-forest dark:hover:text-lime hover:bg-charcoal-deep/5 dark:hover:bg-white/5"}`} aria-label="My account">
                                <User className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <Link href="/wishlist" className="relative" aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}>
                        <Button variant="ghost" size="icon" aria-label="Wishlist" className={`rounded-xl ${onHeroTransparent ? "text-white/70 hover:text-red-400 hover:bg-white/10" : "text-charcoal-deep/60 dark:text-white/60 hover:text-red-500 dark:hover:text-red-400 hover:bg-charcoal-deep/5 dark:hover:bg-white/5"}`}>
                            <Heart className="h-4 w-4" />
                        </Button>
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                                {wishlistCount > 99 ? "99+" : wishlistCount}
                            </span>
                        )}
                    </Link>

                    <Link href="/checkout" className="relative" aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}>
                        <Button variant="brand" size="sm" aria-label="Shopping cart" className="rounded-full flex items-center gap-2 px-4 shadow-lg glow-lime">
                            <ShoppingCart className="h-4 w-4" />
                            <span className="hidden md:inline text-[10px] font-bold tracking-widest uppercase">Cart</span>
                        </Button>
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                                {cartCount > 99 ? "99+" : cartCount}
                            </span>
                        )}
                    </Link>

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
                        <div className="flex flex-col gap-3 pt-6 font-sans text-sm tracking-widest border-t border-border">
                            <div className="flex items-center gap-3">
                                <LanguageSwitcher />
                                <ThemeToggle />
                            </div>
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button variant="outline" className="w-full rounded-2xl h-12 uppercase font-bold glass">{t("nav.login")}</Button>
                            </Link>
                            <Link href="/support" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button variant="brand" className="w-full rounded-2xl h-12 uppercase font-bold glow-lime">{t("nav.talkToSupport")}</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
