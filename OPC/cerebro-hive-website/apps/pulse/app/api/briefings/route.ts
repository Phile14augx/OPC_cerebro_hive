/**
 * GET  /api/briefings         — list persisted briefings (most recent first)
 * POST /api/briefings         — generate a new briefing via Claude, persist to DB
 */
import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@cerebro/db';
import { prisma } from '@/shared/lib/db';
import { generateBriefing } from '@/shared/lib/claude-client';
import { computeEnterpriseHealth } from '@/shared/lib/health-score';
import { cacheGet, cacheSet, TTL } from '@/shared/lib/redis';
import type { Briefing, BriefingType } from '@/shared/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LIST_CACHE = 'pulse:briefings:list:v1';

/* ── GET ──────────────────────────────────────────────────────────────── */
export async function GET(): Promise<NextResponse<{ briefings: Briefing[] }>> {
  try {
    const cached = await cacheGet<{ briefings: Briefing[] }>(LIST_CACHE);
    if (cached) return NextResponse.json(cached);

    // Briefings stored in Metric table with category='briefing' (schema-agnostic)
    // OR in a dedicated Briefing model if it exists — try both approaches
    let rows: Array<{ id: string; name: string; value: unknown; metadata: unknown; recordedAt: Date }> = [];
    try {
      rows = await prisma.metric.findMany({
        where: { category: 'briefing' },
        orderBy: { recordedAt: 'desc' },
        take: 20,
      }) as typeof rows;
    } catch {
      // table may not have briefings yet
      rows = [];
    }

    const briefings: Briefing[] = rows.map((row, idx) => {
      const meta = (row.metadata as Record<string, unknown>) ?? {};
      return {
        id: row.id,
        title: (meta.title as string) ?? row.name,
        type: (meta.type as BriefingType) ?? 'daily',
        period: (meta.period as string) ?? row.recordedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        generatedAt: row.recordedAt.toISOString(),
        executiveSummary: (meta.executiveSummary as string) ?? '',
        highlights: (meta.highlights as Briefing['highlights']) ?? [],
        risks: (meta.risks as Briefing['risks']) ?? [],
        recommendations: (meta.recommendations as string[]) ?? [],
        kpiSnapshot: (meta.kpiSnapshot as Briefing['kpiSnapshot']) ?? [],
        readTime: (meta.readTime as number) ?? 3,
        isLatest: idx === 0,
      };
    });

    const response = { briefings };
    await cacheSet(LIST_CACHE, response, TTL.BRIEFING_LIST);
    return NextResponse.json(response);
  } catch (err) {
    console.error('[API GET /api/briefings]', err);
    return NextResponse.json({ briefings: [], error: String(err) } as unknown as { briefings: Briefing[] }, { status: 500 });
  }
}

/* ── POST ─────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest): Promise<NextResponse<{ briefing: Briefing }>> {
  try {
    const body = await req.json() as { type?: BriefingType };
    const type: BriefingType = body.type ?? 'daily';

    // Build context from live platform data
    const { health, pillars } = await computeEnterpriseHealth();

    const revenueMetrics = await prisma.metric.findMany({
      where: { category: { in: ['revenue', 'mrr'] } },
      orderBy: { recordedAt: 'desc' },
      take: 5,
    });
    const mrrRow = revenueMetrics.find(m => m.name.toLowerCase().includes('mrr'));
    const mrr = mrrRow ? Number(mrrRow.value) / 1_000_000 : undefined;
    const prevMrr = mrrRow
      ? (Number((mrrRow as Record<string, unknown>)['previousValue'] ?? mrrRow.value) / 1_000_000)
      : undefined;
    const revDelta = (mrr != null && prevMrr != null && prevMrr > 0)
      ? ((mrr - prevMrr) / prevMrr) * 100
      : undefined;

    const openAlerts = await prisma.alert.findMany({
      where: { status: 'OPEN' },
      orderBy: { severity: 'desc' },
      take: 5,
    });

    const now = new Date();
    const period = type === 'daily'
      ? now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : type === 'weekly'
        ? `Week of ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : `${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

    const aiContent = await generateBriefing({
      type,
      period,
      healthScore: health.score,
      healthStatus: health.status,
      healthDelta: health.delta,
      pillars: pillars.map(p => ({ label: p.label, score: p.score, status: p.status, delta: p.delta })),
      topAlerts: openAlerts.map(a => ({ title: a.title, severity: a.severity, category: a.category ?? 'operations' })),
      kpis: pillars.flatMap(p => p.kpis.slice(0, 2)).map(k => ({
        label: k.label, value: k.formatted, trend: k.trend, delta: k.delta,
      })),
      revenueThisPeriod: mrr,
      revenueDelta: revDelta,
    });

    const title = `${type.charAt(0).toUpperCase() + type.slice(1)} Briefing — ${period}`;
    const readTime = Math.max(2, Math.ceil(aiContent.executiveSummary.split(' ').length / 200) +
      Math.ceil(aiContent.recommendations.length / 2));

    // Persist to Metric table (category=briefing, value=0)
    const saved = await prisma.metric.create({
      data: {
        name: title,
        value: 0,
        unit: 'briefing',
        category: 'briefing',
        metadata: {
          title,
          type,
          period,
          executiveSummary: aiContent.executiveSummary,
          highlights: aiContent.highlights,
          risks: aiContent.risks,
          recommendations: aiContent.recommendations,
          kpiSnapshot: pillars.flatMap(p => p.kpis.slice(0, 2)),
          readTime,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    // Bust list cache
    const { redis } = await import('@/shared/lib/redis');
    await redis.del(LIST_CACHE);

    const briefing: Briefing = {
      id: saved.id,
      title,
      type,
      period,
      generatedAt: saved.recordedAt.toISOString(),
      executiveSummary: aiContent.executiveSummary,
      highlights: aiContent.highlights,
      risks: aiContent.risks,
      recommendations: aiContent.recommendations,
      kpiSnapshot: pillars.flatMap(p => p.kpis.slice(0, 2)),
      readTime,
      isLatest: true,
    };

    return NextResponse.json({ briefing });
  } catch (err) {
    console.error('[API POST /api/briefings]', err);
    return NextResponse.json({ error: String(err) } as unknown as { briefing: Briefing }, { status: 500 });
  }
}
