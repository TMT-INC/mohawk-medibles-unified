import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Checkout | Mohawk Medibles — Secure Cannabis Ordering",
    description:
        "Complete your cannabis order securely. Pay with Credit Card, Interac e-Transfer, or Crypto. Free shipping over $199 Canada-wide.",
    robots: { index: false, follow: false },
    alternates: { canonical: "https://mohawkmedibles.ca/checkout" },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
