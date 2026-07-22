"""Governance: policy-as-code. Each Policy.rule is a small declarative dict:

    {"if": {"field": "category", "op": "==", "value": "finance"},
     "then": "require_approval"}

Production swap-in: Open Policy Agent (OPA) evaluating Rego — these rule
shapes are simple enough to transliterate directly; the engine's job (given a
context dict, return which policies fire and what they require) doesn't
change.
"""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.governance import Policy

_OPS = {
    "==": lambda a, b: a == b,
    "!=": lambda a, b: a != b,
    "in": lambda a, b: a in b,
    "contains": lambda a, b: b in a if isinstance(a, str) else b in (a or []),
    # Numeric thresholds — e.g. {"field": "cost_usd", "op": ">", "value": 5} to
    # require approval on any run whose running cost context crosses a limit.
    ">": lambda a, b: float(a) > float(b),
    "<": lambda a, b: float(a) < float(b),
    ">=": lambda a, b: float(a) >= float(b),
    "<=": lambda a, b: float(a) <= float(b),
}


@dataclass
class PolicyDecision:
    policy_name: str
    action: str  # require_approval | block
    reason: str


def evaluate(db: Session, context: dict) -> list[PolicyDecision]:
    decisions: list[PolicyDecision] = []
    policies = db.query(Policy).filter(Policy.enabled.is_(True)).all()

    for policy in policies:
        condition = policy.rule.get("if", {})
        field_name = condition.get("field")
        op = condition.get("op", "==")
        expected = condition.get("value")
        actual = context.get(field_name)

        matcher = _OPS.get(op)
        if matcher is None:
            continue
        try:
            fired = matcher(actual, expected)
        except (TypeError, ValueError):
            fired = False

        if fired:
            decisions.append(
                PolicyDecision(
                    policy_name=policy.name,
                    action=policy.rule.get("then", "require_approval"),
                    reason=policy.description or f"{field_name} {op} {expected}",
                )
            )

    return decisions
