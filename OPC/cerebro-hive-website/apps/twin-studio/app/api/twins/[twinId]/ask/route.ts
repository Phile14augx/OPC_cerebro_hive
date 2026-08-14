import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError } from '../../../../../lib/api-response';
import { authenticatedRequestContext } from '../../../../../lib/authenticated-request-context';
import { twinRepository } from '../../../../../lib/twin-runtime';
import { askTwinFromStates } from '../../../../../modules/intelligence/ask-twin-service';

type RouteContext = { params: Promise<{ twinId: string }> };
const AskInputSchema = z.object({ prompt: z.string().trim().min(1).max(2_000) });

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const scope = await authenticatedRequestContext(request, 'READ');
    const { prompt } = AskInputSchema.parse(await request.json());
    const twin = await twinRepository.getById(scope, (await params).twinId);
    if (!twin) throw new Error('TWIN_NOT_FOUND');
    const states = twin.entities
      .filter((entity) => entity.currentState)
      .map((entity) => ({
        entityId: entity.id,
        entityName: entity.name,
        state: entity.currentState!.state as Record<string, unknown>,
        provenance: entity.currentState!.provenance as Record<string, unknown>,
      }));
    return NextResponse.json({ data: await askTwinFromStates(states, prompt) });
  } catch (error) {
    return apiError(error);
  }
}
