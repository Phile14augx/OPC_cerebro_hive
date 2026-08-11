import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Platform",
  description: "Project and program tracking integrated with AI-driven automation and reporting.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
