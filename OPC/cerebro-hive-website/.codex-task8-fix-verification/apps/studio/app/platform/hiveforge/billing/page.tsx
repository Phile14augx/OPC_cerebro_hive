"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api, checkOnline, KEY, type CostExplorer, type Invoice } from "../lib";

export default function BillingPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [cost, setCost] = useState<CostExplorer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try {
      setCost(await api<CostExplorer>("/v1/hiveforge/billing/cost-explorer"));
      setInvoices((await api<{ invoices: Invoice[] }>("/v1/hiveforge/billing/invoices")).invoices);
    } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const generateInvoice = useCallback(async () => {
    setBusy(true);
    try {
      await api("/v1/hiveforge/billing/invoices", { method: "POST" });
      setInvoices((await api<{ invoices: Invoice[] }>("/v1/hiveforge/billing/invoices")).invoices);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform/hiveforge" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> HiveForge™
      </Link>
      <h1 className="mt-5 text-3xl font-bold text-text-primary md:text-4xl">Billing &amp; Cost Explorer</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">Usage-based billing computed live from every provisioned resource&apos;s hourly rate and age.</p>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {cost && (
        <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-surface/60 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-text-secondary">Active resources</div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">{cost.resourceCount}</div>
          </div>
          <div className="rounded-lg border border-border bg-surface/60 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-text-secondary">Accrued cost</div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">${cost.totalUsd.toFixed(2)}</div>
          </div>
          <div className="rounded-lg border border-border bg-surface/60 px-4 py-3 col-span-2">
            <div className="text-xs uppercase tracking-wider text-text-secondary">By kind</div>
            <div className="mt-1 text-sm text-text-primary">{Object.entries(cost.byKind).map(([k, v]) => `${k}: $${v.toFixed(2)}`).join(" · ") || "—"}</div>
          </div>
          <div className="rounded-lg border border-border bg-surface/60 px-4 py-3 col-span-2 md:col-span-4">
            <div className="text-xs uppercase tracking-wider text-text-secondary">By category</div>
            <div className="mt-1 text-sm text-text-primary">{Object.entries(cost.byCategory).map(([k, v]) => `${k}: $${v.toFixed(2)}`).join(" · ") || "—"}</div>
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Invoices</h2>
          <button onClick={() => void generateInvoice()} disabled={busy || !online || !KEY} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">{busy ? "Generating…" : "Generate invoice"}</button>
        </div>
        <div className="mt-3 space-y-3">
          {invoices.map(inv => (
            <div key={inv.id} className="rounded-lg border border-border bg-surface/40 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-primary">Invoice {inv.id.slice(-8)}</span>
                <span className="font-semibold text-text-primary">${inv.totalUsd.toFixed(2)}</span>
              </div>
              <div className="mt-1 text-xs text-text-secondary">{new Date(inv.periodStart).toLocaleDateString()} – {new Date(inv.periodEnd).toLocaleDateString()}</div>
              <ul className="mt-2 space-y-1 text-xs text-text-secondary">
                {inv.lineItems.map(li => <li key={li.resourceId}>{li.itemName} · {li.hours}h · ${li.amountUsd.toFixed(2)}</li>)}
              </ul>
            </div>
          ))}
          {invoices.length === 0 && <p className="text-sm text-text-secondary">No invoices generated yet.</p>}
        </div>
      </section>
    </main>
  );
}
