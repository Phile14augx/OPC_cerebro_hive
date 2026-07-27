import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HivePulse | Platform",
  description: "Real-time monitoring and health signals across every system connected to CerebroHive.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
