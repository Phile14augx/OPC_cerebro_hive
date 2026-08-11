import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Operations Services",
  description: "Ongoing operations, monitoring, and optimization for AI systems already in production.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
