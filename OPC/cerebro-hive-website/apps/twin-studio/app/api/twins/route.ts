import { NextRequest, NextResponse } from 'next/server';
import { requestScope } from '../../../lib/request-scope';
import { createTwin, listTwins } from '../../../modules/twin-definition/twin-service';
export function GET(request: NextRequest) { return NextResponse.json({ data: listTwins(requestScope(request)) }); }
export async function POST(request: NextRequest) { try { return NextResponse.json({ data: createTwin(await request.json()) }, { status: 201 }); } catch (error) { const message = error instanceof Error ? error.message : 'Invalid request'; return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message } }, { status: 400 }); } }
