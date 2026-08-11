import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shield | Platform",
  description: "Security controls — threat detection, access policies, and zero-trust enforcement for AI systems.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
