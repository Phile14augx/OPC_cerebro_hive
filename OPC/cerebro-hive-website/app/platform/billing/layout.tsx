import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing | Platform",
  description: "Usage-based billing, invoicing, and cost management for your CerebroHive platform.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
