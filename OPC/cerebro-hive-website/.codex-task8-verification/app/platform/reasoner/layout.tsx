import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reasoner | Platform",
  description: "Advanced reasoning and chain-of-thought orchestration for complex agent decision-making.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
