
export type DiagnosticLevel = 'Error' | 'Warning' | 'Hint' | 'Information';

export interface Diagnostic {
  level: DiagnosticLevel;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface CompilerResult {
  schema: unknown | null;
  diagnostics: Diagnostic[];
  statistics: { nodeCount: number; edgeCount: number; estimatedCost: number };
}
