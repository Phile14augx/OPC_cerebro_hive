import {
  ApplyVersionProposalCommandSchema,
  CreateVersionProposalCommandSchema,
  RejectVersionProposalCommandSchema,
} from '@cerebro/twin-contracts';
import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '../../../../../lib/api-response';
import { authenticatedRequestContext } from '../../../../../lib/authenticated-request-context';
import { twinRepository } from '../../../../../lib/twin-runtime';
import { evaluateTwinDefinitionPolicy } from '../../../../../modules/twin-definition/twin-policy';

type RouteContext = { params: Promise<{ twinId: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const scope = await authenticatedRequestContext(request, 'READ');
    const { twinId } = await params;
    const [versions, proposals] = await Promise.all([
      twinRepository.listVersions(scope, twinId),
      twinRepository.listProposals(scope, twinId),
    ]);
    return NextResponse.json({ data: { versions, proposals } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const scope = await authenticatedRequestContext(request, 'WRITE');
    const twinId = (await params).twinId;
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
