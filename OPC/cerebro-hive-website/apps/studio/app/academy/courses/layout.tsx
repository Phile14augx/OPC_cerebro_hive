import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Courses — CerebroHive Academy",
  description: "Browse and enroll in AI courses covering LangChain, LLM fine-tuning, RAG pipelines, prompt engineering, and enterprise AI deployment.",
};
export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
