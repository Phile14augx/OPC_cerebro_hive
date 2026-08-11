import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Console | Platform",
  description: "The administrative console for managing users, workspaces, and platform-wide configuration.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
