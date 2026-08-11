import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HiveShield™ | CerebroHive Platform",
  description:
    "Governance, approvals, and Zero Trust agent security in one console — the security and governance control plane over CerebroHive's platform.",
  alternates: { canonical: "https://cerebropchive.org/platform/shield" },
  openGraph: {
    title: "HiveShield™ | CerebroHive Platform",
    description: "Governance, approvals, and Zero Trust agent security in one console.",
    url: "https://cerebropchive.org/platform/shield",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "HiveShield" }],
  },
};

export default function ShieldLayout({ children }: { children: React.ReactNode }) {
  return children;
}
