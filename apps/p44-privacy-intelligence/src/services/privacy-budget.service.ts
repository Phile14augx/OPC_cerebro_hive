import { Injectable, BadRequestException } from '@nestjs/common';
import { PrivacyBudget } from '../models/privacy-budget.model';
import * as crypto from 'crypto';

export interface BudgetEventEmitter {
  emit(event: string, payload: any): void;
}

@Injectable()
export class PrivacyBudgetService {
  private budgets: PrivacyBudget[] = [];
  
  // Injecting an emitter or using a generic one
  constructor(private eventEmitter?: BudgetEventEmitter) {}

  initialiseBudget(subjectId: string, epsilonTotal: number, deltaTotal: number): PrivacyBudget {
    const existing = this.budgets.find(b => b.datasetId === subjectId);
    if (existing) {
      throw new BadRequestException('Budget already initialised for this subject');
    }
    const budget: PrivacyBudget = {
      id: crypto.randomUUID(),
      datasetId: subjectId,
      epsilonTotal,
      epsilonUsed: 0,
      deltaTotal,
      deltaUsed: 0,
      updatedAt: new Date(),
    };
    this.budgets.push(budget);
    return budget;
  }

  consumeBudget(subjectId: string, epsilonCost: number, deltaCost: number): PrivacyBudget {
    const budget = this.budgets.find(b => b.datasetId === subjectId);
    if (!budget) {
      throw new BadRequestException('Budget not found for this subject');
    }

    if (budget.epsilonUsed + epsilonCost > budget.epsilonTotal || budget.deltaUsed + deltaCost > budget.deltaTotal) {
      this.eventEmitter?.emit('governance.privacy.budget.consumed', { subjectId, exceeded: true });
      throw new BadRequestException('Privacy budget exceeded');
    }

    budget.epsilonUsed += epsilonCost;
    budget.deltaUsed += deltaCost;
    budget.updatedAt = new Date();

    if (budget.epsilonUsed >= budget.epsilonTotal || budget.deltaUsed >= budget.deltaTotal) {
      this.eventEmitter?.emit('governance.privacy.budget.consumed', { subjectId, exceeded: true });
    }

    return budget;
  }

  checkBudgetExceeded(subjectId: string): boolean {
    const budget = this.budgets.find(b => b.datasetId === subjectId);
    if (!budget) {
      return false; // or throw, but false is safer if no budget
    }
    return budget.epsilonUsed >= budget.epsilonTotal || budget.deltaUsed >= budget.deltaTotal;
  }
}
