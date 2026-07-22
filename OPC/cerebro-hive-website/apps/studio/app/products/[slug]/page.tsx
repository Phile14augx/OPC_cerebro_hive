import { getProductBySlug, products } from "@/lib/data/products";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductRenderer } from "@/components/products/renderer/ProductRenderer";
import { JsonLd } from "@/components/discovery";
import { buildSoftwareApplicationSchema } from "@/lib/discovery";
import { buildProductMetadata } from "@/lib/discovery/metadata";

export async function generateStaticParams() {
  return products.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return buildProductMetadata({
    title: product.title,
    description: product.summary,
    slug: product.slug,
  });
}

export default async function ProductDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const schema = buildSoftwareApplicationSchema({
    name: product.title,
    description: product.summary,
    slug: product.slug,
    applicationCategory: product.category,
    operatingSystem: product.deploymentModels.join(", "),
  });

  return (
    <>
      <JsonLd schema={schema} />
      <ProductRenderer product={product} />
    </>
  );
}
