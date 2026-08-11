import type { Metadata } from "next";

// Internal component showcase, not customer-facing content.
export const metadata: Metadata = {
  title: "Design System Playground | CerebroHive",
  robots: { index: false, follow: false },
};

export default function DesignSystemPlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
