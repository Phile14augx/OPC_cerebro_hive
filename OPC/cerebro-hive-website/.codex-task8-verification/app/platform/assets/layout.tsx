import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assets | Platform",
  description: "Asset inventory and lifecycle tracking across your organization's digital and physical resources.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
