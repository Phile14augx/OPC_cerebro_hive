# Gemini Tasks — Midday Assignment 2026-08-06 17:39 IST

**Audit session:** Midday | **Next check:** 3 AM tonight (2026-08-07)
**Git commits reviewed:** 0 commits since 3 AM
**Tasks completed since last session:** None confirmed by commit. Several documentation deliverables are present but uncommitted and require review before they can be closed.

---

## 🔴 P0 — Blockers (do first)

### G-P0-1 · Review and commit the completed documentation change-set

**Files:** `infra/README.md`, `MASTER-PLAN-EVOLUTION-LOG.md`, `CEREBROHIVE_CONSTITUTION.md`, `architecture/ARCHITECTURE_INDEX.md`, `MASTER-PLAN-GAP-ASSESSMENT.md`, `docs/09-templates/26-one-pager-template.md`, `docs/09-templates/27-pitch-deck-template.md`, `agents/hermes/INTEGRATION-NOTES.md`

Review the existing uncommitted documentation work for factual accuracy and link validity. Correct any false claims (in particular, verify that `cerebro-review-stack` is actually an ephemeral preview stack) and commit the reviewed changes in logical documentation commits.

**Success criteria:** the Terraform/CDK boundary, evolution decisions, document-migration links, collateral templates, and Hermes assessment are accurate and committed; no unrelated files are included.
**Complexity:** M | **Dependencies:** none

## 🟠 P1 — Critical

### G-P1-1 · Validate and package the Python agent-runner role expansion

**Files:** `services/agent-runner/src/agent_runner/config.py`, `services/agent-runner/src/agent_runner/main.py`, `services/agent-runner/src/agent_runner/registry.py`, `services/agent-runner/src/agent_runner/*.py`

Inventory the modified and newly added Python role modules, check registry/config wiring, run the focused Python tests or import checks, and commit only the coherent agent-runner implementation. Record any missing tests or runtime configuration gaps.

**Success criteria:** every new role is registered intentionally; focused checks pass; coherent code is committed with a clear message; unresolved gaps are documented.
**Complexity:** M | **Dependencies:** C-P0-3 must first identify whether these files belong to a separate changeset.

## 🟡 P2 — High (after P1)

### G-P2-1 · Produce a pre-integration Hermes tool-binding contract

**Files:** `agents/hermes/agent.yaml`, `agents/hermes/skills.py`, `agents/hermes/INTEGRATION-NOTES.md`, `apps/platform-api/src/modules/agents/`, `apps/platform-api/src/`

Verify every endpoint claimed in the integration notes against platform-api, replacing assumptions with exact routes or explicit gaps. Add a concise binding table that Claude can implement after M10.1 lands.

**Success criteria:** each Hermes tool is marked as existing route, missing route, or external dependency; no endpoint is guessed; the notes are updated and committed.
**Complexity:** S | **Dependencies:** G-P0-1

---

## How to use this file in Antigravity

Work top to bottom. Include the task ID in each commit message so the 3 AM audit can detect completion. Never commit secret values.

*Written by CerebroHive Midday Audit — 2026-08-06 17:39 IST*
