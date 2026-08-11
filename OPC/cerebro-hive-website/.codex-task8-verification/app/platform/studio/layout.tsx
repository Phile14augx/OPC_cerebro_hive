import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CerebroStudio | Platform",
  description: "The engineering environment for building, testing, and operating enterprise AI agents.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
