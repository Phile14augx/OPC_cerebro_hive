import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blog — CerebroHive",
  description: "Technical articles, AI strategy posts, and enterprise engineering perspectives from the CerebroHive team.",
};
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
