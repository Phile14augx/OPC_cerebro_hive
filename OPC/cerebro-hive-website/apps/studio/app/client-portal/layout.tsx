import type { Metadata } from "next";

// Demo/authenticated client dashboard — not public marketing content.
// Excluded from search indexing rather than given descriptive metadata.
export const metadata: Metadata = {
  title: "Client Portal | CerebroHive",
  robots: { index: false, follow: false },
};

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
