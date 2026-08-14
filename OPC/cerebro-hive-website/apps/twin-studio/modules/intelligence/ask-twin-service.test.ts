import { afterEach, describe, expect, it, vi } from 'vitest';
import { askTwinFromStates, resolveLlmConfig } from './ask-twin-service';

describe('ask twin', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns an empty-state answer without calling an LLM', async () => {
    const fetchImpl = vi.fn();
    const result = await askTwinFromStates([], 'What is happening?', fetchImpl, {});
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result.provider).toBe('none');
    expect(result.sourceKind).toBe('STORED_TWIN_STATE');
    expect(result.answer).toMatch(/No operational state/);
  });

  it('fails honestly when no LLM key is configured', async () => {
    await expect(
      askTwinFromStates(
        [
          {
            entityId: 'motor-07',
            entityName: 'Motor-07',
            state: { vibration: 9.6 },
            provenance: { classification: 'OBSERVED', source: 'sensor' },
          },
        ],
        'What is Motor-07 vibration?',
        vi.fn(),
        {},
      ),
    ).rejects.toThrow('LLM_UNAVAILABLE');
  });

  it('prefers OpenAI when AI_PROVIDER=openai and grounds the prompt in stored evidence', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                answer: 'Motor-07 vibration is 9.6.',
                recommendation: 'Inspect the bearing.',
                confidence: 0.9,
              }),
            },
          },
        ],
      }),
    });
    const result = await askTwinFromStates(
      [
        {
          entityId: 'motor-07',
          entityName: 'Motor-07',
          state: { vibration: 9.6 },
          provenance: { classification: 'OBSERVED', source: 'line-sensor' },
        },
      ],
      'What is Motor-07 vibration?',
      fetchImpl,
      { AI_PROVIDER: 'openai', OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'gpt-4o-mini' },
    );
    expect(resolveLlmConfig({ AI_PROVIDER: 'openai', OPENAI_API_KEY: 'test-key' })?.provider).toBe(
      'openai',
    );
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(String(init.body)).toContain('Motor-07');
    expect(String(init.body)).toContain('9.6');
    expect(result.provider).toBe('openai');
    expect(result.model).toBe('gpt-4o-mini');
    expect(result.answer).toContain('9.6');
    expect(result.evidence).toHaveLength(1);
  });
});
