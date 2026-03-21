import Link from "next/link";

/** Monthly Deals gradient cards from .cc — high-conversion deal showcase */
export function MonthlyDeals() {
  const deals = [
    {
      title: "$40 Ounces",
      highlight: "3 for $100",
      desc: "Quality bud at an unbeatable price",
      color: "from-green-600/20 to-green-900/20",
      border: "border-green-600/30",
      href: "/shop?category=flower",
    },
    {
      title: "Premium Hash",
      highlight: "Starting $140/oz",
      desc: "Afghan, Lebanese, and Moroccan hash",
      color: "from-amber-600/20 to-amber-900/20",
      border: "border-amber-600/30",
      href: "/shop?category=concentrates",
    },
    {
      title: "1000mg Gummies",
      highlight: "Only $20 Each",
      desc: "Potent edibles, assorted flavours",
      color: "from-purple-600/20 to-purple-900/20",
      border: "border-purple-600/30",
      href: "/shop?category=edibles",
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
            className={`group relative bg-gradient-to-br ${deal.color} border ${deal.border} rounded-2xl p-6 hover:scale-[1.02] transition-transform`}
          >
            <h3 className="text-2xl font-heading font-black text-white mb-1">
              {deal.title}
            </h3>
            <p className="text-[var(--lime)] font-bold text-lg mb-2">
              {deal.highlight}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {deal.desc}
            </p>
            <span className="inline-block mt-4 text-sm text-[var(--lime)] font-bold group-hover:underline">
              Shop Now →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
