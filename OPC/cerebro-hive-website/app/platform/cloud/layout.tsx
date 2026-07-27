import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloud | Platform",
  description: "Cloud infrastructure management and multi-cloud deployment controls.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
