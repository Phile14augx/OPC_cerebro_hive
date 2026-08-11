import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  configurePlatformApiToken,
  configurePlatformApiWorkspace,
} from "@/lib/platform/api-client";
import { isOperatingSystemRoute } from "@/app/(platform)/app/components/PlatformLayoutClient";
import { operatingSystemClient } from "../../data/client";
import { OperatingSystemShell } from "./OperatingSystemShell";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  configurePlatformApiToken(async () => null);
  configurePlatformApiWorkspace(null);
  vi.restoreAllMocks();
});

describe("OperatingSystemShell", () => {
  it("labels explicit demo data", () => {
    render(
      <OperatingSystemShell mode="demo">
        <div>Graph</div>
      </OperatingSystemShell>,
    );

    expect(screen.getByText("DEMO DATA")).toBeVisible();
  });

  it("does not label live data as demo", () => {
    render(
      <OperatingSystemShell mode="live">
        <div>Graph</div>
      </OperatingSystemShell>,
    );

    expect(screen.queryByText("DEMO DATA")).toBeNull();
  });

  it("exposes the workspace slots as accessible landmarks", () => {
    render(
      <OperatingSystemShell
        mode="live"
        header={<div>Company Brain controls</div>}
        inspector={<div>Agent inspector</div>}
        status={<div>Connected to live graph</div>}
      >
        <div>Company graph</div>
      </OperatingSystemShell>,
    );

    expect(screen.getByRole("banner", { name: "Company operating system controls" })).toHaveTextContent(
      "Company Brain controls",
    );
    expect(screen.getByRole("region", { name: "Company operating system visualization" })).toHaveTextContent(
      "Company graph",
    );
    expect(screen.getByRole("complementary", { name: "Entity inspector" })).toHaveTextContent(
      "Agent inspector",
    );
    expect(screen.getByRole("status", { name: "Company operating system status" })).toHaveTextContent(
      "Connected to live graph",
    );
    expect(screen.getByRole("navigation", { name: "Company operating system" })).toBeVisible();
  });

  it("does not add a second main landmark inside the platform page landmark", () => {
    render(
      <main aria-label="Studio page">
        <OperatingSystemShell mode="live">
          <div>Company graph</div>
        </OperatingSystemShell>
      </main>,
    );

    expect(screen.getAllByRole("main")).toHaveLength(1);
  });
});

describe("operatingSystemClient", () => {
  it("fails closed when no selected Studio workspace is available", async () => {
    configurePlatformApiToken(async () => "signed-token");
    const fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;

    await expect(operatingSystemClient.getGraph()).rejects.toThrow(
      "Select a valid Studio workspace",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses the authenticated workspace request context for an explicit graph mode", async () => {
    configurePlatformApiToken(async () => "signed-token");
    configurePlatformApiWorkspace(async () => "workspace-123");
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            revision: "rev-1",
            generatedAt: "2026-08-10T00:00:00.000Z",
            mode: "demo",
            nodes: [],
            edges: [],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    globalThis.fetch = fetchMock;

    const response = await operatingSystemClient.getGraph("demo");

    expect(response.data.mode).toBe("demo");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:4000/api/operating-system/graph?mode=demo");
    expect(init).toMatchObject({
      method: "GET",
      headers: {
        Authorization: "Bearer signed-token",
        "Content-Type": "application/json",
        "X-Workspace-ID": "workspace-123",
      },
    });
  });

  it("defaults graph requests to live mode", async () => {
    configurePlatformApiToken(async () => "signed-token");
    configurePlatformApiWorkspace(async () => "workspace-123");
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            revision: "rev-live",
            generatedAt: "2026-08-10T00:00:00.000Z",
            mode: "live",
            nodes: [],
            edges: [],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    globalThis.fetch = fetchMock;

    await operatingSystemClient.getGraph();

    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://localhost:4000/api/operating-system/graph?mode=live",
    );
  });

  it("encodes entity identifiers before requesting detail", async () => {
    configurePlatformApiToken(async () => "signed-token");
    configurePlatformApiWorkspace(async () => "workspace-123");
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            node: {
              id: "agent/one",
              type: "agent",
              label: "Agent One",
              status: "healthy",
              departmentId: null,
              detailUrl: "/operating-system/agent/agent%2Fone",
              tags: [],
              health: { score: 100, lastActivityAt: null },
              summary: {},
            },
            metrics: {},
            relationships: [],
            actions: [],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    globalThis.fetch = fetchMock;

    await operatingSystemClient.getEntityDetail("agent", "agent/one");

    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://localhost:4000/api/operating-system/entities/agent/agent%2Fone",
    );
  });
});

describe("operating-system route spacing", () => {
  it("recognizes only the route wrapped by the operating-system layout", () => {
    expect(isOperatingSystemRoute("/app/brain")).toBe(true);
  });

  it.each([
    "/app/forge",
    "/app/departments",
    "/app/departments/sales",
    "/app/agents",
    "/app/agents/agent-1",
    "/app/tasks",
    "/app/tasks/task-1",
    "/app/personas",
    "/app/personas/operator",
    "/app/funnels",
    "/app/hierarchy",
    "/app/memory",
    "/app/tools",
    "/app/models",
    "/app/activity",
    "/app/analytics",
  ])("keeps %s in the standard scrolling layout", (pathname) => {
    expect(isOperatingSystemRoute(pathname)).toBe(false);
  });
});
