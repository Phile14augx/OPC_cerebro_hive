import { getProductBySlug, allProductsData } from "@/lib/data/products";
import { Metadata } from 'next';
import { notFound } from "next/navigation";
import { ProductPageLayout } from "@/components/products/ProductPageLayout";

export async function generateStaticParams() {
  return allProductsData.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };
  
  return {
    title: `${product.name} | CerebroHive`,
    description: product.description,
  };
}

export default async function ProductDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductPageLayout product={product} />;
}
