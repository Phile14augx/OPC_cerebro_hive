"""Tests for the finance/ERP module (app/finance/): chart of accounts,
double-entry journal posting, trial balance, org isolation, and the
automated invoice pipeline (categorize -> governance -> post/approve)."""

import pytest


def _new_org_headers(client, owner: str) -> dict:
    """Every call with no organization_id auto-creates a fresh Organization
    (app/api/routers/auth.py), which is exactly the isolation boundary these
    tests need — two calls with different owners land in two different orgs."""
    resp = client.post("/auth/api-keys", json={"owner": owner})
    assert resp.status_code == 200
    return {"Authorization": f"Bearer {resp.json()['api_key']}"}


def _seed_chart_of_accounts(client, headers: dict) -> dict:
    """A minimal, real chart of accounts: cash, AP, AR, a revenue account,
    and a couple of expense accounts a real bill/invoice could post against."""
    accounts = {}
    for code, name, type_ in [
        ("1000", "Cash", "asset"),
        ("1100", "Accounts Receivable", "asset"),
        ("2000", "Accounts Payable", "liability"),
        ("3000", "Owner's Equity", "equity"),
        ("4000", "Sales Revenue", "revenue"),
        ("4100", "Service Revenue", "revenue"),
        ("5000", "General Expense", "expense"),
        ("5100", "Software Expense", "expense"),
        ("5200", "Travel Expense", "expense"),
    ]:
        resp = client.post("/finance/accounts", json={"code": code, "name": name, "type": type_}, headers=headers)
        assert resp.status_code == 201, resp.text
        accounts[code] = resp.json()["id"]
    return accounts


def test_chart_of_accounts_is_isolated_between_organizations(client):
    headers_a = _new_org_headers(client, "org-a-owner")
    headers_b = _new_org_headers(client, "org-b-owner")

    client.post("/finance/accounts", json={"code": "1000", "name": "Org A Cash", "type": "asset"}, headers=headers_a)

    resp_a = client.get("/finance/accounts", headers=headers_a)
    resp_b = client.get("/finance/accounts", headers=headers_b)

    assert len(resp_a.json()) == 1
    assert resp_a.json()[0]["name"] == "Org A Cash"
    assert len(resp_b.json()) == 0  # org B sees none of org A's accounts


def test_duplicate_account_code_in_same_org_is_rejected(client):
    headers = _new_org_headers(client, "dup-code-owner")
    client.post("/finance/accounts", json={"code": "1000", "name": "Cash", "type": "asset"}, headers=headers)
    resp = client.post("/finance/accounts", json={"code": "1000", "name": "Cash Again", "type": "asset"}, headers=headers)
    assert resp.status_code == 409


def test_manual_journal_entry_must_balance(client):
    headers = _new_org_headers(client, "balance-test-owner")
    accounts = _seed_chart_of_accounts(client, headers)

    # Unbalanced: 100 debit vs 90 credit
    resp = client.post(
        "/finance/journal-entries",
        json={
            "memo": "bad entry",
            "lines": [
                {"account_id": accounts["5000"], "debit": 100, "credit": 0},
                {"account_id": accounts["1000"], "debit": 0, "credit": 90},
            ],
        },
        headers=headers,
    )
    assert resp.status_code == 400
    assert "unbalanced" in resp.json()["detail"].lower()


def test_manual_journal_entry_posts_and_updates_trial_balance(client):
    headers = _new_org_headers(client, "tb-test-owner")
    accounts = _seed_chart_of_accounts(client, headers)

    # Owner contributes $1000 cash as equity.
    resp = client.post(
        "/finance/journal-entries",
        json={
            "memo": "owner contribution",
            "lines": [
                {"account_id": accounts["1000"], "debit": 1000, "credit": 0, "description": "cash in"},
                {"account_id": accounts["3000"], "debit": 0, "credit": 1000, "description": "equity"},
            ],
        },
        headers=headers,
    )
    assert resp.status_code == 201

    tb = client.get("/finance/trial-balance", headers=headers).json()
    assert tb["is_balanced"] is True
    assert tb["total_debits"] == 1000.0
    assert tb["total_credits"] == 1000.0

    cash_row = next(r for r in tb["rows"] if r["code"] == "1000")
    equity_row = next(r for r in tb["rows"] if r["code"] == "3000")
    assert cash_row["debit_balance"] == 1000.0
    assert equity_row["credit_balance"] == 1000.0


def test_invoice_with_confident_categorization_auto_posts(client):
    headers = _new_org_headers(client, "auto-post-owner")
    _seed_chart_of_accounts(client, headers)

    party = client.post("/finance/parties", json={"name": "CloudCo", "kind": "vendor"}, headers=headers).json()

    invoice = client.post(
        "/finance/invoices",
        json={"party_id": party["id"], "kind": "payable", "amount": 49.0, "description": "Monthly SaaS software subscription"},
        headers=headers,
    ).json()
    assert invoice["status"] == "draft"

    submitted = client.post(f"/finance/invoices/{invoice['id']}/submit", headers=headers).json()
    assert submitted["status"] == "posted", submitted
    assert submitted["journal_entry_id"] is not None
    assert submitted["suggested_account_confidence"] >= 0.9  # "software" keyword should match confidently

    # Real ledger effect: trial balance should reflect the posted amount.
    tb = client.get("/finance/trial-balance", headers=headers).json()
    assert tb["is_balanced"] is True
    ap_row = next(r for r in tb["rows"] if r["code"] == "2000")
    assert ap_row["credit_balance"] == 49.0
    software_row = next(r for r in tb["rows"] if r["code"] == "5100")
    assert software_row["debit_balance"] == 49.0


def test_invoice_with_low_confidence_requires_approval_then_posts(client):
    headers = _new_org_headers(client, "approval-owner")
    _seed_chart_of_accounts(client, headers)

    party = client.post("/finance/parties", json={"name": "Mystery Vendor", "kind": "vendor"}, headers=headers).json()

    invoice = client.post(
        "/finance/invoices",
        json={"party_id": party["id"], "kind": "payable", "amount": 250.0, "description": "asdkfj unrelated gibberish"},
        headers=headers,
    ).json()

    submitted = client.post(f"/finance/invoices/{invoice['id']}/submit", headers=headers).json()
    assert submitted["status"] == "pending_approval"
    assert submitted["journal_entry_id"] is None

    approvals = client.get("/governance/approvals?status=pending", headers=headers).json()
    matching = [a for a in approvals if a["run_id"] == invoice["id"]]
    assert len(matching) == 1
    assert matching[0]["policy_name"] == "low-confidence-categorization"

    decide = client.post(
        f"/governance/approvals/{matching[0]['id']}/decide",
        json={"decision": "approve", "decided_by": "cfo"},
        headers=headers,
    )
    assert decide.status_code == 200

    posted = client.get(f"/finance/invoices/{invoice['id']}", headers=headers).json()
    assert posted["status"] == "posted"
    assert posted["journal_entry_id"] is not None


def test_governance_policy_forces_approval_above_amount_threshold(client):
    headers = _new_org_headers(client, "policy-owner")
    _seed_chart_of_accounts(client, headers)

    policy = client.post(
        "/governance/policies",
        json={
            "name": "large-invoice-needs-approval",
            "description": "Any finance invoice over $1,000 needs a human sign-off",
            "rule": {"if": {"field": "amount", "op": ">", "value": 1000}, "then": "require_approval"},
        },
        headers=headers,
    )
    assert policy.status_code == 201

    party = client.post("/finance/parties", json={"name": "BigVendor", "kind": "vendor"}, headers=headers).json()
    invoice = client.post(
        "/finance/invoices",
        json={"party_id": party["id"], "kind": "payable", "amount": 5000.0, "description": "software subscription renewal"},
        headers=headers,
    ).json()

    submitted = client.post(f"/finance/invoices/{invoice['id']}/submit", headers=headers).json()
    # High-confidence categorization ("software" keyword matches), but the
    # amount policy should still force approval regardless of confidence.
    assert submitted["status"] == "pending_approval"

    approvals = client.get("/governance/approvals?status=pending", headers=headers).json()
    matching = [a for a in approvals if a["run_id"] == invoice["id"]]
    assert any(a["policy_name"] == "large-invoice-needs-approval" for a in matching)


def test_posting_fails_cleanly_without_an_ap_control_account(client):
    headers = _new_org_headers(client, "no-control-account-owner")
    # Deliberately create only an expense account, no Accounts Payable.
    client.post("/finance/accounts", json={"code": "5000", "name": "General Expense", "type": "expense"}, headers=headers)

    party = client.post("/finance/parties", json={"name": "Vendor", "kind": "vendor"}, headers=headers).json()
    invoice = client.post(
        "/finance/invoices",
        json={"party_id": party["id"], "kind": "payable", "amount": 10.0, "description": "software"},
        headers=headers,
    ).json()

    resp = client.post(f"/finance/invoices/{invoice['id']}/submit", headers=headers)
    assert resp.status_code == 400
    assert "accounts payable" in resp.json()["detail"].lower()
