import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Find Your Perfect Cannabis Product \u2014 Quiz | Mohawk Medibles",
    description:
        "Take our interactive quiz to find the perfect cannabis product for your needs. Answer 5 quick questions and get personalized recommendations from Mohawk Medibles.",
    openGraph: {
        title: "Find Your Perfect Cannabis Product \u2014 Quiz | Mohawk Medibles",
        description:
            "Take our interactive quiz to find the perfect cannabis product for your needs.",
    },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
    return children;
}
