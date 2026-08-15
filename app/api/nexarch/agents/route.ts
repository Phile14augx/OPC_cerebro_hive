import { NextRequest, NextResponse } from "next/server";
import { getAgents, createAgent } from "@/lib/agent-os/store";
import type { AgentRiskLevel } from "@/lib/agent-os/types";

export const dynamic = "force-dynamic";

// GET /api/nexarch/agents
// Query params: ?type=&riskLevel=&isDeprecated=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type") ?? undefined;
    const riskLevel = (searchParams.get("riskLevel") ?? undefined) as AgentRiskLevel | undefined;
    const isDeprecatedParam = searchParams.get("isDeprecated");
    const isDeprecated =
      isDeprecatedParam === null ? undefined : isDeprecatedParam === "true";

    const agents = await getAgents({ type, riskLevel, isDeprecated });
    return NextResponse.json({ data: agents, count: agents.length });
  } catch (err) {
    console.error("[GET /api/nexarch/agents]", err);
    return NextResponse.json(
      { error: "Failed to retrieve agent definitions." },
      { status: 500 }
    );
  }
}

// POST /api/nexarch/agents
// Body: AgentDefinition (without id/createdAt/updatedAt/isDeprecated)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const required = ["name", "version", "type", "role", "description", "purpose", "owner", "riskLevel", "trustLevel", "modelPolicy", "defaultBudget"];
    const missing = required.filter((k) => body[k] === undefined);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const agent = await createAgent({
      name: body.name,
      version: body.version,
      type: body.type,
      role: body.role,
      description: body.description,
      purpose: body.purpose,
      owner: body.owner,
      riskLevel: body.riskLevel,
      trustLevel: body.trustLevel,
      capabilities: body.capabilities ?? [],
      toolPermissions: body.toolPermissions ?? [],
      modelPolicy: body.modelPolicy,
      defaultBudget: body.defaultBudget,
      tags: body.tags ?? [],
    });

    return NextResponse.json({ data: agent }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/nexarch/agents]", err);
    return NextResponse.json(
      { error: "Failed to create agent definition." },
      { status: 500 }
    );
  }
}
