import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "About CerebroHive",
  description: "Learn how CerebroHive was built — our founding story, values, leadership, and the engineering culture behind enterprise AI transformation.",
};
export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
