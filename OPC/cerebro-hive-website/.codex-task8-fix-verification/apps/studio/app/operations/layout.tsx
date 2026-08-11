import type { Metadata } from "next";

// Placeholder scaffold route — no real content yet, excluded from indexing.
export const metadata: Metadata = {
  title: "Operations | CerebroHive",
  robots: { index: false, follow: false },
};

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
