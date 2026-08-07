/**
 * POST /api/narrative   { role: UserRole }
 * Claude generates a role-tailored NL briefing from live platform data.
 * Redis-cached per role for 5 minutes.
 */
import { NextRequest, NextResponse } from 'next/server';
import { aggregateDashboard } from '@/shared/lib/aggregator';
import { generateRoleNarrative } from '@/shared/lib/claude-client';
import { cacheGet, cacheSet, TTL } from '@/shared/lib/redis';
import type { UserRole, RoleNarrative } from '@/shared/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse<{ narrative: RoleNarrative } | { error: string }>> {
  try {
    const { role } = await req.json() as { role?: UserRole };
    if (!role || !['ceo', 'cto', 'coo', 'dept'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be ceo | cto | coo | dept.' }, { status: 400 });
    }

    const CACHE_KEY = `sphere:narrative:${role}:v1`;
    const cached = await cacheGet<RoleNarrative>(CACHE_KEY);
    if (cached) return NextResponse.json({ narrative: cached });

    const data = await aggregateDashboard();
    const narrative = await generateRoleNarrative(role, {
      platform: data.platform,
      kpis: data.kpis,
      alerts: data.alerts,
      finops: data.finops,
    });

    await cacheSet(CACHE_KEY, narrative, TTL.NARRATIVE);
    return NextResponse.json({ narrative });
  } catch (err) {
    console.error('[API POST /api/narrative]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
