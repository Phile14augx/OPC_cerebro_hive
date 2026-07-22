import { NextResponse } from "next/server";
import { resourceService } from "../../../../platform/hiveforge/core/services/ResourceService";
import { Resource } from "@prisma/client";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryId = url.searchParams.get("category");
  const workspaceId = "00000000-0000-0000-0000-000000000000"; // Mock workspace ID for now

  const dbResources = await resourceService.list(workspaceId);

  const mapped = dbResources.map((r: Resource) => ({
    id: r.id,
    kind: "vps", // in reality, derived from blueprint/provider
    category: categoryId || "cloud-compute",
    subgroup: "Provisioned Resources",
    itemId: r.blueprintId || "unknown",
    itemName: `Resource ${r.id.split('-')[0]}`,
    region: "us-east-1",
    status: r.status,
    sizeTier: "medium",
    options: [],
    specs: {},
    endpoint: "10.0.0.5",
    hourlyRateUsd: r.cost,
    createdAt: r.createdAt.toISOString()
  }));

  return NextResponse.json({ resources: mapped });
}
