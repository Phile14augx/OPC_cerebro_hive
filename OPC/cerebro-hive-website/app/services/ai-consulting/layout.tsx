import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Consulting & Strategy — CerebroHive",
  description: "Board-approved AI roadmaps, ROI-prioritized use case identification, and executive alignment workshops. CerebroHive's AI consulting practice turns strategy into production.",
};
export default function AIConsultingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
