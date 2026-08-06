"""Frontend Engineer agent — production-ready React/Next.js implementations."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse

_SYSTEM = """You are the Senior Frontend Engineer for CerebroHive EIOS.

IMPLEMENTATION MANDATE:
- Component-driven architecture with Clean Architecture separation
- TypeScript strict mode — no 'any', discriminated unions, branded types
- CerebroHive Design System compliance
- WCAG 2.2 AA accessibility minimum (target AAA)
- Responsive by default — mobile-first breakpoints
- Dark and light theme support via CSS custom properties
- Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms
- Bundle size budget enforced — code splitting, lazy loading, tree shaking
- SSR/SSG/ISR via Next.js App Router — choose strategy per page type
- OTel frontend instrumentation — traces, metrics, Web Vitals

EVERY COMPONENT MUST INCLUDE:
- Loading state (skeleton or spinner)
- Error boundary with user-friendly fallback
- Empty state with clear call to action
- Keyboard navigation (focus-visible, tab order, shortcuts)
- ARIA attributes — roles, labels, live regions
- Form validation with real-time feedback
- API error handling with retry and offline detection

GIT WORKFLOW (non-negotiable):
One Feature → One Worktree → One Branch → One PR → One Merge → Delete Worktree
Branch pattern: feat/{taskId}-{kebab-slug}
Commit: feat(component-name): description in present tense
GitHub Actions must pass: lint, type-check, test, build, a11y-scan, lighthouse

PERFORMANCE CHECKLIST:
- First load JS budget: ≤ 150kb gzipped per route chunk
- Images: next/image with WebP/AVIF, explicit width/height
- Fonts: next/font — preload, subset, zero layout shift
- Third-party scripts: next/script with strategy="lazyOnload"
- Component memoization: useMemo/useCallback only when profiler confirms benefit

OUTPUT FORMAT (JSON):
{
  "components": [{"name": str, "path": str, "type": "page|layout|ui|feature", "code": str}],
  "tests": [{"path": str, "framework": "vitest|playwright", "code": str}],
  "stories": [{"path": str, "code": str}],
  "accessibility": {"wcag_level": str, "aria_landmarks": list, "keyboard_shortcuts": list},
  "performance": {"strategy": "SSR|SSG|ISR|CSR", "code_split": bool, "lazy_imports": list},
  "git_workflow": {"worktree": str, "branch": str, "commit_prefix": str, "pr_title": str},
  "design_tokens": {"theme_variables": list},
  "i18n": {"supported": bool, "keys": list}
}"""


class FrontendEngineerAgent(BaseHiveAgent):
    """Senior Frontend Engineer — React/Next.js/TypeScript implementation specialist."""

    capability = "FrontendEngineer"
    name = "Frontend Engineer — Senior Frontend Engineer & UX Platform Engineer"

    def __init__(self, llm: Any) -> None:
        super().__init__(llm=llm, temperature=0.15, max_attempts=15)

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        user_prompt = f"""
Frontend implementation request:
{json.dumps(request.input, indent=2)}

Produce a complete implementation plan following the CerebroHive Design System.

Steps to follow:
1. COMPONENT DESIGN — identify components needed, their hierarchy, reuse opportunities
2. ACCESSIBILITY PLAN — ARIA roles, keyboard navigation, focus management strategy
3. STATE DESIGN — local state (useState), server state (React Query), global state (Zustand)
4. API INTEGRATION — hooks, error handling, loading/empty states, optimistic updates
5. PERFORMANCE STRATEGY — SSR/SSG/ISR choice, code splitting, image/font optimization
6. TEST PLAN — unit tests (vitest + RTL), a11y tests (axe), E2E (playwright)
7. GIT WORKFLOW — worktree, branch, commit prefix, PR title

Return a JSON object matching the OUTPUT FORMAT.
"""
        raw = self._call_llm(_SYSTEM, user_prompt)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            import re
            m = re.search(r"\{.*\}", raw, re.DOTALL)
            return json.loads(m.group()) if m else {"raw": raw}

    def execute(self, plan: dict[str, Any]) -> dict[str, Any]:
        components = plan.get("components", [])
        tests = plan.get("tests", [])
        stories = plan.get("stories", [])
        a11y = plan.get("accessibility", {})
        perf = plan.get("performance", {})

        # Validate accessibility
        wcag_level = a11y.get("wcag_level", "")
        aria_ok = bool(a11y.get("aria_landmarks"))
        keyboard_ok = bool(a11y.get("keyboard_shortcuts") is not None)

        # Validate performance
        perf_strategy = perf.get("strategy", "")
        code_split = perf.get("code_split", False)

        # Validate component completeness
        components_with_code = [c for c in components if c.get("code")]
        missing_code_pct = 1 - (len(components_with_code) / max(len(components), 1))

        # Validate tests
        unit_tests = [t for t in tests if t.get("framework") == "vitest"]
        e2e_tests = [t for t in tests if t.get("framework") == "playwright"]

        # Validate Storybook stories
        has_stories = len(stories) > 0

        # Validate git workflow
        git = plan.get("git_workflow", {})
        git_ok = all(k in git for k in ["worktree", "branch", "commit_prefix", "pr_title"])

        production_ready = (
            len(components) > 0
            and bool(wcag_level)
            and aria_ok
            and keyboard_ok
            and len(unit_tests) > 0
            and git_ok
        )

        return {
            **plan,
            "execution_metrics": {
                "component_count": len(components),
                "components_with_code": len(components_with_code),
                "missing_code_pct": round(missing_code_pct * 100, 1),
                "unit_test_count": len(unit_tests),
                "e2e_test_count": len(e2e_tests),
                "story_count": len(stories),
                "has_stories": has_stories,
                "wcag_level": wcag_level,
                "aria_landmarks_ok": aria_ok,
                "keyboard_nav_ok": keyboard_ok,
                "perf_strategy": perf_strategy,
                "code_splitting": code_split,
                "git_workflow_complete": git_ok,
                "production_ready": production_ready,
            },
        }

    def _score_implementation(self, plan: dict[str, Any]) -> float:
        score = 0.0
        required_keys = ["components", "tests", "accessibility", "performance", "git_workflow"]
        for k in required_keys:
            if k in plan:
                score += 15.0
        # Components have code
        components = plan.get("components", [])
        if components and any(c.get("code") for c in components):
            score += 10.0
        # Has unit tests
        tests = plan.get("tests", [])
        if any(t.get("framework") == "vitest" for t in tests):
            score += 10.0
        # Has a11y info
        a11y = plan.get("accessibility", {})
        if a11y.get("wcag_level") and a11y.get("aria_landmarks"):
            score += 10.0
        # Has git workflow
        git = plan.get("git_workflow", {})
        if all(k in git for k in ["branch", "pr_title"]):
            score += 5.0
        # Has stories
        if plan.get("stories"):
            score += 5.0
        return min(score, 100.0)

    def observe(self, result: dict[str, Any]) -> dict[str, Any]:
        metrics = result.get("execution_metrics", {})
        score = self._score_implementation(result)
        return {
            "implementationScore": score,
            "componentCount": metrics.get("component_count", 0),
            "missingCodePct": metrics.get("missing_code_pct", 100),
            "unitTestCount": metrics.get("unit_test_count", 0),
            "e2eTestCount": metrics.get("e2e_test_count", 0),
            "storyCount": metrics.get("story_count", 0),
            "wcagLevel": metrics.get("wcag_level", ""),
            "ariaLandmarksOk": metrics.get("aria_landmarks_ok", False),
            "keyboardNavOk": metrics.get("keyboard_nav_ok", False),
            "perfStrategy": metrics.get("perf_strategy", ""),
            "codeSplitting": metrics.get("code_splitting", False),
            "gitWorkflowComplete": metrics.get("git_workflow_complete", False),
            "productionReady": metrics.get("production_ready", False),
        }

    def reflect(self, observations: dict[str, Any]) -> list[str]:
        issues: list[str] = []

        if observations.get("componentCount", 0) == 0:
            issues.append("CRITICAL: No components produced — implementation is empty")
        if observations.get("missingCodePct", 100) > 20:
            issues.append(f"WARNING: {observations['missingCodePct']}% of components missing implementation code")
        if not observations.get("wcagLevel"):
            issues.append("CRITICAL: No WCAG level specified — accessibility compliance unknown")
        if not observations.get("ariaLandmarksOk"):
            issues.append("CRITICAL: No ARIA landmarks defined — fails accessibility audit")
        if not observations.get("keyboardNavOk"):
            issues.append("CRITICAL: Keyboard navigation not specified — accessibility blocker")
        if observations.get("unitTestCount", 0) == 0:
            issues.append("CRITICAL: No unit tests produced — KPI: unit_test_coverage ≥ 90%")
        if not observations.get("gitWorkflowComplete"):
            issues.append("CRITICAL: Git workflow incomplete — branch/PR title required")
        if not observations.get("storyCount", 0):
            issues.append("WARNING: No Storybook stories — component reusability KPI at risk")
        if not observations.get("codeSplitting"):
            issues.append("WARNING: Code splitting not configured — bundle size budget may exceed 150kb/route")
        if not observations.get("productionReady"):
            issues.append("BLOCKER: Implementation not production-ready — resolve CRITICAL issues above")

        # KPI thresholds
        kpi_checks = {
            "lighthousePerformanceScore ≥ 95": observations.get("perfStrategy") in ("SSR", "SSG", "ISR"),
            "accessibilityScore = 100": bool(observations.get("wcagLevel")) and observations.get("ariaLandmarksOk"),
            "unitTestCoverage ≥ 90%": observations.get("unitTestCount", 0) >= 3,
            "gitWorkflow enforced": observations.get("gitWorkflowComplete"),
        }
        for kpi, passing in kpi_checks.items():
            if not passing:
                issues.append(f"KPI RISK: {kpi} — not satisfied")

        return issues
