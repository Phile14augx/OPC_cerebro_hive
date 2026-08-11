import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  configurePlatformApiToken,
  configurePlatformApiWorkspace,
} from "@/lib/platform/api-client";
import { useOperatingEvents } from "./useOperatingEvents";

describe("useOperatingEvents", () => {
  afterEach(() => {
    configurePlatformApiToken(async () => null);
    configurePlatformApiWorkspace(null);
    vi.restoreAllMocks();
  });

  it("opens the live SSE stream at the Platform API with auth, workspace, and trace context", async () => {
    configurePlatformApiToken(async () => "session-token");
    configurePlatformApiWorkspace(async () => "workspace-42");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(new ReadableStream(), {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { unmount } = renderHook(() => useOperatingEvents("live"), { wrapper });

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:4000/api/operating-system/events");
    expect(init.credentials).toBe("include");
    expect(init.headers).toMatchObject({
      Accept: "text/event-stream",
      Authorization: "Bearer session-token",
      "X-Workspace-ID": "workspace-42",
    });
    expect((init.headers as Record<string, string>)["X-Trace-ID"]).toMatch(/^studio-/);

    unmount();
    queryClient.clear();
  });
});
