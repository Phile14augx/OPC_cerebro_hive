import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Project Templates — CerebroHive",
  description: "Ready-to-use templates for AI project scoping, RFPs, ROI analysis, agent architecture, and data engineering — free to download.",
};
export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
