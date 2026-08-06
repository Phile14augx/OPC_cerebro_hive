"""Technical Writer agent — documentation architecture, API docs, ADRs, and release notes."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse

_SYSTEM = """You are the Senior Technical Writer for CerebroHive EIOS.

DOCUMENTATION MANDATE:
- Documentation is a first-class engineering artifact — ships with every feature
- Documentation-first: write docs alongside code, not after
- Single source of truth: docs live in git with versioning, reviewed in PR
- Every doc must: be accurate, follow the style guide, include diagrams, be searchable

DOCUMENTATION TYPES AND STANDARDS:
- README.md: purpose, prerequisites, installation, quick start, API ref link, contributing guide
- API Reference (OpenAPI 3.1): every endpoint, all request/response schemas, examples, auth details
- Architecture Guides: context diagrams (C4 Level 1), container diagrams (L2), sequence diagrams
- ADRs: Title, Status, Context, Decision, Consequences, Alternatives Considered — stored in /docs/adr/
- Runbooks: trigger conditions, step-by-step procedure, verification, rollback, escalation
- Tutorials: goal, prerequisites, step-by-step (reproducible), expected output per step
- Changelogs: BREAKING CHANGE, feat, fix, perf, deprecation — per semver release

DIAGRAM STANDARDS (Mermaid preferred):
- System Context: actors, external systems, CerebroHive EIOS boundary
- Sequence: happy path + error flow for every critical API interaction
- State machine: for lease lifecycle, tool execution states, agent state transitions
- Entity Relationship: for data models with cardinality

STYLE GUIDE:
- Active voice: "The agent sends" not "A message is sent by the agent"
- Present tense for current behavior, future tense for planned behavior
- Second person for instructions: "Run the following command"
- Code blocks: language tag always, runnable examples preferred
- Headers: sentence case — "Getting started" not "Getting Started"
- Avoid: jargon without definition, passive voice, "simple", "easy", "just"

VERSIONING:
- Docs version matches software version
- Deprecation notice: added 2 releases before removal
- Migration guides: published when breaking changes introduced
- Changelog: updated in same PR as code change

GIT WORKFLOW:
One Feature → One Worktree → One Branch → One PR → One Merge → Delete Worktree
Commit: docs(component-name): description in present tense

OUTPUT FORMAT (JSON):
{
  "documents": [{"type": str, "path": str, "title": str, "content": str}],
  "diagrams": [{"type": str, "path": str, "mermaid_code": str, "description": str}],
  "api_documentation": {"openapi_version": str, "endpoints": list, "schemas": list},
  "adrs": [{"id": str, "title": str, "status": str, "content": str}],
  "release_notes": {"version": str, "breaking_changes": list, "features": list, "fixes": list},
  "quality_checks": {"broken_links": list, "missing_docs": list, "outdated_docs": list},
  "git_workflow": {"worktree": str, "branch": str, "commit_prefix": str, "pr_title": str}
}"""


class TechnicalWriterAgent(BaseHiveAgent):
    """Senior Technical Writer — documentation architecture, API docs, and release governance."""

    capability = "TechnicalWriter"
    name = "Technical Writer — Senior Technical Writer & Enterprise Documentation Architect"

    def __init__(self, llm: Any) -> None:
        super().__init__(llm=llm, temperature=0.15, max_attempts=12)

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        user_prompt = f"""
Documentation request:
{json.dumps(request.input, indent=2)}

Produce comprehensive technical documentation.

Steps:
1. DOCUMENTATION SCOPE — what needs documenting, audience, priority
2. DOCUMENTS — README, API reference, architecture guide, tutorials, runbooks, ADRs
3. DIAGRAMS — system context, sequence diagrams, state machines, ER diagrams in Mermaid
4. API DOCUMENTATION — OpenAPI 3.1 spec for all endpoints
5. ADRs — capture architectural decisions with context and consequences
6. RELEASE NOTES — if this is a release, produce changelog
7. QUALITY CHECKS — identify broken links, missing docs, outdated content
8. GIT WORKFLOW — worktree, branch, commit prefix, PR title

Return JSON matching the OUTPUT FORMAT. All document content must follow the style guide.
"""
        raw = self._call_llm(_SYSTEM, user_prompt)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            import re
            m = re.search(r"\{.*\}", raw, re.DOTALL)
            return json.loads(m.group()) if m else {"raw": raw}

    def execute(self, plan: dict[str, Any]) -> dict[str, Any]:
        documents = plan.get("documents", [])
        diagrams = plan.get("diagrams", [])
        api_docs = plan.get("api_documentation", {})
        adrs = plan.get("adrs", [])
        release_notes = plan.get("release_notes", {})
        quality = plan.get("quality_checks", {})
        git = plan.get("git_workflow", {})

        # Document type coverage
        doc_types = {d.get("type", "").lower() for d in documents}
        has_readme = any(t in doc_types for t in ("readme", "read-me"))
        has_api_ref = bool(api_docs.get("endpoints"))
        has_architecture = any(t in doc_types for t in ("architecture", "architecture-guide"))
        has_tutorials = any(t in doc_types for t in ("tutorial", "guide", "how-to"))
        has_runbook = any(t in doc_types for t in ("runbook", "operations"))

        # Diagram quality
        diagrams_with_mermaid = [d for d in diagrams if d.get("mermaid_code")]
        sequence_diagrams = [d for d in diagrams if d.get("type", "").lower() in ("sequence", "sequencediagram")]

        # Quality
        broken_links = quality.get("broken_links", [])
        missing_docs = quality.get("missing_docs", [])

        # Git
        git_ok = all(k in git for k in ["branch", "commit_prefix", "pr_title"])

        production_ready = (
            len(documents) > 0
            and not broken_links
            and git_ok
        )

        return {
            **plan,
            "execution_metrics": {
                "document_count": len(documents),
                "diagram_count": len(diagrams),
                "diagrams_with_mermaid": len(diagrams_with_mermaid),
                "sequence_diagrams": len(sequence_diagrams),
                "has_readme": has_readme,
                "has_api_reference": has_api_ref,
                "has_architecture_docs": has_architecture,
                "has_tutorials": has_tutorials,
                "has_runbook": has_runbook,
                "adr_count": len(adrs),
                "has_release_notes": bool(release_notes),
                "broken_link_count": len(broken_links),
                "missing_doc_count": len(missing_docs),
                "git_workflow_complete": git_ok,
                "production_ready": production_ready,
            },
        }

    def _score_implementation(self, plan: dict[str, Any]) -> float:
        score = 0.0
        for k in ["documents", "diagrams", "api_documentation", "quality_checks", "git_workflow"]:
            if plan.get(k):
                score += 15.0
        metrics = plan.get("execution_metrics", {})
        if metrics.get("has_readme"):
            score += 5.0
        if metrics.get("has_api_reference"):
            score += 10.0
        if metrics.get("diagrams_with_mermaid", 0) > 0:
            score += 5.0
        if metrics.get("broken_link_count", 0) == 0:
            score += 10.0
        return min(score, 100.0)

    def observe(self, result: dict[str, Any]) -> dict[str, Any]:
        metrics = result.get("execution_metrics", {})
        score = self._score_implementation(result)
        return {
            "implementationScore": score,
            "documentCount": metrics.get("document_count", 0),
            "diagramCount": metrics.get("diagram_count", 0),
            "diagramsWithMermaid": metrics.get("diagrams_with_mermaid", 0),
            "hasReadme": metrics.get("has_readme", False),
            "hasApiReference": metrics.get("has_api_reference", False),
            "hasArchitectureDocs": metrics.get("has_architecture_docs", False),
            "hasTutorials": metrics.get("has_tutorials", False),
            "hasRunbook": metrics.get("has_runbook", False),
            "adrCount": metrics.get("adr_count", 0),
            "hasReleaseNotes": metrics.get("has_release_notes", False),
            "brokenLinkCount": metrics.get("broken_link_count", 0),
            "missingDocCount": metrics.get("missing_doc_count", 0),
            "gitWorkflowComplete": metrics.get("git_workflow_complete", False),
            "productionReady": metrics.get("production_ready", False),
        }

    def reflect(self, observations: dict[str, Any]) -> list[str]:
        issues: list[str] = []

        if observations.get("documentCount", 0) == 0:
            issues.append("CRITICAL: No documents produced — documentation coverage = 0%")
        if not observations.get("hasReadme"):
            issues.append("WARNING: No README — KPI: readme_accuracy = 100% not applicable")
        if not observations.get("hasApiReference"):
            issues.append("CRITICAL: No API documentation — KPI: api_documentation_coverage = 100% at risk")
        if not observations.get("hasArchitectureDocs"):
            issues.append("WARNING: No architecture documentation — KPI: architecture_documentation_coverage = 100% at risk")
        if observations.get("diagramsWithMermaid", 0) == 0:
            issues.append("WARNING: No Mermaid diagrams — visual documentation quality impacted")
        if observations.get("brokenLinkCount", 0) > 0:
            issues.append(f"CRITICAL: {observations['brokenLinkCount']} broken links detected — KPI: broken_documentation_links = 0")
        if observations.get("missingDocCount", 0) > 0:
            issues.append(f"WARNING: {observations['missingDocCount']} documentation gaps identified")
        if not observations.get("gitWorkflowComplete"):
            issues.append("CRITICAL: Git workflow incomplete — documentation not deliverable via PR")
        if not observations.get("productionReady"):
            issues.append("BLOCKER: Documentation not production-ready")

        kpi_checks = {
            "documentation_coverage = 100%": observations.get("documentCount", 0) > 0,
            "api_documentation_coverage = 100%": observations.get("hasApiReference"),
            "broken_documentation_links = 0": observations.get("brokenLinkCount", 0) == 0,
            "undocumented_production_features = 0": observations.get("missingDocCount", 0) == 0,
        }
        for kpi, passing in kpi_checks.items():
            if not passing:
                issues.append(f"KPI RISK: {kpi} — not satisfied")

        return issues
