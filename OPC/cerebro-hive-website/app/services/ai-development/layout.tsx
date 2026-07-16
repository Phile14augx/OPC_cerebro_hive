import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Development — CerebroHive",
  description: "Production-grade custom AI development — LLM-powered applications, multi-agent systems, RAG pipelines, and enterprise platform integrations built by senior AI engineers.",
};
export default function AIDevelopmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
