# Security Policy

## Reporting a vulnerability

If you believe you've found a security vulnerability in this repository (the
CerebroHive website or the AgentOS backend under `agentos/`), please report it
privately rather than opening a public GitHub issue:

- Email: security@cerebrohive.com *(update this to a real, monitored address before publishing)*
- Please include: the affected component/URL, steps to reproduce, and the
  potential impact. Proof-of-concept code is welcome.

We aim to acknowledge reports within 3 business days. Please give us a
reasonable window to investigate and ship a fix before any public disclosure.

## Scope

- `app/`, `components/`, `lib/`, `middleware.ts` — the Next.js website
- `agentos/` — the FastAPI backend service (agent runtime, memory, governance, etc.)

Out of scope: third-party services this project links to or embeds, and
denial-of-service testing against the production deployment (please test
against a local clone instead — see `agentos/DEPLOY.md` and the root
`start-*.bat` scripts).

## Current security posture

This is an actively developed project. See the security roadmap document for
a full breakdown of what's implemented today (security headers, CSP, rate
limiting, input validation, admin-secret gating, dependency/secret scanning
in CI) versus what's planned but not yet in place (SSO/SAML, WAF/edge
protection, SIEM, third-party audits). If you're evaluating this project for
production/enterprise use, ask for the current roadmap doc rather than
assuming parity with a mature SaaS platform's security program.
