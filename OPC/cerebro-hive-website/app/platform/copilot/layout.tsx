import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copilot | Platform",
  description: "An AI copilot embedded across CerebroHive workflows to assist and accelerate day-to-day work.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
