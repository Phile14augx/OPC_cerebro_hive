import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "License | Platform",
  description: "License management and entitlement tracking across users and workspaces.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
