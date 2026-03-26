"use client";

import { Truck, Clock, Package, ShieldCheck, MapPin } from "lucide-react";

const badges = [
  {
    icon: Truck,
    title: "Free Shipping $149+",
    desc: "Via Canada Post & Purolator",
  },
  {
    icon: Clock,
    title: "2-5 Business Days",
    desc: "Anywhere in Canada",
  },
  {
    icon: Package,
    title: "Discreet Packaging",
    desc: "No logos or descriptions",
  },
  {
    icon: ShieldCheck,
    title: "Full Tracking",
    desc: "Real-time email tracking updates",
  },
  {
    icon: MapPin,
    title: "Canada-Wide",
    desc: "All provinces & territories",
  },
];

export function DeliveryConfidence() {
  return (
    <div className="bg-gradient-to-r from-emerald-900/10 via-card to-emerald-900/10 border border-emerald-500/10 rounded-xl p-5">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Truck className="w-4 h-4 text-emerald-400" />
        Delivery Confidence
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {badges.map((badge, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/15 flex items-center justify-center shrink-0">
              <badge.icon className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                {badge.title}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {badge.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
