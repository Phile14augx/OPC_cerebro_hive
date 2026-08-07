"""DevOps / SRE agent — infrastructure, CI/CD, Kubernetes, and platform reliability."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse

_SYSTEM = """You are the Senior DevOps Engineer & SRE for CerebroHive EIOS.

OPERATIONAL MANDATE:
- Infrastructure as Code (IaC) — Terraform or Pulumi. Zero manual infra changes.
- GitOps — ArgoCD/FluxCD for all Kubernetes workload reconciliation
- Immutable infrastructure — replace, never patch in place
- Zero Trust networking — default-deny NetworkPolicy, explicit allow per service pair
- Secrets via Vault dynamic credentials — zero hardcoded secrets anywhere
- Every deployment: health checks + readiness probes before traffic routing
- Rollback strategy documented before every deployment

KUBERNETES STANDARDS:
- resource.requests AND resource.limits on every container
- Non-root UID (1000), readOnlyRootFilesystem, securityContext runAsNonRoot
- PodDisruptionBudget: minAvailable ≥ 1 on every production Deployment
- HPA: minReplicas ≥ 2, CPU target 70%, custom metrics for queue-based scaling
- NetworkPolicy: default-deny ingress, explicit allow from api-gateway + monitoring
- Image tag: never 'latest' — pin to git SHA or semver

OBSERVABILITY REQUIREMENTS (every service):
- RED metrics: rate (requests/s), errors (5xx rate), duration (p50/p95/p99)
- Structured JSON logs to stdout — pino/structlog — with traceId, correlationId
- OTel trace spans — W3C traceparent propagation — OTLP export to Tempo
- Alert rules: high error rate (>1%), high latency (p99 > 500ms), pod restarts

CI/CD QUALITY GATES (GitHub Actions — all required):
- lint → type-check → unit-test → integration-test → sast (CodeQL) → build →
  container-scan (Trivy) → push → deploy → health-check → smoke-test

GIT WORKFLOW:
One Feature → One Worktree → One Branch → One PR → One Merge → Delete Worktree
Branch: feat/{taskId}-{slug} or infra/{taskId}-{slug}
Commit: feat(infra): description OR chore(k8s): description

SRE TARGETS:
- Availability: 99.99% (52 min/year downtime budget)
- MTTD: < 5 min, MTTR: < 30 min
- Change failure rate: < 5%
- Deployment: zero-downtime rolling or blue-green

OUTPUT FORMAT (JSON):
{
  "terraform": [{"path": str, "content": str}],
  "kubernetes": [{"path": str, "kind": str, "content": str}],
  "helm": {"chart": str, "values": dict},
  "github_actions": [{"path": str, "content": str}],
  "monitoring": {"prometheus_rules": list, "grafana_dashboard": str, "alert_channels": list},
  "runbook": {"title": str, "steps": list, "rollback": list},
  "sre": {"availability_target": str, "error_budget_minutes": int, "slo": list},
  "security": {"secret_rotation": str, "network_policy": bool, "image_scanning": bool},
  "git_workflow": {"worktree": str, "branch": str, "pr_title": str},
  "validation_checklist": list
}"""


class DevOpsSREAgent(BaseHiveAgent):
    """Senior DevOps Engineer & SRE — infrastructure, CI/CD, and platform reliability."""

    capability = "DevOpsSRE"
    name = "DevOps/SRE Engineer — Senior DevOps Engineer & Site Reliability Engineer"

    def __init__(self, llm: Any) -> None:
        super().__init__(llm=llm, temperature=0.1, max_attempts=15)

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        user_prompt = f"""
Infrastructure / platform request:
{json.dumps(request.input, indent=2)}

Produce a complete IaC + GitOps implementation plan.

Steps:
1. INFRASTRUCTURE DESIGN — cloud resources, networking, security groups, IAM roles
2. KUBERNETES MANIFESTS — Deployment, Service, ConfigMap, HPA, PDB, NetworkPolicy
3. CI/CD PIPELINE — GitHub Actions workflow with all required quality gates
4. OBSERVABILITY — Prometheus rules, Grafana dashboard, alert configuration
5. SECRETS — Vault integration, dynamic credentials, rotation policy
6. RUNBOOK — deployment steps, health validation, rollback procedure
7. SRE TARGETS — SLOs, error budget, on-call escalation
8. GIT WORKFLOW — worktree, branch, PR title

Return JSON matching the OUTPUT FORMAT.
"""
        raw = self._call_llm(_SYSTEM, user_prompt)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            import re
            m = re.search(r"\{.*\}", raw, re.DOTALL)
            return json.loads(m.group()) if m else {"raw": raw}

    def execute(self, plan: dict[str, Any]) -> dict[str, Any]:
        terraform = plan.get("terraform", [])
        k8s = plan.get("kubernetes", [])
        actions = plan.get("github_actions", [])
        monitoring = plan.get("monitoring", {})
        security = plan.get("security", {})
        git = plan.get("git_workflow", {})

        # Validate K8s manifests
        k8s_kinds = {m.get("kind", "") for m in k8s}
        has_hpa = "HorizontalPodAutoscaler" in k8s_kinds
        has_pdb = "PodDisruptionBudget" in k8s_kinds
        has_network_policy = "NetworkPolicy" in k8s_kinds
        has_deployment = "Deployment" in k8s_kinds
        has_service = "Service" in k8s_kinds

        # Validate observability
        has_alerts = bool(monitoring.get("prometheus_rules"))
        has_dashboard = bool(monitoring.get("grafana_dashboard"))

        # Validate security
        image_scanning = security.get("image_scanning", False)
        network_policy = security.get("network_policy", False) or has_network_policy
        secret_rotation = bool(security.get("secret_rotation"))

        # Validate runbook
        runbook = plan.get("runbook", {})
        has_rollback = bool(runbook.get("rollback"))
        has_steps = bool(runbook.get("steps"))

        # Validate CI/CD
        required_gates = {"lint", "test", "build", "sast", "container-scan"}
        actions_content = " ".join(a.get("content", "") for a in actions)
        gates_present = {g for g in required_gates if g in actions_content}
        missing_gates = required_gates - gates_present

        production_ready = (
            has_deployment
            and has_service
            and has_hpa
            and has_pdb
            and has_alerts
            and has_rollback
            and image_scanning
            and not missing_gates
        )

        return {
            **plan,
            "execution_metrics": {
                "terraform_resources": len(terraform),
                "k8s_manifest_count": len(k8s),
                "k8s_kinds": list(k8s_kinds),
                "has_hpa": has_hpa,
                "has_pdb": has_pdb,
                "has_network_policy": has_network_policy,
                "has_deployment": has_deployment,
                "has_service": has_service,
                "has_alerts": has_alerts,
                "has_dashboard": has_dashboard,
                "image_scanning": image_scanning,
                "network_policy_defined": network_policy,
                "secret_rotation_defined": secret_rotation,
                "has_rollback": has_rollback,
                "has_steps": has_steps,
                "actions_workflow_count": len(actions),
                "missing_ci_gates": list(missing_gates),
                "production_ready": production_ready,
            },
        }

    def _score_implementation(self, plan: dict[str, Any]) -> float:
        score = 0.0
        for k in ["terraform", "kubernetes", "github_actions", "monitoring", "runbook", "git_workflow"]:
            if plan.get(k):
                score += 12.0
        metrics = plan.get("execution_metrics", {})
        if metrics.get("has_hpa"):
            score += 5.0
        if metrics.get("has_pdb"):
            score += 5.0
        if metrics.get("has_network_policy"):
            score += 5.0
        if metrics.get("has_alerts"):
            score += 5.0
        if metrics.get("has_rollback"):
            score += 5.0
        if not metrics.get("missing_ci_gates"):
            score += 5.0
        return min(score, 100.0)

    def observe(self, result: dict[str, Any]) -> dict[str, Any]:
        metrics = result.get("execution_metrics", {})
        score = self._score_implementation(result)
        return {
            "implementationScore": score,
            "terraformResources": metrics.get("terraform_resources", 0),
            "k8sManifestCount": metrics.get("k8s_manifest_count", 0),
            "hasHPA": metrics.get("has_hpa", False),
            "hasPDB": metrics.get("has_pdb", False),
            "hasNetworkPolicy": metrics.get("has_network_policy", False),
            "hasAlerts": metrics.get("has_alerts", False),
            "hasDashboard": metrics.get("has_dashboard", False),
            "imageScanning": metrics.get("image_scanning", False),
            "secretRotation": metrics.get("secret_rotation_defined", False),
            "hasRollback": metrics.get("has_rollback", False),
            "missingCIGates": metrics.get("missing_ci_gates", []),
            "productionReady": metrics.get("production_ready", False),
        }

    def reflect(self, observations: dict[str, Any]) -> list[str]:
        issues: list[str] = []

        if observations.get("k8sManifestCount", 0) == 0:
            issues.append("CRITICAL: No Kubernetes manifests produced")
        if not observations.get("hasHPA"):
            issues.append("CRITICAL: HorizontalPodAutoscaler missing — KPI: auto scaling required")
        if not observations.get("hasPDB"):
            issues.append("CRITICAL: PodDisruptionBudget missing — zero-downtime deployment at risk")
        if not observations.get("hasNetworkPolicy"):
            issues.append("CRITICAL: NetworkPolicy missing — Zero Trust requirement not met")
        if not observations.get("hasAlerts"):
            issues.append("CRITICAL: No Prometheus alert rules — KPI: MTTD < 5 min at risk")
        if not observations.get("imageScanning"):
            issues.append("CRITICAL: Container image scanning not configured — KPI: critical_vulnerabilities = 0")
        if not observations.get("secretRotation"):
            issues.append("WARNING: Secret rotation policy not defined — Vault dynamic credentials required")
        if not observations.get("hasRollback"):
            issues.append("CRITICAL: No rollback procedure in runbook — production deployment blocker")
        missing_gates = observations.get("missingCIGates", [])
        if missing_gates:
            issues.append(f"CRITICAL: Missing CI gates: {missing_gates} — pipeline_success_rate KPI at risk")
        if not observations.get("productionReady"):
            issues.append("BLOCKER: Platform not production-ready — resolve CRITICALs above")

        kpi_checks = {
            "platformAvailability ≥ 99.99%": observations.get("hasHPA") and observations.get("hasPDB"),
            "critical_vulnerabilities = 0": observations.get("imageScanning"),
            "infrastructure_drift = 0": observations.get("terraformResources", 0) > 0,
            "observability_coverage = 100%": observations.get("hasAlerts") and observations.get("hasDashboard"),
        }
        for kpi, passing in kpi_checks.items():
            if not passing:
                issues.append(f"KPI RISK: {kpi} — not satisfied")

        return issues
