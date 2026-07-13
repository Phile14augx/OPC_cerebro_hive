import { getIndustryBySlug, industriesData } from "@/lib/data/industries";
import { notFound } from "next/navigation";
import { IndustryRenderer } from "@/components/industries/engine/IndustryRenderer";


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
