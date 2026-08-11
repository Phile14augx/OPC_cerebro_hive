"""Finance/ERP domain module — chart of accounts, parties, double-entry
journal entries, trial balance, and invoices with the automated
categorize -> governance -> post pipeline (app/finance/automation.py).

Every endpoint is scoped to the caller's own organization_id (from their
APIKey — see app/security.py::get_current_api_key), so one tenant never
sees another's books. Mounted at /finance in app/main.py.
"""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.db import get_db
from app.finance import automation, ledger_engine
from app.finance.ledger_engine import LedgerError
from app.finance.models import ACCOUNT_TYPES, Account, Invoice, JournalEntry, JournalLine, Party
from app.models.identity import APIKey
from app.models.governance import AuditLog
from app.security import get_current_api_key

router = APIRouter(prefix="/finance", tags=["finance"])


def _require_org(key: APIKey) -> str:
    """API keys minted before the organization_id column existed have it as
    NULL — every finance query filters on it, so silently proceeding would
    just return empty results (confusing) rather than a clear error. Callers
    with a legacy key need to mint a fresh one via POST /auth/api-keys."""
    if not key.organization_id:
        raise HTTPException(400, "this API key has no organization — mint a new one via POST /auth/api-keys")
    return key.organization_id


# ─── Schemas ─────────────────────────────────────────────────────────────

class AccountCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str = Field(min_length=1, max_length=20)
    name: str = Field(min_length=1, max_length=200)
    type: str = Field(min_length=1, max_length=20)


class AccountOut(BaseModel):
    id: str
    code: str
    name: str
    type: str
    is_active: bool
    balance: float | None = None

    class Config:
        from_attributes = True


class PartyCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=200)
    kind: str = Field(min_length=1, max_length=20)  # "vendor" | "customer"
    email: str | None = Field(default=None, max_length=320)


class PartyOut(BaseModel):
    id: str
    name: str
    kind: str
    email: str | None

    class Config:
        from_attributes = True


class JournalLineIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    account_id: str = Field(min_length=1, max_length=100)
    debit: float = Field(default=0.0, ge=0)
    credit: float = Field(default=0.0, ge=0)
    description: str = Field(default="", max_length=500)


class JournalEntryCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    memo: str = Field(default="", max_length=500)
    lines: list[JournalLineIn] = Field(min_length=2, max_length=100)


class JournalLineOut(BaseModel):
    account_id: str
    debit: float
    credit: float
    description: str

    class Config:
        from_attributes = True


class JournalEntryOut(BaseModel):
    id: str
    memo: str
    source: str
    created_by: str
    created_at: datetime
    lines: list[JournalLineOut]

    class Config:
        from_attributes = True


class InvoiceCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    party_id: str = Field(min_length=1, max_length=100)
    kind: str = Field(min_length=1, max_length=20)  # "payable" | "receivable"
    amount: float = Field(gt=0, le=100_000_000)
    currency: str = Field(default="USD", max_length=10)
    description: str = Field(default="", max_length=2000)


class InvoiceOut(BaseModel):
    id: str
    party_id: str
    kind: str
    amount: float
    currency: str
    description: str
    status: str
    suggested_account_id: str | None
    suggested_account_confidence: float | None
    journal_entry_id: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class TrialBalanceRowOut(BaseModel):
    account_id: str
    code: str
    name: str
    type: str
    debit_balance: float
    credit_balance: float


class TrialBalanceOut(BaseModel):
    rows: list[TrialBalanceRowOut]
    total_debits: float
    total_credits: float
    is_balanced: bool


# ─── Accounts ────────────────────────────────────────────────────────────

@router.get("/accounts", response_model=list[AccountOut])
def list_accounts(db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> list[AccountOut]:
    org_id = _require_org(key)
    accounts = (
        db.query(Account)
        .filter(Account.organization_id == org_id, Account.is_active.is_(True))
        .order_by(Account.code)
        .all()
    )
    return [AccountOut(id=a.id, code=a.code, name=a.name, type=a.type, is_active=a.is_active, balance=ledger_engine.account_balance(db, a)) for a in accounts]


@router.post("/accounts", response_model=AccountOut, status_code=201)
def create_account(payload: AccountCreate, db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> AccountOut:
    org_id = _require_org(key)
    if payload.type not in ACCOUNT_TYPES:
        raise HTTPException(400, f"type must be one of {ACCOUNT_TYPES}")
    existing = (
        db.query(Account)
        .filter(Account.organization_id == org_id, Account.code == payload.code)
        .first()
    )
    if existing:
        raise HTTPException(409, f"account code '{payload.code}' already exists in this organization")

    account = Account(organization_id=org_id, code=payload.code, name=payload.name, type=payload.type)
    db.add(account)
    db.commit()
    db.refresh(account)
    db.add(AuditLog(actor=key.owner, action="finance.account.created", target=account.id, meta={"code": account.code}))
    db.commit()
    return AccountOut(id=account.id, code=account.code, name=account.name, type=account.type, is_active=account.is_active, balance=0.0)


# ─── Parties (vendors/customers) ────────────────────────────────────────

@router.get("/parties", response_model=list[PartyOut])
def list_parties(db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> list[Party]:
    org_id = _require_org(key)
    return db.query(Party).filter(Party.organization_id == org_id).order_by(Party.name).all()


@router.post("/parties", response_model=PartyOut, status_code=201)
def create_party(payload: PartyCreate, db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> Party:
    org_id = _require_org(key)
    if payload.kind not in ("vendor", "customer"):
        raise HTTPException(400, "kind must be 'vendor' or 'customer'")
    party = Party(organization_id=org_id, name=payload.name, kind=payload.kind, email=payload.email)
    db.add(party)
    db.commit()
    db.refresh(party)
    db.add(AuditLog(actor=key.owner, action="finance.party.created", target=party.id, meta={"kind": party.kind}))
    db.commit()
    return party


# ─── Journal entries (manual double-entry posting) ──────────────────────

@router.get("/journal-entries", response_model=list[JournalEntryOut])
def list_journal_entries(db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> list[JournalEntry]:
    org_id = _require_org(key)
    return (
        db.query(JournalEntry)
        .filter(JournalEntry.organization_id == org_id)
        .order_by(JournalEntry.created_at.desc())
        .limit(200)
        .all()
    )


@router.get("/journal-entries/{entry_id}", response_model=JournalEntryOut)
def get_journal_entry(entry_id: str, db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> JournalEntry:
    org_id = _require_org(key)
    entry = (
        db.query(JournalEntry)
        .filter(JournalEntry.id == entry_id, JournalEntry.organization_id == org_id)
        .first()
    )
    if entry is None:
        raise HTTPException(404, "journal entry not found")
    return entry


@router.post("/journal-entries", response_model=JournalEntryOut, status_code=201)
def create_journal_entry(payload: JournalEntryCreate, db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> JournalEntry:
    org_id = _require_org(key)
    try:
        entry = ledger_engine.post_journal_entry(
            db,
            organization_id=org_id,
            lines=[l.model_dump() for l in payload.lines],
            memo=payload.memo,
            created_by=key.owner,
            source="manual",
        )
    except LedgerError as exc:
        raise HTTPException(400, str(exc)) from exc

    db.add(AuditLog(actor=key.owner, action="finance.journal_entry.posted", target=entry.id, meta={"memo": entry.memo}))
    db.commit()
    return entry


# ─── Trial balance ───────────────────────────────────────────────────────

@router.get("/trial-balance", response_model=TrialBalanceOut)
def get_trial_balance(db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> TrialBalanceOut:
    org_id = _require_org(key)
    tb = ledger_engine.trial_balance(db, org_id)
    return TrialBalanceOut(
        rows=[TrialBalanceRowOut(**r.__dict__) for r in tb.rows],
        total_debits=tb.total_debits,
        total_credits=tb.total_credits,
        is_balanced=tb.is_balanced,
    )


# ─── Invoices (the automated pipeline) ──────────────────────────────────

@router.get("/invoices", response_model=list[InvoiceOut])
def list_invoices(
    status: str | None = None,
    db: Session = Depends(get_db),
    key: APIKey = Depends(get_current_api_key),
) -> list[Invoice]:
    org_id = _require_org(key)
    query = db.query(Invoice).filter(Invoice.organization_id == org_id)
    if status:
        query = query.filter(Invoice.status == status)
    return query.order_by(Invoice.created_at.desc()).all()


@router.get("/invoices/{invoice_id}", response_model=InvoiceOut)
def get_invoice(invoice_id: str, db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> Invoice:
    org_id = _require_org(key)
    invoice = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id, Invoice.organization_id == org_id)
        .first()
    )
    if invoice is None:
        raise HTTPException(404, "invoice not found")
    return invoice


@router.post("/invoices", response_model=InvoiceOut, status_code=201)
def create_invoice(payload: InvoiceCreate, db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> Invoice:
    org_id = _require_org(key)
    if payload.kind not in ("payable", "receivable"):
        raise HTTPException(400, "kind must be 'payable' or 'receivable'")
    party = (
        db.query(Party)
        .filter(Party.id == payload.party_id, Party.organization_id == org_id)
        .first()
    )
    if party is None:
        raise HTTPException(404, "party not found in this organization")

    invoice = Invoice(
        organization_id=org_id,
        party_id=payload.party_id,
        kind=payload.kind,
        amount=payload.amount,
        currency=payload.currency,
        description=payload.description,
        status="draft",
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    db.add(AuditLog(actor=key.owner, action="finance.invoice.created", target=invoice.id, meta={"amount": invoice.amount, "kind": invoice.kind}))
    db.commit()
    return invoice


@router.post("/invoices/{invoice_id}/submit", response_model=InvoiceOut)
def submit_invoice(invoice_id: str, db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> Invoice:
    """Runs the automated pipeline: categorize -> governance check -> post
    (or route to a human as a pending Approval). See app/finance/automation.py."""
    org_id = _require_org(key)
    invoice = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id, Invoice.organization_id == org_id)
        .first()
    )
    if invoice is None:
        raise HTTPException(404, "invoice not found")

    try:
        return automation.submit_invoice(db, invoice)
    except LedgerError as exc:
        raise HTTPException(400, str(exc)) from exc
