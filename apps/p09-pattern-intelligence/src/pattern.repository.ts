import { DetectedPattern, TenantContext } from './types';

export class PatternRepository {
  private patterns: Map<string, DetectedPattern[]> = new Map();

  savePattern(tenantContext: TenantContext, pattern: Omit<DetectedPattern, 'id' | 'timestamp'>): DetectedPattern {
    this.checkContext(tenantContext);
    
    const tenantId = tenantContext.tenantId;
    if (!this.patterns.has(tenantId)) {
      this.patterns.set(tenantId, []);
    }

    const newPattern: DetectedPattern = {
      ...pattern,
      id: `pat-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
    };

    this.patterns.get(tenantId)!.push(newPattern);
    return newPattern;
  }

  getPatterns(tenantContext: TenantContext): DetectedPattern[] {
    this.checkContext(tenantContext);
    return this.patterns.get(tenantContext.tenantId) || [];
  }

  private checkContext(tenantContext: TenantContext) {
    if (!tenantContext || !tenantContext.tenantId) {
      throw new Error('Unauthorized access to tenant patterns: Invalid TenantContext');
    }
  }
}
