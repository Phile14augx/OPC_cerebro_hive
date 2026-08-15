export interface ExecutionContextProps {
  executionId: string;
  workspaceId: string;
  tenantId: string;
  userId: string;
  variables: Record<string, any>;
  secretRefs: Record<string, string>; // References, not raw secrets
  policies: string[]; // List of active policy IDs/slugs
  knowledgeSnapshotId?: string;
  confidenceThreshold?: number; // e.g., 0.85
  modelSelection?: { provider: string; model: string };
  budget?: { tokens?: number; cost?: number; timeMs?: number };
}

/**
 * Immutable context injected into every execution.
 * The runtime should never fetch global mutable state directly; 
 * everything required for execution should come from the context.
 */
export class ExecutionContext {
  public readonly executionId: string;
  public readonly workspaceId: string;
  public readonly tenantId: string;
  public readonly userId: string;
  public readonly variables: Readonly<Record<string, any>>;
  public readonly secretRefs: Readonly<Record<string, string>>;
  public readonly policies: ReadonlyArray<string>;
  public readonly knowledgeSnapshotId?: string;
  public readonly confidenceThreshold?: number;
  public readonly modelSelection?: { readonly provider: string; readonly model: string };
  public readonly budget?: { readonly tokens?: number; readonly cost?: number; readonly timeMs?: number };

  constructor(props: ExecutionContextProps) {
    this.executionId = props.executionId;
    this.workspaceId = props.workspaceId;
    this.tenantId = props.tenantId;
    this.userId = props.userId;
    this.variables = Object.freeze({ ...props.variables });
    this.secretRefs = Object.freeze({ ...props.secretRefs });
    this.policies = Object.freeze([...props.policies]);
    this.knowledgeSnapshotId = props.knowledgeSnapshotId;
    this.confidenceThreshold = props.confidenceThreshold;
    
    if (props.modelSelection) {
      this.modelSelection = Object.freeze({ ...props.modelSelection });
    }
    
    if (props.budget) {
      this.budget = Object.freeze({ ...props.budget });
    }
  }

  /**
   * Creates a new ExecutionContext with updated properties, 
   * preserving immutability of the original context.
   */
  public withUpdates(updates: Partial<ExecutionContextProps>): ExecutionContext {
    return new ExecutionContext({
      executionId: this.executionId,
      workspaceId: this.workspaceId,
      tenantId: this.tenantId,
      userId: this.userId,
      variables: { ...this.variables, ...(updates.variables || {}) },
      secretRefs: { ...this.secretRefs, ...(updates.secretRefs || {}) },
      policies: updates.policies ? [...updates.policies] : [...this.policies],
      knowledgeSnapshotId: updates.knowledgeSnapshotId !== undefined ? updates.knowledgeSnapshotId : this.knowledgeSnapshotId,
      confidenceThreshold: updates.confidenceThreshold !== undefined ? updates.confidenceThreshold : this.confidenceThreshold,
      modelSelection: updates.modelSelection || this.modelSelection,
      budget: updates.budget || this.budget
    });
  }
}
