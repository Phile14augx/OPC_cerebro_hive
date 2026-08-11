import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with CerebroHive to discuss an enterprise AI engagement or platform demo.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
