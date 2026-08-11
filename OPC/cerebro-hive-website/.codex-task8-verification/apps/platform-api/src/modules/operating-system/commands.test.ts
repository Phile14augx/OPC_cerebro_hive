import Fastify from "fastify";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import operatingSystemRoutes from "./operating-system.routes";
import { OperatingEventStream } from "./OperatingEventStream";

describe("operating-system commands", () => {
  const app = Fastify();
  beforeAll(async () => {
    app.addHook("onRequest", async (request) => { request.cerebroContext = { workspaceId: "workspace-a" } as never; });
    await app.register(operatingSystemRoutes, { operatingSystemService: {} as never });
  });
  afterAll(async () => { await app.close(); });
  it("rejects a server command outside the allowlist", async () => {
    const response = await app.inject({ method: "POST", url: "/commands", payload: { text: "delete production" } });
    expect(response.statusCode).toBe(422);
    expect(response.json().error).toBe("UNSUPPORTED_COMMAND");
  });
  it("does not simulate durable task creation before persistence is installed", async () => {
    const response = await app.inject({ method: "POST", url: "/commands", payload: { kind: "create-task", title: "Audit docs", targetType: "agent", targetId: "11111111-1111-4111-8111-111111111111", input: {} } });
    expect(response.statusCode).toBe(501);
    expect(response.json().error).toBe("TASK_PERSISTENCE_NOT_INSTALLED");
  });
  it("translates an explicit execute-agent text command into the allowlisted command", async () => {
    const dispatch = vi.fn().mockResolvedValue({ id: "execution-1", status: "running" });
    const response = await app.inject({ method: "POST", url: "/commands", payload: { text: "execute-agent 11111111-1111-4111-8111-111111111111 Summarize the operating state" }, });
    expect(response.statusCode).toBe(501);
    expect(response.json().error).toBe("RUNTIME_DISPATCH_NOT_INSTALLED");

    const dispatchApp = Fastify();
    dispatchApp.addHook("onRequest", async (request) => { request.cerebroContext = { workspaceId: "workspace-a" } as never; });
    await dispatchApp.register(operatingSystemRoutes, { operatingSystemService: { getEntityDetail: vi.fn().mockResolvedValue({}) } as never, operatingCommandService: { dispatch } as never });
    const dispatched = await dispatchApp.inject({ method: "POST", url: "/commands", payload: { text: "execute-agent 11111111-1111-4111-8111-111111111111 Summarize the operating state" } });
    expect(dispatched.statusCode).toBe(202);
    expect(dispatch).toHaveBeenCalledWith(expect.anything(), { kind: "execute-agent", targetId: "11111111-1111-4111-8111-111111111111", input: { message: "Summarize the operating state" } });
    await dispatchApp.close();
  });
  it("delivers newly published workspace events to subscribers", () => {
    const stream = new OperatingEventStream("test-secret-that-is-long-enough-for-a-test");
    const received: string[] = [];
    const unsubscribe = stream.subscribe("workspace-a", (event) => received.push(event.id));
    stream.publish({ id: "event-1", event: "execution", source: "execution", workspaceId: "workspace-a", occurredAt: "2026-08-10T00:00:00.000Z", data: {} });
    unsubscribe();
    stream.publish({ id: "event-2", event: "execution", source: "execution", workspaceId: "workspace-a", occurredAt: "2026-08-10T00:00:01.000Z", data: {} });
    expect(received).toEqual(["event-1"]);
  });
  it("does not treat a malformed cursor as a fresh stream", () => {
    const stream = new OperatingEventStream("test-secret-that-is-long-enough-for-a-test");
    expect(stream.isValidCursor("forged.cursor")).toBe(false);
  });
  it("rejects a signed cursor when it is replayed in another workspace", () => {
    const stream = new OperatingEventStream("test-secret-that-is-long-enough-for-a-test");
    const event = { id: "event-a", event: "execution", source: "execution", workspaceId: "workspace-a", occurredAt: "2026-08-10T00:00:00.000Z", data: {} } as const;
    stream.publish(event);

    const cursor = stream.cursorFor(event);

    expect(stream.isValidCursor(cursor, "workspace-a")).toBe(true);
    expect(stream.isValidCursor(cursor, "workspace-b")).toBe(false);
  });
  it("subscribes before replay so an event published during replay is not lost", () => {
    const stream = new OperatingEventStream("test-secret-that-is-long-enough-for-a-test");
    stream.publish({ id: "backlog", event: "activity", source: "activity", workspaceId: "workspace-a", occurredAt: "2026-08-10T00:00:00.000Z", data: {} });
    const received: string[] = [];

    const unsubscribe = stream.subscribeWithReplay("workspace-a", undefined, (event) => {
      received.push(event.id);
      if (event.id === "backlog") {
        stream.publish({ id: "live", event: "execution", source: "execution", workspaceId: "workspace-a", occurredAt: "2026-08-10T00:00:01.000Z", data: {} });
      }
    });

    expect(received).toEqual(["backlog", "live"]);
    unsubscribe();
  });
});
