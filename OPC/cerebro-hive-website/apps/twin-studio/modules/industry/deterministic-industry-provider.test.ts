import { describe, expect, it } from 'vitest';
import { DeterministicIndustryProvider } from './deterministic-industry-provider';

const provider = new DeterministicIndustryProvider();

describe('deterministic industry generator', () => {
  it('produces structurally distinct airport and banking proposals', () => {
    const airport = provider.generate({ brief: 'Airport gate B12 aircraft turnaround' });
    const bank = provider.generate({ brief: 'Retail bank branch with ATM vault cash' });
    expect(airport.previewOnly).toBe(true);
    expect(bank.previewOnly).toBe(true);
    expect(airport.industry).toBe('airport');
    expect(bank.industry).toBe('banking');
    expect(airport.definition.entityTypes.map((type) => type.key)).toContain('gate');
    expect(bank.definition.entityTypes.map((type) => type.key)).toContain('atm');
    expect(airport.definition.entityTypes.map((type) => type.key)).not.toEqual(
      bank.definition.entityTypes.map((type) => type.key),
    );
  });

  it('does not persist or mutate an existing twin during generation', () => {
    const before = { id: 'twin-1', name: 'Factory Alpha' };
    const proposal = provider.generate({
      brief: 'Hospital ICU bed turnover and oxygen flow',
      name: 'Northstar Hospital ICU',
    });
    expect(proposal.industry).toBe('hospital');
    expect(proposal.definition.entityTypes.some((type) => type.key === 'icu-bed')).toBe(true);
    expect(before).toEqual({ id: 'twin-1', name: 'Factory Alpha' });
  });
});
