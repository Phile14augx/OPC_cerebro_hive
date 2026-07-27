import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Network | Platform",
  description: "Networking, routing, and traffic controls for secure, low-latency AI service communication.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
