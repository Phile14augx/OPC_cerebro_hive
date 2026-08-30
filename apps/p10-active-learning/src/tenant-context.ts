/**
 * TenantContext — mandatory tenant isolation value object.
 *
 * Every service method that touches persistence MUST receive a TenantContext.
 * Failure to supply one throws at construction time so mistakes surface early.
 */
export class TenantContext {
  readonly tenantId: string;

  constructor(tenantId: string) {
    if (!tenantId || tenantId.trim().length === 0) {
      throw new Error('TenantContext: tenantId must be a non-empty string');
    }
    this.tenantId = tenantId.trim();
  }

  toString(): string {
    return `TenantContext(${this.tenantId})`;
  }
}
