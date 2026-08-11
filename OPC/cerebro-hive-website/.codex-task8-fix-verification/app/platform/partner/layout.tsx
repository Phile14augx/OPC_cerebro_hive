import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner | Platform",
  description: "Partner program tools, resources, and integration management.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
