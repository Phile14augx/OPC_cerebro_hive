import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automation | Platform",
  description: "Trigger-based automation connecting business events to AI agent actions.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
