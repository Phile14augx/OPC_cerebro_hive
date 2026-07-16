import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Community Hub — CerebroHive",
  description: "Join the CerebroHive community of AI practitioners, researchers, and enterprise leaders. Discussions, events, open-source projects, and peer learning.",
};
export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
