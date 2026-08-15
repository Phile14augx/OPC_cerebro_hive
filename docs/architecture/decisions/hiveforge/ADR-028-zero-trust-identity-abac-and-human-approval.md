# ADR-028: Zero Trust identity, ABAC authorization, and the human-approval decision outcome

**Status:** Proposed (Phase 6, security track)

## Context

`ADR-023` fixed HiveForge-facing identity (OIDC/OAuth2) and credential escrow, but explicitly deferred "the precise role/permission model" to implementation. Phase 6 needs a concrete authorization model to specify the rest of the security architecture against.

## Decision

Authorization is **attribute-based (ABAC)**, not a fixed role list: a decision considers Role, Department, Location, Project, Classification, and Risk Score (and any other attribute a `Policy` names), evaluated by `PolicyEngine`. This narrows a decision *within* the Organization/Tenant/Project/Workspace scoping `01-DOMAIN-MODEL.md` §4 already fixes — ABAC does not replace that attachment-level model.

The decision engine has four outcomes, not two: `Permit`, `Deny`, `Step-up MFA` (re-invoke authentication with a stronger factor), `Human Approval` (route to the approval workflow described in `06-SECURITY.md` §14 — not duplicated here).

Authentication mechanisms supported into `HiveIdentity`: Passkeys/WebAuthn, FIDO2, MFA, SSO, OIDC, SAML.

## Consequences

- `PolicyEngine`'s contract now includes returning one of four outcomes, not a boolean — every caller of `PolicyEngine` must handle `Step-up MFA` and `Human Approval` as real control-flow branches, not edge cases.
- This ADR does not fix the specific attribute schema (what values `Classification` or `Risk Score` may take) — that's an implementation detail constrained by, not dictated by, this decision.
- `ADR-026`'s open infrastructure-isolation question is resolved by an amendment recorded there (see `06-SECURITY.md` §1/§17), not by this ADR.
