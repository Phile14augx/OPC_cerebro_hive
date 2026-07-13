import { getSolutionBySlug, solutionsData } from "@/lib/data/solutions";
import { notFound } from "next/navigation";
import SolutionPageLayout from "@/components/solutions/SolutionPageLayout";

export async function generateStaticParams() {
  return solutionsData.map((sol) => ({
    slug: sol.slug,
  }));
}

export default function SolutionPage({ params }: { params: { slug: string } }) {
  const solution = getSolutionBySlug(params.slug);

  if (!solution) {
    notFound();
  }

  return <SolutionPageLayout solution={solution} />;
}
