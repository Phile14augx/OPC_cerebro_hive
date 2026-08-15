import { PageHeader } from "@/components/PageHeader";
import { Panel, SectionHead } from "@/components/terminal";
import { getDb } from "@/lib/data";
import type { FunnelDeal } from "@/lib/schemas";

export const dynamic = "force-dynamic";

const STAGES: FunnelDeal["stage"][] = ["signal", "conversation", "pilot", "workspace", "expansion"];
const LABELS: Record<FunnelDeal["stage"], string> = {
  signal: "Signal",
  conversation: "Conversation",
  pilot: "Pilot",
  workspace: "Hive workspace",
  expansion: "Expansion",
};

export default function FunnelPage() {
  const db = getDb();
  const deals = db.funnel.list();

  return (
    <div>
      <PageHeader eyebrow="Growth" title="Funnel" />
      <p className="mb-6 text-[12px] text-os-muted">
        Cerebro Nexarch GTM. Seeded accounts, not FounderOS coaching clients.
      </p>
      <div className="grid gap-3 md:grid-cols-5">
        {STAGES.map((stage) => (
          <Panel key={stage}>
            <SectionHead>{LABELS[stage]}</SectionHead>
            <ul className="mt-3 space-y-3">
              {deals
                .filter((d) => d.stage === stage)
                .map((d) => (
                  <li key={d.id} className="border border-os-border p-2">
                    <div className="text-[12px] font-bold uppercase">{d.name}</div>
                    <div className="text-[11px] text-os-dim">${d.valueUsd.toLocaleString()}</div>
                    <p className="mt-1 text-[11px] text-os-muted">{d.nextStep}</p>
                  </li>
                ))}
            </ul>
          </Panel>
        ))}
      </div>
    </div>
  );
}
