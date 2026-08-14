/**
 * POST /api/nexarch/agents/:id/lifecycle
 * Transitions the INSTANCE of an agent to a new lifecycle state.
 * Body: { instanceId: string, action: "start"|"pause"|"resume"|"terminate"|"quarantine" }
 */
import { NextRequest, NextResponse } from "next/server";
import { getInstance, updateInstance, recordAudit } from "@/lib/agent-os/store";
import type { AgentLifecycleState } from "@/lib/agent-os/types";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

const ACTION_STATE_MAP: Record<string, AgentLifecycleState> = {
  start:       "running",
  pause:       "paused",
  resume:      "queued",
  terminate:   "terminated",
  quarantine:  "quarantined",
  suspend:     "suspended",
};

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const { instanceId, action } = await req.json() as {
      instanceId: string;
      action: string;
    };

    if (!instanceId || !action) {
      return NextResponse.json({ error: "instanceId and action are required" }, { status: 400 });
    }

    const newState = ACTION_STATE_MAP[action];
    if (!newState) {
      return NextResponse.json(
        { error: `Unknown action '${action}'. Valid: ${Object.keys(ACTION_STATE_MAP).join(", ")}` },
        { status: 400 }
      );
    }

    const instance = await getInstance(instanceId);
    if (!instance || instance.agentId !== params.id) {
      return NextResponse.json({ error: "Instance not found for this agent" }, { status: 404 });
    }

    const updated = await updateInstance(instanceId, {
      state: newState,
      ...(action === "start" && !instance.startedAt ? { startedAt: new Date().toISOString() } : {}),
      ...(["terminate", "quarantine"].includes(action) ? { completedAt: new Date().toISOString() } : {}),
    });

    await recordAudit({
      entityType: "instance",
      entityId:   instanceId,
      action:     `lifecycle.${action}`,
      actorId:    "api",
      actorType:  "system",
      details:    { previousState: instance.state, newState },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
