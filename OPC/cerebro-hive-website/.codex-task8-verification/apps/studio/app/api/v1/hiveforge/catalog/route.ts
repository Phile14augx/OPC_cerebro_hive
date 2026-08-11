import { NextResponse } from "next/server";
import { catalogService } from "../../../../platform/hiveforge/core/services/CatalogService";
import { Plugin } from "../../../../platform/hiveforge/core/contracts/plugin";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryId = url.searchParams.get("category");

  // In a real implementation, we would map the Registry plugins to the expected CatalogCategory DTO.
  // We'll generate a basic DTO structure from the registered blueprints for now.
  const plugins = catalogService.getCatalog();
  
  const blueprints = plugins.filter((p: Plugin) => p.manifest.kind === "blueprint");

  const subgroups = [
    {
      name: "Available Blueprints",
      items: blueprints.map((bp: Plugin) => ({
        id: bp.manifest.metadata.id,
        name: bp.manifest.metadata.name,
        provisionable: true,
        hourlyRateUsd: 0.05, // mock rate
        kind: (bp.manifest.spec?.template as any)?.provider || "vps"
      }))
    }
  ];

  const categories = [
    {
      id: "cloud-compute",
      name: "Cloud Compute (Registry Driven)",
      tagline: "Dynamically generated from the Platform Registry.",
      subgroups
    }
  ];

  const matched = categoryId ? categories.filter(c => c.id === categoryId) : categories;

  return NextResponse.json({ categories: matched });
}
