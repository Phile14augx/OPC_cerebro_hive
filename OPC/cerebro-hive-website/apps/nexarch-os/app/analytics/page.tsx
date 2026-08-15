import { PageHeader } from "@/components/PageHeader";
import { Panel, SectionHead } from "@/components/terminal";
import { getDb } from "@/lib/data";
import { listEnvConnections } from "@/lib/connectors";
import { computePulse } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  const db = getDb();
  const history = db.pulse.list();
  const live = computePulse(db);
  const connections = listEnvConnections();
  const connected = connections.filter((c) => c.status === "connected").length;

  return (
    <div>
      <PageHeader eyebrow="System" title="Analytics" />
      <p className="mb-6 text-[12px] text-os-muted">
        Sparkline from pulse history (seed until Conductor runs). Connector counts are live env status.
      </p>
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <Panel>
          <SectionHead>Live pulse</SectionHead>
          <p className="mt-2 text-[12px]">{live.agentsActive} agents · {live.openComms} comms · {live.runwayMonths.toFixed(1)} mo</p>
        </Panel>
        <Panel>
          <SectionHead>Connectors connected</SectionHead>
          <p className="mt-2 text-[12px]">{connected} / {connections.length} (env, not seed)</p>
        </Panel>
        <Panel>
          <SectionHead>Hive jobs</SectionHead>
          <p className="mt-2 text-[12px]">{db.hiveJobs.list().length} local · SUCCEEDED {db.hiveJobs.list().filter((j) => j.status === "SUCCEEDED").length}</p>
        </Panel>
      </div>
      <Panel>
        <SectionHead>Pulse history (seed labeled)</SectionHead>
        <ul className="mt-3 space-y-1 text-[12px]">
          {history.map((p) => (
            <li key={p.id} className="flex justify-between">
              <span className="text-os-dim">{p.capturedAt.slice(0, 10)}</span>
              <span>
                a{p.agentsActive} c{p.openComms} t{p.openTasks} r{p.runwayMonths.toFixed(1)}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
