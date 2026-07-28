import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Runtime | CerebroHive Platform",
  description:
    "Two real, independent AI runtimes — a deterministic in-browser kernel with no server round-trip, and a live backend execution engine. See CerebroHive's agent runtime in action.",
  alternates: { canonical: "https://cerebropchive.org/platform/live-runtime" },
  openGraph: {
    title: "Live Runtime | CerebroHive Platform",
    description:
      "Two real, independent AI runtimes — a deterministic in-browser kernel with no server round-trip, and a live backend execution engine.",
    url: "https://cerebropchive.org/platform/live-runtime",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CerebroHive Live Runtime" }],
  },
};

export default function LiveRuntimeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
