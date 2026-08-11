import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hive Infrastructure Suite — Cloud, Storage, Compute, Network, Identity, Monitor, API | CerebroHive",
  description:
    "HiveCloud™, HiveStorage™, HiveCompute™, HiveNetwork™, HiveIdentity™, HiveMonitor™, and HiveAPI™ — governed, simulated infrastructure services powering the CerebroHive platform.",
  alternates: { canonical: "https://cerebropchive.org/platform/cloud" },
  openGraph: {
    title: "Hive Infrastructure Suite | CerebroHive",
    description:
      "Cloud, storage, compute, network, identity, monitoring, and API infrastructure — governed and simulated.",
    url: "https://cerebropchive.org/platform/cloud",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Hive Infrastructure Suite" }],
  },
};

export default function CloudLayout({ children }: { children: React.ReactNode }) {
  return children;
}
