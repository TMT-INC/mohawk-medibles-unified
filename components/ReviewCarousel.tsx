"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/components/LocaleProvider";

const REVIEWS = [
  { name: "Sarah T.", location: "Toronto", rating: 5, text: "Best flower I've ever ordered online. The GOAT strain is absolutely incredible. Will be a lifetime customer.", product: "GOAT Flower" },
  { name: "Mike R.", location: "Vancouver", rating: 5, text: "These gummies are really the best. Perfect for relaxing after work. Fast shipping too!", product: "Left Coast Gummies" },
  { name: "Jessica L.", location: "Calgary", rating: 5, text: "Amazing quality shatter. Mohawk Medibles never disappoints. The price is unbeatable.", product: "Zillionaire Shatter" },
  { name: "Dave K.", location: "Ottawa", rating: 5, text: "Ordered on Monday, arrived Wednesday. Discreet packaging, top quality. 10/10 would recommend.", product: "Mixed Flower Oz" },
  { name: "Priya S.", location: "Montreal", rating: 5, text: "The CBD oil has been a game changer for my sleep. Indigenous-owned businesses FTW!", product: "SleeBD Capsules" },
  { name: "Chris W.", location: "Edmonton", rating: 5, text: "First time ordering. Blown away by the quality for the price. The $5 grams are legit.", product: "$5 Gram Special" },
  { name: "Amanda B.", location: "Halifax", rating: 5, text: "Best dispensary in Canada, hands down. Lab tested, fair prices, and the customer service is amazing.", product: "Vape Cartridge" },
  { name: "Tyler N.", location: "Winnipeg", rating: 5, text: "The pre-rolls are perfectly packed and burn smooth. Best $5 pre-roll you'll find anywhere.", product: "$5 Pre-Roll" },
];

export function ReviewCarousel() {
  const { t } = useLocale();
  const doubled = [...REVIEWS, ...REVIEWS];

  return (
    <section className="py-14 px-4 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-1.5 mb-3" role="img" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} aria-hidden="true" className="text-amber-400 text-2xl drop-shadow-sm">★</span>
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight mb-2">{t("home.fiveStarDispensary")}</h2>
          <p className="text-muted-foreground text-sm">{t("home.thousandsSatisfied")}</p>
        </motion.div>
      </div>

      {/* Edge fade overlays */}
      <div className="relative group">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex gap-5 animate-scroll hover:[animation-play-state:paused]">
          {doubled.map((review, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[300px] md:w-[350px] p-6 rounded-2xl bg-card shadow-lg shadow-black/[0.08] dark:shadow-black/30 hover:shadow-xl hover:-translate-y-0.5 border border-transparent hover:border-lime/20 transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-3" role="img" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: review.rating }).map((_, j) => (
                  <span key={j} aria-hidden="true" className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-sm text-card-foreground/90 leading-relaxed mb-4 line-clamp-3 italic">&ldquo;{review.text}&rdquo;</p>
              <div className="flex items-center justify-between pt-3 border-t border-border/30">
                <div>
                  <p className="font-bold text-sm tracking-tight">{review.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{review.location}</p>
                </div>
                <span className="text-[10px] bg-lime/15 dark:bg-lime/10 text-lime-dark dark:text-lime px-2.5 py-1 rounded-full font-semibold tracking-wide">{review.product}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
