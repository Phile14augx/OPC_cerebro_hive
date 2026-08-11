import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Operations | Platform",
  description: "Operational tooling for running AI systems reliably in production — incidents, health, and runbooks.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
