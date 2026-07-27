import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Engineering Services",
  description: "Enterprise RAG, knowledge graphs, custom agents, and platform deployment — built and shipped by CerebroHive engineers.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
