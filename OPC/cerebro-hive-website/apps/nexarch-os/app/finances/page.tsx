import { PageHeader } from "@/components/PageHeader";
import { StatementUploader } from "@/components/StatementUploader";
import { Panel, SectionHead } from "@/components/terminal";
import { getDb } from "@/lib/data";
import { envStatus } from "@/lib/connectors";
import { computePulse, ledgerTotals } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export default function FinancesPage() {
  const db = getDb();
  const entries = db.ledger.list();
  const totals = ledgerTotals(entries);
  const pulse = computePulse(db);
  const stripe = envStatus(["STRIPE_SECRET_KEY"]);

  return (
    <div>
      <PageHeader eyebrow="Finance" title="Runway" />
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <Panel>
          <SectionHead>Income</SectionHead>
          <div className="mt-2 text-xl">${totals.income.toLocaleString()}</div>
        </Panel>
        <Panel>
          <SectionHead>Spend</SectionHead>
          <div className="mt-2 text-xl">${totals.spend.toLocaleString()}</div>
        </Panel>
        <Panel>
          <SectionHead>Net</SectionHead>
          <div className="mt-2 text-xl">${totals.net.toLocaleString()}</div>
        </Panel>
        <Panel>
          <SectionHead>Runway</SectionHead>
          <div className="mt-2 text-xl">{pulse.runwayMonths.toFixed(1)} mo</div>
        </Panel>
      </div>
      <p className="mb-4 text-[11px] uppercase tracking-[0.16em] text-os-muted">Stripe {stripe} — never faked connected</p>
      <Panel className="mb-6">
        <SectionHead>CSV import</SectionHead>
        <p className="mt-2 mb-3 text-[12px] text-os-dim">Header: date,description,category,amount,direction</p>
        <StatementUploader />
      </Panel>
      <Panel>
        <SectionHead>By category</SectionHead>
        <ul className="mt-3 space-y-1 text-[12px]">
          {Object.entries(totals.byCategory).map(([k, v]) => (
            <li key={k} className="flex justify-between">
              <span className="uppercase text-os-muted">{k}</span>
              <span>${v.toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <ul className="mt-6 space-y-2 border-t border-os-border pt-4">
          {entries.map((e) => (
            <li key={e.id} className="flex justify-between text-[12px]">
              <span>
                {e.date} · {e.description}
              </span>
              <span className={e.direction === "in" ? "text-os-ok" : "text-os-err"}>
                {e.direction === "in" ? "+" : "-"}${e.amountUsd}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
