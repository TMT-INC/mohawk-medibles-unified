import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl font-black text-lime/20">404</div>
        <h1 className="text-3xl font-bold text-foreground">Page Not Found</h1>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center pt-4">
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
      </div>
    </div>
  );
}
