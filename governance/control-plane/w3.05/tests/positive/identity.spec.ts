import { describe, expect, it } from 'vitest';
import { resolveIdentity } from '../../src/identity.js';

describe('Identity Resolution (Positive)', () => {
  it('resolves CODEX_B0 to PRODUCT_BUILDER', () => {
    expect(resolveIdentity('CODEX_B0')).toMatchObject({
      id: 'CODEX_B0',
      provider: 'codex',
      role: 'PRODUCT_BUILDER'
    });
  });

  it('resolves CODEX_V0 to PRODUCT_VERIFIER', () => {
    expect(resolveIdentity('CODEX_V0')).toMatchObject({
      id: 'CODEX_V0',
      provider: 'codex',
      role: 'PRODUCT_VERIFIER'
    });
  });

  it('resolves CODEX_A0 to PRODUCT_ARCHITECT', () => {
    expect(resolveIdentity('CODEX_A0')).toMatchObject({
      id: 'CODEX_A0',
      provider: 'codex',
      role: 'PRODUCT_ARCHITECT'
    });
  });

  it('resolves ANTIGRAVITY_W305_V0 to RECOVERY_VERIFIER', () => {
    expect(resolveIdentity('ANTIGRAVITY_W305_V0')).toMatchObject({
      id: 'ANTIGRAVITY_W305_V0',
      provider: 'antigravity',
      role: 'RECOVERY_VERIFIER'
    });
  });

  it('resolves ANTIGRAVITY_W305_B0 to RECOVERY_BUILDER', () => {
    expect(resolveIdentity('ANTIGRAVITY_W305_B0')).toMatchObject({
      id: 'ANTIGRAVITY_W305_B0',
      provider: 'antigravity',
      role: 'RECOVERY_BUILDER'
    });
  });

  it('resolves GOVERNOR_0 to PORTFOLIO_GOVERNOR', () => {
    expect(resolveIdentity('GOVERNOR_0')).toMatchObject({
      id: 'GOVERNOR_0',
      provider: 'governor',
      role: 'PORTFOLIO_GOVERNOR'
    });
  });

  it('resolves CI_AUDITOR_0 to CI_AUDITOR', () => {
    expect(resolveIdentity('CI_AUDITOR_0')).toMatchObject({
      id: 'CI_AUDITOR_0',
      provider: 'ci',
      role: 'CI_AUDITOR'
    });
  });

  it('resolves INTEGRATION_AUDITOR_0 to INTEGRATION_AUDITOR', () => {
    expect(resolveIdentity('INTEGRATION_AUDITOR_0')).toMatchObject({
      id: 'INTEGRATION_AUDITOR_0',
      provider: 'integration',
      role: 'INTEGRATION_AUDITOR'
    });
  });

  it('resolves SHARED_INFRA_B0 to SHARED_INFRA_BUILDER', () => {
    expect(resolveIdentity('SHARED_INFRA_B0')).toMatchObject({
      id: 'SHARED_INFRA_B0',
      provider: 'shared',
      role: 'SHARED_INFRA_BUILDER'
    });
  });
});
