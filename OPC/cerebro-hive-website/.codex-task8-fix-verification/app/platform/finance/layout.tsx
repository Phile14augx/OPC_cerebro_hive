import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finance | Platform",
  description: "Financial operations, reporting, and controls integrated with your AI platform.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
