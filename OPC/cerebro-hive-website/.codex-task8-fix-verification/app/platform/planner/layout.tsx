import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planner | Platform",
  description: "Task and dependency planning for multi-step agent execution — critical path and cost estimation.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
