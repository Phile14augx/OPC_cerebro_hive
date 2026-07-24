export type CriticalityLevel = 'Low' | 'Medium' | 'High' | 'MissionCritical';

export interface BusinessImpactAnalysis {
  biaId: string;
  serviceId: string;
  
  criticality: CriticalityLevel;
  
  // Stated Business Requirements
  requiredRtoHours: number;
  requiredRpoHours: number;
  maximumTolerableDowntimeHours: number;
  
  // Impacts
  financialImpact: string;
  regulatoryImpact: string;
  customerImpact: string;

  lastReviewedAt: Date;
}

export interface BusinessService {
  serviceId: string;
  name: string;
  description: string;
  owner: string;
  
  bia?: BusinessImpactAnalysis;
  
  // Operational state computed by Analyzer
  effectiveRtoHours?: number; 
  resilienceViolations: string[];
}

export class BiaRegistry {
  private services = new Map<string, BusinessService>();

  registerService(service: BusinessService) {
    this.services.set(service.serviceId, service);
  }

  getService(serviceId: string): BusinessService | undefined {
    return this.services.get(serviceId);
  }

  getAllServices(): BusinessService[] {
    return Array.from(this.services.values());
  }
}
