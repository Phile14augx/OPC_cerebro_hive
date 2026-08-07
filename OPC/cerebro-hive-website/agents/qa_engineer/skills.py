"""QA Engineer agent skills — test automation, quality strategy, and release validation."""
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

class TestInput(BaseModel):
    component: str = Field(..., description="Component, service, or feature to test.")
    test_type: str = Field(default="unit", description="Test type: unit|integration|api|e2e|performance|security|a11y.")
    framework: str = Field(default="playwright", description="Testing framework.")

class PlanInput(BaseModel):
    feature: str = Field(..., description="Feature or service to plan testing for.")
    risk_level: str = Field(default="medium", description="Risk level: low|medium|high|critical.")

class PerformanceInput(BaseModel):
    endpoint: str = Field(..., description="Endpoint to performance test.")
    expected_rps: int = Field(default=100, description="Expected requests per second.")
    latency_p99_ms: int = Field(default=500, description="p99 latency SLO in ms.")

class AIEvalInput(BaseModel):
    capability: str = Field(..., description="AI capability to evaluate.")
    dataset_size: int = Field(default=50, description="Evaluation dataset size.")


class TestStrategySkill(BaseTool):
    name: str = "test_strategy"
    description: str = "Design comprehensive test strategies: risk-based coverage, test pyramid, and quality gates."
    def _run(self, feature: str, risk_level: str = "medium") -> str:
        return json.dumps({
            "feature": feature,
            "risk_level": risk_level,
            "test_pyramid": {
                "unit": "≥ 70% of tests — fast, isolated, deterministic",
                "integration": "≈ 20% — real dependencies with Testcontainers",
                "e2e": "≈ 10% — P0 user journeys only — Playwright",
            },
            "scope": ["Happy paths", "Negative/error cases", "Edge cases", "Security scenarios", "Performance under load"],
            "quality_gates": ["Unit tests green", "Integration green", "OWASP ZAP scan", "Accessibility audit", "Performance SLO"],
            "entry_criteria": ["Feature complete", "Unit tests exist", "Docs updated"],
            "exit_criteria": ["All tests green", "Coverage ≥ 90%", "Zero P0 defects", "QA sign-off"],
        }, indent=2)

class PlaywrightSkill(BaseTool):
    name: str = "playwright"
    description: str = "Write Playwright E2E tests: page objects, assertions, accessibility checks, and visual regression."
    def _run(self, component: str, test_type: str = "e2e", framework: str = "playwright") -> str:
        return json.dumps({
            "test_template": f"""
import {{ test, expect }} from '@playwright/test';

test.describe('{component}', () => {{
  test.beforeEach(async ({{ page }}) => {{
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  }});

  test('P0: core functionality works', async ({{ page }}) => {{
    // arrange
    await page.getByRole('button', {{ name: 'Open {component}' }}).click();
    // act
    await page.getByRole('textbox', {{ name: 'Search' }}).fill('test query');
    await page.keyboard.press('Enter');
    // assert
    await expect(page.getByRole('list', {{ name: 'Results' }})).toBeVisible();
  }});

  test('P0: keyboard navigation', async ({{ page }}) => {{
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  }});

  test('P1: error state displayed on API failure', async ({{ page, context }}) => {{
    await context.route('**/api/**', (route) => route.abort());
    await page.reload();
    await expect(page.getByRole('alert')).toBeVisible();
  }});
}});
""",
            "config": "playwright.config.ts: multiple browsers (chromium, firefox, webkit), mobile viewports, retries: 2",
        }, indent=2)

class VitestSkill(BaseTool):
    name: str = "vitest"
    description: str = "Write Vitest unit tests with React Testing Library: component tests, hook tests, and mocking."
    def _run(self, component: str, test_type: str = "unit", framework: str = "vitest") -> str:
        return json.dumps({
            "test_template": f"""
import {{ describe, it, expect, vi }} from 'vitest';
import {{ render, screen, fireEvent, waitFor }} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {{ {component} }} from './{component}';

describe('{component}', () => {{
  it('renders in default state', () => {{
    render(<{component} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  }});

  it('handles user interaction', async () => {{
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<{component} onAction={{onAction}} />);
    await user.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalledOnce();
  }});

  it('displays error state', () => {{
    render(<{component} error="Something went wrong" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  }});

  it('is accessible', () => {{
    const {{ container }} = render(<{component} />);
    expect(container).toHaveNoViolations(); // jest-axe
  }});
}});
""",
            "coverage": "vitest --coverage -- target: lines ≥ 90%, branches ≥ 85%, functions ≥ 90%",
        }, indent=2)

class PytestSkill(BaseTool):
    name: str = "pytest"
    description: str = "Write pytest tests for Python services: fixtures, parametrize, async tests, and coverage."
    def _run(self, component: str, test_type: str = "unit", framework: str = "pytest") -> str:
        return json.dumps({
            "test_template": f"""
import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
class Test{component.replace('_', '').title()}:
    @pytest.fixture
    def mock_repo(self):
        return AsyncMock()

    @pytest.fixture
    def service(self, mock_repo):
        return {component.title().replace('_', '')}Service(repository=mock_repo)

    async def test_success_case(self, service, mock_repo):
        # arrange
        mock_repo.find_by_id.return_value = create_{component}_fixture()
        # act
        result = await service.process(request=valid_request())
        # assert
        assert result.status == 'success'
        mock_repo.find_by_id.assert_called_once()

    async def test_not_found_raises(self, service, mock_repo):
        mock_repo.find_by_id.return_value = None
        with pytest.raises(NotFoundError):
            await service.process(request=valid_request())

    @pytest.mark.parametrize("invalid_input", [None, "", {{}}])
    async def test_invalid_input_raises(self, service, invalid_input):
        with pytest.raises(ValidationError):
            await service.process(request=invalid_input)
""",
            "coverage": "pytest --cov={component} --cov-report=xml -- minimum 90%",
        }, indent=2)

class APITestingSkill(BaseTool):
    name: str = "api_testing"
    description: str = "Test APIs: contract validation, CRUD scenarios, auth, pagination, and error codes."
    def _run(self, component: str, test_type: str = "api", framework: str = "postman") -> str:
        return json.dumps({
            "test_scenarios": [
                f"GET /v1/{component}s — 200 with cursor pagination",
                f"GET /v1/{component}s/{{id}} — 200 with full resource",
                f"GET /v1/{component}s/{{id}} — 404 for non-existent ID",
                f"POST /v1/{component}s — 201 with valid body",
                f"POST /v1/{component}s — 400 with invalid/missing fields",
                f"POST /v1/{component}s — 401 without Authorization header",
                f"POST /v1/{component}s — 403 with insufficient role",
                f"POST /v1/{component}s — 409 with duplicate idempotency key",
                f"PATCH /v1/{component}s/{{id}} — 200 partial update",
                f"DELETE /v1/{component}s/{{id}} — 204 success",
                f"DELETE /v1/{component}s/{{id}} — 404 already deleted",
            ],
            "contract": f"Validate response against OpenAPI 3.1 schema — use openapi-response-validator",
            "headers": "Verify: Content-Type, X-Request-ID, X-RateLimit-Remaining",
        }, indent=2)

class PerformanceTestingSkill(BaseTool):
    name: str = "performance_testing"
    description: str = "Load test with k6: SLO validation, stress tests, and scalability tests."
    def _run(self, endpoint: str, expected_rps: int = 100, latency_p99_ms: int = 500) -> str:
        return json.dumps({
            "k6_script": f"""
import http from 'k6/http';
import {{ check, sleep }} from 'k6';

export const options = {{
  stages: [
    {{ duration: '1m', target: {expected_rps} }},       // ramp up
    {{ duration: '5m', target: {expected_rps} }},       // steady state
    {{ duration: '2m', target: {expected_rps * 2} }},   // stress test (2x load)
    {{ duration: '1m', target: 0 }},                     // ramp down
  ],
  thresholds: {{
    http_req_duration: ['p(99)<{latency_p99_ms}'],
    http_req_failed: ['rate<0.01'],
  }},
}};

export default function () {{
  const resp = http.get('{endpoint}', {{ headers: {{ Authorization: `Bearer ${{__ENV.TEST_TOKEN}}` }} }});
  check(resp, {{
    'status is 200': (r) => r.status === 200,
    `p99 < {latency_p99_ms}ms`: (r) => r.timings.duration < {latency_p99_ms},
  }});
  sleep(1 / {expected_rps});
}}
""",
        }, indent=2)

class AccessibilityTestingSkill(BaseTool):
    name: str = "accessibility_testing"
    description: str = "Validate WCAG 2.2 AA: axe-core scans, keyboard navigation tests, and screen reader testing."
    def _run(self, component: str, test_type: str = "a11y", framework: str = "playwright") -> str:
        return json.dumps({
            "axe_playwright": f"""
import {{ test, expect }} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('{component} accessibility', async ({{ page }}) => {{
  await page.goto('/{component.lower()}');
  const results = await new AxeBuilder({{ page }})
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
}});
""",
            "manual_checklist": [
                "Tab through entire page — every interactive element reachable",
                "Visible focus ring on all focusable elements",
                "Screen reader: navigate with headings (h key), regions (r key), links (k key)",
                "Color contrast: ≥ 4.5:1 for normal text with browser extension",
                "Zoom to 200% — no content cut off",
                "Keyboard shortcut conflicts with browser/OS shortcuts checked",
            ],
        }, indent=2)

class AIEvaluationSkill(BaseTool):
    name: str = "ai_quality_evaluation"
    description: str = "Evaluate AI system quality: hallucination detection, RAG precision, and LLM accuracy testing."
    def _run(self, capability: str, dataset_size: int = 50) -> str:
        return json.dumps({
            "eval_plan": {
                "dataset": f"Minimum {dataset_size} Q/A pairs with ground truth for {capability}",
                "metrics": {
                    "accuracy": "LLM-as-judge or exact match — target ≥ 95%",
                    "hallucination_rate": "Citation grounding check — target < 2%",
                    "rag_precision": "Relevant docs / retrieved docs — target ≥ 95%",
                    "latency_p99_ms": "End-to-end response time — target < 3000ms",
                    "cost_per_query": "Token cost tracking — alert if > budget",
                },
                "regression": f"Run on every PR — fail if accuracy drops ≥ 2% from baseline",
                "adversarial": ["Prompt injection attempts", "Jailbreak attempts", "PII extraction attempts"],
            },
        }, indent=2)

QA_ENGINEER_SKILLS = [
    TestStrategySkill(), PlaywrightSkill(), VitestSkill(), PytestSkill(),
    APITestingSkill(), PerformanceTestingSkill(), AccessibilityTestingSkill(),
    AIEvaluationSkill(),
]

__all__ = ["QA_ENGINEER_SKILLS"]
