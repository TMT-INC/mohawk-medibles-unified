"use client";

const DEALS = [
  { emoji: "🔥", text: "HOME OF THE $5 GRAM" },
  { emoji: "🚚", text: "FREE SHIPPING ON ORDERS $149+" },
  { emoji: "⚡", text: "SAME DAY DELIVERY AVAILABLE" },
  { emoji: "💳", text: "INTERAC • VISA/MC • BITCOIN" },
  { emoji: "🧪", text: "360+ LAB-TESTED PRODUCTS" },
  { emoji: "💰", text: "TAX-FREE ALWAYS" },
  { emoji: "📦", text: "DISCREET, SMELL-PROOF PACKAGING" },
  { emoji: "🏔️", text: "INDIGENOUS OWNED & OPERATED" },
];

export function DealTicker() {
  // Triple the items for a wider seamless loop (avoids gaps on ultrawide)
  const items = [...DEALS, ...DEALS, ...DEALS];

  return (
    <section
      aria-label="Current deals and promotions"
      className="relative overflow-hidden py-2.5 z-40 bg-gradient-to-r from-charcoal-deep via-[#1c1c12] to-charcoal-deep border-y border-lime/[0.08]"
    >
      {/* Fire-themed edge fades */}
      <div className="absolute inset-y-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-charcoal-deep to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-charcoal-deep to-transparent z-10 pointer-events-none" />

      <div className="flex animate-ticker whitespace-nowrap" aria-live="off">
        {items.map((deal, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-6 sm:mx-8 text-xs font-bold tracking-[0.15em] uppercase">
            <span aria-hidden="true" className="text-sm">{deal.emoji}</span>
            <span className="text-lime-light/90">{deal.text}</span>
            <span aria-hidden="true" className="text-lime/30 mx-2 text-[8px]">&#9670;</span>
          </span>
        ))}
      </div>

      {/* Subtle warm glow line at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
    </section>
  );
}
