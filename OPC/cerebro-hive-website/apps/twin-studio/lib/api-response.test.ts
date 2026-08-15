import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { apiError } from './api-response';

async function payload(error: unknown) {
  const response = apiError(error);
  return { status: response.status, body: (await response.json()) as { error: { code: string; message: string } } };
}

describe('apiError', () => {
  it('maps Zod validation failures to 400 VALIDATION_ERROR', async () => {
    const result = await payload(new ZodError([]));
    expect(result.status).toBe(400);
    expect(result.body.error.code).toBe('VALIDATION_ERROR');
    expect(result.body.error.message).toBe('The request contains invalid fields.');
  });

  it('maps invalid JSON to 400 VALIDATION_ERROR instead of a generic 500', async () => {
    const result = await payload(new SyntaxError('Unexpected token o in JSON at position 1'));
    expect(result.status).toBe(400);
    expect(result.body.error.code).toBe('VALIDATION_ERROR');
    expect(result.body.error.message).toBe('The request body is not valid JSON.');
  });

  it('maps LLM_UNAVAILABLE to 503 with a non-generic message', async () => {
    const result = await payload(new Error('LLM_UNAVAILABLE'));
    expect(result.status).toBe(503);
    expect(result.body.error.code).toBe('LLM_UNAVAILABLE');
    expect(result.body.error.message).toBe('llm unavailable');
  });
});
