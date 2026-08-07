/**
 * GET /api/dashboard
 * Returns the full aggregated dashboard payload.
 * Redis-cached for 20 seconds (live-ish but not hammering DB).
 */
import { NextResponse } from 'next/server';
import { aggregateDashboard } from '@/shared/lib/aggregator';
import { cacheGet, cacheSet, TTL } from '@/shared/lib/redis';
import type { DashboardData } from '@/shared/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_KEY = 'sphere:dashboard:v1';

export async function GET(): Promise<NextResponse<DashboardData & { cached: boolean }>> {
  try {
    const cached = await cacheGet<DashboardData>(CACHE_KEY);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const data = await aggregateDashboard();
    await cacheSet(CACHE_KEY, data, TTL.DASHBOARD);

    return NextResponse.json({ ...data, cached: false });
  } catch (err) {
    console.error('[API /api/dashboard]', err);
    return NextResponse.json({ error: String(err) } as unknown as DashboardData & { cached: boolean }, { status: 500 });
  }
}
