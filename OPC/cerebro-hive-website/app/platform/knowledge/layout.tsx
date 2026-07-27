import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Graph | Platform",
  description: "Enterprise knowledge graph connecting documents, entities, and relationships into AI-queryable institutional knowledge.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
