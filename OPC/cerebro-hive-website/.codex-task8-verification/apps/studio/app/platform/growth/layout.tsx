import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CerebroGrowth™ — Enterprise AI Growth Engine | CerebroHive",
  description:
    "A governed-simulation growth engine, not a LinkedIn automation tool. Turn one research paper into a full go-to-market motion.",
  alternates: { canonical: "https://cerebropchive.org/platform/growth" },
  openGraph: {
    title: "CerebroGrowth™ — Enterprise AI Growth Engine | CerebroHive",
    description:
      "A governed-simulation growth engine, not a LinkedIn automation tool. Turn one research paper into a full go-to-market motion.",
    url: "https://cerebropchive.org/platform/growth",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CerebroGrowth" }],
  },
};

export default function GrowthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
