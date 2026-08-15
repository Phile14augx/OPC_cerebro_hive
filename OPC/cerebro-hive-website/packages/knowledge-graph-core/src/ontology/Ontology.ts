/**
 * Canonical Nexarch ontology surface for KRN-015 / KRN-KG-001.
 *
 * One taxonomy, six families. Existing CMDB/AI-ops NodeKind string values are
 * retained. New perceptronic types are added underneath the families — this
 * file is not forked into a second "perceptronic ontology".
 *
 * Family is derived from kind (`familyOf`). Do not persist a parallel type system.
 */

export enum NodeFamily {
  Knowledge = 'KNOWLEDGE',
  Organization = 'ORGANIZATION',
  Work = 'WORK',
  AI = 'AI',
  System = 'SYSTEM',
  Governance = 'GOVERNANCE',
}

/**
 * Concrete node types. Legacy CMDB/AI-ops members keep their original string
 * values so in-memory graphs and `matchNodeKind: 'AIModel'` callers stay valid.
 *
 * Canonical names for new writes:
 *   AIModel → treat as Model (family AI)
 *   AIEvaluation → treat as Evaluation (family AI)
 *   BusinessCapability → family WORK (Capability)
 *   BusinessService → family WORK (Service)
 */
export enum NodeKind {
  // --- KNOWLEDGE ---
  Document = 'Document',
  Page = 'Page',
  Chunk = 'Chunk',
  Concept = 'Concept',
  Fact = 'Fact',
  Claim = 'Claim',
  Decision = 'Decision',
  PolicyDocument = 'PolicyDocument',
  ResearchPaper = 'ResearchPaper',
  Dataset = 'Dataset',

  // --- ORGANIZATION ---
  Person = 'Person',
  Employee = 'Employee',
  Role = 'Role',
  Team = 'Team',
  Department = 'Department',
  BusinessUnit = 'BusinessUnit',
  Organization = 'Organization',

  // --- WORK ---
  Project = 'Project',
  Product = 'Product',
  BusinessService = 'BusinessService',
  BusinessCapability = 'BusinessCapability',
  Process = 'Process',
  Workflow = 'Workflow',
  Task = 'Task',
  Goal = 'Goal',
  KPI = 'KPI',
  ChangeRequest = 'ChangeRequest',
  Incident = 'Incident',

  // --- AI ---
  Agent = 'Agent',
  AgentVersion = 'AgentVersion',
  /** Legacy persisted model type. Family AI. Prefer ModelVersion under this node. */
  AIModel = 'AIModel',
  ModelVersion = 'ModelVersion',
  Prompt = 'Prompt',
  Tool = 'Tool',
  Skill = 'Skill',
  Memory = 'Memory',
  AIEvaluation = 'AIEvaluation',
  AIProvider = 'AIProvider',

  // --- SYSTEM ---
  Application = 'Application',
  Api = 'API',
  Database = 'Database',
  Repository = 'Repository',
  Connector = 'Connector',
  DataSource = 'DataSource',
  ConfigurationItem = 'ConfigurationItem',
  Deployment = 'Deployment',

  // --- GOVERNANCE ---
  Tenant = 'Tenant',
  Workspace = 'Workspace',
  Policy = 'Policy',
  Permission = 'Permission',
  Classification = 'Classification',
  Approval = 'Approval',
  Risk = 'Risk',
  Control = 'Control',
  AuditEvidence = 'AuditEvidence',
}

export enum RelationshipType {
  // Legacy CMDB/AI-ops
  DEPENDS_ON = 'DEPENDS_ON',
  GOVERNS = 'GOVERNS',
  MITIGATES = 'MITIGATES',
  AFFECTS = 'AFFECTS',
  IMPLEMENTS = 'IMPLEMENTS',
  TRAINED_ON = 'TRAINED_ON',
  EVALUATED_BY = 'EVALUATED_BY',
  HOSTED_BY = 'HOSTED_BY',

  // Organization / work
  MEMBER_OF = 'MEMBER_OF',
  REPORTS_TO = 'REPORTS_TO',
  HAS_ROLE = 'HAS_ROLE',
  HAS_SKILL = 'HAS_SKILL',
  OWNS = 'OWNS',
  AUTHORED = 'AUTHORED',
  AUTHORED_BY = 'AUTHORED_BY',
  SUPERVISES = 'SUPERVISES',
  USES = 'USES',
  EXECUTES = 'EXECUTES',

  // AI / agentic
  USES_MODEL = 'USES_MODEL',
  CAN_USE = 'CAN_USE',
  RETRIEVES_FROM = 'RETRIEVES_FROM',
  HAS_MEMORY = 'HAS_MEMORY',
  ACTS_FOR = 'ACTS_FOR',
  GOVERNED_BY = 'GOVERNED_BY',
  PROVIDED_BY = 'PROVIDED_BY',
  HAS_VERSION = 'HAS_VERSION',
  APPROVED_FOR = 'APPROVED_FOR',
  RESTRICTED_FOR = 'RESTRICTED_FOR',

  // Knowledge / provenance
  CONTAINS = 'CONTAINS',
  MENTIONS = 'MENTIONS',
  SUPPORTS = 'SUPPORTS',
  SUPERSEDES = 'SUPERSEDES',
  ASSERTED_BY = 'ASSERTED_BY',
  EXTRACTED_FROM = 'EXTRACTED_FROM',
  VERIFIED_BY = 'VERIFIED_BY',
  SUPPORTED_BY = 'SUPPORTED_BY',
  CONTRADICTED_BY = 'CONTRADICTED_BY',
}

export interface OntologyConstraint {
  sourceKind: NodeKind;
  relationshipType: RelationshipType;
  targetKind: NodeKind;
}

const NODE_FAMILY_OF: Record<NodeKind, NodeFamily> = {
  [NodeKind.Document]: NodeFamily.Knowledge,
  [NodeKind.Page]: NodeFamily.Knowledge,
  [NodeKind.Chunk]: NodeFamily.Knowledge,
  [NodeKind.Concept]: NodeFamily.Knowledge,
  [NodeKind.Fact]: NodeFamily.Knowledge,
  [NodeKind.Claim]: NodeFamily.Knowledge,
  [NodeKind.Decision]: NodeFamily.Knowledge,
  [NodeKind.PolicyDocument]: NodeFamily.Knowledge,
  [NodeKind.ResearchPaper]: NodeFamily.Knowledge,
  [NodeKind.Dataset]: NodeFamily.Knowledge,

  [NodeKind.Person]: NodeFamily.Organization,
  [NodeKind.Employee]: NodeFamily.Organization,
  [NodeKind.Role]: NodeFamily.Organization,
  [NodeKind.Team]: NodeFamily.Organization,
  [NodeKind.Department]: NodeFamily.Organization,
  [NodeKind.BusinessUnit]: NodeFamily.Organization,
  [NodeKind.Organization]: NodeFamily.Organization,

  [NodeKind.Project]: NodeFamily.Work,
  [NodeKind.Product]: NodeFamily.Work,
  [NodeKind.BusinessService]: NodeFamily.Work,
  [NodeKind.BusinessCapability]: NodeFamily.Work,
  [NodeKind.Process]: NodeFamily.Work,
  [NodeKind.Workflow]: NodeFamily.Work,
  [NodeKind.Task]: NodeFamily.Work,
  [NodeKind.Goal]: NodeFamily.Work,
  [NodeKind.KPI]: NodeFamily.Work,
  [NodeKind.ChangeRequest]: NodeFamily.Work,
  [NodeKind.Incident]: NodeFamily.Work,

  [NodeKind.Agent]: NodeFamily.AI,
  [NodeKind.AgentVersion]: NodeFamily.AI,
  [NodeKind.AIModel]: NodeFamily.AI,
  [NodeKind.ModelVersion]: NodeFamily.AI,
  [NodeKind.Prompt]: NodeFamily.AI,
  [NodeKind.Tool]: NodeFamily.AI,
  [NodeKind.Skill]: NodeFamily.AI,
  [NodeKind.Memory]: NodeFamily.AI,
  [NodeKind.AIEvaluation]: NodeFamily.AI,
  [NodeKind.AIProvider]: NodeFamily.AI,

  [NodeKind.Application]: NodeFamily.System,
  [NodeKind.Api]: NodeFamily.System,
  [NodeKind.Database]: NodeFamily.System,
  [NodeKind.Repository]: NodeFamily.System,
  [NodeKind.Connector]: NodeFamily.System,
  [NodeKind.DataSource]: NodeFamily.System,
  [NodeKind.ConfigurationItem]: NodeFamily.System,
  [NodeKind.Deployment]: NodeFamily.System,

  [NodeKind.Tenant]: NodeFamily.Governance,
  [NodeKind.Workspace]: NodeFamily.Governance,
  [NodeKind.Policy]: NodeFamily.Governance,
  [NodeKind.Permission]: NodeFamily.Governance,
  [NodeKind.Classification]: NodeFamily.Governance,
  [NodeKind.Approval]: NodeFamily.Governance,
  [NodeKind.Risk]: NodeFamily.Governance,
  [NodeKind.Control]: NodeFamily.Governance,
  [NodeKind.AuditEvidence]: NodeFamily.Governance,
};

export class EnterpriseOntology {
  static readonly validRelationships: OntologyConstraint[] = [
    // Legacy CMDB/AI-ops (unchanged)
    { sourceKind: NodeKind.BusinessService, relationshipType: RelationshipType.DEPENDS_ON, targetKind: NodeKind.ConfigurationItem },
    { sourceKind: NodeKind.ConfigurationItem, relationshipType: RelationshipType.DEPENDS_ON, targetKind: NodeKind.ConfigurationItem },
    { sourceKind: NodeKind.AIModel, relationshipType: RelationshipType.HOSTED_BY, targetKind: NodeKind.AIProvider },
    { sourceKind: NodeKind.AIModel, relationshipType: RelationshipType.TRAINED_ON, targetKind: NodeKind.Dataset },
    { sourceKind: NodeKind.AIEvaluation, relationshipType: RelationshipType.EVALUATED_BY, targetKind: NodeKind.AIModel },
    { sourceKind: NodeKind.Policy, relationshipType: RelationshipType.GOVERNS, targetKind: NodeKind.AIModel },
    { sourceKind: NodeKind.Risk, relationshipType: RelationshipType.AFFECTS, targetKind: NodeKind.ConfigurationItem },
    { sourceKind: NodeKind.ChangeRequest, relationshipType: RelationshipType.AFFECTS, targetKind: NodeKind.ConfigurationItem },

    // Perceptronic families (additive)
    { sourceKind: NodeKind.Employee, relationshipType: RelationshipType.MEMBER_OF, targetKind: NodeKind.Department },
    { sourceKind: NodeKind.Employee, relationshipType: RelationshipType.REPORTS_TO, targetKind: NodeKind.Employee },
    { sourceKind: NodeKind.Employee, relationshipType: RelationshipType.HAS_ROLE, targetKind: NodeKind.Role },
    { sourceKind: NodeKind.Employee, relationshipType: RelationshipType.HAS_SKILL, targetKind: NodeKind.Skill },
    { sourceKind: NodeKind.Employee, relationshipType: RelationshipType.OWNS, targetKind: NodeKind.Product },
    { sourceKind: NodeKind.Employee, relationshipType: RelationshipType.AUTHORED, targetKind: NodeKind.Document },
    { sourceKind: NodeKind.Employee, relationshipType: RelationshipType.SUPERVISES, targetKind: NodeKind.Agent },
    { sourceKind: NodeKind.Department, relationshipType: RelationshipType.OWNS, targetKind: NodeKind.Process },
    { sourceKind: NodeKind.Department, relationshipType: RelationshipType.OWNS, targetKind: NodeKind.Dataset },
    { sourceKind: NodeKind.Department, relationshipType: RelationshipType.USES, targetKind: NodeKind.Application },
    { sourceKind: NodeKind.Agent, relationshipType: RelationshipType.USES_MODEL, targetKind: NodeKind.ModelVersion },
    { sourceKind: NodeKind.Agent, relationshipType: RelationshipType.CAN_USE, targetKind: NodeKind.Tool },
    { sourceKind: NodeKind.Agent, relationshipType: RelationshipType.HAS_MEMORY, targetKind: NodeKind.Memory },
    { sourceKind: NodeKind.Agent, relationshipType: RelationshipType.EXECUTES, targetKind: NodeKind.Workflow },
    { sourceKind: NodeKind.Agent, relationshipType: RelationshipType.ACTS_FOR, targetKind: NodeKind.Employee },
    { sourceKind: NodeKind.Agent, relationshipType: RelationshipType.GOVERNED_BY, targetKind: NodeKind.Policy },
    { sourceKind: NodeKind.AIModel, relationshipType: RelationshipType.HAS_VERSION, targetKind: NodeKind.ModelVersion },
    { sourceKind: NodeKind.AIModel, relationshipType: RelationshipType.PROVIDED_BY, targetKind: NodeKind.AIProvider },
    { sourceKind: NodeKind.AIModel, relationshipType: RelationshipType.APPROVED_FOR, targetKind: NodeKind.Classification },
    { sourceKind: NodeKind.AIModel, relationshipType: RelationshipType.RESTRICTED_FOR, targetKind: NodeKind.Classification },
    { sourceKind: NodeKind.Document, relationshipType: RelationshipType.CONTAINS, targetKind: NodeKind.Chunk },
    { sourceKind: NodeKind.Document, relationshipType: RelationshipType.MENTIONS, targetKind: NodeKind.Concept },
    { sourceKind: NodeKind.Document, relationshipType: RelationshipType.SUPPORTS, targetKind: NodeKind.Claim },
    { sourceKind: NodeKind.Document, relationshipType: RelationshipType.SUPERSEDES, targetKind: NodeKind.Document },
    { sourceKind: NodeKind.Document, relationshipType: RelationshipType.GOVERNED_BY, targetKind: NodeKind.Policy },
    { sourceKind: NodeKind.Claim, relationshipType: RelationshipType.SUPPORTED_BY, targetKind: NodeKind.Document },
    { sourceKind: NodeKind.Claim, relationshipType: RelationshipType.ASSERTED_BY, targetKind: NodeKind.Employee },
    { sourceKind: NodeKind.Claim, relationshipType: RelationshipType.EXTRACTED_FROM, targetKind: NodeKind.Document },
    { sourceKind: NodeKind.Fact, relationshipType: RelationshipType.VERIFIED_BY, targetKind: NodeKind.Agent },
    { sourceKind: NodeKind.Fact, relationshipType: RelationshipType.CONTRADICTED_BY, targetKind: NodeKind.Fact },
  ];

  static familyOf(kind: NodeKind): NodeFamily {
    return NODE_FAMILY_OF[kind];
  }

  static kindsIn(family: NodeFamily): NodeKind[] {
    return (Object.keys(NODE_FAMILY_OF) as NodeKind[]).filter(
      (kind) => NODE_FAMILY_OF[kind] === family,
    );
  }

  static isValid(sourceKind: NodeKind, relationshipType: RelationshipType, targetKind: NodeKind): boolean {
    return this.validRelationships.some((c) =>
      c.sourceKind === sourceKind &&
      c.relationshipType === relationshipType &&
      c.targetKind === targetKind,
    );
  }
}
