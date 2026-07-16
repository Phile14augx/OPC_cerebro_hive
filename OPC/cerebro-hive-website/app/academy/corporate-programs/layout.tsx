import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Corporate AI Training Programs — CerebroHive Academy",
  description: "Tailor cohort AI training for your engineering, product, and leadership teams. Managed seat allocation, custom curriculum, and certification tracking.",
};
export default function CorporateProgramsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
