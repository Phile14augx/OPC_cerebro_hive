import { getIndustryBySlug, industriesData } from "@/lib/data/industries";
import { notFound } from "next/navigation";
import IndustryPageLayout from "@/components/industries/IndustryPageLayout";

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

  return <IndustryPageLayout industry={industry} />;
}
