import Image from "next/image";
import { ShoppingCart, CreditCard, Mailbox } from "lucide-react";

/** How It Works 3-step process from .cc — numbered circle cards */
export function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: <ShoppingCart className="w-8 h-8 text-[var(--lime)]" />,
      title: "Browse & Select",
      desc: "Browse our curated selection of premium cannabis products and add your favourites to cart.",
      image: "/assets/cards/how-browse.webp",
    },
    {
      step: "02",
      icon: <CreditCard className="w-8 h-8 text-[var(--lime)]" />,
      title: "Place Your Order",
      desc: "Checkout and pay via Interac e-Transfer. Simple, fast, and secure.",
      image: "/assets/cards/how-pay.webp",
    },
    {
      step: "03",
      icon: <Mailbox className="w-8 h-8 text-[var(--lime)]" />,
      title: "Fast Delivery",
      desc: "Your order ships discreetly via Canada Post or Purolator. Delivered in 2-5 business days.",
      image: "/assets/cards/how-delivery.webp",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-20 bg-background">
      <div className="text-center mb-14">
        <p className="text-[11px] uppercase tracking-[0.3em] text-lime font-bold mb-3">Simple & Secure</p>
        <h2 className="text-3xl md:text-4xl font-heading font-black text-foreground dark:text-cream tracking-tight">
          How It Works
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connecting line between steps (desktop) */}
        <div className="hidden md:block absolute top-[168px] left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-lime/20 to-transparent z-0" />

        {steps.map((item) => (
          <div
            key={item.step}
            className="relative text-center overflow-hidden rounded-2xl shadow-xl shadow-black/[0.08] dark:shadow-black/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group"
          >
            <div className="relative h-40 w-full overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-card" />
            </div>
            <div className="absolute top-[148px] left-1/2 -translate-x-1/2 w-12 h-12 bg-lime text-black text-sm font-black flex items-center justify-center rounded-full z-10 shadow-lg shadow-lime/30 ring-[3px] ring-background group-hover:scale-110 transition-transform duration-300">
              {item.step}
            </div>
            <div className="p-6 pt-5 bg-card">
              <div className="flex justify-center mb-4 mt-2 opacity-80 group-hover:opacity-100 transition-opacity">{item.icon}</div>
              <h3 className="font-heading font-black text-lg mb-2 text-card-foreground dark:text-white tracking-tight">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground dark:text-white/70 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
