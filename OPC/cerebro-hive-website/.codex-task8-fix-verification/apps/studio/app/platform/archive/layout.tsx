import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CerebroArchive™ | CerebroHive Platform",
  description:
    "Ingest, search, and reason over your organization's knowledge. CerebroArchive is the console over CerebroHive's Knowledge Fabric and Intelligence Hub.",
  alternates: { canonical: "https://cerebropchive.org/platform/archive" },
  openGraph: {
    title: "CerebroArchive™ | CerebroHive Platform",
    description: "Ingest, search, and reason over your organization's knowledge.",
    url: "https://cerebropchive.org/platform/archive",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CerebroArchive" }],
  },
};

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
