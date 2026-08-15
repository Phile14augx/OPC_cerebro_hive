import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Dot, Label, Panel, SectionHead } from "@/components/terminal";
import { RunButton } from "@/components/RunButton";
import { getDb } from "@/lib/data";
import { hiveDeepLinks, listEnvConnections } from "@/lib/connectors";
import { computePulse } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const db = getDb();
  const pulse = computePulse(db);
  const agents = db.agents.list();
  const connections = listEnvConnections();
  const nodes = db.knowledge.nodes().slice(0, 6);
  const lastRuns = db.agentRuns.list().slice(0, 5);
  const links = hiveDeepLinks();

  return (
    <div>
      <PageHeader eyebrow="Cerebro Nexarch" title="Operator console" aside={<RunButton agentId="nexarch" label="Run conductor" />} />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Agents active", value: String(pulse.agentsActive) },
          { label: "Open comms", value: String(pulse.openComms) },
          { label: "Open tasks", value: String(pulse.openTasks) },
          { label: "Runway months", value: pulse.runwayMonths.toFixed(1) },
        ].map((item) => (
          <Panel key={item.label}>
            <Label>{item.label}</Label>
            <div className="mt-2 text-2xl font-bold">{item.value}</div>
          </Panel>
        ))}
      </div>

      <div className="mb-8">
        <SectionHead>Connections</SectionHead>
        <div className="mt-3 flex flex-wrap gap-2">
          {connections.map((c) => (
            <span key={c.id} className="flex items-center gap-2 border border-os-border px-2 py-1 text-[11px] uppercase tracking-[0.08em]">
              <Dot status={c.status} />
              {c.name}
              <span className="text-os-dim">{c.status}</span>
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-os-dim">Status from env, never from seed. Hive probes live on Connections.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <SectionHead>Company of agents</SectionHead>
          <ul className="mt-4 space-y-2">
            {agents.slice(0, 10).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-[12px]">
                <span className="flex items-center gap-2">
                  <Dot status={a.status} />
                  <span className="uppercase tracking-[0.06em]">{a.name}</span>
                </span>
                <span className="text-os-dim">{a.role}</span>
              </li>
            ))}
          </ul>
          <Link href="/agents" className="mt-4 inline-block text-[11px] uppercase tracking-[0.16em] text-os-muted">
            Full roster
          </Link>
        </Panel>
        <Panel>
          <SectionHead>Knowledge core</SectionHead>
          <ul className="mt-4 space-y-2">
            {nodes.map((n) => (
              <li key={n.id}>
                <div className="text-[12px] uppercase tracking-[0.06em]">{n.title}</div>
                <div className="text-[11px] text-os-dim">{n.kind}{n.path ? ` · ${n.path}` : ""}</div>
              </li>
            ))}
          </ul>
          <Link href="/brain" className="mt-4 inline-block text-[11px] uppercase tracking-[0.16em] text-os-muted">
            Open brain
          </Link>
        </Panel>
      </div>

      <Panel className="mt-6">
        <SectionHead>Last runs</SectionHead>
        {lastRuns.length === 0 ? (
          <p className="mt-3 text-[12px] text-os-muted">No runs yet. Use Run on /agents. Failures stay failures.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {lastRuns.map((r) => (
              <li key={r.id} className="text-[12px]">
                <Dot status={r.ok ? "ok" : "err"} /> {r.agentId}: {r.summary}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <p className="mt-6 text-[11px] text-os-dim">
        Hive: <a className="underline" href={links.studioHome}>Studio</a> ·{" "}
        <a className="underline" href={links.forge}>Forge</a> ·{" "}
        <a className="underline" href={links.archive}>Archive</a>
      </p>
    </div>
  );
}
