export interface TenantContext {
  tenantId: string;
  roles: string[];
}

export interface DataPoint {
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface DetectedPattern {
  id: string;
  type: 'anomaly' | 'seasonality' | 'trend';
  sourceId: string;
  confidence: number;
  details: Record<string, any>;
  timestamp: number;
}

export interface Alert {
  id: string;
  sourceId: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}
