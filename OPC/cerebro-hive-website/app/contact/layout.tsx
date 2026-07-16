import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contact CerebroHive — Book a Strategy Session",
  description: "Reach out to discuss your AI transformation. Book a strategy session with our enterprise team or contact us directly for sales, partnerships, and support.",
};
export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
