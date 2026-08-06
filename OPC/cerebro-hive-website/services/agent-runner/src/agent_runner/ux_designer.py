"""UX/UI Designer Agent — design system, prototyping, accessibility, handoff."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse


class UXDesignerAgent(BaseHiveAgent):
    """Senior UX/UI Designer & Enterprise Experience Architect."""

    name: str = "UXDesigner"
    capability: str = "UXDesigner"
    temperature: float = 0.25
    max_attempts: int = 12

    SYSTEM_PROMPT = """You are a Senior UX/UI Designer & Enterprise Experience Architect for CerebroHive EIOS.

DESIGN MANDATES:
- Accessibility is not optional: WCAG 2.2 AA is the floor, AAA is the target
- Every component exists in the design system before it appears in code
- Design tokens are the single source of truth for colour, spacing, typography, shadow, radius
- Every screen design includes: default | hover | focus | disabled | error | loading | empty states
- Mobile-first, then progressive enhancement to desktop

DESIGN SYSTEM STANDARDS:
- Component library: Figma with auto-layout and component properties
- Token structure: colour → semantic → component
- Tailwind CSS class mapping for every design token
- Storybook story for every component (default + all variants)
- Accessibility annotation on every component (ARIA role, label, keyboard nav)

ACCESSIBILITY REQUIREMENTS:
- Colour contrast: ≥4.5:1 normal text, ≥3:1 large text (WCAG AA)
- Focus indicators: ≥3:1 contrast, ≥2px offset
- Touch targets: ≥44×44px
- Keyboard navigation: logical tab order, all interactive elements reachable
- Screen reader: meaningful alt text, ARIA labels, live regions for dynamic content
- No reliance on colour alone to convey information

HANDOFF STANDARDS:
- Annotated Figma spec with component props table
- Design token JSON (Tokens Studio format → Style Dictionary)
- State matrix per component
- Responsive grid specifications
- Asset exports: SVG (icons), PNG @1x/2x (images)
- Acceptance criteria for QA (pixel-perfect + a11y checks)

COLLABORATION:
- Design review with frontend engineer before implementation starts
- Accessibility review with Accessibility Specialist before handoff
- User research synthesis shared with Product Manager within 48h"""

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""Design objective: {request.objective}
Context: {json.dumps(request.context, indent=2)}

Create a design plan with JSON output:
{{
  "design_type": "component|flow|screen|system",
  "target_users": ["...", ...],
  "user_goals": ["...", ...],
  "information_architecture": ["...", ...],
  "components_needed": ["...", ...],
  "states_required": ["default", "hover", "focus", "disabled", "error", "loading", "empty"],
  "accessibility_plan": {{"wcag_level": "AA", "aria_patterns": ["..."], "keyboard_flows": ["..."]}},
  "design_tokens_required": ["colour", "spacing", "typography"],
  "responsive_breakpoints": ["mobile", "tablet", "desktop"],
  "research_needed": true/false,
  "prototype_fidelity": "low|mid|high",
  "estimated_design_days": 0
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            return json.loads(raw[start:end])
        except Exception:
            return {"raw": raw, "design_type": "screen"}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""Design plan:
{json.dumps(plan, indent=2)}

Produce the complete design specification with JSON output:
{{
  "design_ready_for_handoff": true/false,
  "accessibility_audit": {{"wcag_aa_pass": true/false, "issues": ["..."]}},
  "components": [{{"name": "...", "variants": ["..."], "props": {{}}, "states": ["..."]}}],
  "design_tokens": {{"colour": {{}}, "spacing": {{}}, "typography": {{}}}},
  "figma_spec": {{"frames": ["..."], "components": ["..."], "prototype_link": ""}},
  "handoff_checklist": {{"states_complete": true/false, "tokens_mapped": true/false, "aria_annotated": true/false, "responsive_done": true/false}},
  "acceptance_criteria_for_qa": ["...", ...],
  "storybook_stories": ["...", ...]
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            result = json.loads(raw[start:end])
        except Exception:
            result = {"raw": raw, "design_ready_for_handoff": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        a11y = execution_result.get("accessibility_audit", {})
        handoff = execution_result.get("handoff_checklist", {})
        return {
            "design_ready": execution_result.get("design_ready_for_handoff", False),
            "wcag_aa_pass": a11y.get("wcag_aa_pass", False),
            "accessibility_issues": len(a11y.get("issues", [])),
            "states_complete": handoff.get("states_complete", False),
            "tokens_mapped": handoff.get("tokens_mapped", False),
            "aria_annotated": handoff.get("aria_annotated", False),
            "responsive_done": handoff.get("responsive_done", False),
        }

    def reflect(self, observations: dict[str, Any]) -> str:
        blockers = []
        if not observations.get("wcag_aa_pass"):
            blockers.append(f"{observations.get('accessibility_issues', 0)} WCAG AA issues")
        if not observations.get("states_complete"):
            blockers.append("incomplete component states")
        if not observations.get("aria_annotated"):
            blockers.append("ARIA annotations missing")
        if not observations.get("tokens_mapped"):
            blockers.append("design tokens not mapped to Tailwind")

        if blockers:
            return f"DESIGN BLOCKED — {', '.join(blockers)}. Resolve before handing off to frontend."
        return (
            "Design ready for engineering handoff. "
            "WCAG 2.2 AA: ✓ | All states: ✓ | ARIA annotated: ✓ | "
            "Tokens mapped: ✓ | Responsive specs: ✓"
        )
