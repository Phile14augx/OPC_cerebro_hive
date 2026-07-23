"""The actual accounting logic: post a balanced double-entry transaction,
compute an account's running balance, and produce a trial balance. Kept
independent of FastAPI/Pydantic so it's testable as plain functions — the
router (app/finance/router.py) is a thin translation layer on top of this.

Core invariant this module exists to enforce: a JournalEntry is only ever
created if its lines balance (sum of debits == sum of credits). That's the
one rule that makes "the books" trustworthy, so it's enforced here, in one
place, rather than trusted to every caller.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TypedDict

from sqlalchemy.orm import Session

from app.finance.models import Account, JournalEntry, JournalLine

_BALANCE_TOLERANCE = 0.005  # half a cent — absorbs float rounding, not real imbalance


class LedgerError(ValueError):
    """Raised for any real accounting-integrity violation (unbalanced entry,
    unknown/foreign account, non-positive amount). Routers translate this to
    a 400, distinguishing it from a generic 500."""


class LineInput(TypedDict, total=False):
    account_id: str
    debit: float
    credit: float
    description: str


def post_journal_entry(
    db: Session,
    organization_id: str,
    lines: list[LineInput],
    memo: str,
    created_by: str,
    source: str = "manual",
) -> JournalEntry:
    """Validate and post a balanced journal entry. Raises LedgerError on any
    validation failure — nothing is written to the database in that case."""

    if len(lines) < 2:
        raise LedgerError("a journal entry needs at least two lines (one debit, one credit)")

    total_debit = 0.0
    total_credit = 0.0
    for line in lines:
        debit = float(line.get("debit", 0.0) or 0.0)
        credit = float(line.get("credit", 0.0) or 0.0)
        if debit < 0 or credit < 0:
            raise LedgerError("debit/credit amounts must be non-negative")
        if debit > 0 and credit > 0:
            raise LedgerError("a single line cannot have both a debit and a credit")
        if debit == 0 and credit == 0:
            raise LedgerError("a line must have a non-zero debit or credit")
        total_debit += debit
        total_credit += credit

    if abs(total_debit - total_credit) > _BALANCE_TOLERANCE:
        raise LedgerError(f"unbalanced entry: total debits {total_debit:.2f} != total credits {total_credit:.2f}")

    account_ids = {line["account_id"] for line in lines}
    found_accounts = (
        db.query(Account)
        .filter(Account.id.in_(account_ids), Account.organization_id == organization_id, Account.is_active.is_(True))
        .all()
    )
    if len(found_accounts) != len(account_ids):
        missing = account_ids - {a.id for a in found_accounts}
        raise LedgerError(f"account(s) not found (or not active) in this organization: {sorted(missing)}")

    entry = JournalEntry(organization_id=organization_id, memo=memo, source=source, created_by=created_by)
    db.add(entry)
    db.flush()  # assigns entry.id without committing, so lines can reference it

    for line in lines:
        db.add(
            JournalLine(
                entry_id=entry.id,
                account_id=line["account_id"],
                debit=float(line.get("debit", 0.0) or 0.0),
                credit=float(line.get("credit", 0.0) or 0.0),
                description=line.get("description", ""),
            )
        )

    db.commit()
    db.refresh(entry)
    return entry


def account_balance(db: Session, account: Account) -> float:
    """Signed balance following standard accounting convention: assets and
    expenses have a normal debit balance (debit increases it); liabilities,
    equity, and revenue have a normal credit balance (credit increases it)."""

    lines = db.query(JournalLine).filter(JournalLine.account_id == account.id).all()
    total_debit = sum(l.debit for l in lines)
    total_credit = sum(l.credit for l in lines)

    if account.type in ("asset", "expense"):
        return round(total_debit - total_credit, 2)
    return round(total_credit - total_debit, 2)


@dataclass
class TrialBalanceRow:
    account_id: str
    code: str
    name: str
    type: str
    debit_balance: float
    credit_balance: float


@dataclass
class TrialBalance:
    rows: list[TrialBalanceRow] = field(default_factory=list)
    total_debits: float = 0.0
    total_credits: float = 0.0

    @property
    def is_balanced(self) -> bool:
        return abs(self.total_debits - self.total_credits) <= _BALANCE_TOLERANCE


def trial_balance(db: Session, organization_id: str) -> TrialBalance:
    """A real trial balance: every account's signed balance, split back into
    a debit or credit column so total debits should equal total credits — if
    they don't, that's a real bug in post_journal_entry, not just a rounding
    quirk, since every posted entry is individually balance-checked."""

    accounts = (
        db.query(Account)
        .filter(Account.organization_id == organization_id, Account.is_active.is_(True))
        .order_by(Account.code)
        .all()
    )

    tb = TrialBalance()
    for account in accounts:
        balance = account_balance(db, account)
        debit_col = balance if balance >= 0 else 0.0
        credit_col = -balance if balance < 0 else 0.0
        # Liability/equity/revenue accounts normally carry a credit balance —
        # account_balance() already returns it sign-flipped for those types,
        # so a positive number there means "normal credit balance," which
        # belongs in the credit column, not the debit column.
        if account.type in ("liability", "equity", "revenue"):
            debit_col, credit_col = credit_col, debit_col
        tb.rows.append(
            TrialBalanceRow(
                account_id=account.id, code=account.code, name=account.name, type=account.type,
                debit_balance=debit_col, credit_balance=credit_col,
            )
        )
        tb.total_debits += debit_col
        tb.total_credits += credit_col

    tb.total_debits = round(tb.total_debits, 2)
    tb.total_credits = round(tb.total_credits, 2)
    return tb
