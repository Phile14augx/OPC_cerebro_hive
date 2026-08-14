/**
 * GET /api/nexarch/stream
 * Server-Sent Events endpoint — emits real-time agent/mission state changes.
 *
 * Clients subscribe once and receive:
 *   - ping every 15 s (keepalive)
 *   - metrics snapshot every 10 s
 *   - approval events as they arrive
 *
 * Because the JSON store is polled rather than event-driven, this
 * implementation uses short-interval polling internally and batches
 * changed events to the client.  A full event-driven upgrade would
 * plug NATS/BullMQ here without changing the client contract.
 */
import { NextRequest } from "next/server";
import { getMetrics, getApprovals, getAudit } from "@/lib/agent-os/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        if (closed) return;
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          // client disconnected
        }
      }

      // Send initial snapshot
      try {
        const metrics = await getMetrics();
        send("metrics", metrics);
        const pending = await getApprovals("pending");
        send("approvals", { pending, count: pending.length });
      } catch { /* ignore */ }

      // Ping keepalive
      const pingInterval = setInterval(() => {
        if (closed) { clearInterval(pingInterval); return; }
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch { clearInterval(pingInterval); }
      }, 15_000);

      // Metrics refresh every 10 s
      const metricsInterval = setInterval(async () => {
        if (closed) { clearInterval(metricsInterval); return; }
        try {
          const metrics = await getMetrics();
          send("metrics", metrics);
          const pending = await getApprovals("pending");
          send("approvals", { pending, count: pending.length });
          const recent = await getAudit({ limit: 5, offset: 0 });
          send("audit", recent);
        } catch { /* ignore */ }
      }, 10_000);

      // Abort on disconnect
      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(pingInterval);
        clearInterval(metricsInterval);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
    cancel() { closed = true; },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
