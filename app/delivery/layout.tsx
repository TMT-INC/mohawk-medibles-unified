import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        template: "%s | Mohawk Medibles",
        default: "Cannabis Delivery Across Canada",
    },
    description:
        "Mohawk Medibles delivers premium, lab-tested cannabis to all Canadian provinces and territories. Flower, edibles, concentrates, hash, and more. Free shipping over $149.",
};

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
    return children;
}
