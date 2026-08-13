import { UpdateEntityStateCommandSchema } from '@cerebro/twin-contracts';
import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '../../../../../lib/api-response';
import { authenticatedRequestContext } from '../../../../../lib/authenticated-request-context';
import { twinRepository } from '../../../../../lib/twin-runtime';

type RouteContext = { params: Promise<{ twinId: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const scope = await authenticatedRequestContext(request, 'READ');
    const { twinId } = await params;
    const entityId = request.nextUrl.searchParams.get('entityId');
    if (!entityId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'entityId is required.' } },
        { status: 400 },
      );
    }
    const take = Number(request.nextUrl.searchParams.get('take') ?? 100);
    return NextResponse.json({
      data: await twinRepository.listStateHistory(scope, twinId, entityId, take),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const scope = await authenticatedRequestContext(request, 'WRITE');
    const body = (await request.json()) as Record<string, unknown>;
    const command = UpdateEntityStateCommandSchema.parse({
      ...body,
      ...scope,
      twinId: (await params).twinId,
    });
    return NextResponse.json({ data: await twinRepository.appendState(command) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
