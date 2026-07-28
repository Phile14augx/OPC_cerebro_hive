import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cerebro X™ — AI Gateway | CerebroHive Platform",
  description:
    "The AI gateway: model routing, cost, and observability in one place. Live AI call cost and performance monitoring via the platform's Observatory and Router.",
  alternates: { canonical: "https://cerebropchive.org/platform/x" },
  openGraph: {
    title: "Cerebro X™ — AI Gateway | CerebroHive Platform",
    description: "The AI gateway: model routing, cost, and observability in one place.",
    url: "https://cerebropchive.org/platform/x",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Cerebro X" }],
  },
};

export default function CerebroXLayout({ children }: { children: React.ReactNode }) {
  return children;
}
