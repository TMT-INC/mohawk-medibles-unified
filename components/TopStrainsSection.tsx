/**
 * TopStrainsSection — Server Component
 * ══════════════════════════════════════
 * Displays 8 top-rated flower product cards with image, THC badge,
 * strain type badge, terpenes, and price. Used on homepage and shop pages.
 */

import Image from "next/image";
import Link from "next/link";
import {
  getPopularStrains,
  STRAIN_TYPE_DATA,
  type StrainType,
} from "@/lib/strains";

const TYPE_COLORS: Record<StrainType, string> = {
  Indica: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  Sativa: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Hybrid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

const QUICK_LINKS = [
  { label: "All Strains", href: "/strains/" },
  { label: "Indica", href: "/strains/indica/" },
  { label: "Sativa", href: "/strains/sativa/" },
  { label: "Hybrid", href: "/strains/hybrid/" },
] as const;

export default async function TopStrainsSection() {
  const strains = await getPopularStrains(8);

  if (strains.length === 0) return null;

  return (
    <section aria-labelledby="top-strains-heading" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2
              id="top-strains-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
            >
              Top Strains
            </h2>
            <p className="mt-1 text-muted-foreground">
              Hand-picked premium flower — lab-tested, terpene-profiled, shipped Canada-wide.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Strain categories" className="flex flex-wrap gap-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-border px-3.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-forest hover:text-forest dark:hover:border-lime dark:hover:text-lime"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Product Grid ── */}
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {strains.map((product) => {
            const strainType = product.specs.type as StrainType;
            const typeColor = TYPE_COLORS[strainType] ?? TYPE_COLORS.Hybrid;

            return (
              <Link
                key={product.slug}
                href={`/product/${product.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-forest/40 dark:hover:border-lime/30"
              >
                {/* Image */}
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.altText || product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* THC Badge */}
                  {product.specs.thc && product.specs.thc !== "TBD" && (
                    <span className="absolute top-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-semibold text-lime backdrop-blur-sm">
                      THC {product.specs.thc}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col gap-2 p-3.5">
                  {/* Type Badge */}
                  <span
                    className={`self-start rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${typeColor}`}
                  >
                    {strainType}
                  </span>

                  {/* Name */}
                  <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-forest dark:group-hover:text-lime transition-colors">
                    {product.name}
                  </h3>

                  {/* Terpenes */}
                  {product.specs.terpenes && product.specs.terpenes.length > 0 && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {product.specs.terpenes.slice(0, 3).join(" · ")}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mt-auto pt-2">
                    <span className="text-base font-bold text-forest dark:text-lime">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
