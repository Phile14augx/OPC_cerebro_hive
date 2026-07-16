import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Whitepapers — CerebroHive",
  description: "In-depth AI whitepapers on enterprise architecture, LLM deployment, RAG systems, AI governance, and digital transformation — authored by the CerebroHive team.",
};
export default function WhitepapersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
