"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/components/LocaleProvider";

export function SocialProofStrip() {
  const { t } = useLocale();

  const STATS = [
    { icon: "⭐", value: "4.8/5", label: t("home.customerRating"), detail: t("home.reviewCount") },
    { icon: "🚚", value: "47,000+", label: t("home.ordersShipped"), detail: t("home.canadaWide") },
    { icon: "📦", value: t("home.servingCanada"), label: "Since 2018", detail: t("home.yearsTrusted") },
    { icon: "🏆", value: "#1", label: t("home.indigenousDispensary"), detail: t("home.premiumQuality") },
  ];

  return (
    <section className="py-8 bg-card border-y border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl mb-1" aria-hidden="true">{stat.icon}</div>
              <div className="text-xl md:text-2xl font-black text-lime font-heading tracking-tight">{stat.value}</div>
              <div className="text-foreground font-semibold text-sm">{stat.label}</div>
              <div className="text-muted-foreground text-xs">{stat.detail}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
