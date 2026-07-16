import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Automation — CerebroHive",
  description: "Intelligent workflow automation using AI agents, n8n orchestration, LangGraph pipelines, and enterprise integration. Replace manual processes with autonomous, auditable AI systems.",
};
export default function AIAutomationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
