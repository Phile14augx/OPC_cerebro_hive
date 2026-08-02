/**
 * Capability registry — pure validation + indexing (PR #25).
 *
 * Scope: parse/validate a registry document, index it by capability id, and
 * resolve a provider for a capability. No file IO, no agentOS coupling — the
 * runtime loader (PR #26) and policy evaluation engine (PR #27) build on this.
 */
import { z } from "zod";
import {
  CapabilityDefinitionSchema,
  CapabilityProviderSpec,
  CapabilityRegistryDocument,
  CapabilityRegistryDocumentSchema,
  ResolvedCapability,
} from "./schema";

/** Validate an unknown value as a registry document; throws ZodError on failure. */
export function validateCapabilityRegistry(doc: unknown): CapabilityRegistryDocument {
  return CapabilityRegistryDocumentSchema.parse(doc);
}

/** Safe variant — returns the parsed doc or the ZodError. */
export function tryValidateCapabilityRegistry(
  doc: unknown,
): { ok: true; value: CapabilityRegistryDocument } | { ok: false; error: z.ZodError } {
  const result = CapabilityRegistryDocumentSchema.safeParse(doc);
  return result.success ? { ok: true, value: result.data } : { ok: false, error: result.error };
}

/**
 * Index a validated document by capability id. Throws on duplicate capability ids
 * (the runtime must not have two definitions for the same stable name).
 */
export function buildCapabilityIndex(
  doc: CapabilityRegistryDocument,
): Map<string, CapabilityRegistryDocument["capabilities"][number]> {
  const index = new Map<string, CapabilityRegistryDocument["capabilities"][number]>();
  for (const cap of doc.capabilities) {
    if (index.has(cap.capability)) {
      throw new Error(`Duplicate capability id: ${cap.capability}`);
    }
    index.set(cap.capability, cap);
  }
  return index;
}

/**
 * Resolve a provider for a capability.
 * @param capability the capability definition
 * @param preferredProviderId optional provider id to prefer; falls back to the
 *        first provider in the (already-ordered) providers array.
 */
export function resolveProvider(
  capability: CapabilityRegistryDocument["capabilities"][number],
  preferredProviderId?: string,
): ResolvedCapability {
  let provider: CapabilityProviderSpec | undefined;
  if (preferredProviderId) {
    provider = capability.providers.find((p) => p.id === preferredProviderId);
  }
  if (!provider) {
    provider = capability.providers[0];
  }
  if (!provider) {
    throw new Error(`No provider available for capability: ${capability.capability}`);
  }
  return { definition: capability, provider };
}

/** Flatten a capability's operation ids. */
export function listOperations(
  capability: CapabilityRegistryDocument["capabilities"][number],
): string[] {
  return capability.operations.map((op) => op.id);
}

/**
 * Minimal glob matcher for operation-id policy patterns.
 * Supports a trailing `*` wildcard only (e.g. "read*", "delete*"). This is the
 * precursor to the PR #27 policy engine and intentionally does NOT implement the
 * full authorization model (scopes, risk gating, approval flow).
 */
export function matchOperationPattern(pattern: string, operationId: string): boolean {
  if (pattern === operationId) return true;
  if (pattern.endsWith("*")) {
    return operationId.startsWith(pattern.slice(0, -1));
  }
  return false;
}

/**
 * Precursory allow/deny check. Deny wins over allow. Returns the decision plus the
 * matching pattern. The authoritative evaluation (risk gating, approvals, scopes)
 * is owned by the PR #27 policy engine; this keeps PR #25 verifiable in isolation.
 */
export function isOperationAllowed(
  capability: CapabilityRegistryDocument["capabilities"][number],
  operationId: string,
): { allowed: boolean; reason: string } {
  for (const deny of capability.policy.deny) {
    if (matchOperationPattern(deny, operationId)) {
      return { allowed: false, reason: `denied by pattern "${deny}"` };
    }
  }
  // If allow is non-empty, an operation must match at least one allow pattern.
  if (capability.policy.allow.length > 0) {
    const matched = capability.policy.allow.some((allow) =>
      matchOperationPattern(allow, operationId),
    );
    if (!matched) {
      return { allowed: false, reason: `not in allowlist` };
    }
  }
  return { allowed: true, reason: "no denials; allowlist satisfied (or open)" };
}

export { CapabilityDefinitionSchema };
