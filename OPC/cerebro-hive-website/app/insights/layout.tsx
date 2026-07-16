import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Intelligence Hub — CerebroHive Insights",
  description: "Enterprise AI market intelligence, trend analysis, weekly briefings, and strategic research from the CerebroHive team.",
};
export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
