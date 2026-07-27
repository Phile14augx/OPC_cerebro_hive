import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memory | Platform",
  description: "Persistent and working memory infrastructure for stateful AI agents and long-running conversations.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
