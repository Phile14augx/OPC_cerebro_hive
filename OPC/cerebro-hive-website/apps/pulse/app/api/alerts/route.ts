/**
 * GET  /api/alerts          — list open strategic alerts (Prisma Alert + Incident → StrategicAlert)
 * POST /api/alerts          — body: { action: 'acknowledge', id: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/db';
import { mapAlertRow, mapIncidentRow } from '@/shared/lib/alert-mapper';
import { enrichAlertActions } from '@/shared/lib/claude-client';
import { cacheGet, cacheSet, TTL } from '@/shared/lib/redis';
import type { StrategicAlert } from '@/shared/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_KEY = 'pulse:alerts:v1';

/* ── GET ──────────────────────────────────────────────────────────────── */
export async function GET(): Promise<NextResponse<{ alerts: StrategicAlert[]; total: number }>> {
  try {
    const cached = await cacheGet<{ alerts: StrategicAlert[]; total: number }>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const [rawAlerts, rawIncidents] = await Promise.all([
      prisma.alert.findMany({
        where: { status: { in: ['OPEN', 'ACKNOWLEDGED'] } },
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
        take: 50,
      }),
      prisma.incident.findMany({
        where: { status: { in: ['OPEN', 'INVESTIGATING'] } },
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
        take: 20,
      }),
    ]);

    // Enrich with Claude-generated action steps
    const alertsForEnrichment = rawAlerts.slice(0, 10).map(a => ({
      id: a.id,
      title: a.title,
      summary: a.message,
      severity: a.severity,
      category: a.category ?? 'operations',
    }));

    const enrichmentMap: Record<string, string[]> = alertsForEnrichment.length > 0
      ? await enrichAlertActions(alertsForEnrichment).catch(() => ({}))
      : {};

    const alerts: StrategicAlert[] = [
      ...rawAlerts.map(a => mapAlertRow(a as Parameters<typeof mapAlertRow>[0], enrichmentMap[a.id] ?? [])),
      ...rawIncidents.map(i => mapIncidentRow(i as Parameters<typeof mapIncidentRow>[0])),
    ].sort((a, b) => {
      const SEV = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
      return SEV[b.severity] - SEV[a.severity];
    });

    const response = { alerts, total: alerts.length };
    await cacheSet(CACHE_KEY, response, TTL.ALERTS);

    return NextResponse.json(response);
  } catch (err) {
    console.error('[API GET /api/alerts]', err);
    return NextResponse.json({ alerts: [], total: 0, error: String(err) } as unknown as { alerts: StrategicAlert[]; total: number }, { status: 500 });
  }
}

/* ── POST ─────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { action: string; id: string };
    if (body.action !== 'acknowledge' || !body.id) {
      return NextResponse.json({ error: 'Invalid body. Expected { action: "acknowledge", id: string }' }, { status: 400 });
    }

    // Handle incident vs alert IDs
    if (body.id.startsWith('incident-')) {
      const incidentId = body.id.replace('incident-', '');
      await prisma.incident.update({
        where: { id: incidentId },
        data: { status: 'ACKNOWLEDGED', updatedAt: new Date() },
      });
    } else {
      await prisma.alert.update({
        where: { id: body.id },
        data: { status: 'ACKNOWLEDGED', updatedAt: new Date() },
      });
    }

    // Bust cache
    const { redis } = await import('@/shared/lib/redis');
    await redis.del(CACHE_KEY);

    return NextResponse.json({ success: true, id: body.id });
  } catch (err) {
    console.error('[API POST /api/alerts]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
