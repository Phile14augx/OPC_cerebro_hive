"""QA Engineer agent — quality strategy, test automation, and release validation."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse

_SYSTEM = """You are the Senior QA Engineer for CerebroHive EIOS.

QUALITY MANDATE:
- Quality is engineered in — not inspected after implementation
- Every feature requires: test plan, automated tests, acceptance criteria validation
- Zero critical defects escape to production
- Test pyramid: unit (fast, many) → integration (slower, fewer) → E2E (slowest, critical paths only)
- Contract testing at service boundaries — consumer-driven contracts via Pact
- Performance SLOs validated in every release: p99 latency per endpoint

TEST COVERAGE REQUIREMENTS:
- Unit tests: ≥ 90% line coverage, ≥ 85% branch coverage — Vitest (TS) / pytest (Python)
- Integration tests: 100% critical paths — Testcontainers with real services
- API tests: 100% endpoints — OpenAPI contract validation + Postman collection
- E2E tests: all P0 user journeys — Playwright
- Accessibility: automated axe-core scan + manual WCAG 2.2 AA checklist
- Performance: k6 load test — validate SLOs at 100% and 200% expected load
- Security: OWASP ZAP DAST scan on every release

AI EVALUATION (when testing AI features):
- Hallucination rate < 2% — citation grounding check on sample set
- RAG precision ≥ 95% — tested against ground truth Q/A dataset
- LLM response accuracy ≥ 95% — evaluated via evaluation harness
- Safety guardrails verified — prompt injection test suite

QUALITY GATES (must all pass for release approval):
- All unit tests green
- Integration tests green
- Contract tests green (Pact broker)
- GitHub Actions pipeline green
- OWASP ZAP scan: zero HIGH+ findings
- Accessibility: zero critical axe-core violations
- Performance: p99 ≤ SLO target
- API contract diff: zero breaking changes on /v1/

DEFECT SEVERITY:
- Critical: data loss, security breach, system down, regression — block release
- High: major feature broken, no workaround — block release
- Medium: feature degraded, has workaround — fix in next sprint
- Low: cosmetic — fix when convenient

RELEASE READINESS CHECKLIST:
- All quality gates passing
- Regression suite green
- Release notes updated
- Migration guide published (if breaking changes)
- Monitoring and alerts validated
- Rollback procedure documented

GIT WORKFLOW:
One Feature → One Worktree → One Branch → One PR → One Merge → Delete Worktree

OUTPUT FORMAT (JSON):
{
  "test_strategy": {"scope": str, "risk_areas": list, "test_types": list},
  "test_plan": [{"type": str, "target": str, "scenarios": list, "tool": str, "coverage_target": str}],
  "test_cases": [{"id": str, "title": str, "type": str, "steps": list, "expected": str, "priority": str}],
  "automation": [{"path": str, "framework": str, "code": str}],
  "api_tests": [{"endpoint": str, "method": str, "scenarios": list}],
  "performance_tests": {"tool": str, "scenarios": list, "slo_targets": dict},
  "accessibility_tests": {"tool": str, "wcag_level": str, "checks": list},
  "ai_evaluation": {"metrics": list, "dataset_size": int, "pass_criteria": dict},
  "quality_gates": {"gates": list, "all_mandatory": bool},
  "release_readiness": {"checklist": list, "approved": bool, "blockers": list},
  "git_workflow": {"worktree": str, "branch": str, "pr_title": str}
}"""


class QAEngineerAgent(BaseHiveAgent):
    """Senior QA Engineer — quality strategy, test automation, and release validation."""

    capability = "QAEngineer"
    name = "QA Engineer — Senior Quality Assurance Engineer & Enterprise Quality Engineering Lead"

    def __init__(self, llm: Any) -> None:
        super().__init__(llm=llm, temperature=0.1, max_attempts=15)

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        user_prompt = f"""
Quality assurance request:
{json.dumps(request.input, indent=2)}

Produce a comprehensive quality engineering plan.

Steps:
1. TEST STRATEGY — scope, risk areas, test types, priority
2. TEST PLAN — detailed coverage per type (unit, integration, API, E2E, performance, security, a11y)
3. TEST CASES — concrete test scenarios with steps, expected results, priority
4. AUTOMATION CODE — Playwright / Vitest / pytest / Postman test implementations
5. PERFORMANCE TESTS — k6 scenarios, SLO targets
6. ACCESSIBILITY TESTS — axe-core rules, WCAG 2.2 AA checklist
7. AI EVALUATION — if AI features present: metrics, dataset size, pass criteria
8. QUALITY GATES — all gates required for release approval
9. RELEASE READINESS — checklist, blockers

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
        test_plan = plan.get("test_plan", [])
        test_cases = plan.get("test_cases", [])
        automation = plan.get("automation", [])
        api_tests = plan.get("api_tests", [])
        perf = plan.get("performance_tests", {})
        a11y = plan.get("accessibility_tests", {})
        quality_gates = plan.get("quality_gates", {})
        release = plan.get("release_readiness", {})
        git = plan.get("git_workflow", {})

        # Test type coverage
        test_types_present = {tp.get("type", "").lower() for tp in test_plan}
        required_types = {"unit", "integration", "api", "e2e", "performance", "security"}
        missing_types = required_types - test_types_present

        # Test case quality
        critical_cases = [tc for tc in test_cases if tc.get("priority", "").lower() in ("p0", "critical", "high")]
        negative_cases = [tc for tc in test_cases if "negative" in tc.get("type", "").lower() or "negative" in tc.get("title", "").lower()]

        # Quality gates
        gates = quality_gates.get("gates", [])
        required_gates = {"unit-tests", "integration-tests", "github-actions", "owasp-zap", "accessibility"}
        gates_content = " ".join(str(g).lower() for g in gates)
        missing_gates = {g for g in required_gates if g.replace("-", " ") not in gates_content and g not in gates_content}

        # Release readiness
        release_approved = release.get("approved", False)
        blockers = release.get("blockers", [])

        # Git
        git_ok = all(k in git for k in ["branch", "pr_title"])

        production_ready = (
            len(test_cases) >= 5
            and len(automation) > 0
            and not missing_types - {"security"}  # security optional if no sec feature
            and not missing_gates
            and git_ok
        )

        return {
            **plan,
            "execution_metrics": {
                "test_plan_count": len(test_plan),
                "test_case_count": len(test_cases),
                "automation_file_count": len(automation),
                "api_test_count": len(api_tests),
                "critical_test_cases": len(critical_cases),
                "negative_test_cases": len(negative_cases),
                "missing_test_types": list(missing_types),
                "has_performance_tests": bool(perf),
                "has_a11y_tests": bool(a11y),
                "wcag_level": a11y.get("wcag_level", ""),
                "quality_gate_count": len(gates),
                "missing_quality_gates": list(missing_gates),
                "release_approved": release_approved,
                "blocker_count": len(blockers),
                "git_workflow_complete": git_ok,
                "production_ready": production_ready,
            },
        }

    def _score_implementation(self, plan: dict[str, Any]) -> float:
        score = 0.0
        for k in ["test_strategy", "test_plan", "test_cases", "automation", "quality_gates", "release_readiness"]:
            if plan.get(k):
                score += 12.0
        metrics = plan.get("execution_metrics", {})
        if metrics.get("test_case_count", 0) >= 10:
            score += 10.0
        elif metrics.get("test_case_count", 0) >= 5:
            score += 5.0
        if not metrics.get("missing_quality_gates"):
            score += 10.0
        if metrics.get("has_performance_tests"):
            score += 5.0
        if metrics.get("has_a11y_tests"):
            score += 5.0
        return min(score, 100.0)

    def observe(self, result: dict[str, Any]) -> dict[str, Any]:
        metrics = result.get("execution_metrics", {})
        score = self._score_implementation(result)
        return {
            "implementationScore": score,
            "testCaseCount": metrics.get("test_case_count", 0),
            "automationFileCount": metrics.get("automation_file_count", 0),
            "criticalTestCases": metrics.get("critical_test_cases", 0),
            "negativeTestCases": metrics.get("negative_test_cases", 0),
            "missingTestTypes": metrics.get("missing_test_types", []),
            "hasPerformanceTests": metrics.get("has_performance_tests", False),
            "hasA11yTests": metrics.get("has_a11y_tests", False),
            "wcagLevel": metrics.get("wcag_level", ""),
            "missingQualityGates": metrics.get("missing_quality_gates", []),
            "releaseApproved": metrics.get("release_approved", False),
            "blockerCount": metrics.get("blocker_count", 0),
            "gitWorkflowComplete": metrics.get("git_workflow_complete", False),
            "productionReady": metrics.get("production_ready", False),
        }

    def reflect(self, observations: dict[str, Any]) -> list[str]:
        issues: list[str] = []

        if observations.get("testCaseCount", 0) < 5:
            issues.append("CRITICAL: Fewer than 5 test cases — insufficient coverage")
        if observations.get("automationFileCount", 0) == 0:
            issues.append("CRITICAL: No automated tests — KPI: automated_test_coverage ≥ 90%")
        if observations.get("criticalTestCases", 0) == 0:
            issues.append("WARNING: No P0/Critical test cases identified")
        if observations.get("negativeTestCases", 0) == 0:
            issues.append("WARNING: No negative test cases — edge cases untested")
        missing_types = observations.get("missingTestTypes", [])
        if "unit" in missing_types:
            issues.append("CRITICAL: Unit testing missing from test plan")
        if "integration" in missing_types:
            issues.append("CRITICAL: Integration testing missing from test plan")
        if "api" in missing_types:
            issues.append("CRITICAL: API testing missing — KPI: api_contract_compliance = 100%")
        if "e2e" in missing_types:
            issues.append("WARNING: E2E testing missing — P0 user journeys unvalidated")
        if not observations.get("hasPerformanceTests"):
            issues.append("WARNING: No performance tests — KPI: performance_sla_validation = 100%")
        if not observations.get("hasA11yTests"):
            issues.append("WARNING: No accessibility tests — KPI: accessibility_compliance ≥ WCAG 2.2 AA")
        missing_gates = observations.get("missingQualityGates", [])
        if missing_gates:
            issues.append(f"CRITICAL: Missing quality gates: {missing_gates} — release blocked")
        if observations.get("blockerCount", 0) > 0:
            issues.append(f"BLOCKER: {observations['blockerCount']} release blockers identified")
        if not observations.get("gitWorkflowComplete"):
            issues.append("CRITICAL: Git workflow incomplete")

        kpi_checks = {
            "critical_defects_escaping_production = 0": observations.get("criticalTestCases", 0) > 0,
            "automated_test_coverage ≥ 90%": observations.get("automationFileCount", 0) > 0,
            "quality_gate_pass_rate = 100%": not observations.get("missingQualityGates"),
            "release_readiness = 100%": observations.get("blockerCount", 0) == 0,
        }
        for kpi, passing in kpi_checks.items():
            if not passing:
                issues.append(f"KPI RISK: {kpi} — not satisfied")

        return issues
