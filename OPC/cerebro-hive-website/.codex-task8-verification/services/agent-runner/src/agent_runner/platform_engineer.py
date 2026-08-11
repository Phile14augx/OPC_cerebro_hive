"""Platform Engineer Agent — IDP, golden paths, Helm charts, CI/CD standardisation."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse


class PlatformEngineerAgent(BaseHiveAgent):
    """Senior Platform Engineer & Internal Developer Platform Lead."""

    name: str = "PlatformEngineer"
    capability: str = "PlatformEngineer"
    temperature: float = 0.1
    max_attempts: int = 12

    SYSTEM_PROMPT = """You are a Senior Platform Engineer & Internal Developer Platform Lead for CerebroHive.

PLATFORM MANDATE:
- Engineering teams are your customers — every platform decision improves their DX
- Golden paths are the happy paths: make doing the right thing the easiest thing
- Self-service is the goal: engineers should never need to open a ticket for standard infra
- Platform changes go through the same review process as application code

DORA TARGETS:
- Deployment frequency: ≥10 deployments/day across all services
- Lead time for changes: ≤2 hours (commit to production)
- Mean time to recovery (MTTR): ≤30 minutes
- Change failure rate: ≤5%

IDP STANDARDS (Backstage):
- Every service registered in Backstage software catalogue
- All golden path templates available via Backstage scaffolder
- Tech radar maintained quarterly
- API documentation auto-synced from OpenAPI specs

KUBERNETES STANDARDS:
- All workloads must have: resource requests/limits, HPA, PDB, NetworkPolicy, readiness probe
- No privileged containers, no root users
- All secrets via ExternalSecrets Operator (Vault backend)
- Image scanning in CI: Trivy, fail on CRITICAL/HIGH CVEs
- All images pinned to digest, not tag

CI/CD STANDARDS:
- Reusable GitHub Actions workflows in centralised repo
- Required gates: lint → type-check → test (≥80% coverage) → build → SAST → container-scan → deploy
- Environments: dev → staging → production with manual approval gate for production
- Rollback: ArgoCD automated rollback on failing health checks"""

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""Platform objective: {request.objective}
Context: {json.dumps(request.context, indent=2)}

Design a platform engineering plan with JSON output:
{{
  "platform_capability": "...",
  "consumer_teams": ["...", ...],
  "golden_path_template": true/false,
  "kubernetes_resources": ["Deployment", "Service", "HPA", "PDB", "NetworkPolicy"],
  "helm_chart_needed": true/false,
  "cicd_workflow": "...",
  "backstage_integration": true/false,
  "self_service_ui": true/false,
  "slos": [{{"metric": "...", "target": "..."}}],
  "documentation_required": ["...", ...],
  "estimated_days": 0
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            return json.loads(raw[start:end])
        except Exception:
            return {"raw": raw, "platform_capability": request.objective}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""Platform plan:
{json.dumps(plan, indent=2)}

Produce the platform implementation spec with JSON output:
{{
  "platform_ready": true/false,
  "validation": {{
    "resource_limits_defined": true/false,
    "hpa_configured": true/false,
    "pdb_configured": true/false,
    "network_policy_configured": true/false,
    "secrets_via_external_secrets": true/false,
    "image_scanning_enabled": true/false,
    "cicd_gates_complete": true/false,
    "backstage_catalogue_entry": true/false,
    "documentation_written": true/false
  }},
  "helm_chart_spec": {{...}},
  "cicd_workflow_yaml": "...",
  "backstage_entity": {{...}},
  "runbook_url": "...",
  "onboarding_guide": "..."
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            result = json.loads(raw[start:end])
        except Exception:
            result = {"raw": raw, "platform_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        validation = execution_result.get("validation", {})
        failed = [k for k, v in validation.items() if not v]
        return {
            "platform_ready": execution_result.get("platform_ready", False),
            "failed_checks": failed,
            "failed_count": len(failed),
        }

    def reflect(self, observations: dict[str, Any]) -> str:
        failed = observations.get("failed_checks", [])
        if failed:
            return (
                f"PLATFORM NOT READY — {len(failed)} check(s) failed: "
                f"{', '.join(failed)}. Cannot ship to production."
            )
        return (
            "Platform capability ready for rollout. "
            "Resource limits ✓ | HPA ✓ | PDB ✓ | NetworkPolicy ✓ | "
            "ExternalSecrets ✓ | Image scanning ✓ | CI/CD gates ✓ | "
            "Backstage catalogue entry ✓ | Documentation ✓"
        )
