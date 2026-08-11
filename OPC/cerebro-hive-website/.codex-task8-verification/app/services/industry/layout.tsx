import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industry Solutions",
  description: "Industry-specific AI programs tailored to the compliance and operational needs of 16+ verticals.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
