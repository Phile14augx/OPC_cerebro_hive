import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agents | Platform",
  description: "Manage the fleet of AI agents running across your organization — identities, tool grants, and live status.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
