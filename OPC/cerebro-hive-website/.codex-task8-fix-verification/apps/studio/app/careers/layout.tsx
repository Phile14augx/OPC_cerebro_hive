import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Careers at CerebroHive — Join Our AI Engineering Team",
  description: "Work on enterprise-scale AI systems with a research-first, no-politics engineering culture. Open roles across AI research, platform engineering, consulting, and education.",
};
export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
