import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Models | Platform",
  description: "Browse, install, and manage the AI models and skills your agents can invoke.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
