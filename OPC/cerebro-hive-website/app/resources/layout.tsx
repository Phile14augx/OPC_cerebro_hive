import React from "react";
import type { Metadata } from "next";
import { JsonLd } from "@/components/discovery";
import { buildCollectionPageSchema, buildBreadcrumbSchema } from "@/lib/discovery";

export const metadata: Metadata = {
  title: "Enterprise AI Resources — CerebroHive",
  description: "AI resources from CerebroHive — original research whitepapers, engineering guides, architecture templates, and a curated AI tools directory for enterprise teams.",
  keywords: ["enterprise AI resources", "AI whitepapers", "AI architecture templates", "enterprise AI guides", "AI tools directory", "AI engineering blog"],
  alternates: { canonical: "https://cerebropchive.org/resources" },
};

const collectionSchema = buildCollectionPageSchema({
  name: "Enterprise AI Resources — CerebroHive",
  description: "Whitepapers, engineering guides, architecture templates, and a curated AI tools directory for enterprise AI teams.",
  url: "https://cerebropchive.org/resources",
  items: [
    { name: "Whitepapers — Original Research & Frameworks", url: "https://cerebropchive.org/resources/whitepapers" },
    { name: "Engineering Blog — Technical Deep-Dives", url: "https://cerebropchive.org/resources/blog" },
    { name: "Templates — Ready-to-Use Architecture Templates", url: "https://cerebropchive.org/resources/templates" },
    { name: "AI Tools Directory — Curated Tool Landscape", url: "https://cerebropchive.org/resources/ai-tools-directory" },
  ],
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", url: "https://cerebropchive.org" },
  { name: "Resources", url: "https://cerebropchive.org/resources" },
]);

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd schema={collectionSchema} />
      <JsonLd schema={breadcrumbSchema} />
      {children}
    </>
  );
}
