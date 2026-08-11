import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Semantic Layer | Platform",
  description: "A unified semantic layer mapping business concepts to underlying data for consistent AI reasoning.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
