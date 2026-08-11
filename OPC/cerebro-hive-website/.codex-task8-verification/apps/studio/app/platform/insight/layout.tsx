import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CerebroInsight™ — Executive Intelligence Platform | CerebroHive",
  description:
    "Executive intelligence, not another BI dashboard. A metric engine, dashboard builder, alert engine, and AI insight narratives built directly on your enterprise data.",
  alternates: { canonical: "https://cerebropchive.org/platform/insight" },
  openGraph: {
    title: "CerebroInsight™ — Executive Intelligence Platform | CerebroHive",
    description:
      "Executive intelligence, not another BI dashboard. A metric engine, dashboard builder, alert engine, and AI insight narratives.",
    url: "https://cerebropchive.org/platform/insight",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CerebroInsight" }],
  },
};

export default function InsightLayout({ children }: { children: React.ReactNode }) {
  return children;
}
