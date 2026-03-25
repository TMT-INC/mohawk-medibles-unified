import type { Metadata } from "next";
import WholesaleClient from "./WholesaleClient";

export const metadata: Metadata = {
  title: "Wholesale B2B Cannabis — Bulk Pricing & Net Terms",
  description:
    "Apply for a wholesale account at Mohawk Medibles. Bulk pricing tiers from Bronze to Platinum. Net 15-30 terms. Indigenous-owned supplier shipping Canada-wide.",
  openGraph: {
    images: ["/og-image.png"],
  },
};

export default function WholesalePage() {
  return <WholesaleClient />;
}
