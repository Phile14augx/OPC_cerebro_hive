/**
 * GET /api/health
 * Returns the computed enterprise health score + pillar breakdown.
 * Redis-cached for 30 seconds.
 */
import { NextResponse } from 'next/server';
import { computeEnterpriseHealth } from '@/shared/lib/health-score';
import { cacheGet, cacheSet, TTL } from '@/shared/lib/redis';
import type { EnterpriseHealthScore, PillarScore } from '@/shared/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_KEY = 'pulse:health:v1';

export interface HealthResponse {
  health: EnterpriseHealthScore;
  pillars: PillarScore[];
  cached: boolean;
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  try {
    // Try cache first
    const cached = await cacheGet<HealthResponse>(CACHE_KEY);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const data = await computeEnterpriseHealth();

    const response: HealthResponse = { ...data, cached: false };
    await cacheSet(CACHE_KEY, response, TTL.HEALTH_SCORE);

    return NextResponse.json(response);
  } catch (err) {
    console.error('[API /api/health]', err);
    return NextResponse.json(
      { health: null, pillars: [], cached: false, error: String(err) } as unknown as HealthResponse,
      { status: 500 }
    );
  }
}
