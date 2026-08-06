"""DevOps/SRE agent skills — IaC, Kubernetes, CI/CD, observability, and platform reliability."""
from __future__ import annotations
import json
from typing import Any, Optional
from pydantic import BaseModel, Field

try:
    from crewai.tools import BaseTool
except ImportError:
    class BaseTool:
        name: str = ""
        description: str = ""
        def run(self, **kwargs: Any) -> str: return self._run(**kwargs)
        def _run(self, **kwargs: Any) -> str: raise NotImplementedError

class InfraInput(BaseModel):
    service: str = Field(..., description="Service or component name.")
    cloud: str = Field(default="aws", description="Cloud provider: aws|azure|gcp.")
    region: str = Field(default="us-east-1", description="Deployment region.")

class K8sInput(BaseModel):
    service: str = Field(..., description="Service name.")
    replicas: int = Field(default=2, description="Minimum replica count.")
    port: int = Field(default=3000, description="Container port.")
    cpu_request: str = Field(default="100m", description="CPU request.")
    memory_request: str = Field(default="128Mi", description="Memory request.")

class CICDInput(BaseModel):
    service: str = Field(..., description="Service to configure pipeline for.")
    runtime: str = Field(default="node", description="Runtime: node|python|go|java.")
    has_db: bool = Field(default=False, description="Whether service requires database in tests.")

class MonitoringInput(BaseModel):
    service: str = Field(..., description="Service to monitor.")
    slo_availability: float = Field(default=99.9, description="SLO availability target %.")
    latency_p99_ms: int = Field(default=500, description="p99 latency SLO in milliseconds.")


class TerraformSkill(BaseTool):
    name: str = "terraform"
    description: str = "Write Terraform modules for cloud resources: VPC, EKS, RDS, S3, IAM, and security groups."
    def _run(self, service: str, cloud: str = "aws", region: str = "us-east-1") -> str:
        return json.dumps({
            "module_structure": {
                f"modules/{service}/main.tf": "Primary resources",
                f"modules/{service}/variables.tf": "Input variables with descriptions and types",
                f"modules/{service}/outputs.tf": "Exported values",
                f"modules/{service}/versions.tf": "Required providers with pinned versions",
            },
            "state": "Remote state in S3 + DynamoDB locking — never commit .tfstate",
            "best_practices": [
                "Pin provider versions — never use ~> without upper bound",
                "Use data sources to reference existing resources",
                "Tag all resources: service, environment, team, cost-center",
                "Separate workspace per environment (dev/staging/prod)",
            ],
        }, indent=2)

class KubernetesSkill(BaseTool):
    name: str = "kubernetes"
    description: str = "Deploy production Kubernetes workloads: manifests, HPA, PDB, NetworkPolicy, and resource limits."
    def _run(self, service: str, replicas: int = 2, port: int = 3000, cpu_request: str = "100m", memory_request: str = "128Mi") -> str:
        return json.dumps({
            "deployment": f"""
apiVersion: apps/v1
kind: Deployment
metadata: {{ name: {service} }}
spec:
  replicas: {replicas}
  strategy: {{ type: RollingUpdate, rollingUpdate: {{ maxSurge: 1, maxUnavailable: 0 }} }}
  template:
    spec:
      serviceAccountName: {service}
      securityContext: {{ runAsNonRoot: true, runAsUser: 1000, fsGroup: 1000 }}
      containers:
        - name: {service}
          resources:
            requests: {{ cpu: {cpu_request}, memory: {memory_request} }}
            limits: {{ cpu: 500m, memory: 512Mi }}
          readinessProbe: {{ httpGet: {{ path: /health/ready, port: {port} }} }}
          livenessProbe: {{ httpGet: {{ path: /health/live, port: {port} }} }}
""",
            "hpa": f"minReplicas: {replicas}, maxReplicas: {replicas * 5}, targetCPUUtilizationPercentage: 70",
            "pdb": f"minAvailable: 1 — ensures at least 1 pod during disruptions",
        }, indent=2)

class HelmSkill(BaseTool):
    name: str = "helm"
    description: str = "Build and manage Helm charts for consistent Kubernetes deployments."
    def _run(self, service: str, replicas: int = 2, port: int = 3000, cpu_request: str = "100m", memory_request: str = "128Mi") -> str:
        return json.dumps({
            "chart_structure": {
                f"charts/{service}/Chart.yaml": "Chart metadata and version",
                f"charts/{service}/values.yaml": "Default values — no secrets here",
                f"charts/{service}/values.prod.yaml": "Production overrides",
                f"charts/{service}/templates/": "Kubernetes manifest templates",
            },
            "versioning": "Helm chart version = app version — tag together",
            "secrets": "Use external-secrets-operator — never Helm secrets plugin in prod",
        }, indent=2)

class ArgocdSkill(BaseTool):
    name: str = "argocd"
    description: str = "Configure ArgoCD GitOps: Application CRDs, sync policy, and health checks."
    def _run(self, service: str, cloud: str = "aws", region: str = "us-east-1") -> str:
        return json.dumps({
            "application": f"""
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: {service}
  namespace: argocd
spec:
  project: cerebrohive
  source:
    repoURL: https://github.com/cerebrohive/cerebro-hive
    targetRevision: main
    path: charts/{service}
  destination:
    server: https://kubernetes.default.svc
    namespace: cerebrohive-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions: [CreateNamespace=true]
""",
            "drift": "selfHeal: true — ArgoCD automatically corrects configuration drift",
        }, indent=2)

class GitHubActionsSkill(BaseTool):
    name: str = "github_actions_devops"
    description: str = "Write GitHub Actions workflows: CI/CD pipelines with all required quality gates."
    def _run(self, service: str, runtime: str = "node", has_db: bool = False) -> str:
        db_service = """
      postgres:
        image: postgres:16-alpine
        env: { POSTGRES_PASSWORD: test, POSTGRES_DB: testdb }
        options: --health-cmd pg_isready
""" if has_db else ""
        return json.dumps({
            "workflow": f"""
name: {service} CI/CD
on:
  pull_request:
  push:
    branches: [main]
jobs:
  lint: {{...}}
  type-check: {{...}}
  unit-test:
    services:{db_service}
    steps: [checkout, setup-{runtime}, install, test-with-coverage]
  integration-test: {{...}}
  sast:
    uses: github/codeql-action/analyze@v3
  build:
    needs: [unit-test, sast]
    steps: [docker-build, trivy-scan, push-to-ghcr]
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: [build]
    steps: [argocd-sync, health-check, smoke-test]
""",
        }, indent=2)

class PrometheusSkill(BaseTool):
    name: str = "prometheus_sre"
    description: str = "Configure Prometheus: scrape configs, alert rules, and SLO recording rules."
    def _run(self, service: str, slo_availability: float = 99.9, latency_p99_ms: int = 500) -> str:
        return json.dumps({
            "alert_rules": f"""
groups:
  - name: {service}
    rules:
      - alert: {service}HighErrorRate
        expr: rate(http_requests_total{{job="{service}",status=~"5.."}}[5m]) / rate(http_requests_total{{job="{service}"}}[5m]) > 0.01
        for: 2m
        labels: {{ severity: critical }}
        annotations: {{ summary: "Error rate >1% on {service}" }}
      - alert: {service}HighLatency
        expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{{job="{service}"}}[5m])) > {latency_p99_ms / 1000}
        for: 5m
        labels: {{ severity: warning }}
""",
            "slo": f"Availability SLO: {slo_availability}%, Error budget: {round(100 - slo_availability, 3)}%",
        }, indent=2)

class GrafanaSkill(BaseTool):
    name: str = "grafana_sre"
    description: str = "Build Grafana dashboards: SLO panels, RED metrics, error budget burn rate."
    def _run(self, service: str, slo_availability: float = 99.9, latency_p99_ms: int = 500) -> str:
        return json.dumps({
            "dashboard_panels": [
                f"Request Rate: rate(http_requests_total{{job='{service}'}}[1m])",
                f"Error Rate %: 100 * ...",
                f"p99 Latency (ms): 1000 * histogram_quantile(0.99, ...)",
                f"Error Budget Remaining: ...",
                "Pod CPU / Memory",
                "Active Connections",
            ],
        }, indent=2)

class VaultSkill(BaseTool):
    name: str = "vault"
    description: str = "Configure HashiCorp Vault: dynamic credentials, PKI, secrets engines, and policies."
    def _run(self, service: str, cloud: str = "aws", region: str = "us-east-1") -> str:
        return json.dumps({
            "dynamic_db_credentials": f"""
# Vault database secrets engine — dynamic PostgreSQL credentials
vault write database/roles/{service} \\
  db_name=cerebrohive \\
  creation_statements="CREATE ROLE {{{{name}}}} LOGIN PASSWORD '{{{{password}}}}' VALID UNTIL '{{{{expiration}}}}'; GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO {{{{name}}}};" \\
  default_ttl="1h" max_ttl="24h"
""",
            "k8s_auth": "Kubernetes auth method — pods authenticate with ServiceAccount JWT",
            "policy": f"""
path "database/creds/{service}" {{ capabilities = ["read"] }}
path "secret/data/{service}/*" {{ capabilities = ["read"] }}
""",
        }, indent=2)

class DockerSkill(BaseTool):
    name: str = "docker_devops"
    description: str = "Build multi-stage distroless Docker images with security scanning and SBOM generation."
    def _run(self, service: str, cloud: str = "aws", region: str = "us-east-1") -> str:
        return json.dumps({
            "best_practices": [
                "Multi-stage build — builder stage + distroless runtime",
                "Non-root user (UID 1000) in runtime stage",
                "Pin base image to digest: FROM node:22-alpine@sha256:...",
                "HEALTHCHECK in Dockerfile",
                ".dockerignore: exclude node_modules, .git, *.env",
            ],
            "scanning": "trivy image --exit-code 1 --severity CRITICAL,HIGH ghcr.io/cerebrohive/{service}:SHA",
            "sbom": "syft ghcr.io/cerebrohive/{service}:SHA -o spdx-json > sbom.json",
            "signing": "cosign sign ghcr.io/cerebrohive/{service}:SHA — verify in deployment pipeline",
        }, indent=2)

class IncidentResponseSkill(BaseTool):
    name: str = "incident_response"
    description: str = "Develop incident response runbooks, on-call procedures, and postmortem templates."
    def _run(self, service: str, slo_availability: float = 99.9, latency_p99_ms: int = 500) -> str:
        return json.dumps({
            "runbook": {
                "trigger": f"Alert: {service} error rate > 1% or p99 latency > {latency_p99_ms}ms",
                "sev1_steps": [
                    "1. Acknowledge alert in PagerDuty within 5 min",
                    f"2. Check {service} pod status: kubectl get pods -n cerebrohive-prod -l app={service}",
                    "3. Check recent deployments: kubectl rollout history deployment/{service}",
                    "4. Check error logs: kubectl logs -l app={service} --since=5m",
                    "5. If deployment issue: kubectl rollout undo deployment/{service}",
                    "6. If DB issue: check connection pool, failover to read replica",
                    "7. Communicate status in #incidents Slack channel",
                    "8. MTTR target: 30 minutes",
                ],
                "escalation": ["On-call engineer → TL → CTO"],
                "postmortem": "Required for all Sev1 — 5 Whys + action items within 48h",
            },
        }, indent=2)

class ChaosEngineeringSkill(BaseTool):
    name: str = "chaos_engineering"
    description: str = "Design chaos experiments: pod failures, network latency, resource starvation, and zone outages."
    def _run(self, service: str, slo_availability: float = 99.9, latency_p99_ms: int = 500) -> str:
        return json.dumps({
            "experiments": [
                f"Pod kill: kubectl delete pod -l app={service} — verify HPA replaces within 60s",
                f"Network latency: tc qdisc add dev eth0 root netem delay 200ms — verify SLO maintained",
                f"OOM: Reduce memory limit to 64Mi — verify pod restarted, alerting triggered",
                f"Zone outage: cordon all nodes in AZ-a — verify traffic shifted to AZ-b and AZ-c",
                f"Dependency failure: block outbound to DB — verify circuit breaker opens, graceful degradation",
            ],
            "tooling": "Chaos Mesh or LitmusChaos — never run in prod without change approval",
            "cadence": "Monthly chaos game days + automated experiments in staging weekly",
        }, indent=2)

DEVOPS_SRE_SKILLS = [
    TerraformSkill(), KubernetesSkill(), HelmSkill(), ArgocdSkill(),
    GitHubActionsSkill(), PrometheusSkill(), GrafanaSkill(), VaultSkill(),
    DockerSkill(), IncidentResponseSkill(), ChaosEngineeringSkill(),
]

__all__ = ["DEVOPS_SRE_SKILLS"]
