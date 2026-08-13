import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError } from '../../../../../lib/api-response';
import { authenticatedRequestContext } from '../../../../../lib/authenticated-request-context';
import { twinRepository } from '../../../../../lib/twin-runtime';
import { simulateEntityObservation } from '../../../../../modules/simulation/observation-simulator';
import type { TwinDefinition } from '@cerebro/twin-contracts';

type RouteContext = { params: Promise<{ twinId: string }> };
const SimulatorInputSchema = z.object({ tick: z.coerce.number().int().min(0).max(8) });

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const scope = await authenticatedRequestContext(request, 'WRITE');
    const twinId = (await params).twinId;
    const { tick } = SimulatorInputSchema.parse(await request.json());
    const twin = await twinRepository.getById(scope, twinId);
    if (!twin) throw new Error('TWIN_NOT_FOUND');
    const definition = (twin.activeVersion?.definition ?? {
      variables: [],
    }) as TwinDefinition;
    const at = new Date();
    const observations = [];
    for (const entity of twin.entities) {
      const current = (entity.currentState?.state ?? {}) as Record<string, unknown>;
      const output = simulateEntityObservation({
        entityKey: entity.key,
        variables: definition.variables ?? [],
        current,
        tick,
        at,
      });
      await twinRepository.appendState({
        ...scope,
        twinId,
        entityId: entity.id,
        state: output.state,
        provenance: {
          ...output.provenance,
          ingestedAt: new Date(),
        },
      });
      observations.push({ entityId: entity.id, ...output });
    }
    return NextResponse.json({
      data: observations,
      meta: { mode: 'SIMULATED', tick, persisted: true },
    });
  } catch (error) {
    return apiError(error);
  }
}
