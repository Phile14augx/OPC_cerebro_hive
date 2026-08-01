---
title: "CerebroHive Hermes Agent — MCP Stack Recommendations"
section: "Technology Stack"
company: "CerebroHive"
version: "1.1"
date: "August 2026"
status: "draft — engineering recommendation"
tags: [tech-stack, hermes, mcp, agent-ops, tooling, governance]
---

# Hermes Agent MCP Stack — Recommendations for CerebroHive

> **What this doc is.** A grounded recommendation for which Model Context
> Protocol (MCP) servers the team wires into their _local_ Hermes Agent, plus a
> versioned **template + policy layer** to roll it out safely. It is derived
> from (a) the Hermes MCP catalog guide, (b) the _actually installed_ catalog on
> this machine, and (c) this repo — CerebroHive's own agent platform
> (`apps/studio/agentos`), which already ships an MCP-aware **Tool Execution
> Framework** (agentos-spec Ch. 9).
>
> **Design stance (v1.1):** Hermes is **per-developer infrastructure** — a
> versioned template + policy layer, **not** a committed runtime config. A live
> `~/.hermes/config.yaml` is never committed; only
> `.hermes/config.template.yaml` and `.hermes/policies.yaml` are.

---

## 1. Reality check — what's actually available vs. the generic tier list

The MCP tier list that prompted this doc is a **generic community ranking**
(GitHub, Filesystem, Docker, Postgres, Linear, Figma, …). It does _not_ match
the catalog that ships with _your_ installed Hermes. Verified against the live
CLI (on this machine, after cleanup — see §3):

```text
$ hermes mcp catalog
  Name          Status      Description
  ------------  ----------  ------------------------------------------------
  blender       available   Drive a live Blender session — modeling, scenes, renders.
  comfy-cloud   available   Generate images, video, audio, and 3D on Comfy Cloud.
  figma         available   Official Figma remote MCP (OAuth).
  linear        available   Find, create, and update Linear issues/projects/comments.
  n8n           available   Manage and inspect n8n workflows (stdio bridge).
  unreal-engine available   Drive the Unreal Engine 5.8 editor over its local MCP server.

$ hermes mcp list        # after removing the stray placeholder
  No MCP servers configured.
```

**Key takeaways**

| Fact                                                                                                       | Implication                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| The real catalog is **6 useful entries** (+ a `my-server` demo placeholder that was enabled — now removed) | Most "Tier 1" items (GitHub, Filesystem, Postgres, Docker, K8s) are **not** one-click installs                                     |
| **GitHub / Filesystem / Postgres / Docker** are absent from the catalog                                    | They must be added manually via `hermes mcp add` (stdio subprocess)                                                                |
| `~/.hermes` did not exist until first run; the live config lives in HOME, never in the repo                | Commit only the _template_ + _policy_ — never a populated runtime config                                                           |
| This repo **is** CerebroHive's agent platform                                                              | Treat Hermes MCP as _dev/team productivity_ on top of AgentOS — don't duplicate AgentOS's own tool layer inside Hermes arbitrarily |

---

## 2. What Hermes actually is in your stack (3-layer model)

You already have:

- **agentOS Tool Execution Framework (Ch. 9)** — controlled, audited tool
  execution.
- An internal MCP abstraction layer.
- A planned **MCP marketplace** (CerebroHive platform vision).

So Hermes should **not** be treated as your MCP backbone. Instead:

> **Hermes = developer-side MCP client + integration surface for external
> tools** **agentOS = runtime orchestration + production-grade tool execution**
> **CerebroHive Platform = marketplace, governance, enterprise exposure**

| Layer                | Responsibility                                         |
| -------------------- | ------------------------------------------------------ |
| Hermes CLI           | Dev productivity, local orchestration, experimentation |
| agentOS MCP          | Controlled execution, auditing, production workflows   |
| CerebroHive Platform | Marketplace, governance, enterprise exposure           |

If Hermes starts creeping into runtime paths, you're duplicating your own
platform.

### Data-flow (the alignment that matters)

```
Hermes (dev)
   │  external MCP tools: GitHub, Linear, Figma, n8n, Postgres, Docker
   ▼
agentOS Tool Execution Layer      ← formalizes the same MCP ecosystem for production
   ▼
CerebroHive Platform (future marketplace)
```

Hermes becomes _"the developer control plane for interacting with the same MCP
ecosystem that agentOS will formalize in production."_

---

## 3. Clean baseline (do this first — already done on this machine)

Before layering anything, remove the polluted demo state:

```bash
hermes mcp remove my-server      # stray demo placeholder (was enabled)
hermes mcp catalog               # confirm a clean 6-entry catalog
```

This machine already ran the cleanup; `hermes mcp list` now reports **No MCP
servers configured.** Good baseline to build on.

---

## 4. Recommended stack

### Tier 1 — Immediate install (high ROI, catalog)

| Server     | Why for CerebroHive                                                                                                        | Command                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **linear** | Backlog → agentOS execution traceability; issues referenced across ADRs/backlogs.                                          | `hermes mcp install linear` → OAuth                                 |
| **figma**  | Design → code bridge; extracts design tokens into your Tailwind v4 system; aligns with Design System + Motion Tokens work. | `hermes mcp install figma` → OAuth (Hermes auto-sets `client_name`) |
| **n8n**    | Workflow automation glue; early "agent → workflow" orchestration into agentOS.                                             | `hermes mcp install n8n`                                            |

> `blender`, `comfy-cloud`, `unreal-engine` are not relevant to a B2B AI
> consulting/platform company's core dev loop — skip unless someone owns a
> 3D/multimedia use case.

### Tier 2 — Engineering essentials (manual add, verify upstream first)

| Capability               | Use                                                               | Transport                                         |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------------------- |
| **GitHub**               | Repo introspection, PR automation, CI awareness                   | stdio (`@modelcontextprotocol/server-github`)     |
| **Filesystem (scoped!)** | Read/write only `./apps ./packages ./docs`                        | stdio (`@modelcontextprotocol/server-filesystem`) |
| **Postgres**             | CerebroArchive, Talent OS, pgvector queries                       | stdio (`@modelcontextprotocol/server-postgres`)   |
| **Docker**               | Control execution environments (ties to Stage 5 Secure Execution) | stdio (`@docker/mcp`)                             |
| **Kubernetes**           | Only after infra stabilizes                                       | stdio (verify community server source)            |

> ⚠️ Package names change. For manual adds, read the upstream repo's
> install/bootstrap steps before trusting a server that runs `npm install` /
> `git clone` on your machine.

---

## 5. The correct way to commit this (template + policy, NOT live config)

Do **not** commit a live `~/.hermes/config.yaml` — that pattern leaks local
path/token/trust assumptions across developers. Instead commit a template and a
policy file:

```
.hermes/
  config.template.yaml      # copy -> ~/.hermes/config.yaml, fill secrets via ~/.hermes/.env
  policies.yaml             # non-negotiable guardrails (enforced in review)
docs/
  tech-stack/
    05-hermes-mcp-stack.md  # this doc
```

### Onboarding

```bash
cp .hermes/config.template.yaml ~/.hermes/config.yaml
# edit ~/.hermes/.env to set GITHUB_TOKEN and DATABASE_URL (never commit it)
hermes mcp install linear
hermes mcp install figma
hermes mcp install n8n
hermes mcp add github -- npx -y @modelcontextprotocol/server-github
hermes mcp add fs     -- npx -y @modelcontextprotocol/server-filesystem ./apps ./packages ./docs
hermes mcp add pg     -- npx -y @modelcontextprotocol/server-postgres
hermes mcp add docker -- npx -y @docker/mcp
hermes mcp list
hermes mcp test linear && hermes mcp test github
```

The template uses Hermes's native `mcp_servers:` key and `${ENV_VAR}`
substitution (resolved from `~/.hermes/.env` at connect time). No secrets are
stored in the template.

---

## 6. Security model (non-negotiable)

You're building an enterprise AI OS — treat MCP like an attack surface. (Details
in `.hermes/policies.yaml`.)

**Hard rules**

- No secrets in prompts, ever. All credentials via env vars (`~/.hermes/.env`).
- Read every MCP manifest / upstream source before installing.
- Disable `delete*`, `drop*`, `exec*`, `shell*`, `force_push*`, `rm_*` unless
  explicitly reviewed and needed — use `hermes mcp configure <name>` to uncheck.
- Filesystem server scoped to `./apps ./packages ./docs` **only**. `/` is
  effectively full shell access.

**Production boundary**

- Hermes MCP is **dev-only**. agentOS owns runtime execution. No Hermes in CI or
  production paths.

---

## 7. Next actions

**Option A — Minimal cleanup (done on this machine):** remove `my-server`, init
Hermes, install Linear + Figma + n8n.

**Option B — Proper team setup (this PR):** `config.template.yaml` +
`policies.yaml` committed, `05-hermes-mcp-stack.md` added, onboarding step
documented.

**Option C — Strategic (high leverage, future):** map Hermes MCP → agentOS Tool
Registry; define capability schema, trust levels, execution boundaries; design
the CerebroHive MCP Marketplace architecture.

---

## 8. Open questions for the team

- Standardize on **Linear** (catalog) or keep issues in GitHub? Pick one for the
  Hermes integration to avoid tool sprawl.
- Should DB/infra MCP servers (Postgres, Docker, K8s) be allowed on dev laptops,
  or only on a scoped CI runner? (Security review recommended.)
- Who owns reviewing manifests for manual adds before they're trusted org-wide?
