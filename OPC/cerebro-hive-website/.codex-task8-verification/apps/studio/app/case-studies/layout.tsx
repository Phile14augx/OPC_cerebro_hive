import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Client Case Studies — CerebroHive AI Results",
  description: "Real-world outcomes from CerebroHive AI deployments — sales pipeline automation, logistics support, enterprise AI training, and more.",
};
export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
