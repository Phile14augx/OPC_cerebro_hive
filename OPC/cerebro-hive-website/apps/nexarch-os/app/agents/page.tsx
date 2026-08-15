import { PageHeader } from "@/components/PageHeader";
import { RunButton } from "@/components/RunButton";
import { Dot, Panel } from "@/components/terminal";
import { getDb } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function AgentsPage() {
  const db = getDb();
  const agents = db.agents.list();

  return (
    <div>
      <PageHeader eyebrow="Workforce" title="Agent roster" />
      <p className="mb-6 text-[12px] text-os-muted">
        Every seeded agent maps 1:1 to a RuntimeAgent with run(). Failures persist as failures.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {agents.map((agent) => {
          const last = db.agentRuns.last(agent.id);
          return (
            <Panel key={agent.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.08em]">
                    <Dot status={agent.status} />
                    {agent.name}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-os-dim">
                    {agent.role} · {agent.departmentId} · {agent.tier}
                  </div>
                  <p className="mt-2 text-[12px] text-os-muted">{agent.summary}</p>
                </div>
                <RunButton agentId={agent.id} />
              </div>
              {last ? (
                <p className={`mt-3 text-[11px] ${last.ok ? "text-os-ok" : "text-os-warn"}`}>
                  Last: {last.summary}
                </p>
              ) : (
                <p className="mt-3 text-[11px] text-os-dim">No runs yet.</p>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
