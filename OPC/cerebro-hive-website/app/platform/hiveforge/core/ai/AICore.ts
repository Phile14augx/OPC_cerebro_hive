import { AICoreService, AIContext, AIQueryResponse } from "../contracts/ai";
import { URD } from "../contracts/resource";
import { eventBus } from "../events/EventBus";

export class AICore implements AICoreService {
  private currentContext: AIContext = {};

  setContext(context: AIContext): void {
    this.currentContext = context;
    this.emitContextUpdate();
  }

  updateContext(context: Partial<AIContext>): void {
    this.currentContext = { ...this.currentContext, ...context };
    this.emitContextUpdate();
  }

  private emitContextUpdate() {
    eventBus.publish({
      category: "AILifecycle",
      type: "AIContextUpdated",
      source: "AICore",
      payload: { context: this.currentContext }
    });
  }

  async ask(query: string): Promise<AIQueryResponse> {
    const ctx = this.currentContext;
    const q = query.toLowerCase();
    const suggestedActions: AIQueryResponse["suggestedActions"] = [];
    let answer: string;
    let confidenceScore: number;

    if (ctx.currentResource) {
      const r = ctx.currentResource;
      if (q.includes("cost") || q.includes("price") || q.includes("expensive")) {
        answer = `"${r.id}" is a ${r.type} resource in workspace ${ctx.currentWorkspaceId ?? "this workspace"}. Ask for a cost breakdown or use "optimize cost" to get downscaling recommendations for the whole workspace.`;
        suggestedActions.push({ label: "Optimize workspace cost", actionId: "optimize-cost", payload: { workspaceId: ctx.currentWorkspaceId } });
        confidenceScore = 0.8;
      } else if (q.includes("terraform") || q.includes("iac") || q.includes("provision")) {
        answer = `I can generate a Terraform stub for "${r.id}" (${r.type}). Use "generate terraform" to produce it.`;
        suggestedActions.push({ label: "Generate Terraform", actionId: "generate-terraform", payload: { urdId: r.id } });
        confidenceScore = 0.85;
      } else {
        answer = `You're currently looking at "${r.id}" (${r.type}) in workspace ${ctx.currentWorkspaceId ?? "unknown"}. Ask about its cost, how to provision it via Terraform, or recent errors.`;
        confidenceScore = 0.65;
      }
    } else if (ctx.currentWorkspaceId) {
      answer = `No resource is currently selected in workspace ${ctx.currentWorkspaceId}. Select a resource from the catalog, or ask me to optimize cost across the whole workspace.`;
      suggestedActions.push({ label: "Optimize workspace cost", actionId: "optimize-cost", payload: { workspaceId: ctx.currentWorkspaceId } });
      confidenceScore = 0.5;
    } else {
      answer = `I don't have a workspace or resource in context yet. Open a workspace in HiveForge and select a resource, then ask again.`;
      confidenceScore = 0.3;
    }

    eventBus.publish({ category: "AILifecycle", type: "AIQueryAnswered", source: "AICore", payload: { query, answer, confidenceScore } });
    return { answer, suggestedActions, confidenceScore };
  }

  async generateTerraform(urd: URD): Promise<string> {
    const labelLines = Object.entries(urd.labels ?? {}).map(([k, v]) => `    ${k} = ${JSON.stringify(v)}`);
    const metaEntries = Object.entries(urd.metadata ?? {}).filter(([, v]) => typeof v === "string" || typeof v === "number" || typeof v === "boolean");
    const metaLines = metaEntries.map(([k, v]) => `  ${k} = ${JSON.stringify(v)}`);
    return (
      `# Generated Terraform for ${urd.id} (${urd.kind}/${urd.type} on ${urd.provider})\n` +
      `resource "${urd.provider}_${urd.type}" "${urd.id.replace(/[^a-zA-Z0-9_]/g, "_")}" {\n` +
      `  provider = "${urd.provider}"\n` +
      (metaLines.length > 0 ? metaLines.join("\n") + "\n" : "") +
      (labelLines.length > 0 ? `  tags = {\n${labelLines.join("\n")}\n  }\n` : "") +
      `}\n`
    );
  }

  async explainError(errorLogs: string): Promise<string> {
    const lower = errorLogs.toLowerCase();
    if (lower.includes("timeout") || lower.includes("etimedout")) {
      return "The logs show a network timeout — the deployment couldn't reach a dependency (registry, DB, or external API) in time. Check connectivity and retry.";
    }
    if (lower.includes("permission") || lower.includes("forbidden") || lower.includes("403")) {
      return "The logs indicate a permissions failure — the service account or role attached to this deployment lacks the required grant. Review the policy assigned to this workspace.";
    }
    if (lower.includes("out of memory") || lower.includes("oom")) {
      return "The logs show an out-of-memory kill — the workload exceeded its allocated resource limits. Increase the size tier or optimize memory usage.";
    }
    if (lower.includes("not found") || lower.includes("404")) {
      return "The logs indicate a missing resource or endpoint — verify the referenced resource ID or URL still exists and hasn't been deprovisioned.";
    }
    const firstLine = errorLogs.trim().split("\n")[0] ?? "";
    return firstLine
      ? `The logs indicate a failure in the deployment process. First error line: "${firstLine.slice(0, 200)}". Check the full log for a stack trace.`
      : "No error content was provided to analyze.";
  }

  async optimizeCost(workspaceId: string): Promise<string> {
    return `Cost optimization for workspace ${workspaceId}: review resources with low recent utilization and consider downscaling their size tier or consolidating idle environments. Connect this workspace's real usage data to get specific per-resource recommendations.`;
  }
}

export const aiCore = new AICore();
