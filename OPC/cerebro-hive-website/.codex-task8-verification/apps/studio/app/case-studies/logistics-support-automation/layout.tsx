import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Logistics Support Automation — CerebroHive Case Study",
  description: "How CerebroHive deployed an AI-powered logistics support automation system, reducing resolution time by over 70% with n8n orchestration and LLM-backed classification.",
};
export default function CaseStudyLogisticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
