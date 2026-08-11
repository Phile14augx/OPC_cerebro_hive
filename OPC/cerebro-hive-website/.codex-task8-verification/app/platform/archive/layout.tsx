import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive | Platform",
  description: "Document intelligence and knowledge archival — extraction, governance, and lineage for enterprise content.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
