import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HivePulse™ | CerebroHive Platform",
  description:
    "The unified control plane for your agent mesh and execution runtime. Register agents, discover capabilities, and monitor execution across CerebroHive.",
  alternates: { canonical: "https://cerebropchive.org/platform/pulse" },
  openGraph: {
    title: "HivePulse™ | CerebroHive Platform",
    description: "The unified control plane for your agent mesh and execution runtime.",
    url: "https://cerebropchive.org/platform/pulse",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "HivePulse" }],
  },
};

export default function PulseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
