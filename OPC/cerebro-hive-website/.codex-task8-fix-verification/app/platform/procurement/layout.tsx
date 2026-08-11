import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Procurement | Platform",
  description: "Vendor management, sourcing, and procurement workflows enhanced with AI.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
