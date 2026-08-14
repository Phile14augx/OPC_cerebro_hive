import { NextRequest, NextResponse } from "next/server";
import { getMission, addMissionEvent } from "@/lib/agent-os/store";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

// GET /api/nexarch/missions/:id/events
export async function GET(_req: NextRequest, { params }: Ctx) {
  const mission = await getMission(params.id);
  if (!mission) return NextResponse.json({ error: "Mission not found" }, { status: 404 });
  const events = [...(mission.events ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  return NextResponse.json({ data: events, count: events.length });
}

// POST /api/nexarch/missions/:id/events  (add a manual event / comment)
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const { type, description, actorId, data } = await req.json();
    const updated = await addMissionEvent(params.id, {
      type:        type ?? "comment",
      actorId:     actorId ?? "api",
      actorType:   "system",
      description: description ?? "",
      data:        data ?? {},
    });
    if (!updated) return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    const events = updated.events ?? [];
    return NextResponse.json({ data: events[events.length - 1] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
