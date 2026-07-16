import { getSolutionBySlug, solutionsData } from "@/lib/data/solutions";
import { Metadata } from 'next';
import { notFound } from "next/navigation";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";

export async function generateStaticParams() {
  return solutionsData.map((sol) => ({
    slug: sol.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);
  if (!solution) return { title: 'Solution Not Found' };
  
  return {
    title: `${solution.title} | CerebroHive`,
    description: solution.description,
  };
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  return <SolutionPageLayout solution={solution} />;
}
