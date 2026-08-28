import { describe, expect, it } from 'vitest';
import { parseCompletionMetadata } from '../../src/hooks/gatewayMetadata';

describe('parseCompletionMetadata', () => {
  it('normalizes valid terminal cost into token usage', () => {
    expect(
      parseCompletionMetadata({
        evaluations: { safety: 0.99, quality: 0.95 },
        tokens: { prompt: 150, completion: 42, total: 192 },
        cost: 0.002,
      }),
    ).toEqual({
      evaluations: { safety: 0.99, quality: 0.95 },
      tokens: { prompt: 150, completion: 42, total: 192, cost: 0.002 },
    });
  });

  it('rejects incomplete, missing-cost, or non-numeric SDK metadata', () => {
    expect(parseCompletionMetadata({ evaluations: { safety: '0.99' } })).toBeUndefined();
    expect(
      parseCompletionMetadata({
        evaluations: { safety: 0.99 },
        tokens: { prompt: 150, completion: 42 },
        cost: 0.002,
      }),
    ).toBeUndefined();
    expect(
      parseCompletionMetadata({
        evaluations: { safety: 0.99 },
        tokens: { prompt: 150, completion: 42, total: 192 },
      }),
    ).toBeUndefined();
    expect(
      parseCompletionMetadata({
        evaluations: { safety: 0.99 },
        tokens: { prompt: 150, completion: 42, total: 192 },
        cost: '0.002',
      }),
    ).toBeUndefined();
  });
});
