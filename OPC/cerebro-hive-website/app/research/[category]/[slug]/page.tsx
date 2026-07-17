import { getResearchBySlug, allResearchData } from "@/lib/content/research";
import { Metadata } from 'next';
import { notFound } from "next/navigation";
import { ResearchReader } from "@/components/research/ResearchReader";

// Generate static params for all publications across all categories
export async function generateStaticParams() {
  return allResearchData.map((pub) => ({
    category: pub.category,
    slug: pub.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string, slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pub = getResearchBySlug(slug);
  if (!pub) return { title: 'Research Not Found' };
  
  return {
    title: `${pub.title} | CerebroHive Research`,
    description: pub.abstract,
  };
}

export default async function ResearchDetail({ 
  params 
}: { 
  params: Promise<{ category: string; slug: string }> 
}) {
  const { category, slug } = await params;
  const publication = getResearchBySlug(slug);
  
  // 404 if not found or category mismatch
  if (!publication || publication.category !== category) {
    notFound();
  }

  return <ResearchReader publication={publication} />;
}
