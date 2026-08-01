import { describe, expect, it } from "vitest";
import {
  buildCapabilityIndex,
  isOperationAllowed,
  listOperations,
  matchOperationPattern,
  resolveProvider,
  tryValidateCapabilityRegistry,
  validateCapabilityRegistry,
} from "./registry";
import { CapabilityRegistryDocumentSchema } from "./schema";

const sourceControl = {
  schemaVersion: "1.0.0",
  capabilities: [
    {
      capability: "source-control",
      description: "Version control operations",
      version: "1.0.0",
      risk: "medium",
      auth: "oauth",
      providers: [
        {
          id: "github",
          kind: "mcp",
          transport: "stdio",
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-github"],
          connectionEnv: ["GITHUB_TOKEN"],
          trustTier: "catalog",
        },
        {
          id: "gitlab",
          kind: "mcp",
          transport: "http",
          url: "https://mcp.gitlab.com/mcp",
          auth: "oauth",
          trustTier: "manual",
        },
      ],
      operations: [
        { id: "read_repo", risk: "low" },
        { id: "create_pr", risk: "medium" },
        { id: "list_issues", risk: "low" },
      ],
      policy: {
        allow: ["read*", "create_pr", "list_issues"],
        deny: ["delete_repository", "force_push"],
        requireApproval: ["force_push"],
      },
    },
  ],
};

describe("schema validation", () => {
  it("accepts a well-formed registry document", () => {
    const doc = validateCapabilityRegistry(sourceControl);
    expect(doc.capabilities[0]?.capability).toBe("source-control");
  });

  it("rejects a non-kebab-case capability id", () => {
    const bad = structuredClone(sourceControl);
    bad.capabilities[0]!.capability = "SourceControl";
    const res = tryValidateCapabilityRegistry(bad);
    expect(res.ok).toBe(false);
  });

  it("rejects a capability with no providers", () => {
    const bad = structuredClone(sourceControl);
    bad.capabilities[0]!.providers = [];
    expect(tryValidateCapabilityRegistry(bad).ok).toBe(false);
  });

  it("rejects an invalid risk level", () => {
    const bad = structuredClone(sourceControl);
    bad.capabilities[0]!.risk = "extreme";
    expect(tryValidateCapabilityRegistry(bad).ok).toBe(false);
  });

  it("applies policy defaults", () => {
    const minimal = CapabilityRegistryDocumentSchema.parse({
      schemaVersion: "1.0.0",
      capabilities: [
        {
          capability: "ping",
          description: "noop",
          version: "1.0.0",
          risk: "low",
          providers: [{ id: "noop", kind: "builtin" }],
          operations: [{ id: "ping" }],
        },
      ],
    });
    expect(minimal.capabilities[0]?.policy.allow).toEqual([]);
    expect(minimal.capabilities[0]?.lifecycle).toBe("Experimental");
  });
});

describe("index + resolution", () => {
  it("indexes by capability id", () => {
    const idx = buildCapabilityIndex(validateCapabilityRegistry(sourceControl));
    expect(idx.get("source-control")?.description).toBe("Version control operations");
  });

  it("throws on duplicate capability ids", () => {
    const dup = structuredClone(sourceControl);
    dup.capabilities.push(structuredClone(dup.capabilities[0]!));
    expect(() => buildCapabilityIndex(validateCapabilityRegistry(dup))).toThrow(/Duplicate/);
  });

  it("resolves the preferred provider when present", () => {
    const doc = validateCapabilityRegistry(sourceControl);
    const resolved = resolveProvider(doc.capabilities[0]!, "gitlab");
    expect(resolved.provider.id).toBe("gitlab");
  });

  it("falls back to the first provider", () => {
    const doc = validateCapabilityRegistry(sourceControl);
    const resolved = resolveProvider(doc.capabilities[0]!);
    expect(resolved.provider.id).toBe("github");
  });

  it("lists operation ids", () => {
    const doc = validateCapabilityRegistry(sourceControl);
    expect(listOperations(doc.capabilities[0]!)).toEqual(["read_repo", "create_pr", "list_issues"]);
  });
});

describe("policy precursor (PR #27 owns the full engine)", () => {
  it("matches trailing-* glob patterns", () => {
    expect(matchOperationPattern("read*", "read_repo")).toBe(true);
    expect(matchOperationPattern("read*", "create_pr")).toBe(false);
  });

  it("deny wins over allow", () => {
    const doc = validateCapabilityRegistry(sourceControl);
    const cap = doc.capabilities[0]!;
    expect(isOperationAllowed(cap, "delete_repository")).toEqual({
      allowed: false,
      reason: 'denied by pattern "delete_repository"',
    });
  });

  it("respects an allowlist when present", () => {
    const doc = validateCapabilityRegistry(sourceControl);
    const cap = doc.capabilities[0]!;
    expect(isOperationAllowed(cap, "read_repo").allowed).toBe(true);
    expect(isOperationAllowed(cap, "create_pr").allowed).toBe(true);
    // not in allowlist and not denied -> blocked by allowlist
    expect(isOperationAllowed(cap, "archive_repo")).toEqual({
      allowed: false,
      reason: "not in allowlist",
    });
  });
});
