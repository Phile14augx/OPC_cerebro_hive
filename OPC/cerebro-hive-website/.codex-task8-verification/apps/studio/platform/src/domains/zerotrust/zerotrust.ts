import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";

/**
 * Cerebro Zero Trust™ — the "Zero Trust AI" + "MCP governance" + "tool
 * permissions" strands of the Security pillar. Deliberately distinct from
 * Cerebro Guard (prompt firewall / PII detection on message content) and
 * SecOps (secret scanning, SAST/SCA): this layer governs *capability*, not
 * content — deny-by-default per-agent/per-tool grants, a risk-tiered
 * approval registry for external MCP servers, and short-lived, scoped
 * capability tokens so an agent's blast radius is bounded even if its
 * reasoning is compromised.
 */

export type RiskTier = "low" | "medium" | "high" | "critical";

export interface ToolGrant { id: string; organizationId: string; agentId: string; tool: string; allow: boolean; grantedBy: string; grantedAt: string }

export interface McpServerRegistration {
  id: string; organizationId: string; name: string; url: string; riskTier: RiskTier;
  status: "pending" | "approved" | "denied"; capabilities: string[]; reviewedBy?: string; registeredAt: string; reviewedAt?: string;
}

export interface CapabilityToken { id: string; organizationId: string; agentId: string; tools: string[]; issuedAt: string; expiresAt: string; revoked: boolean }

export interface ZeroTrustRepository {
  insertGrant(g: ToolGrant): Promise<void>;
  listGrants(org: string, agentId?: string): Promise<ToolGrant[]>;
  insertMcpServer(m: McpServerRegistration): Promise<void>;
  updateMcpServer(m: McpServerRegistration): Promise<void>;
  listMcpServers(org: string): Promise<McpServerRegistration[]>;
  insertToken(t: CapabilityToken): Promise<void>;
  getToken(org: string, id: string): Promise<CapabilityToken | undefined>;
  listTokens(org: string, agentId?: string): Promise<CapabilityToken[]>;
}

export class InMemoryZeroTrustRepository implements ZeroTrustRepository {
  grants: ToolGrant[] = [];
  mcpServers = new Map<string, McpServerRegistration>();
  tokens = new Map<string, CapabilityToken>();

  async insertGrant(g: ToolGrant) { this.grants.push(g); }
  async listGrants(org: string, agentId?: string) { return this.grants.filter(g => g.organizationId === org && (!agentId || g.agentId === agentId)); }
  async insertMcpServer(m: McpServerRegistration) { this.mcpServers.set(m.id, structuredClone(m)); }
  async updateMcpServer(m: McpServerRegistration) { this.mcpServers.set(m.id, structuredClone(m)); }
  async listMcpServers(org: string) { return [...this.mcpServers.values()].filter(m => m.organizationId === org); }
  async insertToken(t: CapabilityToken) { this.tokens.set(t.id, structuredClone(t)); }
  async getToken(org: string, id: string) { const t = this.tokens.get(id); return t?.organizationId === org ? structuredClone(t) : undefined; }
  async listTokens(org: string, agentId?: string) { return [...this.tokens.values()].filter(t => t.organizationId === org && (!agentId || t.agentId === agentId)); }
}

export class ZeroTrustService {
  constructor(
    private readonly repo: ZeroTrustRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  /** Deny-by-default: an agent may use a tool only if there is an explicit allow grant. */
  async grantTool(ctx: RequestContext, input: { agentId: string; tool: string; allow: boolean }): Promise<ToolGrant> {
    this.policy.assert(ctx.principal, "zerotrust:write", { kind: "grant", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const grant: ToolGrant = { id: newId("grant"), organizationId: org, agentId: input.agentId, tool: input.tool, allow: input.allow, grantedBy: ctx.principal.userId, grantedAt: new Date().toISOString() };
    await this.repo.insertGrant(grant);
    await this.bus.publish(Subjects.zerotrust.grantChanged, { grantId: grant.id, agentId: grant.agentId, tool: grant.tool, allow: grant.allow }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return grant;
  }

  async listGrants(ctx: RequestContext, agentId?: string): Promise<ToolGrant[]> {
    this.policy.assert(ctx.principal, "zerotrust:read", { kind: "grant", organizationId: ctx.principal.organizationId });
    return this.repo.listGrants(ctx.principal.organizationId, agentId);
  }

  /** Deny-by-default check: the most recently issued matching grant wins; absence of any grant is a deny.
   * Uses repository insertion order rather than the `grantedAt` timestamp string, since two grants issued
   * within the same millisecond would otherwise tie and fall back to an unstable ordering. */
  async canUseTool(ctx: RequestContext, agentId: string, tool: string): Promise<boolean> {
    const grants = await this.repo.listGrants(ctx.principal.organizationId, agentId);
    const matching = grants.filter(g => g.tool === tool || g.tool === "*");
    return matching.at(-1)?.allow ?? false;
  }

  /** MCP server governance: every external MCP connector must be registered and risk-reviewed before use. */
  async registerMcpServer(ctx: RequestContext, input: { name: string; url: string; riskTier: RiskTier; capabilities: string[] }): Promise<McpServerRegistration> {
    this.policy.assert(ctx.principal, "zerotrust:write", { kind: "mcp_server", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const server: McpServerRegistration = {
      id: newId("mcp"), organizationId: org, name: input.name, url: input.url, riskTier: input.riskTier,
      status: input.riskTier === "low" ? "approved" : "pending", capabilities: input.capabilities, registeredAt: new Date().toISOString(),
    };
    if (server.status === "approved") server.reviewedAt = server.registeredAt;
    await this.repo.insertMcpServer(server);
    await this.bus.publish(Subjects.zerotrust.mcpServerRegistered, { serverId: server.id, name: server.name, riskTier: server.riskTier, status: server.status }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return server;
  }

  async reviewMcpServer(ctx: RequestContext, id: string, decision: "approved" | "denied"): Promise<McpServerRegistration> {
    this.policy.assert(ctx.principal, "zerotrust:write", { kind: "mcp_server", organizationId: ctx.principal.organizationId });
    const servers = await this.repo.listMcpServers(ctx.principal.organizationId);
    const server = servers.find(s => s.id === id);
    if (!server) throw PlatformError.notFound("mcp_server", id);
    server.status = decision;
    server.reviewedBy = ctx.principal.userId;
    server.reviewedAt = new Date().toISOString();
    await this.repo.updateMcpServer(server);
    await this.bus.publish(Subjects.zerotrust.mcpServerReviewed, { serverId: server.id, status: server.status }, { organizationId: server.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return server;
  }

  listMcpServers(ctx: RequestContext): Promise<McpServerRegistration[]> {
    this.policy.assert(ctx.principal, "zerotrust:read", { kind: "mcp_server", organizationId: ctx.principal.organizationId });
    return this.repo.listMcpServers(ctx.principal.organizationId);
  }

  /** Short-lived, scoped capability token — bounds an agent's blast radius even if its reasoning is compromised. */
  async issueCapabilityToken(ctx: RequestContext, input: { agentId: string; tools: string[]; ttlMinutes?: number }): Promise<CapabilityToken> {
    this.policy.assert(ctx.principal, "zerotrust:write", { kind: "token", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const now = Date.now();
    const token: CapabilityToken = {
      id: newId("cap"), organizationId: org, agentId: input.agentId, tools: input.tools,
      issuedAt: new Date(now).toISOString(), expiresAt: new Date(now + (input.ttlMinutes ?? 15) * 60_000).toISOString(), revoked: false,
    };
    await this.repo.insertToken(token);
    await this.bus.publish(Subjects.zerotrust.tokenIssued, { tokenId: token.id, agentId: token.agentId, tools: token.tools }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return token;
  }

  async validateCapabilityToken(ctx: RequestContext, tokenId: string, tool: string): Promise<{ valid: boolean; reason?: string }> {
    const token = await this.repo.getToken(ctx.principal.organizationId, tokenId);
    if (!token) return { valid: false, reason: "unknown token" };
    if (token.revoked) return { valid: false, reason: "revoked" };
    if (new Date(token.expiresAt).getTime() < Date.now()) return { valid: false, reason: "expired" };
    if (!token.tools.includes(tool) && !token.tools.includes("*")) return { valid: false, reason: `token not scoped for tool "${tool}"` };
    return { valid: true };
  }

  listTokens(ctx: RequestContext, agentId?: string): Promise<CapabilityToken[]> {
    this.policy.assert(ctx.principal, "zerotrust:read", { kind: "token", organizationId: ctx.principal.organizationId });
    return this.repo.listTokens(ctx.principal.organizationId, agentId);
  }
}
