import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | Platform",
  description: "Usage, performance, and business analytics across every agent, model, and workflow in your platform.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
