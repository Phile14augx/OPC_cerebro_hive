"""Real, deterministic expense/revenue categorization for incoming invoices.

This is intentionally not an LLM call: classifying "which GL account does
this line item belong to" from a short description is a keyword/rules
problem the same way app/core/guard's PII detection is a regex problem — a
transparent, auditable, zero-cost classifier beats an opaque one for exactly
the kind of decision a finance team needs to be able to explain to an
auditor. (An LLM-backed classifier is a reasonable v2 — see the note at the
bottom — but it should sit behind this same interface, not replace the need
for a governance/approval gate on low-confidence or high-value calls.)

Matching strategy: map the invoice's free-text description to one of a
fixed set of category labels via keyword search, then find the caller's own
chart-of-accounts entry whose name best matches that label. Confidence is
high only when a keyword actually matched; anything that falls through to
the default bucket is deliberately low-confidence so the governance policy
layer (app/finance/automation.py) can route it to a human instead of
auto-posting a guess.
"""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.finance.models import Account

# category label -> (keywords to match in the description, name fragments to
# find the right account in an arbitrary chart of accounts, account type)
_EXPENSE_CATEGORIES: list[tuple[str, list[str], list[str]]] = [
    ("software_expense", ["software", "saas", "subscription", "license", "cloud hosting", "aws", "azure"], ["software", "subscription", "technology"]),
    ("travel_expense", ["travel", "flight", "airfare", "hotel", "uber", "lyft", "taxi", "mileage"], ["travel"]),
    ("office_supplies_expense", ["office supplies", "stationery", "printer", "paper"], ["office supplies", "office"]),
    ("professional_services_expense", ["legal", "attorney", "accountant", "accounting fees", "consulting fee", "audit fee"], ["professional services", "legal", "consulting"]),
    ("marketing_expense", ["marketing", "advertising", "ads", "campaign", "sponsorship"], ["marketing", "advertising"]),
    ("rent_expense", ["rent", "lease", "office space"], ["rent", "lease"]),
    ("utilities_expense", ["electricity", "utilities", "internet bill", "water bill"], ["utilities"]),
]

_REVENUE_CATEGORIES: list[tuple[str, list[str], list[str]]] = [
    ("service_revenue", ["consulting", "services rendered", "implementation", "support contract", "retainer"], ["service revenue", "consulting revenue"]),
    ("product_revenue", ["license fee", "product sale", "subscription revenue"], ["product revenue", "subscription revenue"]),
]

_DEFAULT_EXPENSE_LABEL = "general_expense"
_DEFAULT_EXPENSE_FRAGMENTS = ["general expense", "miscellaneous", "other expense"]
_DEFAULT_REVENUE_LABEL = "sales_revenue"
_DEFAULT_REVENUE_FRAGMENTS = ["sales revenue", "revenue"]

_HIGH_CONFIDENCE = 0.9
_LOW_CONFIDENCE = 0.35


@dataclass
class CategorySuggestion:
    account_id: str | None
    account_code: str | None
    account_name: str | None
    category_label: str
    confidence: float
    matched_keyword: str | None


def _find_account(db: Session, organization_id: str, account_type: str, name_fragments: list[str]) -> Account | None:
    candidates = (
        db.query(Account)
        .filter(Account.organization_id == organization_id, Account.type == account_type, Account.is_active.is_(True))
        .all()
    )
    for fragment in name_fragments:
        for account in candidates:
            if fragment.lower() in account.name.lower():
                return account
    # Nothing matched by name — fall back to any account of the right type,
    # so there's always *something* to suggest (at low confidence).
    return candidates[0] if candidates else None


def suggest_account(db: Session, organization_id: str, kind: str, description: str) -> CategorySuggestion:
    """kind: "payable" (expense) or "receivable" (revenue)."""

    text = description.lower()
    categories = _EXPENSE_CATEGORIES if kind == "payable" else _REVENUE_CATEGORIES
    account_type = "expense" if kind == "payable" else "revenue"

    for label, keywords, name_fragments in categories:
        for keyword in keywords:
            if keyword in text:
                account = _find_account(db, organization_id, account_type, name_fragments)
                return CategorySuggestion(
                    account_id=account.id if account else None,
                    account_code=account.code if account else None,
                    account_name=account.name if account else None,
                    category_label=label,
                    confidence=_HIGH_CONFIDENCE if account else _LOW_CONFIDENCE,
                    matched_keyword=keyword,
                )

    default_label = _DEFAULT_EXPENSE_LABEL if kind == "payable" else _DEFAULT_REVENUE_LABEL
    default_fragments = _DEFAULT_EXPENSE_FRAGMENTS if kind == "payable" else _DEFAULT_REVENUE_FRAGMENTS
    account = _find_account(db, organization_id, account_type, default_fragments)
    return CategorySuggestion(
        account_id=account.id if account else None,
        account_code=account.code if account else None,
        account_name=account.name if account else None,
        category_label=default_label,
        confidence=_LOW_CONFIDENCE,
        matched_keyword=None,
    )


# v2 idea, not implemented: route through app.core.cerebro_x.gateway (the
# existing LLM gateway used by agent runs) for descriptions this keyword
# matcher can't confidently place, keeping this function's signature/return
# type as the contract so automation.py doesn't need to change.
