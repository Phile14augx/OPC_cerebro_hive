import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Enterprise AI Solutions — CerebroHive",
  description: "Explore CerebroHive's 12 enterprise AI solutions — from RAG pipelines and AI agents to hyperautomation, decision intelligence, and ERP modernization.",
};
export default function SolutionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
