/**
 * GET  /api/scenarios  — list persisted scenarios
 * POST /api/scenarios  — create + analyse a new scenario via Claude
 */
import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@cerebro/db';
import { prisma } from '@/shared/lib/db';
import { analyseScenario } from '@/shared/lib/claude-client';
import { computeEnterpriseHealth } from '@/shared/lib/health-score';
import { cacheGet, cacheSet, TTL } from '@/shared/lib/redis';
import type { Scenario } from '@/shared/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LIST_CACHE = 'pulse:scenarios:list:v1';

/* ── GET ──────────────────────────────────────────────────────────────── */
export async function GET(): Promise<NextResponse<{ scenarios: Scenario[] }>> {
  try {
    const cached = await cacheGet<{ scenarios: Scenario[] }>(LIST_CACHE);
    if (cached) return NextResponse.json(cached);

    const rows = await prisma.metric.findMany({
      where: { category: 'scenario' },
      orderBy: { recordedAt: 'desc' },
      take: 20,
    });

    const scenarios: Scenario[] = rows.map(row => {
      const meta = (row.metadata as Record<string, unknown>) ?? {};
      return {
        id: row.id,
        title: (meta.title as string) ?? row.name,
        description: (meta.description as string) ?? '',
        assumption: (meta.assumption as string) ?? '',
        healthImpact: (meta.healthImpact as number) ?? 0,
        pillarImpacts: (meta.pillarImpacts as Scenario['pillarImpacts']) ?? [],
        revenueImpact: (meta.revenueImpact as number) ?? 0,
        probability: (meta.probability as number) ?? 0.5,
        timeHorizon: (meta.timeHorizon as Scenario['timeHorizon']) ?? '90d',
        generatedAt: row.recordedAt.toISOString(),
      };
    });

    const response = { scenarios };
    await cacheSet(LIST_CACHE, response, TTL.SCENARIO);
    return NextResponse.json(response);
  } catch (err) {
    console.error('[API GET /api/scenarios]', err);
    return NextResponse.json({ scenarios: [], error: String(err) } as unknown as { scenarios: Scenario[] }, { status: 500 });
  }
}

/* ── POST ─────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest): Promise<NextResponse<{ scenario: Scenario } | { error: string }>> {
  try {
    const body = await req.json() as {
      title: string;
      description: string;
      assumption: string;
      timeHorizon?: Scenario['timeHorizon'];
    };

    if (!body.title || !body.assumption) {
      return NextResponse.json({ error: 'title and assumption are required' }, { status: 400 });
    }

    const { health, pillars } = await computeEnterpriseHealth();

    // Get MRR for revenue impact context
    const mrrRow = await prisma.metric.findFirst({
      where: { category: { in: ['revenue', 'mrr'] }, name: { contains: 'mrr', mode: 'insensitive' } },
      orderBy: { recordedAt: 'desc' },
    });
    const mrr = mrrRow ? Number(mrrRow.value) / 1_000_000 : undefined;

    const analysis = await analyseScenario({
      title: body.title,
      description: body.description,
      assumption: body.assumption,
      currentHealthScore: health.score,
      currentPillars: pillars.map(p => ({ id: p.id, label: p.label, score: p.score })),
      currentRevenueMRR: mrr,
      timeHorizon: body.timeHorizon ?? '90d',
    });

    const saved = await prisma.metric.create({
      data: {
        name: body.title,
        value: analysis.healthImpact,
        unit: 'scenario',
        category: 'scenario',
        metadata: {
          title: body.title,
          description: body.description,
          assumption: body.assumption,
          timeHorizon: body.timeHorizon ?? '90d',
          ...analysis,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    // Bust list cache
    const { redis } = await import('@/shared/lib/redis');
    await redis.del(LIST_CACHE);

    const scenario: Scenario = {
      id: saved.id,
      title: body.title,
      description: body.description,
      assumption: body.assumption,
      healthImpact: analysis.healthImpact,
      pillarImpacts: analysis.pillarImpacts,
      revenueImpact: analysis.revenueImpact,
      probability: analysis.probability,
      timeHorizon: body.timeHorizon ?? '90d',
      generatedAt: saved.recordedAt.toISOString(),
    };

    return NextResponse.json({ scenario });
  } catch (err) {
    console.error('[API POST /api/scenarios]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
