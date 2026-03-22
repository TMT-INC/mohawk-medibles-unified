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
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-heading font-bold text-center mb-10">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((item) => (
          <div
            key={item.step}
            className="relative text-center overflow-hidden rounded-2xl border border-[var(--border)]"
          >
            <div className="relative h-36 w-full">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--card)]" />
            </div>
            <div className="absolute top-32 left-1/2 -translate-x-1/2 w-8 h-8 bg-[var(--lime)] text-black text-xs font-black flex items-center justify-center rounded-full z-10">
              {item.step}
            </div>
            <div className="p-6 pt-4 bg-[var(--card)]">
              <div className="flex justify-center mb-4 mt-2">{item.icon}</div>
              <h3 className="font-heading font-bold text-white text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
