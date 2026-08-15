import { NextRequest, NextResponse } from "next/server";
import { getTasks, createTask, recordAudit } from "@/lib/agent-os/store";

export const dynamic = "force-dynamic";

// GET /api/nexarch/tasks?missionId=&status=
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const missionId = searchParams.get("missionId") ?? undefined;
  const tasks = await getTasks(missionId);
  const status = searchParams.get("status");
  const filtered = status ? tasks.filter(t => t.status === status) : tasks;
  return NextResponse.json({ data: filtered, count: filtered.length });
}

// POST /api/nexarch/tasks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ["missionId", "name", "objective", "capability"];
    const missing = required.filter(k => !body[k]);
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
    }
    const task = await createTask({
      missionId:       body.missionId,
      name:            body.name,
      description:     body.description ?? "",
      objective:       body.objective,
      capability:      body.capability,
      priority:        body.priority ?? "normal",
      assignedAgentId: body.assignedAgentId,
      dependsOn:       body.dependsOn ?? [],
      input:           body.input ?? {},
      metadata:        body.metadata ?? {},
      tags:            body.tags ?? [],
      maxRetries:      body.maxRetries ?? 3,
    });
    await recordAudit({
      entityType: "task",
      entityId:   task.id,
      action:     "created",
      actorId:    "api",
      actorType:  "system",
      details:    { missionId: body.missionId, name: body.name },
    });
    return NextResponse.json({ data: task }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
