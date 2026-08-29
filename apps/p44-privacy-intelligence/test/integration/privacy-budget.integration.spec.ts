import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import {
  BudgetEventEmitter,
  PrivacyBudgetService,
} from '../../src/services/privacy-budget.service';

class RecordingBudgetEmitter implements BudgetEventEmitter {
  readonly events: Array<{ event: string; payload: unknown }> = [];

  emit(event: string, payload: unknown): void {
    this.events.push({ event, payload });
  }
}

describe('Privacy Budget Integration', () => {
  it('accumulates epsilon and delta costs without emitting before the limit', () => {
    const emitter = new RecordingBudgetEmitter();
    const budgets = new PrivacyBudgetService(emitter);
    budgets.initialiseBudget('dataset-1', 3, 0.03);

    budgets.consumeBudget('dataset-1', 1, 0.01);
    const current = budgets.consumeBudget('dataset-1', 1, 0.01);

    expect(current).toMatchObject({
      datasetId: 'dataset-1',
      epsilonUsed: 2,
      deltaUsed: 0.02,
    });
    expect(budgets.checkBudgetExceeded('dataset-1')).toBe(false);
    expect(emitter.events).toEqual([]);
  });

  it('marks an exactly consumed budget as exceeded and emits its governance event', () => {
    const emitter = new RecordingBudgetEmitter();
    const budgets = new PrivacyBudgetService(emitter);
    budgets.initialiseBudget('dataset-2', 2, 0.02);

    budgets.consumeBudget('dataset-2', 2, 0.02);

    expect(budgets.checkBudgetExceeded('dataset-2')).toBe(true);
    expect(emitter.events).toEqual([
      {
        event: 'governance.privacy.budget.consumed',
        payload: { subjectId: 'dataset-2', exceeded: true },
      },
    ]);
  });

  it('rejects over-consumption without mutating the previously consumed amount', () => {
    const emitter = new RecordingBudgetEmitter();
    const budgets = new PrivacyBudgetService(emitter);
    budgets.initialiseBudget('dataset-3', 2, 0.02);
    const current = budgets.consumeBudget('dataset-3', 1, 0.01);

    expect(() => budgets.consumeBudget('dataset-3', 2, 0)).toThrow(BadRequestException);
    expect(current).toMatchObject({ epsilonUsed: 1, deltaUsed: 0.01 });
    expect(emitter.events).toEqual([
      {
        event: 'governance.privacy.budget.consumed',
        payload: { subjectId: 'dataset-3', exceeded: true },
      },
    ]);
  });
});
