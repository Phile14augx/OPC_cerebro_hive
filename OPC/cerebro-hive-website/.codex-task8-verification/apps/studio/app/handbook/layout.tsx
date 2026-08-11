import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Company Handbook — CerebroHive",
  description: "The CerebroHive operating handbook — how we work, our engineering principles, delivery standards, and culture documentation.",
};
export default function HandbookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
