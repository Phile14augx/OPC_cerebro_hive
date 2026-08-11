import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Solution Finder — CerebroHive",
  description: "Answer a few questions about your business challenge and get a curated set of CerebroHive AI solutions, products, and services matched to your needs.",
};
export default function SolutionFinderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
