import Fastify from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";

import operatingSystemRoutes from "./operating-system.routes";
import { OperatingTaskService } from "./OperatingTaskService";

const WORKSPACE_A = "00000000-0000-4000-8000-00000000000a";
const WORKSPACE_B = "00000000-0000-4000-8000-00000000000b";
const AGENT_ID = "00000000-0000-4000-8000-000000000101";
const DEPARTMENT_ID = "00000000-0000-4000-8000-000000000102";
const WORKFLOW_ID = "00000000-0000-4000-8000-000000000103";
const TASK_ID = "00000000-0000-4000-8000-000000000201";

function detail(overrides: Record<string, unknown> = {}) {
  return {
    id: TASK_ID, workspaceId: WORKSPACE_A, title: "Audit docs", prompt: null,
    status: "QUEUED", targetType: "agent", targetId: AGENT_ID, createdById: "user-a",
    executionId: null, version: 1, startedAt: null, completedAt: null,
    createdAt: "2026-08-09T00:00:00.000Z", updatedAt: "2026-08-09T00:00:00.000Z",
    artifactCount: 0, input: {}, output: null, error: null, steps: [], artifacts: [], ...overrides,
  };
}

async function routeApp(taskService?: Record<string, unknown>, workspaceId = WORKSPACE_A) {
  const app = Fastify();
  app.addHook("onRequest", async (request) => {
    request.cerebroContext = { tenantId: "tenant-a", workspaceId, userId: "user-a", traceId: "trace-a", correlationId: "correlation-a" } as never;
  });
  await app.register(operatingSystemRoutes, {
    operatingSystemService: {} as never,
    operatingTaskService: taskService as never,
  });
  return app;
}

describe("operating-system task routes", () => {
  const apps: Awaited<ReturnType<typeof routeApp>>[] = [];
  afterEach(async () => { await Promise.all(apps.splice(0).map((app) => app.close())); });

  it("requires Idempotency-Key for task mutations", async () => {
    const createTask = vi.fn();
    const app = await routeApp({ createTask }); apps.push(app);
    const response = await app.inject({ method: "POST", url: "/commands", payload: { kind: "create-task", title: "Audit docs", targetType: "agent", targetId: AGENT_ID, input: {} } });
    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("IDEMPOTENCY_KEY_REQUIRED");
    expect(createTask).not.toHaveBeenCalled();
  });

  it("creates a task and dispatches a supported agent execution", async () => {
    const createTask = vi.fn().mockResolvedValue(detail());
    const app = await routeApp({ createTask }); apps.push(app);
    const response = await app.inject({ method: "POST", url: "/commands", headers: { "idempotency-key": "create-audit" }, payload: { kind: "create-task", title: "Audit docs", targetType: "agent", targetId: AGENT_ID, input: {} } });
    expect(response.statusCode).toBe(202);
    expect(response.json().data.status).toBe("QUEUED");
    expect(createTask).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ targetId: AGENT_ID }), "create-audit");
  });

  it("lists, reads, and does not reveal another workspace task", async () => {
    const list = vi.fn().mockResolvedValue([detail()]);
    const get = vi.fn().mockResolvedValueOnce(detail()).mockResolvedValueOnce(null);
    const app = await routeApp({ list, get }); apps.push(app);
    expect((await app.inject({ method: "GET", url: "/tasks" })).json().data).toHaveLength(1);
    expect((await app.inject({ method: "GET", url: `/tasks/${TASK_ID}` })).statusCode).toBe(200);
    expect((await app.inject({ method: "GET", url: `/tasks/${TASK_ID}` })).statusCode).toBe(404);
  });

  it.each(["pause", "cancel", "retry"])("dispatches the %s lifecycle action with its idempotency key", async (action) => {
    const mutate = vi.fn().mockResolvedValue(detail({ status: action === "pause" ? "PAUSED" : action === "cancel" ? "CANCELLED" : "QUEUED" }));
    const app = await routeApp({ [action]: mutate }); apps.push(app);
    const response = await app.inject({ method: "POST", url: `/tasks/${TASK_ID}/${action}`, headers: { "idempotency-key": `${action}-1` } });
    expect(response.statusCode).toBe(200);
    expect(mutate).toHaveBeenCalledWith(expect.anything(), TASK_ID, `${action}-1`);
  });
});

describe("OperatingTaskService dispatch", () => {
  it("rejects workflow targets before creating a task", async () => {
    const repository = { create: vi.fn() };
    const service = new OperatingTaskService(repository as never, {} as never, {} as never, { getEntityDetail: vi.fn().mockResolvedValue({ node: { id: WORKFLOW_ID, type: "workflow" } }) } as never, { execute: vi.fn() } as never, { publish: vi.fn() } as never);
    await expect(service.createTask({ tenantId: "tenant-a", workspaceId: WORKSPACE_A, userId: "user-a" }, { kind: "create-task", title: "Run flow", targetType: "workflow", targetId: WORKFLOW_ID, input: {} }, "workflow-1")).rejects.toMatchObject({ code: "TARGET_NOT_EXECUTABLE" });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("resolves a department target to its configured leader agent", async () => {
    const repository = { create: vi.fn().mockResolvedValue(detail({ targetType: "department", targetId: DEPARTMENT_ID })), appendStep: vi.fn(), attachExecution: vi.fn().mockResolvedValue(detail()), transition: vi.fn().mockResolvedValue(detail()) };
    const runtime = { execute: vi.fn().mockResolvedValue({ status: "completed" }) };
    const agentRepository = { getLatestVersion: vi.fn().mockResolvedValue({ id: "version-a", modelId: "model-a", instructions: "Do work" }) };
    const entity = vi.fn().mockImplementation((_context, type) => type === "department" ? Promise.resolve({ node: { id: DEPARTMENT_ID, type }, metrics: {}, relationships: [], actions: [], summary: {}, nodeExtra: {}, }) : Promise.resolve({ node: { id: AGENT_ID, type: "agent" } }));
    entity.mockResolvedValueOnce({ node: { id: DEPARTMENT_ID, type: "department", summary: { leaderAgentId: AGENT_ID } } });
    const service = new OperatingTaskService(repository as never, runtime as never, agentRepository as never, { getEntityDetail: entity } as never, { execute: async (work: (tx: unknown) => Promise<unknown>) => work({ tx: true }) } as never, { publish: vi.fn() } as never);
    await service.createTask({ tenantId: "tenant-a", workspaceId: WORKSPACE_A, userId: "user-a", traceId: "trace-a", correlationId: "correlation-a" }, { kind: "create-task", title: "Lead audit", targetType: "department", targetId: DEPARTMENT_ID, input: {} }, "department-1");
    await vi.waitFor(() => expect(agentRepository.getLatestVersion).toHaveBeenCalledWith(AGENT_ID, expect.anything()));
  });

  it("persists runtime completion and its terminal step in one transaction", async () => {
    const tx = { tx: true };
    const repository = { create: vi.fn().mockResolvedValue(detail()), appendStep: vi.fn(), attachExecution: vi.fn().mockResolvedValue(detail()), transition: vi.fn().mockResolvedValue(detail({ status: "COMPLETED" })) };
    const runtime = { execute: vi.fn().mockResolvedValue({ status: "completed" }) };
    const service = new OperatingTaskService(repository as never, runtime as never, { getLatestVersion: vi.fn().mockResolvedValue({ id: "version-a", modelId: "model-a", instructions: "Do work" }) } as never, { getEntityDetail: vi.fn().mockResolvedValue({ node: { id: AGENT_ID, type: "agent" } }) } as never, { execute: async (work: (value: unknown) => Promise<unknown>) => work(tx) } as never, { publish: vi.fn() } as never);
    await service.createTask({ tenantId: "tenant-a", workspaceId: WORKSPACE_A, userId: "user-a", traceId: "trace-a", correlationId: "correlation-a" }, { kind: "create-task", title: "Audit docs", targetType: "agent", targetId: AGENT_ID, input: {} }, "agent-1");
    await vi.waitFor(() => expect(repository.transition).toHaveBeenCalledWith(TASK_ID, "COMPLETED", expect.objectContaining({ tx })));
    expect(repository.appendStep).toHaveBeenCalledWith(TASK_ID, expect.objectContaining({ label: "Execution completed", status: "COMPLETED" }), expect.objectContaining({ tx }));
  });
});
