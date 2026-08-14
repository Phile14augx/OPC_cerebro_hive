import { NextRequest, NextResponse } from "next/server";
import { getTask, updateTask, recordAudit } from "@/lib/agent-os/store";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const task = await getTask(params.id);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json({ data: task });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const body = await req.json();
    const task = await updateTask(params.id, body);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    await recordAudit({
      entityType: "task",
      entityId:   params.id,
      action:     "updated",
      actorId:    "api",
      actorType:  "system",
      details:    body,
    });
    return NextResponse.json({ data: task });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
