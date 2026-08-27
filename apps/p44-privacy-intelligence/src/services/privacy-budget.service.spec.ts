import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrivacyBudgetService, BudgetEventEmitter } from './privacy-budget.service';
import { BadRequestException } from '@nestjs/common';

describe('PrivacyBudgetService', () => {
  let service: PrivacyBudgetService;
  let mockEmitter: BudgetEventEmitter;

  beforeEach(() => {
    mockEmitter = {
      emit: vi.fn(),
    };
    service = new PrivacyBudgetService(mockEmitter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialise a budget', () => {
    const budget = service.initialiseBudget('ds-1', 10.0, 1e-5);
    expect(budget.datasetId).toBe('ds-1');
    expect(budget.epsilonTotal).toBe(10.0);
    expect(budget.deltaTotal).toBe(1e-5);
    expect(budget.epsilonUsed).toBe(0);
    expect(budget.deltaUsed).toBe(0);
  });

  it('should throw if budget already initialised', () => {
    service.initialiseBudget('ds-1', 10.0, 1e-5);
    expect(() => service.initialiseBudget('ds-1', 5.0, 1e-6)).toThrow(BadRequestException);
  });

  it('should consume budget', () => {
    service.initialiseBudget('ds-1', 10.0, 1e-5);
    const updated = service.consumeBudget('ds-1', 2.0, 1e-6);
    expect(updated.epsilonUsed).toBe(2.0);
    expect(updated.deltaUsed).toBe(1e-6);
    expect(service.checkBudgetExceeded('ds-1')).toBe(false);
  });

  it('should throw if consuming non-existent budget', () => {
    expect(() => service.consumeBudget('ds-2', 1.0, 0)).toThrow(BadRequestException);
  });

  it('should throw and emit event if budget exceeded', () => {
    service.initialiseBudget('ds-1', 10.0, 1e-5);
    expect(() => service.consumeBudget('ds-1', 11.0, 0)).toThrow(BadRequestException);
    expect(mockEmitter.emit).toHaveBeenCalledWith('governance.privacy.budget.consumed', { subjectId: 'ds-1', exceeded: true });
  });

  it('should emit event if budget exactly reached', () => {
    service.initialiseBudget('ds-1', 10.0, 1e-5);
    service.consumeBudget('ds-1', 10.0, 0);
    expect(mockEmitter.emit).toHaveBeenCalledWith('governance.privacy.budget.consumed', { subjectId: 'ds-1', exceeded: true });
    expect(service.checkBudgetExceeded('ds-1')).toBe(true);
  });

  it('checkBudgetExceeded should return false for unknown dataset', () => {
    expect(service.checkBudgetExceeded('unknown')).toBe(false);
  });
});
