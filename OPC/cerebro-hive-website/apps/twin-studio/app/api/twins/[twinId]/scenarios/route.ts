import { NextRequest, NextResponse } from 'next/server';
import { runMotorFailureScenario } from '../../../../../modules/simulation/scenario-service';
export async function POST(request: NextRequest) { const body = await request.json() as { tick?: number }; return NextResponse.json({ data: runMotorFailureScenario(Number(body.tick ?? 0)) }, { status: 201 }); }
