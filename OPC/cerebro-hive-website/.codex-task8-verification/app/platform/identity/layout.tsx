import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identity & Access Management | Platform",
  description: "Manage agent identities, tool grants, risk tiers, and capability tokens for your AI workforce from a single control plane.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
