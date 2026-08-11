export type ControlStatus = 'Satisfied' | 'PartiallySatisfied' | 'Deficient' | 'Unknown' | 'NotApplicable';

export interface EvidenceRequirement {
  id: string;
  description: string;
  sourceEventTypes: string[];
}

export interface ControlRequirement {
  id: string;
  description: string;
  evidenceRequirements: EvidenceRequirement[];
}

export interface ControlObjective {
  id: string; // e.g., 'CC6.1'
  family: string; // e.g., 'Logical Access'
  description: string;
  requirements: ControlRequirement[];
  status: ControlStatus;
}

export interface ControlFamily {
  id: string;
  name: string;
  objectives: ControlObjective[];
}

export interface ComplianceFramework {
  id: string; // e.g., 'SOC2-2022'
  name: string;
  version: string;
  families: ControlFamily[];
}
