import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | Platform",
  description: "Enterprise search across documents, knowledge, and conversations powered by semantic retrieval.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
