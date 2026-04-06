import Link from "next/link";
import { Search, ShoppingBag, Flame, BookOpen, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-lg">
        <div className="text-8xl font-black text-lime/20">404</div>
        <h1 className="text-3xl font-bold text-foreground">Page Not Found</h1>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center pt-2">
          <Link
            href="/"
            className="px-6 py-3 bg-forest text-white rounded-full font-medium hover:bg-forest/90 transition-colors dark:bg-lime dark:text-charcoal-deep dark:hover:bg-lime/90"
          >
            Go Home
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 border border-border rounded-full font-medium hover:bg-muted transition-colors"
          >
            Browse Shop
          </Link>
        </div>

        {/* Popular links */}
        <div className="pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Popular pages</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: ShoppingBag, label: "All Products", href: "/shop" },
              { icon: Flame, label: "Deals & Promos", href: "/deals" },
              { icon: BookOpen, label: "Blog", href: "/blog" },
              { icon: HelpCircle, label: "FAQ", href: "/faq" },
            ].map((link) => (
              <Link key={link.label} href={link.href} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:border-lime/50 hover:bg-muted/30 transition-colors text-sm font-medium text-muted-foreground hover:text-foreground">
                <link.icon className="h-4 w-4 text-lime" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
