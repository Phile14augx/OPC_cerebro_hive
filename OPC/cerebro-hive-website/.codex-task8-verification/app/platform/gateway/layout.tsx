import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Gateway | Platform",
  description: "The unified gateway routing every model call — circuit breaking, rate limiting, caching, and cost tracking.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
