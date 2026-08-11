import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Observatory | Platform",
  description: "Full-stack observability — traces, logs, and metrics — for every AI agent and model call.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
