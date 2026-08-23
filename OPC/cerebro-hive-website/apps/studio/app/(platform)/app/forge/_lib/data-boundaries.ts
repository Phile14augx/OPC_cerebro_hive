import type { ForgeArchitecture, ForgePlan, ForgeRequirements } from "@cerebro/workflow";

export interface ProjectValue<T> {
  projectId: string | null;
  value: T;
}

interface PersistedRequirementRow {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  priority: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

function isStringArrayRecord(value: unknown): value is Record<string, string[]> {
  return isRecord(value) && Object.values(value).every(isStringArray);
}

function isArchitectureService(
  value: unknown,
): value is ForgeArchitecture["services"][number] {
  return isRecord(value)
    && typeof value.name === "string"
    && isFiniteNumber(value.port)
    && (value.database === null || typeof value.database === "string")
    && typeof value.runtime === "string"
    && isStringArray(value.responsibilities);
}

function isArchitectureDecision(
  value: unknown,
): value is ForgeArchitecture["decisions"][number] {
  return isRecord(value)
    && typeof value.title === "string"
    && typeof value.context === "string"
    && typeof value.decision === "string"
    && typeof value.status === "string";
}

export function parseForgeArchitecture(value: unknown): ForgeArchitecture | null {
  if (!isRecord(value)
    || typeof value.pattern !== "string"
    || !Array.isArray(value.services)
    || !value.services.every(isArchitectureService)
    || !isStringArrayRecord(value.techStack)
    || !Array.isArray(value.decisions)
    || !value.decisions.every(isArchitectureDecision)
    || (value.folderStructure !== undefined && typeof value.folderStructure !== "string")) {
    return null;
  }

  return {
    pattern: value.pattern,
    services: value.services,
    techStack: value.techStack,
    decisions: value.decisions,
    folderStructure: value.folderStructure,
  };
}

function isModulePriority(
  value: unknown,
): value is ForgePlan["modules"][number]["priority"] {
  return value === "critical" || value === "high" || value === "medium" || value === "low";
}

function isModuleStatus(
  value: unknown,
): value is ForgePlan["modules"][number]["status"] {
  return value === "pending" || value === "generating" || value === "done";
}

function isPlanModule(value: unknown): value is ForgePlan["modules"][number] {
  return isRecord(value)
    && typeof value.name === "string"
    && (value.description === undefined || typeof value.description === "string")
    && isModulePriority(value.priority)
    && isFiniteNumber(value.storyCount)
    && isFiniteNumber(value.apiCount)
    && isModuleStatus(value.status);
}

function isPlanMilestone(value: unknown): value is ForgePlan["milestones"][number] {
  return isRecord(value)
    && typeof value.title === "string"
    && typeof value.weekLabel === "string"
    && isFiniteNumber(value.order);
}

function isForgeStack(value: unknown): value is ForgePlan["stack"] {
  return isRecord(value)
    && typeof value.frontend === "string"
    && typeof value.backend === "string"
    && typeof value.database === "string"
    && (value.mobile === undefined || value.mobile === null || typeof value.mobile === "string")
    && typeof value.infra === "string";
}

export function parseForgePlan(value: unknown): ForgePlan | null {
  if (!isRecord(value)
    || !Array.isArray(value.modules)
    || !value.modules.every(isPlanModule)
    || !isStringArray(value.actors)
    || !Array.isArray(value.milestones)
    || !value.milestones.every(isPlanMilestone)
    || !isFiniteNumber(value.totalStories)
    || !isFiniteNumber(value.totalApis)
    || !isForgeStack(value.stack)
    || typeof value.businessSummary !== "string") {
    return null;
  }

  return {
    modules: value.modules,
    actors: value.actors,
    milestones: value.milestones,
    totalStories: value.totalStories,
    totalApis: value.totalApis,
    stack: value.stack,
    businessSummary: value.businessSummary,
  };
}

function isRequirementActor(value: unknown): value is ForgeRequirements["actors"][number] {
  return isRecord(value)
    && typeof value.name === "string"
    && isStringArray(value.permissions);
}

function isRequirementEntity(value: unknown): value is ForgeRequirements["entities"][number] {
  return isRecord(value)
    && typeof value.name === "string"
    && isStringArray(value.fields);
}

function isApiContract(value: unknown): value is ForgeRequirements["apiContracts"][number] {
  return isRecord(value)
    && typeof value.method === "string"
    && typeof value.path === "string"
    && typeof value.description === "string";
}

function isUserStory(value: unknown): value is ForgeRequirements["userStories"][number] {
  return isRecord(value)
    && typeof value.actor === "string"
    && typeof value.action === "string"
    && typeof value.benefit === "string";
}

export function parseForgeRequirements(value: unknown): ForgeRequirements | null {
  if (!isRecord(value)
    || !isStringArray(value.functional)
    || !isStringArray(value.nonFunctional)
    || !Array.isArray(value.actors)
    || !value.actors.every(isRequirementActor)
    || !Array.isArray(value.entities)
    || !value.entities.every(isRequirementEntity)
    || !Array.isArray(value.apiContracts)
    || !value.apiContracts.every(isApiContract)
    || !Array.isArray(value.userStories)
    || !value.userStories.every(isUserStory)) {
    return null;
  }

  return {
    functional: value.functional,
    nonFunctional: value.nonFunctional,
    actors: value.actors,
    entities: value.entities,
    apiContracts: value.apiContracts,
    userStories: value.userStories,
  };
}

function isPersistedRequirementRow(value: unknown): value is PersistedRequirementRow {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.type === "string"
    && typeof value.title === "string"
    && (value.description === undefined
      || value.description === null
      || typeof value.description === "string")
    && typeof value.priority === "string";
}

export function parseForgeRequirementRows(value: unknown): ForgeRequirements | null {
  if (!Array.isArray(value) || value.length === 0 || !value.every(isPersistedRequirementRow)) {
    return null;
  }

  return {
    functional: value.filter(row => row.type === "functional").map(row => row.title),
    nonFunctional: value.filter(row => row.type === "non_functional").map(row => row.title),
    actors: [],
    entities: [],
    apiContracts: value.filter(row => row.type === "api_contract").map(row => {
      const [method = "", path = "", ...legacyDescription] = row.title.split(" ");
      return {
        method,
        path,
        description: row.description ?? legacyDescription.join(" ").replace(/^— /, ""),
      };
    }),
    userStories: value.filter(row => row.type === "user_story").map(row => {
      const match = row.title.match(/^As a (.+?), I want to (.+?) so that (.+)$/);
      return match
        ? { actor: match[1], action: match[2], benefit: match[3] }
        : { actor: "", action: row.title, benefit: "" };
    }),
  };
}

export function selectProjectValue<T>(
  projectId: string | null,
  override: ProjectValue<T> | null,
  persisted: T | null,
): T | null {
  return override?.projectId === projectId ? override.value : persisted;
}
