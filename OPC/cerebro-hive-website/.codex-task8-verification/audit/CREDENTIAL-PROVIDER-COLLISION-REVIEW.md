# CredentialProvider Naming Collision — Architecture Review

**Status:** Review complete. No implementation changes made — per scope, this document records findings and a recommendation only; nothing here has been applied to code.

**Origin:** surfaced during the HiveForge Slice 4 provider-abstraction inventory (`packages/domain-model/README.md`), which found `identity-core`'s and `secrets-core`'s `CredentialProvider` interfaces share a name but do opposite things. That finding was deliberately left unresolved at the time, out of Slice 4's scope. This document is the dedicated follow-up review.

## The two interfaces, side by side

**`packages/identity-core/src/credentials/CredentialProvider.ts`:**
```ts
export interface CredentialProvider {
  validatePassword(principalId: string, passwordHash: string): Promise<boolean>;
  validateApiKey(apiKey: string): Promise<string | null>; // Returns principalId if valid
  validateOAuthToken(token: string): Promise<string | null>;
}
```

**`packages/secrets-core/src/providers/CredentialProvider.ts`:**
```ts
export interface CredentialProvider {
  getType(): CredentialType; // 'ApiKey' | 'OAuth' | 'Certificate' | 'JwtSigningKey' | 'CloudCredential'
  issue(policy: CredentialPolicy): Promise<IssueResult>; // { value, expiresAt }
  revoke(value: string): Promise<void>;
}
// + ApiKeyProvider implements CredentialProvider (real, generates a chv_-prefixed high-entropy key)
```

## What responsibilities does each own?

- **`identity-core`'s `CredentialProvider`** is an **authentication-time validation** contract: given a credential a caller has already presented (a password hash, an API key, an OAuth token), answer whether it's valid and, if so, which principal it belongs to. This is the shape a login/API-gateway auth check would call against.
- **`secrets-core`'s `CredentialProvider`** is a **credential-issuance/lifecycle-management** contract: mint a brand-new credential against a policy (max TTL, rotation strategy, allowed workspaces/environments), and revoke one later. This is the shape a vault/secrets-management service would call to hand out new API keys, certificates, or signing keys.

These sit at opposite ends of a credential's life: `secrets-core` creates and destroys credential material; `identity-core` (would) check a credential a caller already has in hand. Notably, `secrets-core`'s `CredentialType` includes `'OAuth'` and `identity-core`'s interface has `validateOAuthToken` — the two are conceptually adjacent (both touch OAuth credentials) but from opposite lifecycle ends, not overlapping implementations of the same operation.

## Are they actually the same abstraction?

**No.** Zero method signatures overlap, no shared types are imported between the two files, and there is no code anywhere that imports both and treats them interchangeably. This is a name collision, not a duplicate-implementation problem (unlike the earlier `PolicyEngine`/`CapabilityRegistry`/`DomainEvent` findings, which were genuinely competing implementations of the same concept).

## Consumer evidence (real, not assumed)

This is the finding that changes the shape of the recommendation:

- **`identity-core`'s `CredentialProvider` has zero consumers and zero implementers anywhere in the repository.** A repo-wide search for `validatePassword`, `validateApiKey`, and `validateOAuthToken` — its three method names — matches only the interface's own declaration file. It is re-exported from `identity-core/src/index.ts`, but nothing outside that one file references `CredentialProvider` by name, implements it, or calls any of its methods. It appears to be a designed-but-never-wired interface, not a live abstraction with a rename risk attached to real call sites.
- **`secrets-core`'s `CredentialProvider` is real and internally consumed.** `SecretsManager.ts` (`packages/secrets-core/src/manager/`) imports it directly, stores implementations in a `Map<CredentialType, CredentialProvider>` via `registerProvider()`, and calls `.issue()`/`.getType()` in both `issueCredential()` and `rotateCredential()`. `ApiKeyProvider implements CredentialProvider` is a real, working implementation (not a mock — it generates actual high-entropy key material via `crypto.getRandomValues`).
- **However, `secrets-core`'s `SecretsManager` itself has no external consumers.** A repo-wide search for `SecretsManager` usage of this specific class turns up only `secrets-core`'s own source and test file — no `apps/` or `services/` package imports and calls it. So `secrets-core`'s `CredentialProvider` is real, tested-by-implication code, but not yet wired into a live authentication/secrets-issuance flow anywhere.
- **A third, related naming collision, found while confirming the above:** `services/enterprise-control-plane/src/SecretsManager.ts` independently defines its own unrelated `SecretsManager` class (already flagged generically in `audit/name-collisions.md`'s `SecretsManager` row) alongside a `SecretProvider` interface (`resolveSecret(key: string): Promise<string>`) — a third, differently-shaped credential/secret concept, backed only by two mock providers (`PostgresSecretProvider`, `HashiCorpVaultProvider`, both `console.log` stubs). This package has zero consumers anywhere in the repo (only self-references). Its existence matters directly to the naming recommendation below: **`SecretProvider` is not an available disambiguation name** — it's already taken by this third, equally-unwired concept.

## Naming recommendation

Given the evidence above — one interface is completely dangling (no implementers, no callers), the other is real but internally-scoped — the collision carries very little actual rename risk today. The recommendation:

1. **Keep `secrets-core`'s `CredentialProvider` name as-is.** It's the one with a real implementation and a real internal consumer (`SecretsManager`). Renaming the live one to accommodate the dead one would be backwards.
2. **Rename `identity-core`'s `CredentialProvider` to `CredentialValidator`.** This directly names what its three methods actually do (validate a presented credential, don't issue or manage one), reads unambiguously next to `secrets-core`'s `CredentialProvider`, and — checked against `audit/name-collisions.md` and this review's own findings — `CredentialValidator` collides with nothing else in the repository. `SecretProvider`, `CredentialResolver`, and `IdentityCredentialProvider` (the alternatives raised for this review) were considered: `SecretProvider` is ruled out (taken by `services/enterprise-control-plane`, per above); `CredentialResolver` is a plausible second choice but reads more like something that looks up which provider to use, closer to a registry/resolver role than a validation contract; `IdentityCredentialProvider` doesn't resolve the actual naming problem, since it still contains the word "Provider" doing double duty for two different meanings ("provides validation" vs. "provides new credential material") across the codebase.
3. **No change to `secrets-core`.**

## Recommended ownership/scope

- `identity-core` owns credential **validation** (is this presented credential valid, and for whom) — this is squarely an authentication-boundary concern, consistent with the rest of `identity-core`'s public surface (`Principal`, `IdentityContext`, `AuthorizationProvider`).
- `secrets-core` owns credential **issuance and lifecycle** (mint, rotate, revoke, vault-backed storage) — a secrets-management concern, consistent with `SecretsManager`/`VaultEngine`/`KeyProvider` already in that package.
- These are legitimately two different bounded contexts that will need to collaborate in a real auth flow (something issues a credential via `secrets-core`, something else validates it later via `identity-core`'s renamed contract) but should not be merged into one interface — merging would recreate exactly the "one algorithm, two evaluators" kind of premature convergence this project's own `ADR-038` rule 5 amendment already chose not to force.

## What this does not decide

Whether `identity-core`'s `CredentialValidator` (post-rename) is ever actually implemented and wired into a real auth flow is a separate, future scoping decision — this review only resolves the naming ambiguity and records that the interface is currently unimplemented. Likewise, whether `secrets-core`'s `SecretsManager`/`CredentialProvider` pair gets wired into a real consumer, and what should happen to the fully unwired `services/enterprise-control-plane` `SecretsManager`/`SecretProvider` pair, are separate governance questions not resolved here.

## Implementation changes made

None. Per scope, this is a review-and-recommendation document only.
