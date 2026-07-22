import { newId } from "../../kernel/ids/id.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";

export interface ConnectorDescriptor {
  kind: string; title: string; category: "chat" | "dev" | "crm" | "erp" | "cloud" | "storage" | "generic";
  auth: "none" | "token" | "oauth"; operations: string[];
}

export interface ConnectorInstance { id: string; organizationId: string; kind: string; name: string; config: Record<string, string>; status: "configured" | "error" }

export interface Connector {
  descriptor: ConnectorDescriptor;
  invoke(instance: ConnectorInstance, operation: string, params: Record<string, unknown>): Promise<unknown>;
}

/** Webhook connector: POSTs JSON to a configured URL. */
export const webhookConnector: Connector = {
  descriptor: { kind: "webhook", title: "Webhook", category: "generic", auth: "none", operations: ["post"] },
  async invoke(instance, operation, params) {
    if (operation !== "post") throw PlatformError.validation(`unknown operation ${operation}`);
    const url = instance.config.url;
    if (!url) throw PlatformError.validation("webhook url not configured");
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(params), signal: AbortSignal.timeout(10_000) });
    return { status: res.status, ok: res.ok };
  },
};

/** REST connector: parameterized HTTP requests against a configured base URL. */
export const restConnector: Connector = {
  descriptor: { kind: "rest", title: "Generic REST", category: "generic", auth: "token", operations: ["get", "post"] },
  async invoke(instance, operation, params) {
    const base = instance.config.baseUrl;
    if (!base) throw PlatformError.validation("baseUrl not configured");
    const path = String(params.path ?? "/");
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (instance.config.token) headers.authorization = `Bearer ${instance.config.token}`;
    const res = await fetch(`${base}${path}`, {
      method: operation === "get" ? "GET" : "POST",
      headers, body: operation === "post" ? JSON.stringify(params.body ?? {}) : undefined,
      signal: AbortSignal.timeout(15_000),
    });
    const text = await res.text();
    return { status: res.status, body: text.slice(0, 5000) };
  },
};

export const githubConnector: Connector = {
  descriptor: { kind: "github", title: "GitHub", category: "dev", auth: "token", operations: ["repo.get", "issues.list"] },
  async invoke(instance, operation, params) {
    const token = instance.config.token;
    const repo = String(params.repo ?? instance.config.repo ?? "");
    if (!repo.includes("/")) throw PlatformError.validation("repo must be owner/name");
    const path = operation === "repo.get" ? `/repos/${repo}` : `/repos/${repo}/issues?per_page=10`;
    const res = await fetch(`https://api.github.com${path}`, {
      headers: { accept: "application/vnd.github+json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { status: res.status, error: "github request failed" };
    return { status: res.status, body: await res.json() };
  },
};

/** Catalog stubs for the named enterprise systems; same Connector contract. */
const STUB_KINDS: ConnectorDescriptor[] = [
  { kind: "slack", title: "Slack", category: "chat", auth: "oauth", operations: ["chat.postMessage"] },
  { kind: "teams", title: "Microsoft Teams", category: "chat", auth: "oauth", operations: ["message.send"] },
  { kind: "jira", title: "Jira", category: "dev", auth: "oauth", operations: ["issue.create", "issue.search"] },
  { kind: "salesforce", title: "Salesforce", category: "crm", auth: "oauth", operations: ["record.query"] },
  { kind: "sap", title: "SAP", category: "erp", auth: "oauth", operations: ["odata.query"] },
  { kind: "hubspot", title: "HubSpot", category: "crm", auth: "oauth", operations: ["contact.search"] },
  { kind: "google", title: "Google Workspace", category: "storage", auth: "oauth", operations: ["drive.search"] },
  { kind: "microsoft", title: "Microsoft 365", category: "storage", auth: "oauth", operations: ["graph.query"] },
  { kind: "aws", title: "AWS", category: "cloud", auth: "token", operations: ["s3.list"] },
  { kind: "azure", title: "Azure", category: "cloud", auth: "token", operations: ["resource.list"] },
];

function stubConnector(descriptor: ConnectorDescriptor): Connector {
  return {
    descriptor,
    async invoke(_instance, operation) {
      return { status: 501, note: `${descriptor.title} connector scaffold: operation ${operation} requires OAuth credentials; configure via connect API.` };
    },
  };
}

export interface ConnectorRepository {
  insert(instance: ConnectorInstance): Promise<void>;
  list(organizationId: string): Promise<ConnectorInstance[]>;
  get(organizationId: string, id: string): Promise<ConnectorInstance | undefined>;
}

export class InMemoryConnectorRepository implements ConnectorRepository {
  rows = new Map<string, ConnectorInstance>();
  async insert(i: ConnectorInstance) { this.rows.set(i.id, structuredClone(i)); }
  async list(org: string) { return [...this.rows.values()].filter(i => i.organizationId === org).map(i => structuredClone(i)); }
  async get(org: string, id: string) { const i = this.rows.get(id); return i?.organizationId === org ? structuredClone(i) : undefined; }
}

/**
 * Cerebro Connect™ — connector framework + registry. Working webhook/REST/GitHub
 * connectors; OAuth catalog entries share the exact same contract so adding a
 * live integration is one class, not a redesign.
 */
export class ConnectService {
  private connectors = new Map<string, Connector>();

  constructor(
    private readonly repo: ConnectorRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {
    for (const c of [webhookConnector, restConnector, githubConnector]) this.connectors.set(c.descriptor.kind, c);
    for (const d of STUB_KINDS) this.connectors.set(d.kind, stubConnector(d));
  }

  registerConnector(connector: Connector): void { this.connectors.set(connector.descriptor.kind, connector); }
  catalog(): ConnectorDescriptor[] { return [...this.connectors.values()].map(c => c.descriptor); }

  async configure(ctx: RequestContext, input: { kind: string; name: string; config: Record<string, string> }): Promise<ConnectorInstance> {
    this.policy.assert(ctx.principal, "connect:write", { kind: "connector", organizationId: ctx.principal.organizationId });
    if (!this.connectors.has(input.kind)) throw PlatformError.notFound("connector kind", input.kind);
    const instance: ConnectorInstance = { id: newId("con"), organizationId: ctx.principal.organizationId, kind: input.kind, name: input.name, config: input.config, status: "configured" };
    await this.repo.insert(instance);
    return instance;
  }

  list(ctx: RequestContext): Promise<ConnectorInstance[]> {
    this.policy.assert(ctx.principal, "connect:read", { kind: "connector", organizationId: ctx.principal.organizationId });
    return this.repo.list(ctx.principal.organizationId);
  }

  async invoke(ctx: RequestContext, instanceId: string, operation: string, params: Record<string, unknown>): Promise<unknown> {
    this.policy.assert(ctx.principal, "connect:invoke", { kind: "connector", organizationId: ctx.principal.organizationId });
    const instance = await this.repo.get(ctx.principal.organizationId, instanceId);
    if (!instance) throw PlatformError.notFound("connector", instanceId);
    const connector = this.connectors.get(instance.kind);
    if (!connector) throw PlatformError.notFound("connector kind", instance.kind);
    const result = await connector.invoke(instance, operation, params);
    await this.bus.publish(Subjects.connect.connectorInvoked, { instanceId, kind: instance.kind, operation }, { organizationId: ctx.principal.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return result;
  }

  async receiveWebhook(organizationId: string, source: string, payload: Record<string, unknown>): Promise<void> {
    await this.bus.publish(Subjects.connect.webhookReceived, { source, payload }, { organizationId });
  }
}
