import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Status | CerebroHive",
  description: "Live status and uptime for CerebroHive's enterprise AI platform services.",
  alternates: { canonical: "https://cerebropchive.org/status" },
  openGraph: {
    title: "System Status | CerebroHive",
    description: "Live status and uptime for CerebroHive's enterprise AI platform services.",
    url: "https://cerebropchive.org/status",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CerebroHive Status" }],
  },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
