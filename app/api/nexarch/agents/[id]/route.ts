import { NextRequest, NextResponse } from "next/server";
import { getAgent, updateAgent, recordAudit } from "@/lib/agent-os/store";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

// GET /api/nexarch/agents/:id
export async function GET(_req: NextRequest, { params }: Ctx) {
  const agent = await getAgent(params.id);
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  return NextResponse.json({ data: agent });
}

// PATCH /api/nexarch/agents/:id
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const body = await req.json();
    const agent = await updateAgent(params.id, body);
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    await recordAudit({
      entityType: "agent",
      entityId: params.id,
      action: "updated",
      actorId: "api",
      actorType: "system",
      details: { fields: Object.keys(body) },
    });
    return NextResponse.json({ data: agent });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/nexarch/agents/:id  (soft-delete: marks deprecated)
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const agent = await updateAgent(params.id, { isDeprecated: true });
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    await recordAudit({
      entityType: "agent",
      entityId: params.id,
      action: "deprecated",
      actorId: "api",
      actorType: "system",
      details: {},
    });
    return NextResponse.json({ data: { deprecated: true } });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
