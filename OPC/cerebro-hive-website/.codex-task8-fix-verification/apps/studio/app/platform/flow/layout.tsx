import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CerebroFlow™ | CerebroHive Platform",
  description:
    "Event-driven workflow orchestration with human-in-the-loop approvals. Compile and run flows on CerebroHive's Flow engine and Connect integration hub.",
  alternates: { canonical: "https://cerebropchive.org/platform/flow" },
  openGraph: {
    title: "CerebroFlow™ | CerebroHive Platform",
    description: "Event-driven workflow orchestration with human-in-the-loop approvals.",
    url: "https://cerebropchive.org/platform/flow",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CerebroFlow" }],
  },
};

export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return children;
}
