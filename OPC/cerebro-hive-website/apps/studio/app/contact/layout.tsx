import type { Metadata } from "next";
import { JsonLd } from "@/components/discovery";
import { SITE_URL, SITE_NAME } from "@/lib/discovery";

export const metadata: Metadata = {
  title: "Contact CerebroHive — Book an Enterprise AI Strategy Session",
  description:
    "Reach out to discuss your AI transformation. Book a strategy session with CerebroHive's enterprise AI team, or contact us for sales, partnerships, and support.",
  keywords: [
    "contact CerebroHive", "book AI strategy session", "enterprise AI consultation",
    "AI consulting inquiry", "CerebroHive contact",
  ],
  alternates: { canonical: "https://cerebropchive.org/contact" },
  openGraph: {
    title: "Contact CerebroHive — Book an Enterprise AI Strategy Session",
    description:
      "Start your enterprise AI transformation. Book a strategy session with our team.",
    url: "https://cerebropchive.org/contact",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Contact CerebroHive" }],
  },
};

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE_NAME,
  url: SITE_URL,
  email: "hello@cerebropchive.org",
  areaServed: "Worldwide",
  serviceType: "Enterprise AI Consulting",
  availableLanguage: ["English"],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "sales@cerebropchive.org",
      availableLanguage: "English",
      areaServed: "Worldwide",
    },
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@cerebropchive.org",
      availableLanguage: "English",
    },
    {
      "@type": "ContactPoint",
      contactType: "partnerships",
      email: "partners@cerebropchive.org",
      availableLanguage: "English",
    },
  ],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={contactSchema} />
      {children}
    </>
  );
}
