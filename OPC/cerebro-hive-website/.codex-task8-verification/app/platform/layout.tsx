import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform",
  description: "Explore CerebroHive's full enterprise AI platform — 50+ integrated capabilities spanning data, models, agents, governance, and operations.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
