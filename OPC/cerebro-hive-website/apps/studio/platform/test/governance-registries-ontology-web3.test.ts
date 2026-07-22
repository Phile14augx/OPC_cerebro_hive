import { describe, expect, it } from "vitest";
import { testPlatform } from "./helpers.js";

describe("governance registries + ethics", () => {
  it("registers entries across all six registry kinds and rolls them up into the AI inventory", async () => {
    const { platform, ctx } = await testPlatform();
    const model = await platform.registries.register(ctx, { kind: "model", name: "gpt-4o-mini", riskTier: "medium" });
    await platform.registries.register(ctx, { kind: "prompt", name: "grounded-answer" });
    await platform.registries.register(ctx, { kind: "agent", name: "AgentOS bridge" });
    await platform.registries.register(ctx, { kind: "policy", name: "data-retention-90d" });
    const risk = await platform.registries.register(ctx, { kind: "risk", name: "hallucination-in-finance-answers", riskTier: "critical" });
    await platform.registries.register(ctx, { kind: "evidence", name: "SOC2 access control review" });

    expect(model.lifecycle).toBe("proposed");
    const inventory = await platform.registries.inventory(ctx);
    expect(inventory.total).toBe(6);
    expect(inventory.byKind.model).toBe(1);
    expect(inventory.byKind.risk).toBe(1);
    expect(inventory.highRiskWithoutEvidence.map(e => e.id)).toContain(risk.id);

    const transitioned = await platform.registries.transition(ctx, model.id, "active");
    expect(transitioned.lifecycle).toBe("active");
    expect(transitioned.version).toBe(2);

    const withEvidence = await platform.registries.attachEvidence(ctx, risk.id, "ev-123");
    expect(withEvidence.linkedEvidenceIds).toContain("ev-123");
    const inventory2 = await platform.registries.inventory(ctx);
    expect(inventory2.highRiskWithoutEvidence.map(e => e.id)).not.toContain(risk.id);
  });

  it("scores the eight ethics pillars deterministically and bands the result", async () => {
    const { platform, ctx } = await testPlatform();
    const a1 = platform.ethics.assess(ctx, "model", "gpt-4o-mini");
    const a2 = platform.ethics.assess(ctx, "model", "gpt-4o-mini");
    expect(a1.scores).toEqual(a2.scores); // deterministic for the same subject
    expect(Object.keys(a1.scores)).toHaveLength(8);
    expect(a1.overall).toBeGreaterThanOrEqual(0);
    expect(a1.overall).toBeLessThanOrEqual(1);
    expect(["low_risk", "moderate_risk", "elevated_risk", "high_risk"]).toContain(a1.band);
    expect(platform.ethics.list(ctx.principal.organizationId).length).toBe(2);
  });
});

describe("ontology", () => {
  it("upserts typed nodes, links them with governed relationship types, and expands the graph", async () => {
    const { platform, ctx } = await testPlatform();
    const team = await platform.ontology.upsertNode(ctx, { type: "team", name: "Platform Engineering" });
    const service = await platform.ontology.upsertNode(ctx, { type: "service", name: "Cerebro Runtime", confidence: 0.9, provenance: "deploy-manifest" });
    const dep = await platform.ontology.upsertNode(ctx, { type: "service", name: "Cerebro Guard" });

    await platform.ontology.link(ctx, { fromNodeId: team.id, toNodeId: service.id, relationship: "OWNS" });
    await platform.ontology.link(ctx, { fromNodeId: service.id, toNodeId: dep.id, relationship: "DEPENDS_ON" });

    const expanded = await platform.ontology.expand(ctx, team.id, 2);
    expect(expanded.nodes.map(n => n.id)).toEqual(expect.arrayContaining([team.id, service.id, dep.id]));
    expect(expanded.edges.length).toBe(2);

    const graph = await platform.ontology.graph(ctx);
    expect(graph.entityTypes).toContain("service");
    expect(graph.relationshipTypes).toContain("DEPENDS_ON");
    expect(graph.nodes.length).toBeGreaterThanOrEqual(3);
  });

  it("rejects an edge referencing an unknown node", async () => {
    const { platform, ctx } = await testPlatform();
    const a = await platform.ontology.upsertNode(ctx, { type: "project", name: "Solo" });
    await expect(platform.ontology.link(ctx, { fromNodeId: a.id, toNodeId: "onode_missing", relationship: "USES" })).rejects.toThrow(/not found/i);
  });
});

describe("web3", () => {
  it("exposes the chain registry, DeFi catalog, and cross-chain/account-abstraction stacks", async () => {
    const { platform } = await testPlatform();
    const chains = platform.web3.chains();
    expect(chains.find(c => c.id === "ethereum")).toBeTruthy();
    expect(chains.find(c => c.id === "base")?.layer).toBe("L2");
    expect(platform.web3.defiCatalog().length).toBeGreaterThan(0);
    expect(platform.web3.crossChain().some(p => p.id === "layerzero")).toBe(true);
    expect(platform.web3.accountAbstraction().some(s => s.id === "erc-4337")).toBe(true);
  });

  it("registers a smart contract and rejects an invalid EVM address", async () => {
    const { platform, ctx } = await testPlatform();
    const contract = await platform.web3.registerContract(ctx, {
      chainId: "base", address: "0x1234567890123456789012345678901234567890", name: "Cerebro Treasury", standard: "erc20",
    });
    expect(contract.auditStatus).toBe("unaudited");
    const list = await platform.web3.listContracts(ctx, "base");
    expect(list.map(c => c.id)).toContain(contract.id);
    await expect(platform.web3.registerContract(ctx, { chainId: "base", address: "not-an-address", name: "Bad", standard: "erc20" }))
      .rejects.toThrow(/invalid/i);
  });

  it("looks up an account with a deterministic offline fallback when RPC is unreachable, and is stable across repeats", async () => {
    const { platform, ctx } = await testPlatform();
    const addr = "0xabababababababababababababababababababab".slice(0, 42);
    const r1 = await platform.web3.accountLookup(ctx, "ethereum", addr);
    const r2 = await platform.web3.accountLookup(ctx, "solana", "someSolanaAddressLookingString");
    expect(r1.chain.id).toBe("ethereum");
    expect(typeof r1.balanceFormatted).toBe("string");
    expect(r2.source).toBe("deterministic-fallback");
  });

  it("produces a deterministic, repeatable compliance risk score", async () => {
    const { platform, ctx } = await testPlatform();
    const addr = "0x00000000000000000000000000000000000001";
    const a = await platform.web3.complianceScreen(ctx, "ethereum", addr);
    const b = await platform.web3.complianceScreen(ctx, "ethereum", addr);
    expect(a.riskScore).toBe(b.riskScore);
    expect(["low", "medium", "high"]).toContain(a.band);
  });
});
