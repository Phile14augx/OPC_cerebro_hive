import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Strategy Services",
  description: "Enterprise AI strategy, roadmaps, and governance frameworks — from readiness assessment to Center of Excellence design.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
