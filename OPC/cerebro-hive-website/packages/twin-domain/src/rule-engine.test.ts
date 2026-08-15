import { describe, expect, it } from 'vitest';
import { evaluateTwinRule, evaluateTwinRules, lookupStateValue } from './rule-engine';

const bearing = { key: 'bearing-risk', expression: 'vibration > 6.5 && temperature > 76' };

describe('evaluateTwinRules', () => {
  it('fires the manufacturing bearing-risk rule against stored measurements', () => {
    expect(evaluateTwinRule(bearing, { vibration: 7.1, temperature: 80 }).fired).toBe(true);
    expect(evaluateTwinRule(bearing, { vibration: 3.4, temperature: 80 }).fired).toBe(false);
    expect(evaluateTwinRule(bearing, { vibration: 7.1, temperature: 70 }).fired).toBe(false);
  });

  it('looks up kebab-case rule variables from camelCase state', () => {
    const rule = { key: 'turnover-delay', expression: 'turnover-minutes > 45' };
    expect(evaluateTwinRule(rule, { turnoverMinutes: 48 }).fired).toBe(true);
    expect(evaluateTwinRule(rule, { 'turnover-minutes': 12 }).fired).toBe(false);
    expect(lookupStateValue({ turnoverMinutes: 48 }, 'turnover-minutes')).toBe(48);
  });

  it('does not fire when a referenced measurement is missing', () => {
    expect(evaluateTwinRule(bearing, { vibration: 9 }).fired).toBe(false);
    expect(evaluateTwinRule(bearing, {}).fired).toBe(false);
  });

  it('evaluates ||, parentheses, equality, and boolean literals', () => {
    expect(
      evaluateTwinRule(
        { key: 'either', expression: '(vibration > 6.5) || (temperature > 76)' },
        { vibration: 3, temperature: 80 },
      ).fired,
    ).toBe(true);
    expect(evaluateTwinRule({ key: 'occupied', expression: 'occupancy == true' }, { occupancy: true }).fired).toBe(
      true,
    );
    expect(evaluateTwinRule({ key: 'clear', expression: 'alert != true' }, { alert: false }).fired).toBe(true);
  });

  it('refuses expressions that would require eval or unexpected syntax', () => {
    const injected = evaluateTwinRule(
      { key: 'inject', expression: 'vibration > 6.5; process.exit(1)' },
      { vibration: 9 },
    );
    expect(injected.fired).toBe(false);
    expect(injected.parseError).toBeTruthy();
    const member = evaluateTwinRule({ key: 'member', expression: 'process.env' }, {});
    expect(member.fired).toBe(false);
    expect(member.parseError).toBeTruthy();
  });

  it('returns one evaluation per rule without inventing extra events', () => {
    const results = evaluateTwinRules(
      [bearing, { key: 'turnover-delay', expression: 'turnover-minutes > 45' }],
      { vibration: 7, temperature: 80, turnoverMinutes: 10 },
    );
    expect(results.map((item) => [item.key, item.fired])).toEqual([
      ['bearing-risk', true],
      ['turnover-delay', false],
    ]);
  });
});
