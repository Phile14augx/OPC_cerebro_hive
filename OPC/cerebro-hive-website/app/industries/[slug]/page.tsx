import type { Metadata } from "next";
import { getIndustryBySlug, industriesData } from "@/lib/data/industries";
import { notFound } from "next/navigation";
import { IndustryRenderer } from "@/components/industries/engine/IndustryRenderer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) return {};
  return {
    title: `AI for ${industry.name} — CerebroHive`,
    description: `Explore AI use cases, reference architectures, compliance frameworks, and transformation roadmaps for the ${industry.name} industry — powered by CerebroHive.`,
  };
}

export function generateStaticParams() {
  return industriesData.map((industry) => ({
    slug: industry.slug,
  }));
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);

  if (!industry) {
    notFound();
  }

  return <IndustryRenderer industry={industry} />;
}
