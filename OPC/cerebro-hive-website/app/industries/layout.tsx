import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI for Every Industry — CerebroHive",
  description: "Explore AI use cases, compliance frameworks, reference architectures, and transformation roadmaps tailored to 15 industries — from finance and healthcare to manufacturing and government.",
};
export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
