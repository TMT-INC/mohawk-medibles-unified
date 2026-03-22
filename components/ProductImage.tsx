"use client";

import Image from "next/image";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
    src?: string;
    alt: string;
    sizes?: string;
    priority?: boolean;
    /** "card" for grid tiles, "hero" for product detail page, "bento" for homepage bento/showcase */
    variant?: "card" | "hero" | "bento";
    className?: string;
    /** Extra content to overlay (e.g. badges) */
    children?: React.ReactNode;
}

export default function ProductImage({
    src,
    alt,
    sizes = "33vw",
    priority = false,
    variant = "card",
    className,
    children,
}: ProductImageProps) {
    const hasImage = src && src.startsWith("http");

    return (
        <div
            className={cn(
                "relative overflow-hidden flex items-center justify-center",
                // Consistent background gradient for ALL product images
                "bg-gradient-to-br from-neutral-100 via-white to-neutral-50",
                "dark:from-[#0f2a0b] dark:via-[#142910] dark:to-[#0D1F0A]",
                variant === "hero" ? "aspect-square rounded-2xl border border-border"
                    : variant === "bento" ? "aspect-square"
                    : "aspect-square",
                className
            )}
        >
            {/* Product Image */}
            {hasImage ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className={cn(
                        variant === "hero" ? "object-contain p-6"
                            : variant === "bento" ? "object-cover group-hover:scale-110 transition-transform duration-700"
                            : "object-cover",
                        variant !== "bento" && "group-hover:scale-105 transition-transform duration-300",
                        "dark:mix-blend-multiply dark:brightness-90 dark:contrast-105"
                    )}
                    sizes={sizes}
                    priority={priority}
                />
            ) : (
                <Leaf
                    className={cn(
                        "text-forest/15 group-hover:scale-110 transition-transform",
                        variant === "hero" ? "h-32 w-32" : "h-16 w-16"
                    )}
                />
            )}

            {/* Watermark Logo — subtle brand mark */}
            <div className="absolute bottom-2 right-2 pointer-events-none z-10">
                <Image
                    src="/assets/logos/medibles-logo2.png"
                    alt=""
                    width={variant === "hero" ? 48 : variant === "bento" ? 36 : 32}
                    height={variant === "hero" ? 48 : variant === "bento" ? 36 : 32}
                    className={cn(
                        "select-none",
                        variant === "bento" ? "opacity-[0.15]" : "opacity-[0.12] dark:opacity-[0.18]"
                    )}
                    aria-hidden="true"
                />
            </div>

            {/* Overlay children (badges, etc) */}
            {children}
        </div>
    );
}
