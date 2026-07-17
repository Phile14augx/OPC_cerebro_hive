import { getProductBySlug, products } from "@/lib/data/products";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductRenderer } from "@/components/products/renderer/ProductRenderer";

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

  return {
    title: `${product.title} | CerebroHive`,
    description: product.summary,
    openGraph: {
      title: `${product.title} | CerebroHive`,
      description: product.summary,
      type: "website",
    },
  };
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

  // SoftwareApplication JSON-LD structured data for rich search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.title,
    description: product.summary,
    url: `https://cerebrohive.com/products/${product.slug}`,
    applicationCategory: product.category,
    operatingSystem: product.deploymentModels.join(", "),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
    },
    provider: {
      "@type": "Organization",
      name: "CerebroHive OPC Pvt. Ltd.",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductRenderer product={product} />
    </>
  );
}
