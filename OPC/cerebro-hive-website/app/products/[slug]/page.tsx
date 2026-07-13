import { getProductBySlug, allProductsData } from "@/lib/data/products";
import { notFound } from "next/navigation";
import { ProductPageLayout } from "@/components/products/ProductPageLayout";

export async function generateStaticParams() {
  return allProductsData.map((p) => ({
    slug: p.slug,
  }));
}

export default function ProductDetailRoute({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return <ProductPageLayout product={product} />;
}
