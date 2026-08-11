import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgentOS Live Runtime | CerebroHive",
  description:
    "Run the real Cerebro AgentOS kernel — Guard, Reasoning Engine, Planner, Scheduler, Memory Fabric and Eval executing live in your browser, or connect to the full Python AgentOS backend.",
};

export default function LiveRuntimeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
