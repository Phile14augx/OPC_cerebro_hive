"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { platformFetch } from "@/lib/platform/api-client";
import { projectOperatingEvent, type OperatingEventProjection } from "./eventProjection";

export function useOperatingEvents(mode: "live" | "demo") {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (mode === "demo") return;
    let cancelled = false; let attempts = 0; let cursor: string | undefined; let controller: AbortController | undefined; let retry: ReturnType<typeof setTimeout> | undefined;
    const fallback = setInterval(() => { if (attempts >= 3) void queryClient.invalidateQueries({ queryKey: ["company-os", "graph", mode] }); }, 15_000);
    const connect = async () => {
      controller = new AbortController();
      try {
        const eventUrl = cursor ? `/api/operating-system/events?cursor=${encodeURIComponent(cursor)}` : "/api/operating-system/events";
        const response = await platformFetch(eventUrl, { credentials: "include", headers: { Accept: "text/event-stream" }, signal: controller.signal });
        if (!response.ok || !response.body) throw new Error("Event stream unavailable");
        const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
        while (!cancelled) { const part = await reader.read(); if (part.done) throw new Error("Event stream closed"); buffer += decoder.decode(part.value, { stream: true }); const frames = buffer.split("\n\n"); buffer = frames.pop() ?? ""; for (const frame of frames) { const lines = frame.split("\n"); const data = lines.find((line) => line.startsWith("data: "))?.slice(6); if (!data) continue; const id = lines.find((line) => line.startsWith("id: "))?.slice(4); if (id) cursor = id; attempts = 0; const event = JSON.parse(data) as OperatingEventProjection; queryClient.setQueryData(["company-os", "graph", mode], (current: { data: Parameters<typeof projectOperatingEvent>[0] } | undefined) => current ? { data: projectOperatingEvent(current.data, event) } : current); } }
      } catch { if (!cancelled) { attempts += 1; retry = setTimeout(connect, Math.min(1_000 * 2 ** (attempts - 1), 30_000)); } }
    };
    void connect(); return () => { cancelled = true; controller?.abort(); if (retry) clearTimeout(retry); clearInterval(fallback); };
  }, [mode, queryClient]);
}
