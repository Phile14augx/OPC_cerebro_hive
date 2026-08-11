import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace | Platform",
  description: "Discover and install third-party skills, agents, and integrations for the CerebroHive platform.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
