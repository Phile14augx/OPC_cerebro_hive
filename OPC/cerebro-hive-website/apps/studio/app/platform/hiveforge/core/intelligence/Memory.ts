/**
 * Multi-Scope AI Memory
 */

export type MemoryScope = "Session" | "Workspace" | "Organization" | "Platform";
export type MemoryType = "Working" | "Persistent";

export interface MemoryFact {
  id: string;
  scope: MemoryScope;
  type: MemoryType;
  fact: string;
  timestamp: string;
  sourceContextId?: string; // E.g., tied to a specific incident or workflow
}

export class AIMemory {
  private facts: MemoryFact[] = [];

  storeFact(fact: MemoryFact) {
    this.facts.push(fact);
  }

  retrieveContext(scope: MemoryScope, type?: MemoryType): MemoryFact[] {
    return this.facts.filter(f => f.scope === scope && (!type || f.type === type));
  }
  
  clearWorkingMemory(scope: MemoryScope) {
    this.facts = this.facts.filter(f => !(f.scope === scope && f.type === "Working"));
  }
}

export const aiMemory = new AIMemory();
