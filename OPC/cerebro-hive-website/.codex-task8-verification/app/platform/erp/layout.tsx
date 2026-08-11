import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ERP | Platform",
  description: "Enterprise resource planning integrations connecting AI agents to core business systems.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
