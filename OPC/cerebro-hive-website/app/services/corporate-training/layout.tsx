import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Corporate AI Training — CerebroHive",
  description: "Upskill your entire organisation in AI. CerebroHive's corporate training programs cover LLMs, prompt engineering, AI agents, and governance — delivered as cohorts or self-paced.",
};
export default function CorporateTrainingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
