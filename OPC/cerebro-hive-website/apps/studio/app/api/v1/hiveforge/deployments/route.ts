import { NextResponse } from "next/server";
import { prisma } from "@cerebro/db";
import { eventStore } from "../../../../platform/hiveforge/core/events/EventStore";
import { deploymentOrchestrator } from "../../../../platform/hiveforge/core/engine/DeploymentOrchestrator";
import { AuthService } from "@/lib/services/auth.service";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const user = await AuthService.verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const workspaceId = req.headers.get('x-workspace-id');
    if (!workspaceId) {
      return NextResponse.json({ error: "Bad Request: Missing workspace selector" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { tenantId: true }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Forbidden: Wrong workspace" }, { status: 403 });
    }

    const member = await prisma.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId: workspace.tenantId,
          userId: user.userId
        }
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Forbidden: Wrong workspace" }, { status: 403 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Bad Request: Invalid JSON payload" }, { status: 400 });
    }
    
    if (!body || typeof body !== "object" || !("blueprintId" in body) || !("config" in body)) {
      return NextResponse.json({ error: "Bad Request: Missing blueprintId or config" }, { status: 400 });
    }

    const { blueprintId, config } = body as { blueprintId: string; config: Record<string, unknown> };
    if (!blueprintId) {
      return NextResponse.json({ error: "Bad Request: Malformed blueprintId" }, { status: 400 });
    }


    // Start a Prisma transaction to ensure Atomicity for Deployment, Operation, and Resource placeholders
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create a pending resource placeholder
      const resource = await tx.resource.create({
        data: {
          workspaceId,
          blueprintId,
          status: "pending",
          config: (config || {}) as unknown as import('@cerebro/db').Prisma.InputJsonValue
        }
      });

      // 2. Create the deployment intent
      const deployment = await tx.deployment.create({
        data: {
          resourceId: resource.id,
          status: "requested",
          config: (config || {}) as unknown as import('@cerebro/db').Prisma.InputJsonValue
        }
      });

      // 3. Create the operation to track execution
      const operation = await tx.operation.create({
        data: {
          resourceId: resource.id,
          deploymentId: deployment.id,
          status: "queued",
          type: "create"
        }
      });

      return { resource, deployment, operation };
    });

    // 4. Persist Domain Events (Event Sourcing)
    eventStore.append({
      id: crypto.randomUUID(),
      correlationId: result.operation.id,
      type: "WorkflowStarted",
      timestamp: new Date().toISOString(),
      payload: { deploymentId: result.deployment.id, blueprintId }
    });

    // We simulate handing off to the Orchestrator here in the background
    // setTimeout avoids blocking the HTTP response
    setTimeout(() => {
      deploymentOrchestrator.startOrchestration(result.operation.id, blueprintId, config);
    }, 0);

    return NextResponse.json({
      operationId: result.operation.id,
      status: result.operation.status,
      pollUrl: `/api/v1/hiveforge/operations/${result.operation.id}`
    }, { status: 202 });

  } catch (error) {
    console.error("[Deployments API] Error:", error);
    return NextResponse.json({ error: "Failed to create deployment" }, { status: 500 });
  }
}
