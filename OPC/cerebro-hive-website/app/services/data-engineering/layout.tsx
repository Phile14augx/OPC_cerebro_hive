import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Data Engineering — CerebroHive",
  description: "Enterprise data infrastructure for AI — vector databases, semantic pipelines, ETL architectures, and data lakes designed to power production AI systems at scale.",
};
export default function DataEngineeringLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
