import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Platform & Products — CerebroHive",
  description: "CerebroHive's enterprise AI platform: 6 software products (Quantiva ERP, AgentOS, Automation Studio, and more) and 10 proprietary AI frameworks for building production-grade intelligent systems.",
};
export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
