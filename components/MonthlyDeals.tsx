import Link from "next/link";
import Image from "next/image";
import { Flame } from "lucide-react";

/** Monthly Deals gradient cards from .cc — high-conversion deal showcase */
export function MonthlyDeals() {
  const deals = [
    {
      title: "$40 Ounces",
      highlight: "3 for $100",
      desc: "Quality bud at an unbeatable price",
      color: "from-green-900/90 via-green-950/80 to-black/70",
      accent: "text-lime-400",
      badge: "BEST SELLER",
      href: "/shop?category=flower",
      image: "/assets/cards/monthly-ounces.webp",
    },
    {
      title: "Premium Hash",
      highlight: "Starting $140/oz",
      desc: "Afghan, Lebanese, and Moroccan hash",
      color: "from-amber-900/90 via-amber-950/80 to-black/70",
      accent: "text-amber-400",
      badge: "LIMITED",
      href: "/shop?category=concentrates",
      image: "/assets/cards/monthly-hash.webp",
    },
    {
      title: "1000mg Gummies",
      highlight: "Only $20 Each",
      desc: "Potent edibles, assorted flavours",
      color: "from-purple-900/90 via-purple-950/80 to-black/70",
      accent: "text-fuchsia-400",
      badge: "HOT DEAL",
      href: "/shop?category=edibles",
      image: "/assets/cards/monthly-gummies.webp",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold tracking-widest uppercase mb-4">
          <Flame className="w-3.5 h-3.5" />
          This Month&apos;s Fire
        </div>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-2">
          Monthly Deals
        </h2>
        <p className="text-center text-[var(--muted-foreground)]">
          Unbeatable prices — while supplies last
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <Link
            key={deal.title}
            href={deal.href}
            className="group relative overflow-hidden rounded-2xl min-h-[280px] transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 shadow-lg shadow-black/20 hover:shadow-2xl hover:shadow-black/40"
          >
            <Image
              src={deal.image}
              alt={deal.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {/* Gradient overlay — thicker for readability */}
            <div className={`absolute inset-0 bg-gradient-to-t ${deal.color}`} />
            {/* Shimmer on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
            {/* Badge */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-bold tracking-widest text-orange-400 uppercase">
              {deal.badge}
            </div>
            <div className="relative z-10 p-6 flex flex-col justify-end h-full">
              <h3 className="text-2xl font-heading font-black text-white mb-1 drop-shadow-lg">
                {deal.title}
              </h3>
              <p className={`${deal.accent} font-extrabold text-xl mb-2 drop-shadow-md`}>
                {deal.highlight}
              </p>
              <p className="text-sm text-white/70">
                {deal.desc}
              </p>
              <span className="inline-flex items-center gap-1.5 mt-4 text-sm text-white font-bold opacity-80 group-hover:opacity-100 group-hover:gap-3 transition-all duration-300">
                Shop Now
                <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
