import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API | Platform",
  description: "Developer API access, keys, and documentation for building on top of CerebroHive.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
