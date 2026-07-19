import type { Metadata } from "next";
import { getIndustryBySlug, industriesData } from "@/lib/data/industries";
import { notFound } from "next/navigation";
import { IndustryRenderer } from "@/components/industries/engine/IndustryRenderer";
import { JsonLd } from "@/components/discovery";
import { buildServiceSchema, buildFaqSchema, buildBreadcrumbSchema } from "@/lib/discovery";
import { buildIndustryMetadata } from "@/lib/discovery/metadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
  if (!industry) return {};

  if (industry.seo) {
    return buildIndustryMetadata({
      title: industry.seo.title,
      description: industry.seo.description,
      slug: industry.slug,
      keywords: industry.seo.keywords,
    });
  }

  return buildIndustryMetadata({
    title: `AI for ${industry.name} — Enterprise AI Solutions | CerebroHive`,
    description: `Explore AI use cases, reference architectures, compliance frameworks, and transformation roadmaps for the ${industry.name} industry — powered by CerebroHive.`,
    slug: industry.slug,
  });
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

  const schemas = [
    buildServiceSchema({
      name: `AI Solutions for ${industry.name}`,
      description: industry.overview.opportunitySummary,
      serviceType: `${industry.name} AI Consulting`,
      slug: `industries/${industry.slug}`,
    }),
    buildBreadcrumbSchema([
      { label: 'Home', href: '/' },
      { label: 'Industries', href: '/industries' },
      { label: industry.name, href: `/industries/${industry.slug}` },
    ]),
    ...(industry.faqs && industry.faqs.length > 0
      ? [buildFaqSchema(industry.faqs.map(f => ({ q: f.question, a: f.answer })))]
      : []),
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <JsonLd key={i} schema={schema} />
      ))}
      <IndustryRenderer industry={industry} />
    </>
  );
}
