import { NextRequest, NextResponse } from "next/server";
import { getMission, updateMission, addMissionEvent, recordAudit } from "@/lib/agent-os/store";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const mission = await getMission(params.id);
  if (!mission) return NextResponse.json({ error: "Mission not found" }, { status: 404 });
  return NextResponse.json({ data: mission });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const body = await req.json();
    const mission = await updateMission(params.id, body);
    if (!mission) return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    await addMissionEvent(params.id, {
      type: "status_changed",
      actorId: "api",
      actorType: "system",
      description: `Mission updated: ${Object.keys(body).join(", ")}`,
      data: body,
    });
    return NextResponse.json({ data: mission });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST to /missions/:id with action in body for status transitions
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const { action, reason } = await req.json();
    const statusMap: Record<string, string> = {
      start:    "running",
      pause:    "paused",
      resume:   "running",
      complete: "completed",
      fail:     "failed",
      cancel:   "cancelled",
    };
    const newStatus = statusMap[action];
    if (!newStatus) {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
    const mission = await updateMission(params.id, { status: newStatus as any });
    if (!mission) return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    await addMissionEvent(params.id, {
      type: "status_changed",
      actorId: "api",
      actorType: "system",
      description: reason ?? `Mission ${action}`,
      data: { action, newStatus },
    });
    await recordAudit({
      entityType: "mission",
      entityId:   params.id,
      action:     `mission.${action}`,
      actorId:    "api",
      actorType:  "system",
      details:    { newStatus, reason },
    });
    return NextResponse.json({ data: mission });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
