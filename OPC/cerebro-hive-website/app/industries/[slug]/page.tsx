import { getIndustryBySlug, industriesData } from "@/lib/data/industries";
import { notFound } from "next/navigation";
import { IndustryRenderer } from "@/components/industries/engine/IndustryRenderer";

export async function generateStaticParams() {
  return industriesData.map((ind) => ({
    slug: ind.slug,
  }));
}

export default function IndustryPage({ params }: { params: { slug: string } }) {
  const industry = getIndustryBySlug(params.slug);

  if (!industry) {
    notFound();
  }

  return <IndustryRenderer industry={industry} />;
}
