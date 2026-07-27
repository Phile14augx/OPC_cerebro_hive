import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evaluation | Platform",
  description: "Test, score, and benchmark agent and model outputs before and after they reach production.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
