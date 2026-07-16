import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "CerebroHive Academy — AI Education Platform",
  description: "Accredited AI courses, structured learning paths, and enterprise cohort programs. Build your team's AI fluency with CerebroHive Academy.",
};
export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
