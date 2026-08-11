import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer 360 | Platform",
  description: "A unified customer profile combining engagement, support, and transaction data for AI-driven personalization.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
