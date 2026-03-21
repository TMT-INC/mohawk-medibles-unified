import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Wishlist | Mohawk Medibles — Save Your Favourite Cannabis Products",
    description:
        "Save and manage your favourite cannabis products from Mohawk Medibles. Flower, edibles, concentrates, vapes and more — all in one place.",
    robots: { index: false, follow: true },
    alternates: { canonical: "https://mohawkmedibles.ca/wishlist" },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
