import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compliance | Platform",
  description: "Regulatory compliance tracking and reporting — SOC 2, HIPAA, GDPR, and industry-specific controls.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
