export type AgentRole = 
  | 'PORTFOLIO_GOVERNOR'
  | 'RECOVERY_BUILDER'
  | 'RECOVERY_VERIFIER'
  | 'PRODUCT_BUILDER'
  | 'PRODUCT_VERIFIER'
  | 'PRODUCT_ARCHITECT'
  | 'CI_AUDITOR'
  | 'INTEGRATION_AUDITOR'
  | 'SHARED_INFRA_BUILDER';

export function resolveIdentity(identity: unknown): { id: string; provider: string; role: AgentRole } {
  if (typeof identity !== 'string' || identity.trim() === '') {
    throw new Error('Malformed identity string: must be a non-empty string');
  }

  if (/\s/.test(identity)) {
    throw new Error('Malformed identity string: must not contain whitespace or newlines');
  }

  const identityMap: Array<{ regex: RegExp; provider: string; role: AgentRole }> = [
    { regex: /^CODEX_B\d+$/, provider: 'codex', role: 'PRODUCT_BUILDER' },
    { regex: /^CODEX_V\d+$/, provider: 'codex', role: 'PRODUCT_VERIFIER' },
    { regex: /^CODEX_A\d+$/, provider: 'codex', role: 'PRODUCT_ARCHITECT' },
    { regex: /^ANTIGRAVITY_W305_V\d+$/, provider: 'antigravity', role: 'RECOVERY_VERIFIER' },
    { regex: /^ANTIGRAVITY_W305_B\d+$/, provider: 'antigravity', role: 'RECOVERY_BUILDER' },
    { regex: /^GOVERNOR_\d+$/, provider: 'governor', role: 'PORTFOLIO_GOVERNOR' },
    { regex: /^CI_AUDITOR_\d+$/, provider: 'ci', role: 'CI_AUDITOR' },
    { regex: /^INTEGRATION_AUDITOR_\d+$/, provider: 'integration', role: 'INTEGRATION_AUDITOR' },
    { regex: /^SHARED_INFRA_B\d+$/, provider: 'shared', role: 'SHARED_INFRA_BUILDER' }
  ];

  for (const mapping of identityMap) {
    if (mapping.regex.test(identity)) {
      return { id: identity, provider: mapping.provider, role: mapping.role };
    }
  }

  throw new Error('Unknown or malformed identity: ' + identity + '. Zero-trust execution denied.');
}
