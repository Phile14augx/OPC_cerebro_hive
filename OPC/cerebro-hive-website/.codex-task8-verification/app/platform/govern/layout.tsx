import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Governance | Platform",
  description: "Policy enforcement, audit trails, and compliance controls for every agent and model running in production.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
