import type { Metadata } from "next";
import { JsonLd } from "@/components/discovery";
import { buildPersonSchema, buildOrganizationSchema } from "@/lib/discovery";

export const metadata: Metadata = {
  title: "About CerebroHive | Enterprise AI Company",
  description:
    "CerebroHive is an enterprise AI company founded in 2023. Learn our founding story, mission, values, and the team building the future of AI-native enterprises.",
  keywords: [
    "CerebroHive company", "enterprise AI company", "AI consulting firm India",
    "Philemon V Nath", "AI transformation company", "AI strategy firm",
  ],
  alternates: { canonical: "https://cerebropchive.org/about" },
  openGraph: {
    title: "About CerebroHive | Enterprise AI Company",
    description:
      "Founded in 2023, CerebroHive architects enterprise AI systems for organizations worldwide. Meet our team and learn our story.",
    url: "https://cerebropchive.org/about",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "About CerebroHive" }],
  },
};

const founderSchema = buildPersonSchema({
  name: "Philemon V Nath",
  jobTitle: "Founder & CEO",
  description:
    "Philemon V Nath is the Founder and CEO of CerebroHive, leading enterprise AI transformation engagements across 16+ industries.",
  url: "https://cerebropchive.org/about",
  sameAs: ["https://linkedin.com/in/philemon-v-nath"],
  knowsAbout: [
    "Enterprise AI", "AI Strategy", "AI Agents", "Retrieval-Augmented Generation",
    "AI Governance", "Knowledge Engineering", "MLOps", "AI Platform Engineering",
  ],
});

const orgSchema = {
  ...buildOrganizationSchema(),
  foundingDate: "2023",
  numberOfEmployees: { "@type": "QuantitativeValue", minValue: 1 },
  knowsAbout: [
    "Enterprise AI", "AI Agents", "RAG", "LLMs", "MLOps",
    "AI Governance", "Knowledge Engineering", "AI Platform Engineering",
  ],
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={founderSchema} />
      <JsonLd schema={orgSchema} />
      {children}
    </>
  );
}
