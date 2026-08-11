import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Corporate AI Training — CerebroHive Case Study",
  description: "How CerebroHive designed and delivered a corporate AI training program for 500+ employees across engineering, product, and operations teams.",
};
export default function CaseStudyTrainingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
