/**
 * GET /api/stream/platform
 * SSE — pushes live platform health every 20 seconds.
 */
import { aggregateDashboard } from '@/shared/lib/aggregator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  let closed = false;
  let dataTimer: NodeJS.Timeout | null = null;
  let pingTimer: NodeJS.Timeout | null = null;
  const enc = new TextEncoder();

  const stream = new ReadableStream({
    async start(ctrl) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try { ctrl.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)); }
        catch { closed = true; }
      };

      // Initial push
      try {
        const d = await aggregateDashboard();
        send('platform', { platform: d.platform, alerts: d.alerts, agents: d.agents, ts: new Date().toISOString() });
      } catch (e) { send('error', { message: String(e) }); }

      pingTimer = setInterval(() => { if (!closed) { try { ctrl.enqueue(enc.encode(': ping\n\n')); } catch { closed = true; } } }, 15_000);
      dataTimer = setInterval(async () => {
        if (closed) {
          if (dataTimer) clearInterval(dataTimer);
          if (pingTimer) clearInterval(pingTimer);
          return;
        }
        try {
          const d = await aggregateDashboard();
          send('platform', { platform: d.platform, alerts: d.alerts, agents: d.agents, ts: new Date().toISOString() });
        } catch (e) { send('error', { message: String(e) }); }
      }, 20_000);
    },
    cancel() {
      closed = true;
      if (dataTimer) clearInterval(dataTimer);
      if (pingTimer) clearInterval(pingTimer);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
