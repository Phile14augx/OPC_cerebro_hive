import { NextRequest, NextResponse } from "next/server";
import { getApprovals, createApproval } from "@/lib/agent-os/store";
import type { ApprovalStatus } from "@/lib/agent-os/types";

export const dynamic = "force-dynamic";

// GET /api/nexarch/approvals?status=pending
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") as ApprovalStatus | null;
  const approvals = await getApprovals(status ?? undefined);
  return NextResponse.json({ data: approvals, count: approvals.length });
}

// POST /api/nexarch/approvals  (used by policy engine / agent runner)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ["agentId", "agentName", "action", "riskLevel", "reason", "requestedBy"];
    const missing = required.filter(k => !body[k]);
    if (missing.length) {
      return NextResponse.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
    }
    const approval = await createApproval({
      agentId:     body.agentId,
      agentName:   body.agentName,
      missionId:   body.missionId,
      taskId:      body.taskId,
      action:      body.action,
      description: body.description ?? body.action,
      riskLevel:   body.riskLevel,
      reason:      body.reason,
      requestedBy: body.requestedBy,
      details:     body.details ?? {},
      expiresAt:   body.expiresAt,
    });
    return NextResponse.json({ data: approval }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
