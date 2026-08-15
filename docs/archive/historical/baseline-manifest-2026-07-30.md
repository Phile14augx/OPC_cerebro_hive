# Architecture Baseline Manifest — 2026-07-30

Supersedes `BASELINE-MANIFEST-2026-07-29.md` as the current checkpoint — that file is not amended or replaced, it remains the historical record of the prior freeze point. This manifest fixes the exact content of everything added or changed since that freeze, so any future drift is independently detectable via hash comparison rather than assumed. Recompute with `sha256sum <path>` (or `Get-FileHash -Algorithm SHA256 <path>` in PowerShell) and diff against this file to verify the baseline hasn't moved.

## Suggested git tag (run locally — this sandbox's `.git` isn't a functional repo, so I couldn't create it from here)

```
git add hiveforge/adr/ADR-038-policy-inheritance-precedence-and-conflict-resolution.md hiveforge/08-ROADMAP.md \
  packages/hiveshield-policy/package.json packages/hiveshield-policy/src/HierarchyTypes.ts \
  packages/hiveshield-policy/src/HierarchicalPolicyEngine.ts packages/hiveshield-policy/src/HierarchicalPolicyEngine.test.ts \
  packages/domain-model/ audit/CREDENTIAL-PROVIDER-COLLISION-REVIEW.md audit/SERVICES-PLATFORM-API-CLASSIFICATION.md \
  audit/name-collisions.md BASELINE-MANIFEST-2026-07-30.md
git commit -m "Freeze baseline: hiveshield-policy typed-ID reconciliation, HiveForge Slice 4 (provider contracts), CredentialProvider + services/platform-api reviews"
git tag -a baseline-2026-07-30 -m "Typed-ID reconciliation complete; HiveForge Slice 4 (ADR-020 provider contracts) complete; CredentialProvider naming collision and services/platform-api orphaned-tree reviews complete. Slice 5 proceeds from here."
git push origin baseline-2026-07-30
```

## What changed since `baseline-2026-07-29`

1. **Typed-ID reconciliation** (`@cerebro/hiveshield-policy`) — `HierarchyLevelPolicies` converted to a discriminated union carrying optional per-level-typed `id?:` (`OrganizationId`/`TenantId`/`ProjectId`/`WorkspaceId`), additive-only, verified via real `tsc`/`vitest` (9/9 tests). `ADR-038`'s Implementation status section updated accordingly. `TenancyScope` gap deliberately left untouched.
2. **HiveForge Slice 4** (`packages/domain-model/src/provider/`) — nine new interfaces/types implementing `ADR-020`'s `ProviderMetadata`/`ProviderExecutor` split as interfaces only, no adapter. Primary finding: no pre-existing implementation of this ADR was found within the inspected scope. Verified via real `tsc`/`vitest` (41/41 package tests).
3. **`audit/CREDENTIAL-PROVIDER-COLLISION-REVIEW.md`** — new review. Finding: `identity-core`'s `CredentialProvider` has zero implementers/consumers anywhere in the repo (dangling); `secrets-core`'s is real and internally consumed. Recommendation: rename `identity-core`'s to `CredentialValidator`; no code changes made.
4. **`audit/SERVICES-PLATFORM-API-CLASSIFICATION.md`** — new review. Finding: `services/platform-api` is a substantial but never-wired parallel implementation (no `package.json`, references a nonexistent `orgRepository`), not a duplicate of the actively-developed Fastify-based `apps/platform-api`. Recommendation: archive as design reference, don't adopt or delete; no action taken.
5. **`audit/name-collisions.md`** — two rows added (`CredentialProvider`, `SecretProvider`) reflecting the findings above.

## Manifest

| File | SHA-256 |
|---|---|
| `hiveforge/adr/ADR-038-policy-inheritance-precedence-and-conflict-resolution.md` | `fcecaee3302c3f3c434e989e0fdc600819c817b08e454d9081954fd176c4082f` |
| `hiveforge/08-ROADMAP.md` | `175b1a4f1502181c692e9d3bea302d0fc12f3d9f19bf5d390497c2825dbf53e8` |
| `packages/hiveshield-policy/package.json` | `4e4bb94a93ff27867be3867273641299cec7384bb02238c8b4541da37ddc7c47` |
| `packages/hiveshield-policy/src/HierarchyTypes.ts` | `431708e6b97a7bdb87068c87102033acee0a40d03c7eb80e0f36873821367ae5` |
| `packages/hiveshield-policy/src/HierarchicalPolicyEngine.ts` | `8cbb6ba54c9f20377f1f2a1e3a258d08ea10935cdbd62fb0485dff3e8894076a` |
| `packages/hiveshield-policy/src/HierarchicalPolicyEngine.test.ts` | `0706510ae9b4af88a5a3a43c5d8814820980814e0e26c54d18d6b1f7c6831694` |
| `packages/domain-model/README.md` | `30fc95b1fb10f85480f96b146b8230bb6385aa67e9652b2bf1b84578a4f64d3a` |
| `packages/domain-model/src/index.ts` | `17b23133bfa350ee4449526b852813154009723d7e8cdee294a01546e8045afc` |
| `packages/domain-model/src/provider/HiveRegion.ts` | `4c5cd3af20d04914b98ab3ea3e72925c36aabb1183c634ff21e24c820a288fcf` |
| `packages/domain-model/src/provider/HiveResourceTypeDescriptor.ts` | `9e0f291116bc52af1720423c38fa21cafb9566e7aacbc21652819d99729fd554` |
| `packages/domain-model/src/provider/HiveProviderQuota.ts` | `45609c2ef25dd0f0e407704246b6482fca7f2c64727c6d839f6bc4ad129b7a5e` |
| `packages/domain-model/src/provider/HiveProviderMetadata.ts` | `408e8baa17f092f37d873606880ca261c564ef3570742cd605e7d61861fd33bd` |
| `packages/domain-model/src/provider/HiveResourceSpec.ts` | `cf08f44ea01e048d30040399391c4c006557bced5ce4ed01d96f3aad649c9db2` |
| `packages/domain-model/src/provider/HiveProviderErrorCode.ts` | `348e60a7602c7827ff4eaf4155442fea3647f3bdc043a4ade3631d117aeb9eec` |
| `packages/domain-model/src/provider/HiveProviderOperation.ts` | `8dc8475dfeb4f6ed4ed07409ba0e0d3315e16dfe3da9dbaf51979f2427cec6e4` |
| `packages/domain-model/src/provider/HiveProviderResourceState.ts` | `3e990a80bb5d058a6951926a8280d200ed149635d7bfab16a398e3f14a405db8` |
| `packages/domain-model/src/provider/HiveProviderExecutor.ts` | `fde8329fe8cb61ab2975b30173daf7871edbaf3159129abba5cfcd6b412dad47` |
| `packages/domain-model/src/provider/HiveProvider.ts` | `3a3e9519e50777ace6289816e564da2a137b22f0daf554627ce21f5742be04f4` |
| `packages/domain-model/src/__tests__/provider.test.ts` | `7487050e3146619174f911e4d6dbba614edf5adb6e627c50b2adecb4b87a4946` |
| `audit/CREDENTIAL-PROVIDER-COLLISION-REVIEW.md` | `9ed184202c2edb121f33728c473d1b7534c06255dd9650d7bed650589b948e91` |
| `audit/SERVICES-PLATFORM-API-CLASSIFICATION.md` | `7edd934fa97a4bc85f01c3e94c92193f4abdd6b3019b08240825a1e9b4b89165` |
| `audit/name-collisions.md` | `331f8d20d28db3e4381d62a90e04082f68696ab5c04fff67cbe707cea13080ed` |

## Known open items at time of freeze

- Policy inheritance precedence/override algorithm's rule 5 ("one algorithm, two evaluators") — deferred per `ADR-038`'s amendment, not resolved.
- `TenancyScope` vs. HiveForge's `Organization→Tenant→Project→Workspace` domain hierarchy — open architectural question, `08-ROADMAP.md` §2.
- `CredentialProvider` rename (`identity-core` → `CredentialValidator`) — recommended, not applied.
- `services/platform-api` archival — recommended, not applied.
- Broader 20-directory `services/*` no-`package.json` scaffolding pattern — flagged, no repository-wide policy decided.
- ADR-020's infrastructure/cloud provider abstraction — no implementation found within inspected scope; not proof of absence repository-wide (`apps/`, `services/`, non-TypeScript infra not exhaustively searched).
