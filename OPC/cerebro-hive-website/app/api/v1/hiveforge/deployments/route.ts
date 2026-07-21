import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { eventStore } from "../../../../platform/hiveforge/core/events/EventStore";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { blueprintId, config, idempotencyKey } = body;
    
    // In a real app we'd get workspaceId from auth session
    const workspaceId = "00000000-0000-0000-0000-000000000000";

    // Start a Prisma transaction to ensure Atomicity for Deployment, Operation, and Resource placeholders
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create a pending resource placeholder
      const resource = await tx.resource.create({
        data: {
          workspaceId,
          blueprintId,
          status: "pending",
          config: config || {}
        }
      });

      // 2. Create the deployment intent
      const deployment = await tx.deployment.create({
        data: {
          resourceId: resource.id,
          status: "requested",
          config: config || {}
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

    // We simulate handing off to the ExecutionPlanner here in the background
    // setTimeout(() => executionPlanner.execute(result.operation.id), 0);

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
