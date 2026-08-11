import { describe, it, expect, vi } from 'vitest';
import { AIGatewayLLMProvider, computeHealthFromGateway } from './AIGatewayProviders';
import type { AIGateway } from '@cerebro/ai-gateway';

function fakeContext(overrides: { model?: string; tokens?: number } = {}): any {
  return {
    modelSelection: { provider: 'auto', model: overrides.model ?? 'claude-sonnet-4-6' },
    budget: { tokens: overrides.tokens ?? 512 },
  };
}

describe('AIGatewayLLMProvider', () => {
  it('calls gateway.chat() with the messages and model/maxTokens from the context', async () => {
    const chat = vi.fn().mockResolvedValue({ content: 'real response' });
    const gateway = { chat, stream: vi.fn() } as unknown as AIGateway;
    const provider = new AIGatewayLLMProvider(gateway);

    const result = await provider.invokeModel(
      [{ role: 'user', content: 'hi' }],
      fakeContext({ model: 'gpt-4o', tokens: 256 })
    );

    expect(result).toBe('real response');
    expect(chat).toHaveBeenCalledWith({
      messages: [{ role: 'user', content: 'hi' }],
      model: 'gpt-4o',
      maxTokens: 256,
    });
  });

  it('streams via gateway.stream() and forwards each delta when onToken is provided', async () => {
    async function* fakeStream() {
      yield { id: '1', delta: 'Hel', done: false };
      yield { id: '1', delta: 'lo', done: true };
    }
    const stream = vi.fn().mockReturnValue(fakeStream());
    const gateway = { chat: vi.fn(), stream } as unknown as AIGateway;
    const provider = new AIGatewayLLMProvider(gateway);

    const tokens: string[] = [];
    const result = await provider.invokeModel([{ role: 'user', content: 'hi' }], fakeContext(), (t) => tokens.push(t));

    expect(tokens).toEqual(['Hel', 'lo']);
    expect(result).toBe('Hello');
    expect(stream).toHaveBeenCalled();
  });

  it('propagates errors from the gateway instead of swallowing them', async () => {
    const gateway = {
      chat: vi.fn().mockRejectedValue(new Error('provider down')),
      stream: vi.fn(),
    } as unknown as AIGateway;
    const provider = new AIGatewayLLMProvider(gateway);

    await expect(provider.invokeModel([], fakeContext())).rejects.toThrow('provider down');
  });
});

describe('computeHealthFromGateway', () => {
  function gatewayWith(states: string[]): AIGateway {
    return {
      getHealth: () => ({
        providers: states.map((circuitState, i) => ({ name: `p${i}`, circuitState })),
        cache: { size: 0, enabled: true },
      }),
    } as unknown as AIGateway;
  }

  it('is Healthy when every provider is CLOSED', () => {
    expect(computeHealthFromGateway(gatewayWith(['CLOSED', 'CLOSED']))).toBe('Healthy');
  });

  it('is Degraded when some but not all providers are open/half-open', () => {
    expect(computeHealthFromGateway(gatewayWith(['CLOSED', 'OPEN']))).toBe('Degraded');
    expect(computeHealthFromGateway(gatewayWith(['CLOSED', 'HALF_OPEN']))).toBe('Degraded');
  });

  it('is Unavailable when every provider is OPEN', () => {
    expect(computeHealthFromGateway(gatewayWith(['OPEN', 'OPEN']))).toBe('Unavailable');
  });

  it('is Unavailable when there are no providers registered at all', () => {
    expect(computeHealthFromGateway(gatewayWith([]))).toBe('Unavailable');
  });
});
