import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform | CerebroHive — The Enterprise AI Operating System",
  description:
    "CerebroHive's enterprise AI operating system: agent orchestration, knowledge graphs, governance, and infrastructure unified under one platform.",
  alternates: { canonical: "https://cerebropchive.org/platform" },
  openGraph: {
    title: "Platform | CerebroHive — The Enterprise AI Operating System",
    description:
      "CerebroHive's enterprise AI operating system: agent orchestration, knowledge graphs, governance, and infrastructure unified under one platform.",
    url: "https://cerebropchive.org/platform",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CerebroHive Platform" }],
  },
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return children;
}
