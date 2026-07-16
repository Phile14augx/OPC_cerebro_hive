import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Learn AI — CerebroHive",
  description: "Free AI learning resources, guides, and getting-started content from CerebroHive — for individuals and enterprise teams at every level.",
};
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
