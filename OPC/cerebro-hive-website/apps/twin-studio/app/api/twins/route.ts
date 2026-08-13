import { NextRequest, NextResponse } from 'next/server';
import { CreateTwinCommandSchema } from '@cerebro/twin-contracts';
import { apiError } from '../../../lib/api-response';
import { authenticatedRequestContext } from '../../../lib/authenticated-request-context';
import { ensureDevelopmentTwinData, twinRepository } from '../../../lib/twin-runtime';
import { starterDefinitionForType } from '../../../modules/twin-definition/starter-definitions';

export async function GET(request: NextRequest) {
  try {
    const scope = await authenticatedRequestContext(request, 'READ');
    await ensureDevelopmentTwinData();
    const q = request.nextUrl.searchParams.get('q');
    const type = request.nextUrl.searchParams.get('type');
    const take = Number(request.nextUrl.searchParams.get('take') ?? 50);
    const skip = Number(request.nextUrl.searchParams.get('skip') ?? 0);
    return NextResponse.json({
      data: await twinRepository.list(scope, {
        take,
        skip,
        ...(q ? { q } : {}),
        ...(type ? { type } : {}),
      }),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const scope = await authenticatedRequestContext(request, 'WRITE');
    await ensureDevelopmentTwinData();
    const body = (await request.json()) as Record<string, unknown>;
    const command = CreateTwinCommandSchema.parse({
      ...body,
      ...scope,
      createdBy: scope.userId,
      definition: body['definition'] ?? starterDefinitionForType(String(body['type'] ?? 'GENERIC')),
    });
    return NextResponse.json({ data: await twinRepository.create(command) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
