import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compute | Platform",
  description: "Provision and monitor the compute infrastructure powering CerebroHive agents, models, and workflows.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
