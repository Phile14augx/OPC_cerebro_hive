import {
  ApplyVersionProposalCommandSchema,
  CreateScenarioCommandSchema,
  CreateVersionProposalCommandSchema,
  RejectVersionProposalCommandSchema,
  UpdateEntityStateCommandSchema,
  type TwinDefinition,
} from '@cerebro/twin-contracts';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError } from './api-response';
import { authenticatedRequestContext } from './authenticated-request-context';
import { ensureDevelopmentTwinData, twinRepository } from './twin-runtime';
import { askTwinFromStates } from '../modules/intelligence/ask-twin-service';
import { simulateEntityObservation } from '../modules/simulation/observation-simulator';
import { evaluateTwinDefinitionPolicy } from '../modules/twin-definition/twin-policy';

const UpdateTwinSchema = z
  .object({
    name: z.string().trim().min(1).max(160).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((input) => input.name !== undefined || input.metadata !== undefined, {
    message: 'At least one field is required.',
  });
const AskInputSchema = z.object({ prompt: z.string().trim().min(1).max(2_000) });
const SimulatorInputSchema = z.object({ tick: z.coerce.number().int().min(0).max(8) });
const RunScenarioSchema = z.object({ action: z.literal('RUN'), scenarioId: z.string().uuid() });

export async function handleTwinGet(request: NextRequest, twinId: string) {
  try {
    const scope = await authenticatedRequestContext(request, 'READ');
    await ensureDevelopmentTwinData();
    const twin = await twinRepository.getById(scope, twinId);
    if (!twin) throw new Error('TWIN_NOT_FOUND');
    return NextResponse.json({ data: twin });
  } catch (error) {
    return apiError(error);
  }
}

export async function handleTwinPatch(request: NextRequest, twinId: string) {
  try {
    const scope = await authenticatedRequestContext(request, 'WRITE');
    const input = UpdateTwinSchema.parse(await request.json());
    const twin = await twinRepository.update(scope, twinId, {
      ...(input.name ? { name: input.name } : {}),
      ...(input.metadata ? { metadata: input.metadata } : {}),
      updatedBy: scope.userId,
    });
    return NextResponse.json({ data: twin });
  } catch (error) {
    return apiError(error);
  }
}

export async function handleTwinDelete(request: NextRequest, twinId: string) {
  try {
    const scope = await authenticatedRequestContext(request, 'WRITE');
    await twinRepository.archive(scope, twinId, scope.userId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}

export async function handleStateGet(request: NextRequest, twinId: string) {
  try {
    const scope = await authenticatedRequestContext(request, 'READ');
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

export async function handleStatePost(request: NextRequest, twinId: string) {
  try {
    const scope = await authenticatedRequestContext(request, 'WRITE');
    const body = (await request.json()) as Record<string, unknown>;
    const command = UpdateEntityStateCommandSchema.parse({
      ...body,
      ...scope,
      twinId,
    });
    return NextResponse.json({ data: await twinRepository.appendState(command) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function handleEventsGet(request: NextRequest, twinId: string) {
  try {
    const scope = await authenticatedRequestContext(request, 'READ');
    const take = Number(request.nextUrl.searchParams.get('take') ?? 200);
    return NextResponse.json({ data: await twinRepository.listEvents(scope, twinId, take) });
  } catch (error) {
    return apiError(error);
  }
}

export async function handleGraphGet(request: NextRequest, twinId: string) {
  try {
    const scope = await authenticatedRequestContext(request, 'READ');
    return NextResponse.json({ data: await twinRepository.getGraph(scope, twinId) });
  } catch (error) {
    return apiError(error);
  }
}

export async function handleAskPost(request: NextRequest, twinId: string) {
  try {
    const scope = await authenticatedRequestContext(request, 'READ');
    const { prompt } = AskInputSchema.parse(await request.json());
    const twin = await twinRepository.getById(scope, twinId);
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

export async function handleSimulatorPost(request: NextRequest, twinId: string) {
  try {
    const scope = await authenticatedRequestContext(request, 'WRITE');
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

export async function handleVersionsGet(request: NextRequest, twinId: string) {
  try {
    const scope = await authenticatedRequestContext(request, 'READ');
    const [versions, proposals] = await Promise.all([
      twinRepository.listVersions(scope, twinId),
      twinRepository.listProposals(scope, twinId),
    ]);
    return NextResponse.json({ data: { versions, proposals } });
  } catch (error) {
    return apiError(error);
  }
}

export async function handleVersionsPost(request: NextRequest, twinId: string) {
  try {
    const scope = await authenticatedRequestContext(request, 'WRITE');
    const body = (await request.json()) as Record<string, unknown>;
    if (body['action'] === 'APPLY') {
      const command = ApplyVersionProposalCommandSchema.parse({
        ...body,
        ...scope,
        twinId,
        appliedBy: scope.userId,
      });
      return NextResponse.json({ data: await twinRepository.applyProposal(command) });
    }
    if (body['action'] === 'REJECT') {
      const command = RejectVersionProposalCommandSchema.parse({
        ...body,
        ...scope,
        twinId,
      });
      return NextResponse.json({ data: await twinRepository.rejectProposal(command) });
    }
    const command = CreateVersionProposalCommandSchema.parse({
      ...body,
      ...scope,
      twinId,
      createdBy: scope.userId,
    });
    const policy = evaluateTwinDefinitionPolicy(command.definition);
    if (!policy.allowed) throw new Error('POLICY_REJECTED');
    return NextResponse.json({ data: await twinRepository.createProposal(command) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function handleScenariosGet(request: NextRequest, twinId: string) {
  try {
    const scope = await authenticatedRequestContext(request, 'READ');
    return NextResponse.json({
      data: await twinRepository.listScenarios(scope, twinId),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function handleScenariosPost(request: NextRequest, twinId: string) {
  try {
    const scope = await authenticatedRequestContext(request, 'WRITE');
    const body = (await request.json()) as Record<string, unknown>;
    if (body['action'] === 'RUN') {
      const { scenarioId } = RunScenarioSchema.parse(body);
      return NextResponse.json(
        { data: await twinRepository.runScenario(scope, twinId, scenarioId) },
        { status: 201 },
      );
    }
    const command = CreateScenarioCommandSchema.parse({
      ...body,
      ...scope,
      twinId,
      createdBy: scope.userId,
    });
    return NextResponse.json({ data: await twinRepository.createScenario(command) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
