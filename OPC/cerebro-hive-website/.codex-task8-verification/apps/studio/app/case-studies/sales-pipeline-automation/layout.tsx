import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sales Pipeline Automation — CerebroHive Case Study",
  description: "How CerebroHive automated a client's entire sales pipeline with AI agents — from lead scoring to proposal generation. Measured outcomes and architecture breakdown.",
};
export default function CaseStudySalesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
