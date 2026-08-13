import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError } from '../../../../lib/api-response';
import { authenticatedRequestContext } from '../../../../lib/authenticated-request-context';
import { ensureDevelopmentTwinData, twinRepository } from '../../../../lib/twin-runtime';

type RouteContext = { params: Promise<{ twinId: string }> };

const UpdateTwinSchema = z
  .object({
    name: z.string().trim().min(1).max(160).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((input) => input.name !== undefined || input.metadata !== undefined, {
    message: 'At least one field is required.',
  });

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const scope = await authenticatedRequestContext(request, 'READ');
    await ensureDevelopmentTwinData();
    const twin = await twinRepository.getById(scope, (await params).twinId);
    if (!twin) throw new Error('TWIN_NOT_FOUND');
    return NextResponse.json({ data: twin });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const scope = await authenticatedRequestContext(request, 'WRITE');
    const input = UpdateTwinSchema.parse(await request.json());
    const twin = await twinRepository.update(scope, (await params).twinId, {
      ...(input.name ? { name: input.name } : {}),
      ...(input.metadata ? { metadata: input.metadata } : {}),
      updatedBy: scope.userId,
    });
    return NextResponse.json({ data: twin });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const scope = await authenticatedRequestContext(request, 'WRITE');
    await twinRepository.archive(scope, (await params).twinId, scope.userId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
