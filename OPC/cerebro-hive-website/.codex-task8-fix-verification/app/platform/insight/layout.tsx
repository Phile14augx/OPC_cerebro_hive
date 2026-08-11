import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insight | Platform",
  description: "Business intelligence and reporting surfaced directly from your AI platform's operational data.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
