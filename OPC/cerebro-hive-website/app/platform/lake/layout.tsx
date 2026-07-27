import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Lake | Platform",
  description: "Unified data lake for structured and unstructured enterprise data feeding CerebroHive's AI systems.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
