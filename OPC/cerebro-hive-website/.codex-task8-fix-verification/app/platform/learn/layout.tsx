import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn | Platform",
  description: "In-product learning resources and guided onboarding for CerebroHive platform capabilities.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
