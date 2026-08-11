import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Learning Paths — CerebroHive Academy",
  description: "Follow curated AI learning paths — AI Developer, AI Architect, and AI Product Manager tracks designed to take you from foundations to production systems.",
};
export default function LearningPathsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
