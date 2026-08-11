import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description: "CerebroHive's enterprise AI services — strategy, engineering, operations, and security — scoped for enterprise engagements.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
