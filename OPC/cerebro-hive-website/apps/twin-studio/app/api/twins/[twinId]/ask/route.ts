import { NextRequest, NextResponse } from 'next/server';
import { askTwin } from '../../../../../modules/intelligence/ask-twin-service';
export async function POST(request: NextRequest) { const body = await request.json() as { tick?: number; prompt?: string }; if (!body.prompt?.trim()) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Prompt is required.' } }, { status: 400 }); return NextResponse.json({ data: askTwin(Number(body.tick ?? 0), body.prompt) }); }
