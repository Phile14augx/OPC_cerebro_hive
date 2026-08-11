/**
 * GET /api/briefings/[id] — fetch a single persisted briefing by ID
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/db';
import { cacheGet, cacheSet, TTL } from '@/shared/lib/redis';
import type { Briefing, BriefingType } from '@/shared/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ briefing: Briefing } | { error: string }>> {
  const { id } = await params;
  const CACHE_KEY = `pulse:briefing:${id}`;

  try {
    const cached = await cacheGet<{ briefing: Briefing }>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const row = await prisma.metric.findUnique({ where: { id } });
    if (!row || row.category !== 'briefing') {
      return NextResponse.json({ error: 'Briefing not found' }, { status: 404 });
    }

    const meta = (row.metadata as Record<string, unknown>) ?? {};
    const briefing: Briefing = {
      id: row.id,
      title: (meta.title as string) ?? row.name,
      type: (meta.type as BriefingType) ?? 'daily',
      period: (meta.period as string) ?? row.recordedAt.toLocaleDateString(),
      generatedAt: row.recordedAt.toISOString(),
      executiveSummary: (meta.executiveSummary as string) ?? '',
      highlights: (meta.highlights as Briefing['highlights']) ?? [],
      risks: (meta.risks as Briefing['risks']) ?? [],
      recommendations: (meta.recommendations as string[]) ?? [],
      kpiSnapshot: (meta.kpiSnapshot as Briefing['kpiSnapshot']) ?? [],
      readTime: (meta.readTime as number) ?? 3,
      isLatest: false,
    };

    const response = { briefing };
    await cacheSet(CACHE_KEY, response, TTL.BRIEFING_BODY);
    return NextResponse.json(response);
  } catch (err) {
    console.error(`[API GET /api/briefings/${id}]`, err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
