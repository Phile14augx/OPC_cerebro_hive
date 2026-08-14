# Day 1 Security Notes

## Enforced now

- Talent OS APIs reject missing `Authorization` with 401 and do not run Prisma.
- Talent mock sandbox no longer `eval`s candidate code.
- Trivy adapter no longer returns a fake CVE as `succeeded`.
- Studio platform client sends `Authorization` when a token provider is configured.

## Explicitly not changed

- **forge-api is not globally authenticated.** Wrapping every controller in JwtGuard would take down the nine local CerebroForge tools until Studio attaches tokens. Gate with tokens first (later day), then require auth.
- Twin Studio tenant is still derived from request headers and is spoofable.
- Secrets remain in env / compose; no new secret store.

## Operator requirements

- Set `KEYCLOAK_SERVER_URL` (not only `KEYCLOAK_URL`) for JWT verification.
- Do not treat skipped analyzers or 501 Talent routes as passed security controls.
