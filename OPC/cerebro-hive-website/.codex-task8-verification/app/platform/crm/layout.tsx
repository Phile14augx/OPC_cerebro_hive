import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM | Platform",
  description: "Customer relationship management data and workflows integrated with CerebroHive's AI agents.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
