import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Tools Directory — CerebroHive",
  description: "A curated directory of enterprise AI tools across LLMs, vector databases, orchestration frameworks, observability, and data infrastructure — reviewed by the CerebroHive team.",
};
export default function AIToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
