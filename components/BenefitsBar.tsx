import { Truck, Package, Home as HomeIcon, Mailbox, CalendarDays } from "lucide-react";

/** Benefits bar — 5-column trust signals below hero */
export function BenefitsBar() {
  const benefits = [
    { icon: <Truck className="w-[18px] h-[18px]" strokeWidth={1.8} />, text: "Free Shipping $199+" },
    { icon: <Package className="w-[18px] h-[18px]" strokeWidth={1.8} />, text: "Discreet Packaging" },
    { icon: <HomeIcon className="w-[18px] h-[18px]" strokeWidth={1.8} />, text: "Indigenous Owned" },
    { icon: <Mailbox className="w-[18px] h-[18px]" strokeWidth={1.8} />, text: "2-5 Day Delivery" },
    { icon: <CalendarDays className="w-[18px] h-[18px]" strokeWidth={1.8} />, text: "Since 2019" },
  ];

  return (
    <section className="relative border-y border-white/[0.06] bg-gradient-to-r from-charcoal-deep/80 via-[#1a1a24]/90 to-charcoal-deep/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-2">
          {benefits.map((item) => (
            <div
              key={item.text}
              className="group flex items-center justify-center gap-2.5 text-[13px] text-white/60 hover:text-white/90 transition-colors duration-300 cursor-default"
            >
              <span className="text-lime/80 group-hover:text-lime transition-colors duration-300 shrink-0">
                {item.icon}
              </span>
              <span className="font-medium tracking-wide whitespace-nowrap">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Subtle top highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/15 to-transparent" />
    </section>
  );
}
