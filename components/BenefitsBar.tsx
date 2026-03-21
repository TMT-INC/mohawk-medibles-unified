import { Truck, Package, Home as HomeIcon, Mailbox, CalendarDays } from "lucide-react";

/** Benefits bar from .cc — 5-column trust signals below hero */
export function BenefitsBar() {
  const benefits = [
    { icon: <Truck className="w-4 h-4 text-[var(--lime)]" />, text: "Free Shipping $149+" },
    { icon: <Package className="w-4 h-4 text-[var(--lime)]" />, text: "Discreet Packaging" },
    { icon: <HomeIcon className="w-4 h-4 text-[var(--lime)]" />, text: "Indigenous Owned" },
    { icon: <Mailbox className="w-4 h-4 text-[var(--lime)]" />, text: "2-5 Day Delivery" },
    { icon: <CalendarDays className="w-4 h-4 text-[var(--lime)]" />, text: "Since 2018" },
  ];

  return (
    <section className="border-y border-[var(--border)] bg-[#252530]/50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {benefits.map((item) => (
            <div
              key={item.text}
              className="flex items-center justify-center gap-2 text-sm text-[var(--muted-foreground)]"
            >
              {item.icon}
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
