import Link from "next/link";
import Image from "next/image";

/** Monthly Deals gradient cards from .cc — high-conversion deal showcase */
export function MonthlyDeals() {
  const deals = [
    {
      title: "$40 Ounces",
      highlight: "3 for $100",
      desc: "Quality bud at an unbeatable price",
      color: "from-green-900/80 to-green-950/90",
      href: "/shop?category=flower",
      image: "/assets/cards/monthly-ounces.webp",
    },
    {
      title: "Premium Hash",
      highlight: "Starting $140/oz",
      desc: "Afghan, Lebanese, and Moroccan hash",
      color: "from-amber-900/80 to-amber-950/90",
      href: "/shop?category=concentrates",
      image: "/assets/cards/monthly-hash.webp",
    },
    {
      title: "1000mg Gummies",
      highlight: "Only $20 Each",
      desc: "Potent edibles, assorted flavours",
      color: "from-purple-900/80 to-purple-950/90",
      href: "/shop?category=edibles",
      image: "/assets/cards/monthly-gummies.webp",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-heading font-bold text-center mb-2">
        Monthly Deals
      </h2>
      <p className="text-center text-[var(--muted-foreground)] mb-10">
        Unbeatable prices every month
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <Link
            key={deal.title}
            href={deal.href}
            className="group relative overflow-hidden rounded-2xl min-h-[220px] hover:scale-[1.02] transition-transform"
          >
            <Image
              src={deal.image}
              alt={deal.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${deal.color}`} />
            <div className="relative z-10 p-6 flex flex-col justify-end h-full">
              <h3 className="text-2xl font-heading font-black text-white mb-1">
                {deal.title}
              </h3>
              <p className="text-[var(--lime)] font-bold text-lg mb-2">
                {deal.highlight}
              </p>
              <p className="text-sm text-white/70">
                {deal.desc}
              </p>
              <span className="inline-block mt-4 text-sm text-[var(--lime)] font-bold group-hover:underline">
                Shop Now →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
