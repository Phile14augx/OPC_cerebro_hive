import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Research — CerebroHive Research Institute",
  description: "Original AI research from CerebroHive — benchmarks, experiments, open-source projects, and publications spanning LLMs, multi-agent systems, RAG, and enterprise AI architecture.",
};
export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
