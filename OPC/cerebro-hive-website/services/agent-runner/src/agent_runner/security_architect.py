"""Security Architect agent — Zero Trust architecture, threat modeling, and security governance."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse

_SYSTEM = """You are the Senior Security Architect for CerebroHive EIOS.

SECURITY MANDATE:
- Zero Trust: never trust, always verify — explicit authentication at every service boundary
- Defense-in-Depth: multiple security controls at every layer
- Least Privilege: minimum access required, time-bound where possible
- Secure by Default: secure configuration out of the box, insecure options explicitly opted into
- Security embedded in SDLC — not bolted on post-deployment

ZERO TRUST IMPLEMENTATION:
- Every service-to-service call: mutual TLS (mTLS) via service mesh (Istio/Linkerd)
- Every API request: JWT validation with RS256, audience + issuer + expiry checked
- Every K8s workload: ServiceAccount with minimal RBAC, NetworkPolicy default-deny
- Every secret: Vault dynamic credentials — never static, TTL ≤ 1h for DB credentials
- Every human access: IdP federated (OIDC), MFA enforced, JIT access for prod

THREAT MODELING (STRIDE per feature):
- Spoofing: how could an attacker impersonate this component?
- Tampering: how could data be modified in transit or at rest?
- Repudiation: can actions be proven to have occurred (audit log)?
- Information Disclosure: what data could leak and to whom?
- Denial of Service: what could make this unavailable?
- Elevation of Privilege: how could an attacker gain higher access?

AI SECURITY REVIEW:
- Prompt Injection: does user input reach LLM prompt unsanitized?
- Jailbreak: does system prompt enforce hard boundaries?
- Tool Abuse: can LLM call tools beyond intended scope?
- RAG Poisoning: is retrieval corpus protected from unauthorized writes?
- Data Leakage: could PII from one user appear in another's response?
- Model Exfiltration: is the system prompt exposed in responses?

SECURITY CONTROLS CHECKLIST:
□ Authentication: OAuth2/OIDC or JWT RS256 on every endpoint
□ Authorization: RBAC + ABAC — role check + resource ownership check
□ Secrets: Vault dynamic credentials — no hardcoded secrets
□ Encryption: TLS 1.3 in transit, AES-256 at rest
□ Audit Log: every auth event, admin action, data access logged with actor + timestamp
□ Rate Limiting: per user, per IP, per API key — Cloudflare WAF + application layer
□ Input Validation: all inputs validated and sanitized before processing
□ OWASP Top 10: reviewed and mitigated
□ Supply Chain: SBOM generated, dependencies scanned (Trivy/Grype), signed images
□ Network: NetworkPolicy default-deny, explicit allow per service pair

SECURITY GATE REQUIREMENTS (must all pass):
- SAST: CodeQL — zero HIGH+ code-level findings
- Dependency scan: Trivy/Grype — zero CRITICAL vulnerabilities
- Container scan: Trivy — zero CRITICAL/HIGH image vulnerabilities
- Secret scan: TruffleHog — zero secrets in git history
- DAST: OWASP ZAP — zero HIGH+ findings
- OPA policy: all K8s manifests pass security policy

OUTPUT FORMAT (JSON):
{
  "threat_model": {"components": list, "threats": [{"category": str, "description": str, "mitigations": list, "risk": str}]},
  "security_controls": {"authentication": dict, "authorization": dict, "secrets": dict, "encryption": dict, "network": dict},
  "owasp_review": [{"item": str, "status": str, "evidence": str, "remediation": str}],
  "ai_security": {"prompt_injection_mitigated": bool, "data_leakage_mitigated": bool, "findings": list},
  "compliance": {"frameworks": list, "gaps": list, "controls_mapped": int},
  "security_gates": {"gates": list, "all_passing": bool, "failures": list},
  "opa_policies": [{"path": str, "content": str}],
  "incident_response": {"playbook": str, "escalation": list, "sla_minutes": int},
  "sbom": {"format": str, "tool": str, "components_count": int},
  "security_score": float,
  "approval_status": str,
  "blockers": list
}"""


class SecurityArchitectAgent(BaseHiveAgent):
    """Senior Security Architect — Zero Trust, threat modeling, and enterprise security governance."""

    capability = "SecurityArchitect"
    name = "Security Architect — Senior Security Architect & Enterprise Cybersecurity Governance Lead"

    def __init__(self, llm: Any) -> None:
        super().__init__(llm=llm, temperature=0.05, max_attempts=15)

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        user_prompt = f"""
Security architecture review request:
{json.dumps(request.input, indent=2)}

Produce a comprehensive security architecture assessment and governance plan.

Steps:
1. THREAT MODELING — STRIDE analysis per component, risk rating per threat
2. SECURITY CONTROLS — authentication, authorization, secrets, encryption, network policy
3. OWASP TOP 10 REVIEW — assess each category, status, and remediation
4. AI SECURITY REVIEW — if AI systems present: prompt injection, data leakage, tool abuse
5. COMPLIANCE MAPPING — ISO 27001, SOC 2, NIST CSF, GDPR gaps
6. SECURITY GATES — list required gates, identify failures
7. OPA POLICIES — policy-as-code for K8s security constraints
8. INCIDENT RESPONSE — playbook, escalation, SLA
9. SBOM — supply chain security requirements
10. APPROVAL — overall security score, approval status, blockers

Return JSON matching the OUTPUT FORMAT. Temperature is 0.05 — be deterministic and precise.
"""
        raw = self._call_llm(_SYSTEM, user_prompt)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            import re
            m = re.search(r"\{.*\}", raw, re.DOTALL)
            return json.loads(m.group()) if m else {"raw": raw}

    def execute(self, plan: dict[str, Any]) -> dict[str, Any]:
        threat_model = plan.get("threat_model", {})
        controls = plan.get("security_controls", {})
        owasp = plan.get("owasp_review", [])
        ai_sec = plan.get("ai_security", {})
        compliance = plan.get("compliance", {})
        gates = plan.get("security_gates", {})
        opa = plan.get("opa_policies", [])
        incident = plan.get("incident_response", {})
        blockers = plan.get("blockers", [])

        # Threat model
        threats = threat_model.get("threats", [])
        high_risks = [t for t in threats if t.get("risk", "").lower() in ("high", "critical")]
        mitigated_highs = [t for t in high_risks if t.get("mitigations")]

        # Controls
        has_auth = bool(controls.get("authentication"))
        has_authz = bool(controls.get("authorization"))
        has_secrets = bool(controls.get("secrets"))
        has_encryption = bool(controls.get("encryption"))
        has_network_policy = bool(controls.get("network"))

        # OWASP
        owasp_passing = [o for o in owasp if o.get("status", "").lower() in ("pass", "passing", "mitigated")]
        owasp_failing = [o for o in owasp if o.get("status", "").lower() in ("fail", "failing", "missing", "open")]

        # AI security
        ai_prompt_ok = ai_sec.get("prompt_injection_mitigated", True)  # N/A if no AI
        ai_data_ok = ai_sec.get("data_leakage_mitigated", True)
        ai_findings = ai_sec.get("findings", [])

        # Security gates
        gates_passing = gates.get("all_passing", False)
        gate_failures = gates.get("failures", [])

        # OPA
        has_opa = len(opa) > 0

        # Incident response
        has_incident_playbook = bool(incident.get("playbook"))
        incident_sla = incident.get("sla_minutes", 999)

        # Overall security score
        security_score = plan.get("security_score", 0.0)

        approval_status = plan.get("approval_status", "pending")
        approved = approval_status.lower() in ("approved", "conditional_approval")

        critical_unmitigated = len(high_risks) - len(mitigated_highs)

        production_ready = (
            has_auth
            and has_authz
            and has_secrets
            and has_encryption
            and len(owasp_failing) == 0
            and not gate_failures
            and len(blockers) == 0
            and critical_unmitigated == 0
        )

        return {
            **plan,
            "execution_metrics": {
                "threat_count": len(threats),
                "high_risk_threats": len(high_risks),
                "unmitigated_high_risks": critical_unmitigated,
                "has_auth_controls": has_auth,
                "has_authz_controls": has_authz,
                "has_secrets_management": has_secrets,
                "has_encryption": has_encryption,
                "has_network_policy": has_network_policy,
                "owasp_passing": len(owasp_passing),
                "owasp_failing": len(owasp_failing),
                "ai_prompt_injection_ok": ai_prompt_ok,
                "ai_data_leakage_ok": ai_data_ok,
                "ai_finding_count": len(ai_findings),
                "security_gates_passing": gates_passing,
                "gate_failure_count": len(gate_failures),
                "has_opa_policies": has_opa,
                "has_incident_playbook": has_incident_playbook,
                "incident_sla_minutes": incident_sla,
                "blocker_count": len(blockers),
                "security_score": security_score,
                "approval_status": approval_status,
                "production_ready": production_ready,
            },
        }

    def _score_implementation(self, plan: dict[str, Any]) -> float:
        score = 0.0
        for k in ["threat_model", "security_controls", "owasp_review", "security_gates", "compliance"]:
            if plan.get(k):
                score += 12.0
        metrics = plan.get("execution_metrics", {})
        if metrics.get("has_auth_controls") and metrics.get("has_authz_controls"):
            score += 10.0
        if metrics.get("has_secrets_management"):
            score += 8.0
        if metrics.get("owasp_failing", 999) == 0:
            score += 10.0
        if metrics.get("unmitigated_high_risks", 999) == 0:
            score += 10.0
        return min(score, 100.0)

    def observe(self, result: dict[str, Any]) -> dict[str, Any]:
        metrics = result.get("execution_metrics", {})
        score = self._score_implementation(result)
        return {
            "implementationScore": score,
            "threatCount": metrics.get("threat_count", 0),
            "highRiskThreats": metrics.get("high_risk_threats", 0),
            "unmitigatedHighRisks": metrics.get("unmitigated_high_risks", 0),
            "hasAuthControls": metrics.get("has_auth_controls", False),
            "hasAuthzControls": metrics.get("has_authz_controls", False),
            "hasSecretsManagement": metrics.get("has_secrets_management", False),
            "hasEncryption": metrics.get("has_encryption", False),
            "hasNetworkPolicy": metrics.get("has_network_policy", False),
            "owaspFailing": metrics.get("owasp_failing", 0),
            "aiPromptInjectionOk": metrics.get("ai_prompt_injection_ok", True),
            "aiDataLeakageOk": metrics.get("ai_data_leakage_ok", True),
            "securityGatesPassing": metrics.get("security_gates_passing", False),
            "gateFailureCount": metrics.get("gate_failure_count", 0),
            "hasOPAPolicies": metrics.get("has_opa_policies", False),
            "hasIncidentPlaybook": metrics.get("has_incident_playbook", False),
            "incidentSLAMinutes": metrics.get("incident_sla_minutes", 999),
            "blockerCount": metrics.get("blocker_count", 0),
            "securityScore": metrics.get("security_score", 0.0),
            "approvalStatus": metrics.get("approval_status", "pending"),
            "productionReady": metrics.get("production_ready", False),
        }

    def reflect(self, observations: dict[str, Any]) -> list[str]:
        issues: list[str] = []

        if observations.get("unmitigatedHighRisks", 0) > 0:
            issues.append(f"CRITICAL: {observations['unmitigatedHighRisks']} HIGH/CRITICAL threats without mitigations — release blocked")
        if not observations.get("hasAuthControls"):
            issues.append("CRITICAL: No authentication controls — KPI: security_architecture_compliance = 100% violated")
        if not observations.get("hasAuthzControls"):
            issues.append("CRITICAL: No authorization controls — broken access control (OWASP A01)")
        if not observations.get("hasSecretsManagement"):
            issues.append("CRITICAL: No secrets management — KPI: secrets_in_source_code = 0 at risk")
        if not observations.get("hasEncryption"):
            issues.append("CRITICAL: No encryption strategy — cryptographic failures (OWASP A02)")
        if not observations.get("hasNetworkPolicy"):
            issues.append("CRITICAL: No network policy — Zero Trust coverage = 100% not met")
        if observations.get("owaspFailing", 0) > 0:
            issues.append(f"CRITICAL: {observations['owaspFailing']} OWASP Top 10 items failing — KPI: owasp_compliance = 100% violated")
        if not observations.get("aiPromptInjectionOk"):
            issues.append("CRITICAL: Prompt injection not mitigated — AI safety compliance = 100% violated")
        if not observations.get("aiDataLeakageOk"):
            issues.append("CRITICAL: AI data leakage risk not mitigated")
        if not observations.get("securityGatesPassing"):
            issues.append(f"CRITICAL: {observations.get('gateFailureCount', '?')} security gates failing — KPI: security_gate_pass_rate = 100%")
        if not observations.get("hasOPAPolicies"):
            issues.append("WARNING: No OPA policies — K8s security policy enforcement missing")
        if not observations.get("hasIncidentPlaybook"):
            issues.append("WARNING: No incident response playbook — KPI: incident_response_sla < 30 min unverifiable")
        if observations.get("incidentSLAMinutes", 999) > 30:
            issues.append(f"WARNING: Incident response SLA {observations['incidentSLAMinutes']}min exceeds KPI target of 30min")
        if observations.get("blockerCount", 0) > 0:
            issues.append(f"BLOCKER: {observations['blockerCount']} security blockers — RELEASE DENIED")

        approval = observations.get("approvalStatus", "pending")
        if approval.lower() in ("denied", "rejected", "pending"):
            issues.append(f"SECURITY REVIEW: {approval.upper()} — resolve all CRITICALs before re-review")

        kpi_checks = {
            "critical_vulnerabilities = 0": observations.get("unmitigatedHighRisks", 0) == 0,
            "security_gate_pass_rate = 100%": observations.get("securityGatesPassing"),
            "zero_trust_coverage = 100%": observations.get("hasAuthControls") and observations.get("hasNetworkPolicy"),
            "owasp_compliance = 100%": observations.get("owaspFailing", 0) == 0,
            "secrets_in_source_code = 0": observations.get("hasSecretsManagement"),
        }
        for kpi, passing in kpi_checks.items():
            if not passing:
                issues.append(f"KPI RISK: {kpi} — not satisfied")

        return issues
