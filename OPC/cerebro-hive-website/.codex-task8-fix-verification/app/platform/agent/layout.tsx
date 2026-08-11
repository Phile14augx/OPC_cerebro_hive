import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent | Platform",
  description: "Configure a single AI agent — model selection, tool access, instructions, and execution limits.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
