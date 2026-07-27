import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flow | Platform",
  description: "Design and orchestrate multi-step AI workflows connecting agents, tools, and data sources.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
