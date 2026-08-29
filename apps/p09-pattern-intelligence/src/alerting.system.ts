import { Alert, TenantContext } from './types';

export class AlertingSystem {
  private alerts: Map<string, Alert[]> = new Map();

  triggerAlert(tenantContext: TenantContext, alert: Omit<Alert, 'id' | 'timestamp'>): Alert {
    this.checkContext(tenantContext);
    
    const tenantId = tenantContext.tenantId;
    if (!this.alerts.has(tenantId)) {
      this.alerts.set(tenantId, []);
    }

    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
    };

    this.alerts.get(tenantId)!.push(newAlert);
    
    // In a real system, we'd publish this to the Event Bus
    console.log(`[ALERT] [Tenant: ${tenantId}] ${newAlert.severity.toUpperCase()} - ${newAlert.message}`);
    
    return newAlert;
  }

  getAlerts(tenantContext: TenantContext): Alert[] {
    this.checkContext(tenantContext);
    return this.alerts.get(tenantContext.tenantId) || [];
  }

  private checkContext(tenantContext: TenantContext) {
    if (!tenantContext || !tenantContext.tenantId) {
      throw new Error('Unauthorized access to tenant alerts: Invalid TenantContext');
    }
  }
}
