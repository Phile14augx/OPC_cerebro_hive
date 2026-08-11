"""Finance/ERP domain models: a real double-entry ledger core.

Everything here is scoped by `organization_id` (app.models.identity.Organization)
— every query in app/finance/router.py filters on the caller's own
organization_id (from their APIKey), so one tenant's books are never visible
to another's.

Design deliberately mirrors standard double-entry bookkeeping rather than
inventing a simplified model: Account (chart of accounts) -> JournalEntry
(a transaction) -> JournalLine (one debit or credit leg of that transaction).
An entry only exists if its lines balance (enforced in ledger_engine.py, not
here — SQLAlchemy models stay dumb, validation lives in the engine so it's
testable independent of the ORM).
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


# The five fundamental account types every ledger entry ultimately rolls up
# into. Normal balance side (debit vs credit increases the balance) follows
# standard accounting convention — enforced in ledger_engine.account_balance.
ACCOUNT_TYPES = ("asset", "liability", "equity", "revenue", "expense")


class Account(Base):
    """One line in the chart of accounts, e.g. "1000 Cash", "4000 Revenue",
    "5100 Office Supplies Expense"."""

    __tablename__ = "finance_accounts"
    __table_args__ = (UniqueConstraint("organization_id", "code", name="uq_finance_account_org_code"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String, ForeignKey("organizations.id"), index=True)
    code: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(String)  # one of ACCOUNT_TYPES
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class Party(Base):
    """A vendor (money owed to) or customer (money owed from)."""

    __tablename__ = "finance_parties"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String, ForeignKey("organizations.id"), index=True)
    name: Mapped[str] = mapped_column(String)
    kind: Mapped[str] = mapped_column(String)  # "vendor" | "customer"
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class JournalEntry(Base):
    """One balanced transaction. Immutable once created — corrections are
    made with a new, offsetting entry (standard accounting practice), not by
    editing history. `source` records what created it for audit purposes."""

    __tablename__ = "finance_journal_entries"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String, ForeignKey("organizations.id"), index=True)
    memo: Mapped[str] = mapped_column(String, default="")
    source: Mapped[str] = mapped_column(String, default="manual")  # "manual" | "agent" | "invoice"
    created_by: Mapped[str] = mapped_column(String)  # APIKey.owner or agent slug
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    lines: Mapped[list["JournalLine"]] = relationship(back_populates="entry", cascade="all, delete-orphan")


class JournalLine(Base):
    """One debit or credit leg of a JournalEntry. Exactly one of debit/credit
    should be non-zero per line by convention (both stored so a line can be
    summed either way without a sign convention bug)."""

    __tablename__ = "finance_journal_lines"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    entry_id: Mapped[str] = mapped_column(String, ForeignKey("finance_journal_entries.id"), index=True)
    account_id: Mapped[str] = mapped_column(String, ForeignKey("finance_accounts.id"), index=True)
    debit: Mapped[float] = mapped_column(Float, default=0.0)
    credit: Mapped[float] = mapped_column(Float, default=0.0)
    description: Mapped[str] = mapped_column(String, default="")

    entry: Mapped[JournalEntry] = relationship(back_populates="lines")


class Invoice(Base):
    """An AP (payable, we owe a vendor) or AR (receivable, a customer owes
    us) invoice. Starts as `draft`; POST /finance/invoices/{id}/submit runs
    the automated categorize -> governance-check -> post pipeline
    (app/finance/automation.py), landing on `posted` (journal_entry_id set)
    or `pending_approval` (an Approval row exists, same as agent runs)."""

    __tablename__ = "finance_invoices"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    organization_id: Mapped[str] = mapped_column(String, ForeignKey("organizations.id"), index=True)
    party_id: Mapped[str] = mapped_column(String, ForeignKey("finance_parties.id"), index=True)
    kind: Mapped[str] = mapped_column(String)  # "payable" | "receivable"
    amount: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String, default="USD")
    description: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default="draft")  # draft|pending_approval|posted|rejected
    suggested_account_id: Mapped[str | None] = mapped_column(String, ForeignKey("finance_accounts.id"), nullable=True)
    suggested_account_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    journal_entry_id: Mapped[str | None] = mapped_column(String, ForeignKey("finance_journal_entries.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
