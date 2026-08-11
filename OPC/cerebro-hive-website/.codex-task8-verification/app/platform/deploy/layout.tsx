import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deploy | Platform",
  description: "CI/CD and release management for shipping agents, models, and workflows to production safely.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
