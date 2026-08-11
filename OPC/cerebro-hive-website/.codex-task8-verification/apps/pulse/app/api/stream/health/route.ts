/**
 * GET /api/stream/health
 * Server-Sent Events — streams live health score updates every 30 seconds.
 * Client subscribes once; receives push notifications on score changes.
 */
import { NextResponse } from 'next/server';
import { computeEnterpriseHealth } from '@/shared/lib/health-score';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const INTERVAL_MS = 30_000; // 30 seconds
const KEEPALIVE_MS = 15_000; // 15 seconds

export async function GET(): Promise<Response> {
  let keepaliveTimer: NodeJS.Timeout | null = null;
  let dataTimer: NodeJS.Timeout | null = null;
  let isClosed = false;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          // stream was cancelled
          isClosed = true;
        }
      }

      function sendKeepalive() {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch {
          isClosed = true;
        }
      }

      // Send initial health score immediately
      try {
        const data = await computeEnterpriseHealth();
        send('health', { health: data.health, pillars: data.pillars, ts: new Date().toISOString() });
      } catch (err) {
        send('error', { message: String(err) });
      }

      // Keepalive ping
      keepaliveTimer = setInterval(sendKeepalive, KEEPALIVE_MS);

      // Periodic refresh
      dataTimer = setInterval(async () => {
        if (isClosed) {
          clearInterval(keepaliveTimer!);
          clearInterval(dataTimer!);
          return;
        }
        try {
          const data = await computeEnterpriseHealth();
          send('health', { health: data.health, pillars: data.pillars, ts: new Date().toISOString() });
        } catch (err) {
          send('error', { message: String(err) });
        }
      }, INTERVAL_MS);
    },

    cancel() {
      isClosed = true;
      if (keepaliveTimer) clearInterval(keepaliveTimer);
      if (dataTimer) clearInterval(dataTimer);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
