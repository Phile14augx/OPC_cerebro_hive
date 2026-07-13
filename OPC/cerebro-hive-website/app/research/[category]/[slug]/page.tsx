import { getResearchBySlug, allResearchData } from "@/lib/content/research";
import { notFound } from "next/navigation";
import { ResearchReader } from "@/components/research/ResearchReader";

// Generate static params for all publications across all categories
export async function generateStaticParams() {
  return allResearchData.map((pub) => ({
    category: pub.category,
    slug: pub.slug,
  }));
}

export default function ResearchDetailRoute({ 
  params 
}: { 
  params: { category: string; slug: string } 
}) {
  const publication = getResearchBySlug(params.slug);

  // If not found or if the category in URL doesn't match the actual category
  if (!publication || publication.category !== params.category) {
    notFound();
  }

  return <ResearchReader publication={publication} />;
}
