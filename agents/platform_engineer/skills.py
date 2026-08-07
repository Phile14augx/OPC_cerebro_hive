"""Platform Engineer skills — BaseTool subclasses."""
from __future__ import annotations

from typing import Any

try:
    from crewai.tools import BaseTool
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:  # type: ignore[no-redef]
        def __init_subclass__(cls, **kwargs: Any) -> None: ...
    def Field(*a: Any, **kw: Any) -> Any: return None  # noqa: N802
    class BaseTool:  # type: ignore[no-redef]
        name: str = ""
        description: str = ""
        def _run(self, *a: Any, **kw: Any) -> str: return ""


class IDPInput(BaseModel):
    capability: str = Field(..., description="IDP capability to build or improve")
    consumer: str = Field(default="engineering", description="Primary consumer team")

class GoldenPathInput(BaseModel):
    service_type: str = Field(..., description="Service type: api|worker|frontend|ml")
    stack: str = Field(default="typescript/nestjs", description="Technology stack")

class HelmInput(BaseModel):
    chart_name: str = Field(..., description="Helm chart name")
    environment: str = Field(default="production", description="Target environment")

class CICDInput(BaseModel):
    workflow_type: str = Field(..., description="Workflow: pr-check|deploy|release|security-scan")
    language: str = Field(default="typescript", description="Primary language")

class DORAInput(BaseModel):
    metric: str = Field(..., description="DORA metric to measure and improve")
    current_baseline: str = Field(default="", description="Current baseline measurement")


class IDPCapabilitySkill(BaseTool):
    name: str = "idp_capability"
    description: str = "Design and build Internal Developer Platform capabilities."
    args_schema: type[BaseModel] = IDPInput

    def _run(self, capability: str, consumer: str = "engineering") -> str:
        return (
            f"IDP capability: '{capability}' for {consumer} team\n"
            "Platform: Backstage portal + Crossplane (infra) + GitHub Actions\n"
            "Deliverables: Self-service UI | IaC template | Documentation | "
            "SLO definition | Runbook | Onboarding guide"
        )


class GoldenPathSkill(BaseTool):
    name: str = "golden_path"
    description: str = "Create golden path templates for new service bootstrapping."
    args_schema: type[BaseModel] = GoldenPathInput

    def _run(self, service_type: str, stack: str = "typescript/nestjs") -> str:
        return (
            f"Golden path: {service_type} ({stack})\n"
            "Includes: Project scaffold | CI/CD pipeline | Dockerfile | "
            "Helm chart | Observability config (OTel, Prometheus) | "
            "Security defaults (non-root, read-only FS, resource limits) | "
            "README template | ADR template | GitHub repo creation"
        )


class HelmChartSkill(BaseTool):
    name: str = "helm_chart"
    description: str = "Develop and maintain standardised Helm charts for CerebroHive services."
    args_schema: type[BaseModel] = HelmInput

    def _run(self, chart_name: str, environment: str = "production") -> str:
        return (
            f"Helm chart: '{chart_name}' ({environment})\n"
            "Includes: Deployment | Service | HPA | PDB | NetworkPolicy | "
            "ServiceMonitor | ConfigMap | Secret (ExternalSecrets) | "
            "values-{env}.yaml overrides | Chart tests | RBAC"
        )


class CICDPipelineSkill(BaseTool):
    name: str = "cicd_pipeline"
    description: str = "Build standardised, reusable CI/CD pipeline workflows."
    args_schema: type[BaseModel] = CICDInput

    def _run(self, workflow_type: str, language: str = "typescript") -> str:
        return (
            f"CI/CD workflow: {workflow_type} ({language})\n"
            "Platform: GitHub Actions (reusable workflows)\n"
            "Gates: lint → type-check → test → build → sast → "
            "container-scan → deploy → smoke-test\n"
            "Features: Caching | Matrix builds | OIDC auth | "
            "Slack notifications | PR status checks"
        )


class DORAMetricsSkill(BaseTool):
    name: str = "dora_metrics"
    description: str = "Measure and improve DORA metrics for engineering delivery performance."
    args_schema: type[BaseModel] = DORAInput

    def _run(self, metric: str, current_baseline: str = "") -> str:
        return (
            f"DORA metric: {metric}\n"
            f"Baseline: {current_baseline or 'to be measured'}\n"
            "Targets: Deployment frequency ≥10/day | Lead time ≤2h | "
            "MTTR ≤30min | Change failure rate ≤5%\n"
            "Measurement: GitHub + ArgoCD + PagerDuty integration\n"
            "Dashboard: Grafana DORA panel with trend lines"
        )


PLATFORM_ENGINEER_SKILLS: list[BaseTool] = [
    IDPCapabilitySkill(),
    GoldenPathSkill(),
    HelmChartSkill(),
    CICDPipelineSkill(),
    DORAMetricsSkill(),
]
