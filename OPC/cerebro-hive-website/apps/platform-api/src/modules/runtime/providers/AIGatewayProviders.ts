import { RuntimeRegistry, CapabilityDescriptor } from '@cerebro/runtime-core';
import type { LLMProvider, LLMMessage, ExecutionContext } from '@cerebro/runtime-core';
import type { AIGateway } from '@cerebro/ai-gateway';

/**
 * Real LLMProvider backed by the production AIGateway (circuit breaker,
 * rate limiting, caching, cost tracking, telemetry — see
 * packages/ai-gateway/src/gateway.ts). Registered at higher priority than
 * MockLLMProvider so RuntimeRegistry.resolve() prefers it whenever it's
 * healthy.
 */
export class AIGatewayLLMProvider implements LLMProvider {
  constructor(private readonly gateway: AIGateway) {}

  async initialize(): Promise<void> {}
  async dispose(): Promise<void> {}

  async invokeModel(
    messages: LLMMessage[],
    context: ExecutionContext,
    onToken?: (token: string) => void
  ): Promise<string> {
    const model = context.modelSelection?.model;
    const maxTokens = context.budget?.tokens;
    // `provider` is intentionally not forwarded to the gateway request —
    // AIGateway already does its own priority + health-based provider
    // selection and failover; pinning a specific provider here would only
    // get in the way of that.

    if (onToken) {
      let full = '';
      for await (const chunk of this.gateway.stream({ messages, model, maxTokens })) {
        if (chunk.delta) {
          onToken(chunk.delta);
          full += chunk.delta;
        }
      }
      return full;
    }

    const response = await this.gateway.chat({ messages, model, maxTokens });
    return response.content;
  }
}

/**
 * Registers the real AIGateway-backed LLM provider into the shared
 * RuntimeRegistry, alongside (not instead of) the mock providers registered
 * by registerMockProviders(). Priority 100 vs. the mock's 10, so resolve()
 * prefers this one once it's marked Healthy.
 *
 * Guarded against double-registration because RuntimeRegistry is a
 * process-wide singleton and `dev` runs via `tsx watch` — without this
 * guard, a hot-reload would hit CapabilityDescriptor's "already registered"
 * throw. (registerMockProviders() has the same latent gap; not fixed here —
 * out of scope for this change.)
 */
export function registerAIGatewayProvider(gateway: AIGateway): void {
  const registry = RuntimeRegistry.getInstance();

  const alreadyRegistered = registry
    .listCapabilities()
    .some((d) => d.metadata.capability === 'LLMProvider' && d.metadata.name === 'AIGateway-LLM');
  if (alreadyRegistered) return;

  const descriptor = new CapabilityDescriptor<LLMProvider>(
    {
      name: 'AIGateway-LLM',
      capability: 'LLMProvider',
      version: '1.0.0',
      priority: 100,
      supportedFeatures: ['streaming'],
      costClass: 'Medium',
    },
    () => new AIGatewayLLMProvider(gateway)
  );

  registry.register(descriptor);

  // Epic 4 (Runtime Health Integration): reflect AIGateway's real circuit
  // breaker state instead of a static 'Healthy' flag set once at
  // registration. AIGateway only exposes a point-in-time getHealth()
  // snapshot (no change events), so this polls rather than pushing.
  syncHealth(descriptor, gateway);
  const interval = setInterval(() => syncHealth(descriptor, gateway), 15_000);
  interval.unref?.();
}

function syncHealth(descriptor: CapabilityDescriptor<LLMProvider>, gateway: AIGateway): void {
  descriptor.setHealth(computeHealthFromGateway(gateway));
}

/**
 * Maps AIGateway's per-provider circuit breaker states onto the registry's
 * three-state health:
 *  - every provider CLOSED           -> Healthy
 *  - some but not all OPEN/HALF_OPEN -> Degraded (failover still works)
 *  - every provider OPEN, or none    -> Unavailable
 * Exported standalone so it's unit-testable without a timer or a real
 * gateway (see AIGatewayProviders.test.ts).
 */
export function computeHealthFromGateway(gateway: AIGateway): 'Healthy' | 'Degraded' | 'Unavailable' {
  const { providers } = gateway.getHealth();
  if (providers.length === 0) return 'Unavailable';
  if (providers.every((p) => p.circuitState === 'OPEN')) return 'Unavailable';
  if (providers.some((p) => p.circuitState !== 'CLOSED')) return 'Degraded';
  return 'Healthy';
}
