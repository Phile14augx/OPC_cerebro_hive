import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HR | Platform",
  description: "Human resources workflows and talent data integrated with CerebroHive's AI and automation layer.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
