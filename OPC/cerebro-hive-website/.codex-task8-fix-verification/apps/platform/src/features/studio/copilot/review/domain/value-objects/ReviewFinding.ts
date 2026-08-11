
export interface ReviewFinding {
  readonly id: string;
  readonly severity: 'PASS' | 'WARNING' | 'FAILED' | 'NOT_EXECUTED';
  readonly category: string;
  readonly message: string;
  readonly contributorId: string;
  readonly evidenceRefs: string[]; // references to EvidenceNodes
  readonly confidence: number;
}
