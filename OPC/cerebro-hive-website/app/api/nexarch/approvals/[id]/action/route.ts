/**
 * POST /api/nexarch/approvals/:id/action
 * Body: { action: "approve"|"reject", reviewedBy: string, comment?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { getApproval, updateApproval, recordAudit } from "@/lib/agent-os/store";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const { action, reviewedBy, comment } = await req.json() as {
      action: "approve" | "reject";
      reviewedBy: string;
      comment?: string;
    };

    if (!action || !reviewedBy) {
      return NextResponse.json({ error: "action and reviewedBy are required" }, { status: 400 });
    }
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
    }

    const existing = await getApproval(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Approval not found" }, { status: 404 });
    }
    if (existing.status !== "pending") {
      return NextResponse.json(
        { error: `Approval is already ${existing.status}` },
        { status: 409 }
      );
    }

    const newStatus = action === "approve" ? "approved" : "rejected";
    const updated = await updateApproval(params.id, {
      status:      newStatus,
      reviewedBy,
      reviewedAt:  new Date().toISOString(),
      comment,
    });

    await recordAudit({
      entityType: "approval",
      entityId:   params.id,
      action:     `approval.${action}d`,
      actorId:    reviewedBy,
      actorType:  "user",
      details:    {
        agentId:    existing.agentId,
        agentAction: existing.action,
        riskLevel:  existing.riskLevel,
        comment,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("[POST /api/nexarch/approvals/:id/action]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
