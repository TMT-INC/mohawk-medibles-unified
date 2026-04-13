/**
 * PopularStrainsFooter — Server Component
 * ═════════════════════════════════════════
 * Renders 10 popular strain pill links + 3 strain type category cards.
 * Placed above the site footer on every page for internal linking juice.
 */

import Link from "next/link";
import {
  getPopularStrains,
  getStrainTypeCounts,
  STRAIN_TYPE_DATA,
  STRAIN_TYPES,
  type StrainType,
} from "@/lib/strains";

const TYPE_EMOJI: Record<StrainType, string> = {
  Indica: "🌙",
  Sativa: "☀️",
  Hybrid: "⚡",
};

export default async function PopularStrainsFooter() {
  const [strains, counts] = await Promise.all([
    getPopularStrains(10),
    getStrainTypeCounts(),
  ]);

  if (strains.length === 0) return null;

  return (
    <section
      aria-label="Popular cannabis strains"
      className="bg-charcoal-deep/95 border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* ── Popular Strains Pill Links ── */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-cream mb-4">
            Popular Strains
          </h2>
          <div className="flex flex-wrap gap-2">
            {strains.map((strain) => (
              <Link
                key={strain.slug}
                href={`/product/${strain.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-cream/90 transition-colors hover:border-lime/40 hover:bg-lime/10 hover:text-lime"
              >
                <span className="text-xs opacity-60">
                  {TYPE_EMOJI[strain.specs.type as StrainType] ?? "🌿"}
                </span>
                {strain.name}
                {strain.specs.thc && strain.specs.thc !== "TBD" && (
                  <span className="text-xs text-lime/70">
                    {strain.specs.thc}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Strain Type Category Cards ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          {STRAIN_TYPES.map((type) => {
            const data = STRAIN_TYPE_DATA[type];
            return (
              <Link
                key={type}
                href={`/strains/${data.slug}`}
                className="group flex flex-col rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-lime/30 hover:bg-lime/5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl" aria-hidden="true">
                    {TYPE_EMOJI[type]}
                  </span>
                  <h3 className="text-base font-semibold text-cream group-hover:text-lime transition-colors">
                    {data.title}
                  </h3>
                </div>
                <p className="text-sm text-cream/60 leading-relaxed mb-3">
                  {data.shortDescription}
                </p>
                <span className="mt-auto text-xs font-medium text-lime/70">
                  {counts[type]} {counts[type] === 1 ? "strain" : "strains"}{" "}
                  available
                </span>
              </Link>
            );
          })}
        </div>

        {/* ── View All Link ── */}
        <div className="mt-8 text-center">
          <Link
            href="/strains"
            className="inline-flex items-center gap-1 text-sm font-medium text-lime hover:text-lime/80 transition-colors"
          >
            View All Strains
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
