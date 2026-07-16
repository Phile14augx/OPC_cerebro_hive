import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Resources — CerebroHive",
  description: "AI resources from CerebroHive — whitepapers, templates, blog posts, and an AI tools directory to help you research, plan, and execute your AI strategy.",
};
export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
