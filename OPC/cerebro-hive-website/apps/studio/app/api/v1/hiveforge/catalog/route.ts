import { NextResponse } from "next/server";
import { catalogService } from "../../../../platform/hiveforge/core/services/CatalogService";
import { Plugin } from "../../../../platform/hiveforge/core/contracts/plugin";
import { AuthService } from "@/lib/services/auth.service";
import { prisma } from "@cerebro/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryId = url.searchParams.get("category");

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 });
  }
  const token = authHeader.substring(7);
  const user = await AuthService.verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
  }

  const workspaceId = req.headers.get('x-workspace-id');
  if (!workspaceId) {
    return NextResponse.json({ error: "Bad Request: Missing workspace selector" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { tenantId: true }
  });

  if (!workspace) {
    return NextResponse.json({ error: "Forbidden: Wrong workspace" }, { status: 403 });
  }

  const member = await prisma.tenantMember.findUnique({
    where: {
      tenantId_userId: {
        tenantId: workspace.tenantId,
        userId: user.userId
      }
    }
  });

  if (!member) {
    return NextResponse.json({ error: "Forbidden: Wrong workspace" }, { status: 403 });
  }

  // In a real implementation, we would map the Registry plugins to the expected CatalogCategory DTO.
  // We'll generate a basic DTO structure from the registered blueprints for now.
  const plugins = catalogService.getCatalog();
  
  const blueprints = plugins.filter((p: Plugin) => p.manifest.kind === "blueprint");

  const subgroups = [
    {
      name: "Available Blueprints",
      items: blueprints.map((bp: Plugin) => {
        let provider = "vps";
        if (bp.manifest.spec?.template && typeof bp.manifest.spec.template === "object") {
          const template = bp.manifest.spec.template as Record<string, unknown>;
          if (typeof template.provider === "string") {
            provider = template.provider;
          }
        }
        return {
          id: bp.manifest.metadata.id,
          name: bp.manifest.metadata.name,
          provisionable: true,
          hourlyRateUsd: 0.05, // mock rate
          kind: provider
        };
      })
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
