import { NextRequest, NextResponse } from "next/server";
import { getMissions, createMission, recordAudit } from "@/lib/agent-os/store";
import type { MissionStatus } from "@/lib/agent-os/types";

export const dynamic = "force-dynamic";

// GET /api/nexarch/missions?status=&agentId=
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") as MissionStatus | null;
  const missions = await getMissions({ status: status ?? undefined });
  return NextResponse.json({ data: missions, count: missions.length });
}

// POST /api/nexarch/missions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ["title", "objective", "submittedBy"];
    const missing = required.filter(k => !body[k]);
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
    }

    const mission = await createMission({
      title:             body.title,
      objective:         body.objective,
      description:       body.description ?? "",
      submittedBy:       body.submittedBy,
      assignedAgentIds:  body.assignedAgentIds ?? [],
      constraints:       body.constraints ?? {},
      tags:              body.tags ?? [],
      metadata:          body.metadata ?? {},
    });

    await recordAudit({
      entityType: "mission",
      entityId:   mission.id,
      action:     "created",
      actorId:    body.submittedBy,
      actorType:  "user",
      details:    { title: mission.title },
    });

    return NextResponse.json({ data: mission }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/nexarch/missions]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
