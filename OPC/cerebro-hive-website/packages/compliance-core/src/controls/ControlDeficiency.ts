export interface ControlDeficiency {
  id: string;
  controlObjectiveId: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  detectedAt: Date;
  
  // Link back to what evidence was evaluated (or missing)
  relatedEvidenceIds: string[];
  
  recommendedRemediation: string;
  status: 'Open' | 'Remediating' | 'Resolved' | 'RiskAccepted';
}
