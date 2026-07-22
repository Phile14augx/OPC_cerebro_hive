import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/discovery/metadata";
import { JsonLd } from "@/components/discovery";
import { buildCollectionPageSchema, buildBreadcrumbSchema, buildSoftwareApplicationSchema } from "@/lib/discovery";
import { ProductsEcosystemPage } from "@/components/products/v2/ProductsEcosystemPage";
import { featuredProducts } from "@/lib/data/products";

export const metadata: Metadata = buildPageMetadata({
  title: "Enterprise AI Operating System — CerebroHive Products",
  description: "CerebroHive is a modular Enterprise AI Operating System. Eight intelligent modules — CerebroSphere™, CerebroArchive™, CerebroStudio™, CerebroFlow™, CerebroInsight™, CerebroCopilot™, HiveOps™, and HiveShield™ — unified on a shared platform foundation.",
  path: "/products",
  keywords: [
    "enterprise AI platform",
    "AI operating system",
    "enterprise AI modules",
    "unified AI platform",
    "AI workflow automation",
    "enterprise knowledge management",
    "AI analytics platform",
    "enterprise AI assistant",
    "AI development platform",
    "enterprise MLOps",
  ],
  ogImage: "https://cerebropchive.org/opengraph-image/products",
});

const collectionSchema = buildCollectionPageSchema({
  name: "CerebroHive — Enterprise AI Operating System",
  description: "Eight intelligent modules unified on a shared enterprise platform: CerebroSphere™, CerebroArchive™, CerebroStudio™, CerebroFlow™, CerebroInsight™, CerebroCopilot™, HiveOps™, and HiveShield™.",
  url: "https://cerebropchive.org/products",
  items: featuredProducts.map(p => ({
    name: p.title,
    url: `https://cerebropchive.org/products/${p.slug}`,
  })),
});

const platformSchema = buildSoftwareApplicationSchema({
  name: "CerebroHive Enterprise AI Operating System",
  description: "A modular Enterprise AI Operating System comprising 8 intelligent modules unified on a shared platform foundation with common Identity, AI Gateway, Event Bus, Vector Search, and Audit services.",
  slug: "products",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Cloud, On-Premises, Air-Gapped",
  features: featuredProducts.map(p => p.title),
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
]);

export default function ProductsPage() {
  return (
    <>
      <JsonLd schema={collectionSchema} />
      <JsonLd schema={platformSchema} />
      <JsonLd schema={breadcrumbSchema} />
      <ProductsEcosystemPage />
    </>
  );
}
