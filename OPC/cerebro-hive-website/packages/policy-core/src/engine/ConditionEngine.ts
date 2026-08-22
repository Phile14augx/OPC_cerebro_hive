import { PolicyCondition } from '../models/PolicyRule';

export type ConditionOperatorFn = (contextValue: unknown, conditionValue: unknown) => boolean;

export class ConditionEngine {
  private operators = new Map<string, ConditionOperatorFn>();

  constructor() {
    this.registerDefaultOperators();
  }

  registerOperator(name: string, fn: ConditionOperatorFn) {
    this.operators.set(name, fn);
  }

  private registerDefaultOperators() {
    this.registerOperator('eq', (a, b) => a === b);
    this.registerOperator('neq', (a, b) => a !== b);
    this.registerOperator('lt', (a, b) => (a as number) < (b as number));
    this.registerOperator('lte', (a, b) => (a as number) <= (b as number));
    this.registerOperator('gt', (a, b) => (a as number) > (b as number));
    this.registerOperator('gte', (a, b) => (a as number) >= (b as number));
    this.registerOperator('contains', (a, b) => Array.isArray(a) && a.includes(b));
    this.registerOperator('exists', (a, b) => (a !== undefined && a !== null) === b);
  }

  evaluateCondition(condition: PolicyCondition, evaluationContext: Record<string, unknown>): boolean {
    const operatorFn = this.operators.get(condition.operator);
    if (!operatorFn) {
      console.warn(`[ConditionEngine] Unknown operator: ${condition.operator}`);
      return false; // Fail safe
    }
    
    const contextValue = this.resolvePath(evaluationContext, condition.field);
    return operatorFn(contextValue, condition.value);
  }

  private resolvePath(obj: Record<string, unknown> | unknown, path: string): unknown {
    return path.split('.').reduce((prev, curr) => (prev && typeof prev === 'object' ? (prev as Record<string, unknown>)[curr] : undefined), obj);
  }
}
