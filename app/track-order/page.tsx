import { Metadata } from "next";
import { Suspense } from "react";
import { breadcrumbSchema } from "@/lib/seo/schemas";
import OrderTracker from "@/components/OrderTracker";

export const metadata: Metadata = {
  title: "Track Order | Mohawk Medibles",
  description:
    "Track your Mohawk Medibles order status and delivery in real-time. Enter your order number to see live updates, estimated delivery, and carrier tracking.",
};

export default function TrackOrderPage() {
  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", url: "https://mohawkmedibles.ca" },
    { name: "Track Order", url: "https://mohawkmedibles.ca/track-order" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-950/30 via-background to-background py-14">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            Live Tracking
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-black text-white mb-3 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Real-time updates on your delivery status
          </p>
        </div>
      </section>

      {/* Tracker */}
      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        }
      >
        <OrderTracker />
      </Suspense>

      {/* Shipping FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8 text-foreground">Shipping FAQ</h2>
        <div className="space-y-4">
          {[
            { q: "How long does shipping take?", a: "Most orders ship same-day and arrive within 1-3 business days via Canada Post Xpresspost or Purolator." },
            { q: "How much does shipping cost?", a: "Flat rate $15 shipping. FREE on all orders over $199. Click & Collect in-store is always free." },
            { q: "Is the packaging discreet?", a: "Yes. All orders ship in plain, unbranded packaging with no indication of contents. Your privacy is our priority." },
            { q: "What carriers do you use?", a: "We ship via Canada Post Xpresspost, Purolator, UPS, and FedEx depending on your location for the fastest delivery." },
            { q: "Can I change my shipping address?", a: "Contact us immediately at info@mohawkmedibles.ca or (613) 396-6728. We can update before the order ships." },
          ].map((item) => (
            <details key={item.q} className="group rounded-xl border border-border bg-card/50 overflow-hidden">
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-medium text-foreground hover:bg-muted/30 transition-colors">
                {item.q}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-6 pb-4 text-muted-foreground text-sm">{item.a}</div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
