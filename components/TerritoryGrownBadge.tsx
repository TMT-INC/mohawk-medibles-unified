"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";

interface TerritoryGrownBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export default function TerritoryGrownBadge({ size = "sm", className = "" }: TerritoryGrownBadgeProps) {
  if (size === "sm") {
    return (
      <Link
        href="/about"
        className={`inline-flex items-center gap-1 bg-amber-700/10 dark:bg-amber-600/15 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase hover:bg-amber-700/20 transition-colors ${className}`}
      >
        <Leaf className="h-3 w-3" />
        Territory Grown
      </Link>
    );
  }

  return (
    <Link
      href="/about"
      className={`inline-flex items-center gap-2 bg-amber-700/10 dark:bg-amber-600/15 text-amber-800 dark:text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase hover:bg-amber-700/20 transition-colors ${className}`}
    >
      <Leaf className="h-4 w-4" />
      Tyendinaga Territory Grown
    </Link>
  );
}
