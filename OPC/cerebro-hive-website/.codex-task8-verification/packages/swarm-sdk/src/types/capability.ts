/**
 * HiveSwarm — Agent Capability Types
 *
 * Defines the 12 enterprise capability domains that swarm agents can advertise.
 * Each capability maps to a vertical or cross-cutting concern in the enterprise
 * AI operating system. Agents may hold multiple capabilities.
 */

// ── Core capability domains ────────────────────────────────────────────────────

export const SwarmCapability = {
  // Knowledge work
  RESEARCH:      "Research",       // Web search, literature synthesis, fact-checking
  CODING:        "Coding",         // Code generation, review, debugging, refactoring
  LEGAL:         "Legal",          // Contract analysis, compliance, regulatory research
  FINANCE:       "Finance",        // Financial modeling, analysis, reporting

  // Business functions
  MARKETING:     "Marketing",      // Copy, campaigns, SEO, content strategy
  SALES:         "Sales",          // Lead qualification, outreach, proposal drafting
  HR:            "HR",             // Job descriptions, screening, policy drafting

  // Technical domains
  ARCHITECTURE:  "Architecture",   // System design, ADRs, diagram generation
  TESTING:       "Testing",        // Test plan, spec generation, coverage analysis
  SECURITY:      "Security",       // Threat modeling, vuln analysis, pen-test planning

  // Data & Infrastructure
  DATABASE:      "Database",       // Schema design, query optimisation, migration scripts
  CLOUD:         "Cloud",          // IaC, cost optimisation, multi-cloud provisioning

  // Meta-cognitive (used internally by swarm intelligence layer)
  PLANNING:      "Planning",       // Breaks goals into DAG task trees
  ROUTING:       "Routing",        // Selects optimal agent for a task
  CRITIQUE:      "Critique",       // Evaluates and scores outputs
  REFLECTION:    "Reflection",     // Post-execution review and learning
  MEMORY:        "Memory",         // Retrieval-augmented context management
} as const;

export type SwarmCapability = (typeof SwarmCapability)[keyof typeof SwarmCapability];

// Grouped for UI / registry display
export const ENTERPRISE_CAPABILITIES: SwarmCapability[] = [
  SwarmCapability.RESEARCH, SwarmCapability.CODING, SwarmCapability.LEGAL,
  SwarmCapability.FINANCE, SwarmCapability.MARKETING, SwarmCapability.SALES,
  SwarmCapability.HR, SwarmCapability.ARCHITECTURE, SwarmCapability.TESTING,
  SwarmCapability.SECURITY, SwarmCapability.DATABASE, SwarmCapability.CLOUD,
];

export const META_CAPABILITIES: SwarmCapability[] = [
  SwarmCapability.PLANNING, SwarmCapability.ROUTING, SwarmCapability.CRITIQUE,
  SwarmCapability.REFLECTION, SwarmCapability.MEMORY,
];

export const ALL_CAPABILITIES: SwarmCapability[] = [
  ...ENTERPRISE_CAPABILITIES,
  ...META_CAPABILITIES,
];

// ── Capability requirement ─────────────────────────────────────────────────────

/** Expresses a capability requirement for a task node */
export interface CapabilityRequirement {
  capability:    SwarmCapability;
  minProficiency?: number;          // 0.0–1.0; default 0.5
  preferredAgentId?: string;        // pin to a specific agent if needed
}
