import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Readiness Assessment — CerebroHive",
  description: "Benchmark your organisation's AI readiness across strategy, data, talent, infrastructure, and governance. Get a scored report with a prioritised transformation roadmap.",
};
export default function AIReadinessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
