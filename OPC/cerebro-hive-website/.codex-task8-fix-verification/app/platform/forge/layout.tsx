import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HiveForge | Platform",
  description: "Build and compose custom AI agents visually — no-code and pro-code agent construction.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
