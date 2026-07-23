"""The "fully automated ERP" pipeline: submit an invoice, and it gets
categorized, checked against governance policy, and either posted to the
real ledger automatically or routed to a human — using the same
governance/Approval machinery app/core/runtime.py already uses for agent
runs, not a parallel system.

Pipeline for POST /finance/invoices/{id}/submit:
  1. categorizer.suggest_account() — real keyword classification, not a stub.
  2. Safety rail: low-confidence suggestions always require a human, no
     matter what policy says (a policy can make approval *more* likely, not
     less, than this floor).
  3. governance_engine.evaluate() — the same policy-as-code engine agent runs
     use, evaluated against a `{"domain": "finance", ...}` context so a
     deployment can add its own rules (e.g. "any invoice over $5,000 needs
     approval") without touching this code.
  4. Blocked -> invoice rejected. Needs approval -> Approval row created,
     invoice pauses at `pending_approval` exactly like a blocked agent run
     pauses. Otherwise -> posted immediately as a real, balanced
     JournalEntry via ledger_engine.post_journal_entry.
  5. Approving that Approval (via the existing POST
     /governance/approvals/{id}/decide endpoint) resumes and posts the
     invoice, the same way it resumes a paused agent run.
"""

from __future__ import annotations

from app.finance import categorizer, ledger_engine
from app.finance.ledger_engine import LedgerError
from app.finance.models import Account, Invoice
from app.core import governance_engine
from app.models.governance import Approval, AuditLog

LOW_CONFIDENCE_FLOOR = 0.5

_AP_NAME_FRAGMENTS = ["accounts payable"]
_AR_NAME_FRAGMENTS = ["accounts receivable"]


def _find_control_account(db, organization_id: str, kind: str) -> Account | None:
    """The balance-sheet side of every invoice posting: Accounts Payable
    (a liability) for bills we owe, Accounts Receivable (an asset) for
    invoices owed to us. Must already exist in the org's chart of accounts —
    this doesn't silently create one, since which account is "the" AP/AR
    control account is a real bookkeeping decision, not something to guess.
    """
    account_type = "liability" if kind == "payable" else "asset"
    fragments = _AP_NAME_FRAGMENTS if kind == "payable" else _AR_NAME_FRAGMENTS
    accounts = (
        db.query(Account)
        .filter(Account.organization_id == organization_id, Account.type == account_type, Account.is_active.is_(True))
        .all()
    )
    for fragment in fragments:
        for account in accounts:
            if fragment in account.name.lower():
                return account
    return None


def submit_invoice(db, invoice: Invoice) -> Invoice:
    if invoice.status != "draft":
        raise LedgerError(f"invoice is '{invoice.status}', not draft — nothing to submit")

    suggestion = categorizer.suggest_account(db, invoice.organization_id, invoice.kind, invoice.description)
    invoice.suggested_account_id = suggestion.account_id
    invoice.suggested_account_confidence = suggestion.confidence
    db.commit()

    context = {
        "domain": "finance",
        "invoice_kind": invoice.kind,
        "amount": invoice.amount,
        "confidence": suggestion.confidence,
        "category_label": suggestion.category_label,
    }
    decisions = governance_engine.evaluate(db, context)
    blocking = [d for d in decisions if d.action == "block"]
    approvals_needed = [d for d in decisions if d.action == "require_approval"]

    low_confidence = suggestion.account_id is None or suggestion.confidence < LOW_CONFIDENCE_FLOOR

    if blocking:
        invoice.status = "rejected"
        db.commit()
        db.add(
            AuditLog(
                actor="finance-automation",
                action="invoice.blocked",
                target=invoice.id,
                meta={"policy_name": blocking[0].policy_name, "reason": blocking[0].reason},
            )
        )
        db.commit()
        return invoice

    if approvals_needed or low_confidence:
        invoice.status = "pending_approval"
        db.commit()
        for decision in approvals_needed:
            db.add(Approval(run_id=invoice.id, policy_name=decision.policy_name, reason=decision.reason))
        if low_confidence:
            reason = (
                "Categorizer found no matching account in the chart of accounts."
                if suggestion.account_id is None
                else f"Low-confidence categorization ({suggestion.confidence:.2f}) as '{suggestion.category_label}' — needs a human to confirm."
            )
            db.add(Approval(run_id=invoice.id, policy_name="low-confidence-categorization", reason=reason))
        db.commit()
        db.add(
            AuditLog(
                actor="finance-automation",
                action="invoice.pending_approval",
                target=invoice.id,
                meta={"suggested_category": suggestion.category_label, "confidence": suggestion.confidence},
            )
        )
        db.commit()
        return invoice

    return _post_invoice(db, invoice)


def _post_invoice(db, invoice: Invoice) -> Invoice:
    if invoice.suggested_account_id is None:
        raise LedgerError("cannot post an invoice with no categorized account — resolve the pending approval first")

    control_account = _find_control_account(db, invoice.organization_id, invoice.kind)
    if control_account is None:
        label = "Accounts Payable" if invoice.kind == "payable" else "Accounts Receivable"
        raise LedgerError(
            f"no active '{label}' account found in this organization's chart of accounts — "
            f"create one before posting {invoice.kind} invoices"
        )

    memo = f"Invoice {invoice.id}: {invoice.description}"[:500]
    if invoice.kind == "payable":
        lines = [
            {"account_id": invoice.suggested_account_id, "debit": invoice.amount, "description": invoice.description},
            {"account_id": control_account.id, "credit": invoice.amount, "description": f"A/P — {invoice.description}"},
        ]
    else:
        lines = [
            {"account_id": control_account.id, "debit": invoice.amount, "description": f"A/R — {invoice.description}"},
            {"account_id": invoice.suggested_account_id, "credit": invoice.amount, "description": invoice.description},
        ]

    entry = ledger_engine.post_journal_entry(
        db, invoice.organization_id, lines, memo=memo, created_by="finance-automation", source="invoice"
    )

    invoice.journal_entry_id = entry.id
    invoice.status = "posted"
    db.commit()
    db.refresh(invoice)

    db.add(
        AuditLog(
            actor="finance-automation",
            action="invoice.posted",
            target=invoice.id,
            meta={"journal_entry_id": entry.id, "account_id": invoice.suggested_account_id, "amount": invoice.amount},
        )
    )
    db.commit()
    return invoice


def resume_after_approval(db, invoice: Invoice) -> Invoice:
    """Called once every Approval row tied to this invoice (run_id == invoice.id)
    has been approved — mirrors app.core.runtime.resume_after_approval."""
    return _post_invoice(db, invoice)
