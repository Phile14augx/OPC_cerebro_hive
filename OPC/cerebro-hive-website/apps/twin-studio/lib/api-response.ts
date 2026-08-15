import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

const statusByCode: Record<string, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  WORKSPACE_REQUIRED: 400,
  TWIN_NOT_FOUND: 404,
  ENTITY_NOT_FOUND: 404,
  SCENARIO_NOT_FOUND: 404,
  PROPOSAL_NOT_FOUND_OR_ALREADY_APPLIED: 409,
  PROPOSAL_ALREADY_APPLIED: 409,
  APPROVAL_REQUIRED: 409,
  POLICY_REJECTED: 422,
  LLM_UNAVAILABLE: 503,
};

function isInvalidJson(error: unknown) {
  if (error instanceof SyntaxError) return true;
  return error instanceof Error && /not valid JSON|Unexpected token|JSON\.parse/i.test(error.message);
}

export function apiError(error: unknown) {
  const traceId = crypto.randomUUID();
  if (error instanceof ZodError || isInvalidJson(error)) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message:
            error instanceof ZodError
              ? 'The request contains invalid fields.'
              : 'The request body is not valid JSON.',
          ...(error instanceof ZodError ? { details: error.flatten() } : {}),
          traceId,
        },
      },
      { status: 400 },
    );
  }
  const rawCode = error instanceof Error ? error.message : 'INTERNAL_ERROR';
  const code = statusByCode[rawCode] ? rawCode : 'INTERNAL_ERROR';
  const message =
    code === 'INTERNAL_ERROR'
      ? 'The request could not be completed.'
      : rawCode.replaceAll('_', ' ').toLowerCase();
  if (code === 'INTERNAL_ERROR') console.error(`[${traceId}] Twin Studio request failed`, error);
  return NextResponse.json(
    { error: { code, message, traceId } },
    { status: statusByCode[code] ?? 500 },
  );
}
