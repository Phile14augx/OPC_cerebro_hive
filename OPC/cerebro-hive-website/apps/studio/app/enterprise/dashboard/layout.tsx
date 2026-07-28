import type { Metadata } from "next";

// Demo/authenticated enterprise dashboard — not public marketing content.
export const metadata: Metadata = {
  title: "Enterprise Dashboard | CerebroHive",
  robots: { index: false, follow: false },
};

export default function EnterpriseDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
