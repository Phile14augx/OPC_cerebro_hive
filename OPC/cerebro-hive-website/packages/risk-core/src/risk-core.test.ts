import { describe, expect, it } from 'vitest';
import { ScoringEngine } from './index';

describe('ScoringEngine', () => {
  const engine = new ScoringEngine();

  it('clamps likelihood and impact to the supported matrix before scoring', () => {
    expect(engine.calculateScore(9, -3)).toEqual({ likelihood: 5, impact: 1, score: 5 });
  });

  it.each([
    [{ likelihood: 1, impact: 5, score: 5 }, 'Low'],
    [{ likelihood: 2, impact: 3, score: 6 }, 'Medium'],
    [{ likelihood: 3, impact: 4, score: 12 }, 'High'],
    [{ likelihood: 4, impact: 5, score: 20 }, 'Critical'],
  ] as const)('maps matrix score $0.score to $1 risk', (score, rating) => {
    expect(engine.getRating(score)).toBe(rating);
  });

  it('applies mitigation and penalties by changing likelihood within matrix bounds', () => {
    const base = engine.calculateScore(4, 5);
    expect(engine.applyMitigation(base, 0.5)).toEqual({ likelihood: 2, impact: 5, score: 10 });
    expect(engine.applyPenalty(base, 0.5)).toEqual({ likelihood: 5, impact: 5, score: 25 });
  });
});
