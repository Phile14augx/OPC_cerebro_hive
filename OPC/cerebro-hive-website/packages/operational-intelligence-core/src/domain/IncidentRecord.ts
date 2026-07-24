export interface IncidentRecord {
  incidentId: string;
  rootCauseNodeId?: string;
  blastRadiusNodeIds: string[];
  
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  
  businessImpact: string;
  slaBreached: boolean;
  customerImpact: boolean;
  
  startTime: Date;
  resolutionTime?: Date;
  timeToResolveMs?: number;
}
