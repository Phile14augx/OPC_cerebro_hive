import type { Metadata } from "next";
import { JsonLd } from "@/components/discovery";
import {
  buildSoftwareApplicationSchema,
  buildWebApplicationSchema,
  buildFaqSchema,
  buildBreadcrumbSchema,
} from "@/lib/discovery";
import { buildProductMetadata } from "@/lib/discovery/metadata";
import { cerebroXProduct } from "@/lib/data/products/cerebro-x";
import { ProductRenderer } from "@/components/products/renderer/ProductRenderer";

export const metadata: Metadata = buildProductMetadata({
  title: cerebroXProduct.seo!.title!,
  description: cerebroXProduct.seo!.description!,
  slug: cerebroXProduct.slug,
  keywords: cerebroXProduct.seo!.keywords,
});

export default function CerebroXPage() {
  const softwareSchema = buildSoftwareApplicationSchema({
    name: "Cerebro X",
    description: cerebroXProduct.summary,
    slug: cerebroXProduct.slug,
    applicationCategory: "BusinessApplication",
    operatingSystem: cerebroXProduct.deploymentModels.join(", "),
    features: cerebroXProduct.coreCapabilities.map((c) => c.title),
  });

  const webAppSchema = buildWebApplicationSchema({
    name: "Cerebro X — Enterprise AI Intelligence Platform",
    description: cerebroXProduct.summary,
    url: "https://cerebropchive.org/products/cerebro-x",
    features: cerebroXProduct.coreCapabilities.map((c) => c.title),
  });

  const faqSchema = buildFaqSchema(
    cerebroXProduct.faqs!.map((f) => ({ q: f.question, a: f.answer }))
  );

  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Cerebro X", href: "/products/cerebro-x" },
  ]);

  return (
    <>
      <JsonLd schema={softwareSchema} />
      <JsonLd schema={webAppSchema} />
      <JsonLd schema={faqSchema} />
      <JsonLd schema={breadcrumbSchema} />
      <ProductRenderer product={cerebroXProduct} />
    </>
  );
}
