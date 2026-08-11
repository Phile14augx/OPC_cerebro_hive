import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vector Database | Platform",
  description: "High-performance vector storage and retrieval powering semantic search and RAG across CerebroHive.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
