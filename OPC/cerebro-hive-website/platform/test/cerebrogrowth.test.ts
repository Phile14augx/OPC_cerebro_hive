import { describe, expect, it } from "vitest";
import { testPlatform } from "./helpers.js";
import { LEAD_STAGE_ORDER } from "../src/domains/cerebrogrowth/cerebrogrowth.js";

describe("CerebroGrowth™ — Enterprise AI Growth OS Phase 1 (Content Studio + CRM + Sales Copilot)", () => {
  it("generates a full multi-channel content set from one research input", async () => {
    const { platform, ctx } = await testPlatform();
    const set = await platform.cerebroGrowth.generateContentSet(ctx, {
      sourceTitle: "Enterprise AI Governance at Scale",
      sourceExcerpt: "Organizations adopting multi-agent systems need governance and automation to reach production.",
    });
    expect(set.pieces.map(p => p.type)).toEqual([
      "exec-summary", "ceo-post", "company-post", "carousel", "infographic-brief", "newsletter", "blog", "video-script",
    ]);
    expect(set.pieces.every(p => p.body.length > 0)).toBe(true);
  });

  it("is deterministic — same input produces the same content set", async () => {
    const { platform, ctx } = await testPlatform();
    const input = { sourceTitle: "RAG at Enterprise Scale", sourceExcerpt: "Retrieval augmented generation needs grounding and evaluation." };
    const a = await platform.cerebroGrowth.generateContentSet(ctx, input);
    const b = await platform.cerebroGrowth.generateContentSet(ctx, input);
    expect(a.pieces.map(p => p.body)).toEqual(b.pieces.map(p => p.body));
  });

  it("refuses an empty source title or excerpt", async () => {
    const { platform, ctx } = await testPlatform();
    await expect(platform.cerebroGrowth.generateContentSet(ctx, { sourceTitle: "  ", sourceExcerpt: "x" })).rejects.toThrow();
    await expect(platform.cerebroGrowth.generateContentSet(ctx, { sourceTitle: "x", sourceExcerpt: "  " })).rejects.toThrow();
  });

  it("creates a lead with an AI opportunity/risk score and auto-assigns an initial stage", async () => {
    const { platform, ctx } = await testPlatform();
    const lead = await platform.cerebroGrowth.createLead(ctx, {
      contactName: "Jordan Lee", email: "jordan@acme.com", title: "Chief Technology Officer",
      companyName: "Acme Corp", industry: "Manufacturing", employeeCount: 8000,
      source: "referral", notes: "Looking to build AI agents for customer support automation.",
    });
    expect(lead.opportunityScore).toBeGreaterThanOrEqual(0);
    expect(lead.opportunityScore).toBeLessThanOrEqual(99);
    expect(["new", "qualified"]).toContain(lead.stage);
    expect(lead.recommendedService).toBeTruthy();
    expect(lead.history[0]!.stage).toBe("new");
  });

  it("scores a strong enterprise referral lead higher than a weak cold-outbound one", async () => {
    const { platform, ctx } = await testPlatform();
    const strong = await platform.cerebroGrowth.createLead(ctx, {
      contactName: "Strong Lead", email: "strong@bigco.com", title: "Chief AI Officer",
      companyName: "BigCo", employeeCount: 20000, source: "referral", notes: "Enterprise-wide AI transformation initiative underway, budget approved.",
    });
    const weak = await platform.cerebroGrowth.createLead(ctx, {
      contactName: "Weak Lead", email: "weak@tiny.com", companyName: "Tiny LLC", employeeCount: 3, source: "outbound",
    });
    expect(strong.opportunityScore).toBeGreaterThan(weak.opportunityScore);
  });

  it("advances a lead forward through the pipeline but rejects moving it backward", async () => {
    const { platform, ctx } = await testPlatform();
    const lead = await platform.cerebroGrowth.createLead(ctx, {
      contactName: "Pipeline Test", email: "pipeline@test.com", companyName: "TestCo", source: "inbound",
    });
    const meeting = await platform.cerebroGrowth.advanceLeadStage(ctx, lead.id, "meeting");
    expect(meeting.stage).toBe("meeting");
    expect(meeting.history.some(h => h.stage === "meeting")).toBe(true);
    await expect(platform.cerebroGrowth.advanceLeadStage(ctx, lead.id, "new")).rejects.toThrow();
  });

  it("allows marking a lead lost from any stage", async () => {
    const { platform, ctx } = await testPlatform();
    const lead = await platform.cerebroGrowth.createLead(ctx, {
      contactName: "Lost Test", email: "lost@test.com", companyName: "LostCo", source: "event",
    });
    const lost = await platform.cerebroGrowth.advanceLeadStage(ctx, lead.id, "lost");
    expect(lost.stage).toBe("lost");
  });

  it("generates a proposal for a lead and advances its stage to proposal", async () => {
    const { platform, ctx } = await testPlatform();
    const lead = await platform.cerebroGrowth.createLead(ctx, {
      contactName: "Proposal Test", email: "proposal@test.com", companyName: "ProposalCo",
      employeeCount: 1200, source: "lead-gen-form", notes: "Need help with data pipeline and analytics.",
    });
    const proposal = await platform.cerebroGrowth.generateProposal(ctx, lead.id);
    expect(proposal.tiers.length).toBe(3);
    expect(proposal.tiers[0]!.priceUsd).toBeLessThan(proposal.tiers[2]!.priceUsd);
    expect(proposal.timelineWeeks.length).toBeGreaterThan(0);

    const leads = await platform.cerebroGrowth.listLeads(ctx);
    const updated = leads.find(l => l.id === lead.id)!;
    expect(LEAD_STAGE_ORDER.indexOf(updated.stage)).toBeGreaterThanOrEqual(LEAD_STAGE_ORDER.indexOf("proposal"));
  });

  it("404s generating a proposal for an unknown lead", async () => {
    const { platform, ctx } = await testPlatform();
    await expect(platform.cerebroGrowth.generateProposal(ctx, "does-not-exist")).rejects.toThrow();
  });

  it("generates a sales copilot brief with company intelligence", async () => {
    const { platform, ctx } = await testPlatform();
    const brief = await platform.cerebroGrowth.generateSalesBrief(ctx, { companyName: "Contoso", industry: "Retail" });
    expect(brief.companyName).toBe("Contoso");
    expect(brief.aiMaturity.score).toBeGreaterThanOrEqual(0);
    expect(brief.discoveryQuestions.length).toBeGreaterThan(0);
    expect(brief.stakeholders.length).toBeGreaterThan(0);
  });

  it("scopes leads and briefs per organization", async () => {
    const { platform, ctx } = await testPlatform();
    const { ctx: otherCtx } = await testPlatform();
    const lead = await platform.cerebroGrowth.createLead(ctx, { contactName: "Org Scoped", email: "scoped@test.com", companyName: "ScopedCo", source: "inbound" });
    const otherLeads = await platform.cerebroGrowth.listLeads(otherCtx);
    expect(otherLeads.map(l => l.id)).not.toContain(lead.id);
    await expect(platform.cerebroGrowth.advanceLeadStage(otherCtx, lead.id, "qualified")).rejects.toThrow();
  });
});
