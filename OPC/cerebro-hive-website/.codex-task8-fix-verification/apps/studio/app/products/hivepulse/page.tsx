import type { Metadata } from "next";
import { JsonLd } from "@/components/discovery";
import {
  buildSoftwareApplicationSchema,
  buildWebApplicationSchema,
  buildFaqSchema,
  buildBreadcrumbSchema,
} from "@/lib/discovery";
import { buildProductMetadata } from "@/lib/discovery/metadata";
import { hivepulseProduct } from "@/lib/data/products/hivepulse";
import { ProductRenderer } from "@/components/products/renderer/ProductRenderer";

export const metadata: Metadata = buildProductMetadata({
  title: hivepulseProduct.seo!.title!,
  description: hivepulseProduct.seo!.description!,
  slug: hivepulseProduct.slug,
  keywords: hivepulseProduct.seo!.keywords,
});

export default function HivePulsePage() {
  const softwareSchema = buildSoftwareApplicationSchema({
    name: "HivePulse",
    description: hivepulseProduct.summary,
    slug: hivepulseProduct.slug,
    applicationCategory: "BusinessApplication",
    operatingSystem: hivepulseProduct.deploymentModels.join(", "),
    features: hivepulseProduct.coreCapabilities.map((c) => c.title),
  });

  const webAppSchema = buildWebApplicationSchema({
    name: "HivePulse — Enterprise AI Operating System",
    description: hivepulseProduct.summary,
    url: "https://cerebropchive.org/products/hivepulse",
    features: hivepulseProduct.coreCapabilities.map((c) => c.title),
  });

  const faqSchema = buildFaqSchema(
    hivepulseProduct.faqs!.map((f) => ({ q: f.question, a: f.answer }))
  );

  const breadcrumbSchema = buildBreadcrumbSchema([
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "HivePulse", href: "/products/hivepulse" },
  ]);

  return (
    <>
      <JsonLd schema={softwareSchema} />
      <JsonLd schema={webAppSchema} />
      <JsonLd schema={faqSchema} />
      <JsonLd schema={breadcrumbSchema} />
      <ProductRenderer product={hivepulseProduct} />
    </>
  );
}
