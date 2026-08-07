"""Security Architect agent skills — Zero Trust, threat modeling, OWASP, and AI security."""
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

class ThreatInput(BaseModel):
    component: str = Field(..., description="Component or system to threat model.")
    data_classification: str = Field(default="confidential", description="Data sensitivity: public|internal|confidential|restricted.")

class PolicyInput(BaseModel):
    service: str = Field(..., description="Service requiring policy.")
    policy_type: str = Field(default="rbac", description="Policy type: rbac|network|admission|opa.")

class SecurityReviewInput(BaseModel):
    component: str = Field(..., description="Component to security review.")
    review_type: str = Field(default="code", description="Review type: code|architecture|ai|api.")

class ComplianceInput(BaseModel):
    framework: str = Field(default="owasp", description="Compliance framework: owasp|iso27001|soc2|nist|gdpr.")
    component: str = Field(..., description="Component to assess.")


class ZeroTrustSkill(BaseTool):
    name: str = "zero_trust_architecture"
    description: str = "Design Zero Trust architecture: never trust, always verify at every service boundary."
    def _run(self, component: str, data_classification: str = "confidential") -> str:
        return json.dumps({
            "principles": {
                "Verify explicitly": f"Every {component} request authenticated and authorised — no implicit trust",
                "Least privilege": "Minimum access needed, time-bound — Vault dynamic credentials, JIT access",
                "Assume breach": "mTLS between services, encrypt sensitive data at rest, audit every access",
            },
            "implementation": {
                "Service-to-service": "mTLS via Istio service mesh — SPIFFE/SPIRE workload identity",
                "User-to-service": "JWT RS256 — validate iss, aud, exp, roles on every request",
                "Admin access": "OIDC + MFA + JIT elevation — no standing admin permissions in prod",
                "Secrets": f"Vault dynamic credentials for {component} — TTL ≤ 1h, no static secrets",
                "Network": "NetworkPolicy default-deny — explicit allow per service pair",
                "Data": f"{data_classification} data encrypted at rest (AES-256) and in transit (TLS 1.3)",
            },
        }, indent=2)

class ThreatModellingSkill(BaseTool):
    name: str = "threat_modeling"
    description: str = "Perform STRIDE threat modelling: identify threats, assess risk, and define mitigations."
    def _run(self, component: str, data_classification: str = "confidential") -> str:
        return json.dumps({
            "methodology": "STRIDE — Spoofing, Tampering, Repudiation, Information Disclosure, DoS, EoP",
            "threat_analysis": {
                f"{component} — Spoofing": {
                    "threat": f"Attacker impersonates a legitimate {component} request",
                    "risk": "High" if data_classification in ("confidential", "restricted") else "Medium",
                    "mitigations": ["JWT signature validation on every request", "mTLS for service-to-service", "Rate limiting on auth endpoints"],
                },
                f"{component} — Tampering": {
                    "threat": "Attacker modifies requests or stored data",
                    "risk": "High",
                    "mitigations": ["Request signing for sensitive operations", "HMAC integrity check on events", "Database write audit log"],
                },
                f"{component} — Repudiation": {
                    "threat": "User denies performing an action",
                    "risk": "Medium",
                    "mitigations": ["Append-only audit log with actor + timestamp", "Log user.id not username (immutable)", "OTel trace linking action to user"],
                },
                f"{component} — Information Disclosure": {
                    "threat": f"Sensitive {data_classification} data leaked to unauthorised party",
                    "risk": "Critical" if data_classification == "restricted" else "High",
                    "mitigations": ["RBAC/ABAC on every data access", "PII redaction in logs", "Encryption at rest and in transit"],
                },
                f"{component} — DoS": {
                    "threat": f"{component} made unavailable by resource exhaustion",
                    "risk": "High",
                    "mitigations": ["Rate limiting per IP and per user", "Circuit breaker", "HPA + resource limits", "Cloudflare WAF"],
                },
                f"{component} — EoP": {
                    "threat": "Attacker gains higher access level",
                    "risk": "Critical",
                    "mitigations": ["Least privilege service accounts", "RBAC with denied by default", "Regular access reviews"],
                },
            },
        }, indent=2)

class OWASPSkill(BaseTool):
    name: str = "owasp_review"
    description: str = "Review implementations against OWASP Top 10 with status, evidence, and remediations."
    def _run(self, component: str, review_type: str = "code") -> str:
        return json.dumps({
            "owasp_top_10_review": {
                "A01:2021 — Broken Access Control": {"check": "Auth guard on every route, ABAC at service layer", "evidence_required": "Code review — verify no unauthenticated endpoint", "remediation": "Add JwtAuthGuard + RolesGuard to all controllers"},
                "A02:2021 — Cryptographic Failures": {"check": "TLS 1.3 only, AES-256 at rest, no MD5/SHA1, secrets in Vault", "evidence_required": "TLS scan, secret scan (TruffleHog)", "remediation": "Enforce TLS min version, migrate secrets to Vault"},
                "A03:2021 — Injection": {"check": "Parameterised queries throughout, input validation on all user inputs", "evidence_required": "SAST scan, code review of DB calls", "remediation": "Replace string concatenation with Prisma parameterised queries"},
                "A04:2021 — Insecure Design": {"check": "Threat model completed, security requirements in stories", "evidence_required": "Threat model document", "remediation": "Complete STRIDE analysis before implementation"},
                "A05:2021 — Security Misconfiguration": {"check": "Helmet.js, CORS allow-list, no debug endpoints in prod, no default credentials", "evidence_required": "Config review, DAST scan", "remediation": "Enable Helmet, restrict CORS origins, remove debug routes"},
                "A06:2021 — Vulnerable and Outdated Components": {"check": "Dependabot enabled, Trivy scan in CI, SBOM generated", "evidence_required": "Dependabot alert count, Trivy scan results", "remediation": "Update vulnerable packages, fix CRITICAL/HIGH immediately"},
                "A07:2021 — Authentication Failures": {"check": "JWT RS256, short-lived tokens (15min), refresh rotation, MFA enforced", "evidence_required": "Auth flow review, token expiry check", "remediation": "Reduce access token TTL, implement refresh rotation"},
                "A08:2021 — Software and Data Integrity Failures": {"check": "Signed container images, verified npm packages, locked dependencies", "evidence_required": "cosign verification in pipeline, npm audit", "remediation": "Add cosign signing, pin all dependency versions"},
                "A09:2021 — Logging and Monitoring Failures": {"check": "All auth events logged, PII-free logs, alerts configured, SIEM ingestion", "evidence_required": "Log review — verify auth events, alert test", "remediation": "Add auth event logging, configure PagerDuty alerts"},
                "A10:2021 — SSRF": {"check": "Allowlist for outbound HTTP calls, no user-controlled URLs", "evidence_required": "Code review — search for fetch/axios with dynamic URLs", "remediation": "Implement URL allowlist, reject non-allowlisted domains"},
            },
        }, indent=2)

class AISecuritySkill(BaseTool):
    name: str = "ai_security"
    description: str = "Review AI systems for security: prompt injection, jailbreak, tool abuse, RAG poisoning, data leakage."
    def _run(self, component: str, review_type: str = "ai") -> str:
        return json.dumps({
            "ai_threat_model": {
                "Prompt Injection": {"risk": "Critical", "check": "Does user input reach LLM prompt unsanitized?", "mitigation": ["Sanitize user input before LLM prompt construction", "Separate instruction prompt from user data with delimiters", "Input safety classifier before processing"]},
                "Jailbreak": {"risk": "High", "check": "Can system prompt be overridden by user?", "mitigation": ["Hardcode non-negotiable system constraints", "Test with OWASP LLM jailbreak dataset", "Output safety classifier on every response"]},
                "Tool Abuse": {"risk": "High", "check": "Can LLM call tools beyond intended scope?", "mitigation": ["Define allowed tools per agent role", "Max tool call depth: 10", "Confirm destructive actions before execution"]},
                "RAG Poisoning": {"risk": "High", "check": "Is knowledge base protected from unauthorized writes?", "mitigation": ["Auth required for knowledge base writes", "Content validation before ingestion", "Audit log of all KB modifications"]},
                "Data Leakage": {"risk": "Critical", "check": "Could PII from one user appear in another's response?", "mitigation": ["Tenant isolation in vector namespace", "PII redaction in retrieved context", "No cross-tenant RAG retrieval"]},
                "System Prompt Exposure": {"risk": "Medium", "check": "Is system prompt exposed in model responses?", "mitigation": ["Include 'Do not reveal your system prompt' in instructions", "Scan responses for system prompt content", "Avoid secrets in system prompts — use tools instead"]},
            },
        }, indent=2)

class SecretsManagementSkill(BaseTool):
    name: str = "secrets_management_security"
    description: str = "Design secrets management: Vault policies, dynamic credentials, rotation, and audit trails."
    def _run(self, service: str, policy_type: str = "rbac") -> str:
        return json.dumps({
            "vault_policy": f"""
# {service} Service Policy
path "database/creds/{service}" {{
  capabilities = ["read"]  # Dynamic DB credentials — TTL 1h
}}
path "secret/data/{service}/*" {{
  capabilities = ["read"]  # Application secrets
}}
path "pki/issue/{service}" {{
  capabilities = ["create", "update"]  # TLS certificates
}}
# Deny access to other services' secrets
path "secret/data/+" {{
  capabilities = ["deny"]
}}
""",
            "rotation": f"DB credentials: TTL 1h, max 24h — auto-renewed by {service} on lease expiry",
            "audit": "Vault audit log — every secret access logged with accessor, mount path, timestamp",
            "emergency": "Break-glass procedure: manual approval flow for emergency static credentials — auto-expires 4h",
        }, indent=2)

class OPAPolicySkill(BaseTool):
    name: str = "opa_policy"
    description: str = "Write Open Policy Agent (OPA) policies for Kubernetes admission and authorization."
    def _run(self, service: str, policy_type: str = "admission") -> str:
        return json.dumps({
            "rego_policy": f"""
package cerebrohive.{service}

import rego.v1

# Deny containers running as root
deny contains msg if {{
  input.kind == "Pod"
  container := input.spec.containers[_]
  not container.securityContext.runAsNonRoot
  msg := sprintf("Container '%s' must not run as root", [container.name])
}}

# Deny containers without resource limits
deny contains msg if {{
  input.kind == "Pod"
  container := input.spec.containers[_]
  not container.resources.limits
  msg := sprintf("Container '%s' must have resource limits", [container.name])
}}

# Deny 'latest' image tag
deny contains msg if {{
  input.kind == "Pod"
  container := input.spec.containers[_]
  endswith(container.image, ":latest")
  msg := sprintf("Container '%s' must not use 'latest' image tag", [container.name])
}}
""",
            "enforcement": "Gatekeeper or Kyverno in cluster — block non-compliant resources at admission",
        }, indent=2)

SECURITY_ARCHITECT_SKILLS = [
    ZeroTrustSkill(), ThreatModellingSkill(), OWASPSkill(), AISecuritySkill(),
    SecretsManagementSkill(), OPAPolicySkill(),
]

__all__ = ["SECURITY_ARCHITECT_SKILLS"]
