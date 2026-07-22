import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Services — CerebroHive",
  description: "End-to-end AI services for enterprises — consulting, automation, custom AI development, data engineering, and corporate AI training programs.",
};
export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
