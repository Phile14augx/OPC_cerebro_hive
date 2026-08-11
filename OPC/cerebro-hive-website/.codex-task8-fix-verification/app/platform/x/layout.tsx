import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CerebroX | Platform",
  description: "Experimental and early-access capabilities from the CerebroHive research team.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
