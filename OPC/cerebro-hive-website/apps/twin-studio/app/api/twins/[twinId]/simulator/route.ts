import { NextRequest, NextResponse } from 'next/server';
import { simulateFactoryTick } from '../../../../../modules/demo-factory/factory-simulator';
export async function POST(request: NextRequest) { const body = await request.json() as { tick?: number }; const tick = Math.max(0, Math.min(8, Number(body.tick ?? 0))); return NextResponse.json({ data: simulateFactoryTick(tick), meta: { mode: 'SIMULATED', tick } }); }
