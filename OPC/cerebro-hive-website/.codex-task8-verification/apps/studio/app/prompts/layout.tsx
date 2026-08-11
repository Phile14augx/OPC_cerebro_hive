import type { Metadata } from "next";

// Internal prompt-management tool backed by live user data — not marketing content.
export const metadata: Metadata = {
  title: "Prompt Studio | CerebroHive",
  robots: { index: false, follow: false },
};

export default function PromptsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
