import { getResearchBySlug, allResearchData } from "@/lib/content/research";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResearchReader } from "@/components/research/ResearchReader";

// Generate static params for all publications
// Route: /research/[slug]/[articleSlug]
// e.g. /research/papers/design-patterns-multi-agent
export async function generateStaticParams() {
  return allResearchData.map((pub) => ({
    slug: pub.category,        // parent category (papers, whitepapers, etc.)
    articleSlug: pub.slug,     // article slug
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; articleSlug: string }>;
}): Promise<Metadata> {
  const { articleSlug } = await params;
  const pub = getResearchBySlug(articleSlug);
  if (!pub) return { title: "Research Not Found" };

  return {
    title: `${pub.title} | CerebroHive Research`,
    description: pub.abstract,
  };
}

export default async function ResearchDetail({
  params,
}: {
  params: Promise<{ slug: string; articleSlug: string }>;
}) {
  const { slug, articleSlug } = await params;
  const publication = getResearchBySlug(articleSlug);

  // 404 if not found or category mismatch
  if (!publication || publication.category !== slug) {
    notFound();
  }

  return <ResearchReader publication={publication} />;
}
