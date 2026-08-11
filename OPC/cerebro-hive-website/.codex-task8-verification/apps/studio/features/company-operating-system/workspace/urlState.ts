import { z } from "zod";

const nodeTypes = [
  "department", "agent", "tool", "model", "skill", "data-source", "memory",
  "workflow", "task", "output", "human", "system", "integration",
] as const;
const relationships = [
  "REPORTS_TO", "COLLABORATES_WITH", "USES", "DELEGATES_TO", "READS_FROM",
  "WRITES_TO", "SHARES_MEMORY_WITH", "TRIGGERS", "DEPENDS_ON", "PRODUCES",
] as const;

const workspaceUrlStateSchema = z.object({
  selectedIds: z.array(z.string().min(1)),
  inspectorId: z.string().min(1).nullable(),
  focusId: z.string().min(1).nullable(),
  query: z.string(),
  nodeTypes: z.array(z.enum(nodeTypes)),
  departments: z.array(z.string().min(1)),
  relationships: z.array(z.enum(relationships)),
  labelsVisible: z.boolean(),
  edgesVisible: z.boolean(),
  fullscreen: z.boolean(),
});

export type OperatingWorkspaceUrlState = z.infer<typeof workspaceUrlStateSchema>;

export const workspaceUrlDefaults: OperatingWorkspaceUrlState = {
  selectedIds: [],
  inspectorId: null,
  focusId: null,
  query: "",
  nodeTypes: [],
  departments: [],
  relationships: [],
  labelsVisible: true,
  edgesVisible: true,
  fullscreen: false,
};

export function serializeWorkspaceState(state: OperatingWorkspaceUrlState): string {
  const safeState = workspaceUrlStateSchema.parse(state);
  const params = new URLSearchParams();
  const setList = (key: string, values: readonly string[]) => {
    if (values.length) params.set(key, values.join(","));
  };

  setList("selectedIds", safeState.selectedIds);
  if (safeState.inspectorId) params.set("inspectorId", safeState.inspectorId);
  if (safeState.focusId) params.set("focusId", safeState.focusId);
  if (safeState.query) params.set("query", safeState.query);
  setList("nodeTypes", safeState.nodeTypes);
  setList("departments", safeState.departments);
  setList("relationships", safeState.relationships);
  if (!safeState.labelsVisible) params.set("labelsVisible", "false");
  if (!safeState.edgesVisible) params.set("edgesVisible", "false");
  if (safeState.fullscreen) params.set("fullscreen", "true");

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export function parseWorkspaceState(search: string | URLSearchParams): OperatingWorkspaceUrlState {
  const params = typeof search === "string"
    ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
    : search;
  const list = (key: string) => params.get(key)?.split(",").filter(Boolean) ?? [];
  const boolean = (key: string, fallback: boolean) => {
    const value = params.get(key);
    return value === null ? fallback : value === "true" ? true : value === "false" ? false : value;
  };
  const parsed = workspaceUrlStateSchema.safeParse({
    selectedIds: list("selectedIds"),
    inspectorId: params.get("inspectorId"),
    focusId: params.get("focusId"),
    query: params.get("query") ?? "",
    nodeTypes: list("nodeTypes"),
    departments: list("departments"),
    relationships: list("relationships"),
    labelsVisible: boolean("labelsVisible", true),
    edgesVisible: boolean("edgesVisible", true),
    fullscreen: boolean("fullscreen", false),
  });

  return parsed.success ? parsed.data : workspaceUrlDefaults;
}
