import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CerebroForge™ — AI Innovation Factory | CerebroHive",
  description:
    "A governed-simulation research-to-product pipeline, not a live web-scraping news aggregator. Submit a domain and get a validated product concept back.",
  alternates: { canonical: "https://cerebropchive.org/platform/forge" },
  openGraph: {
    title: "CerebroForge™ — AI Innovation Factory | CerebroHive",
    description:
      "A governed-simulation research-to-product pipeline, not a live web-scraping news aggregator.",
    url: "https://cerebropchive.org/platform/forge",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CerebroForge" }],
  },
};

export default function ForgeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
