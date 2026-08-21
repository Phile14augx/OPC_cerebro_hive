"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users, FileText, Scale } from "lucide-react";
import { api, checkOnline } from "./lib";

type Tab = "accounts" | "parties" | "journal" | "invoices";
const inputCls = "rounded-md border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-sm text-text-primary w-full";
const btnPrimary = "rounded-md border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40";

type Account = { id: string; code: string; name: string; type: string; balance: number; currency: string };
type Party = { id: string; name: string; type: "customer" | "vendor" | "internal"; email?: string };
type JournalEntry = { id: string; date: string; description: string; debit_account: string; credit_account: string; amount: number; currency: string; status: string };
type Invoice = { id: string; number: string; party_id: string; amount: number; currency: string; status: string; due_date: string; issued_date: string };
type TrialBalance = { accounts: Array<{ code: string; name: string; debit: number; credit: number }> };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1 text-xs text-text-secondary"><span className="font-semibold uppercase tracking-wider">{label}</span>{children}</label>;
}

function AccountsPanel({ online }: { online: boolean | null }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [, setTrialBalance] = useState<TrialBalance | null>(null);
  const [form, setForm] = useState({ code: "", name: "", type: "asset", currency: "USD" });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online) return;
    try {
      const [accs, tb] = await Promise.all([
        api<Account[]>("/finance/accounts"),
        api<TrialBalance>("/finance/trial-balance"),
      ]);
      setAccounts(accs); setTrialBalance(tb);
    } catch { /* noop */ }
  }, [online]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount+poll pattern; setState happens after an await inside refresh(), not synchronously in the effect body, but the rule's static analysis can't see through the async boundary.
  useEffect(() => { void refresh(); const id = setInterval(refresh, 6000); return () => clearInterval(id); }, [refresh]);

  const create = async () => {
    if (!form.code || !form.name) return;
    setBusy(true);
    try { await api("/finance/accounts", { method: "POST", body: JSON.stringify(form) }); await refresh(); setForm(f => ({ ...f, code: "", name: "" })); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  const totalAssets = accounts.filter(a => a.type === "asset").reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === "liability").reduce((s, a) => s + a.balance, 0);

  return (
    <div className="mt-6 space-y-6">
      {accounts.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[["Total Assets", totalAssets], ["Total Liabilities", totalLiabilities], ["Net Position", totalAssets - totalLiabilities]].map(([label, val]) => (
            <div key={label as string} className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</p>
              <p className={`mt-2 text-2xl font-bold ${(val as number) >= 0 ? "text-primary-accent" : "text-red-400"}`}>${(val as number).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
      <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Add account</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Code"><input className={inputCls} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="1000" /></Field>
          <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Cash" /></Field>
          <Field label="Type">
            <select className={inputCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {["asset", "liability", "equity", "revenue", "expense"].map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Currency"><input className={inputCls} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} /></Field>
        </div>
        <button onClick={create} disabled={busy || !online} className={btnPrimary}>{busy ? "Creating…" : "Add account"}</button>
      </section>
      <div className="overflow-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-elevated/40">
            <tr>{["Code", "Name", "Type", "Balance", "Currency"].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">{h}</th>)}</tr>
          </thead>
          <tbody>
            {accounts.map(a => (
              <tr key={a.id} className="border-b border-border last:border-none hover:bg-surface-elevated/20">
                <td className="px-3 py-2 font-mono text-xs text-text-secondary">{a.code}</td>
                <td className="px-3 py-2 font-semibold text-text-primary">{a.name}</td>
                <td className="px-3 py-2 text-text-secondary capitalize">{a.type}</td>
                <td className={`px-3 py-2 font-semibold ${a.balance >= 0 ? "text-primary-accent" : "text-red-400"}`}>{a.balance.toLocaleString()}</td>
                <td className="px-3 py-2 text-text-secondary">{a.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {accounts.length === 0 && <p className="px-4 py-6 text-sm text-text-secondary">No accounts yet.</p>}
      </div>
    </div>
  );
}

function PartiesPanel({ online }: { online: boolean | null }) {
  const [parties, setParties] = useState<Party[]>([]);
  const [form, setForm] = useState({ name: "", type: "customer" as Party["type"], email: "" });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online) return;
    try { setParties(await api<Party[]>("/finance/parties")); } catch { /* noop */ }
  }, [online]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount+poll pattern; setState happens after an await inside refresh(), not synchronously in the effect body, but the rule's static analysis can't see through the async boundary.
  useEffect(() => { void refresh(); const id = setInterval(refresh, 6000); return () => clearInterval(id); }, [refresh]);

  const create = async () => {
    if (!form.name) return;
    setBusy(true);
    try { await api("/finance/parties", { method: "POST", body: JSON.stringify(form) }); await refresh(); setForm(f => ({ ...f, name: "", email: "" })); }
    catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Add party</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Acme Corp" /></Field>
          <Field label="Type">
            <select className={inputCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Party["type"] }))}>
              {["customer", "vendor", "internal"].map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ap@acme.com" /></Field>
        </div>
        <button onClick={create} disabled={busy || !online} className={btnPrimary}>{busy ? "Creating…" : "Add party"}</button>
      </section>
      <div className="space-y-2">
        {parties.map(p => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 px-4 py-3">
            <div>
              <span className="font-semibold text-text-primary">{p.name}</span>
              {p.email && <span className="ml-2 text-xs text-text-secondary">{p.email}</span>}
            </div>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${p.type === "customer" ? "text-primary-accent border-primary-accent/40 bg-primary-accent/10" : p.type === "vendor" ? "text-orange-400 border-orange-400/40 bg-orange-400/10" : "text-text-secondary border-border bg-surface/40"}`}>{p.type}</span>
          </div>
        ))}
        {parties.length === 0 && <p className="text-sm text-text-secondary">No parties yet.</p>}
      </div>
    </div>
  );
}

function JournalPanel({ online }: { online: boolean | null }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [form, setForm] = useState({ description: "", debit_account: "", credit_account: "", amount: "", currency: "USD" });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online) return;
    try { setEntries(await api<JournalEntry[]>("/finance/journal-entries")); } catch { /* noop */ }
  }, [online]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount+poll pattern; setState happens after an await inside refresh(), not synchronously in the effect body, but the rule's static analysis can't see through the async boundary.
  useEffect(() => { void refresh(); const id = setInterval(refresh, 6000); return () => clearInterval(id); }, [refresh]);

  const create = async () => {
    if (!form.description || !form.debit_account || !form.credit_account || !form.amount) return;
    setBusy(true);
    try {
      await api("/finance/journal-entries", { method: "POST", body: JSON.stringify({ ...form, amount: parseFloat(form.amount), date: new Date().toISOString() }) });
      await refresh();
      setForm(f => ({ ...f, description: "", amount: "" }));
    } catch { /* noop */ } finally { setBusy(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Post journal entry</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Description"><input className={inputCls} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Q3 SaaS revenue recognition" /></Field></div>
          <Field label="Debit account"><input className={inputCls} value={form.debit_account} onChange={e => setForm(f => ({ ...f, debit_account: e.target.value }))} placeholder="1000 (Cash)" /></Field>
          <Field label="Credit account"><input className={inputCls} value={form.credit_account} onChange={e => setForm(f => ({ ...f, credit_account: e.target.value }))} placeholder="4000 (Revenue)" /></Field>
          <Field label="Amount"><input className={inputCls} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="10000" /></Field>
          <Field label="Currency"><input className={inputCls} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} /></Field>
        </div>
        <button onClick={create} disabled={busy || !online} className={btnPrimary}>{busy ? "Posting…" : "Post entry"}</button>
      </section>
      <div className="overflow-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-elevated/40">
            <tr>{["Date", "Description", "Debit", "Credit", "Amount", "Status"].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">{h}</th>)}</tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="border-b border-border last:border-none hover:bg-surface-elevated/20">
                <td className="px-3 py-2 text-xs text-text-secondary">{new Date(e.date).toLocaleDateString()}</td>
                <td className="px-3 py-2 text-text-primary">{e.description}</td>
                <td className="px-3 py-2 font-mono text-xs text-text-secondary">{e.debit_account}</td>
                <td className="px-3 py-2 font-mono text-xs text-text-secondary">{e.credit_account}</td>
                <td className="px-3 py-2 font-semibold text-primary-accent">{parseFloat(String(e.amount)).toLocaleString()} {e.currency}</td>
                <td className="px-3 py-2"><span className="text-xs text-text-secondary capitalize">{e.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && <p className="px-4 py-6 text-sm text-text-secondary">No journal entries yet.</p>}
      </div>
    </div>
  );
}

function InvoicesPanel({ online }: { online: boolean | null }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [form, setForm] = useState({ number: "", party_id: "", amount: "", currency: "USD", due_date: "" });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!online) return;
    try { setInvoices(await api<Invoice[]>("/finance/invoices")); } catch { /* noop */ }
  }, [online]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount+poll pattern; setState happens after an await inside refresh(), not synchronously in the effect body, but the rule's static analysis can't see through the async boundary.
  useEffect(() => { void refresh(); const id = setInterval(refresh, 6000); return () => clearInterval(id); }, [refresh]);

  const create = async () => {
    if (!form.number || !form.party_id || !form.amount) return;
    setBusy(true);
    try {
      await api("/finance/invoices", { method: "POST", body: JSON.stringify({ ...form, amount: parseFloat(form.amount), issued_date: new Date().toISOString() }) });
      await refresh();
      setForm(f => ({ ...f, number: "", amount: "" }));
    } catch { /* noop */ } finally { setBusy(false); }
  };

  const submit = async (id: string) => {
    try { await api(`/finance/invoices/${id}/submit`, { method: "POST" }); await refresh(); } catch { /* noop */ }
  };

  const statusColor = (s: string) => s === "paid" ? "text-primary-accent border-primary-accent/40 bg-primary-accent/10"
    : s === "overdue" ? "text-red-400 border-red-400/40 bg-red-400/10"
    : s === "submitted" ? "text-yellow-400 border-yellow-400/40 bg-yellow-400/10"
    : "text-text-secondary border-border bg-surface/40";

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-border bg-surface/40 p-4 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Create invoice</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Invoice number"><input className={inputCls} value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="INV-2026-001" /></Field>
          <Field label="Party ID"><input className={inputCls} value={form.party_id} onChange={e => setForm(f => ({ ...f, party_id: e.target.value }))} placeholder="UUID from Parties tab" /></Field>
          <Field label="Amount"><input className={inputCls} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></Field>
          <Field label="Currency"><input className={inputCls} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} /></Field>
          <Field label="Due date"><input className={inputCls} type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></Field>
        </div>
        <button onClick={create} disabled={busy || !online} className={btnPrimary}>{busy ? "Creating…" : "Create invoice"}</button>
      </section>
      <div className="space-y-2">
        {invoices.map(inv => (
          <div key={inv.id} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-text-primary">{inv.number}</span>
                <span className="ml-3 font-bold text-primary-accent">{parseFloat(String(inv.amount)).toLocaleString()} {inv.currency}</span>
              </div>
              <div className="flex items-center gap-2">
                {inv.status === "draft" && (
                  <button onClick={() => submit(inv.id)} className={btnPrimary}>Submit</button>
                )}
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColor(inv.status)}`}>{inv.status}</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-text-secondary">Due {new Date(inv.due_date).toLocaleDateString()} · Issued {new Date(inv.issued_date).toLocaleDateString()}</p>
          </div>
        ))}
        {invoices.length === 0 && <p className="text-sm text-text-secondary">No invoices yet.</p>}
      </div>
    </div>
  );
}

const TABS: [Tab, string, React.ComponentType<{ size?: number }>][] = [
  ["accounts", "Chart of Accounts", BookOpen],
  ["parties", "Parties", Users],
  ["journal", "Journal Entries", Scale],
  ["invoices", "Invoices", FileText],
];

export default function CerebroFinancePage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("accounts");
  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> Platform
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">CerebroFinance™ · Tier 4</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">FP&A Intelligence — chart of accounts, journal entries, invoices, and trial balance</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">CerebroFinance is the financial intelligence layer. Manage the full double-entry accounting stack — chart of accounts, parties, journal entries, and invoices — with AI-powered anomaly detection and revenue recognition.</p>
      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(([t, label, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
      {tab === "accounts" && <AccountsPanel online={online} />}
      {tab === "parties" && <PartiesPanel online={online} />}
      {tab === "journal" && <JournalPanel online={online} />}
      {tab === "invoices" && <InvoicesPanel online={online} />}
    </main>
  );
}
