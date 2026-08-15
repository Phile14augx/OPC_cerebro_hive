import { PageHeader } from "@/components/PageHeader";
import { BroadcastForm } from "@/components/BroadcastForm";
import { RunButton } from "@/components/RunButton";
import { Dot, Panel, SectionHead } from "@/components/terminal";
import { getDb } from "@/lib/data";
import { buildHierarchy } from "@/lib/hierarchy";

export const dynamic = "force-dynamic";

export default function OrgPage() {
  const db = getDb();
  const hierarchy = buildHierarchy(db.departments.list(), db.agents.list());
  const broadcasts = db.broadcasts.list().slice(0, 5);

  return (
    <div>
      <PageHeader
        eyebrow="Company of agents"
        title="Org chart"
        aside={<RunButton agentId="nexarch" label="Run Nexarch" />}
      />
      <p className="mb-8 text-[12px] text-os-muted">
        Operator Philemon → Conductor Nexarch → seven pillars → workers. Markup stays stable.
      </p>

      <div className="mb-8 border border-os-border bg-os-surface p-4">
        <div className="text-[11px] uppercase tracking-[0.2em] text-os-dim">Operator</div>
        <div className="mt-1 text-lg font-bold uppercase tracking-[0.08em]">Philemon</div>
        <div className="mt-6 border-t border-os-border pt-4">
          <div className="text-[11px] uppercase tracking-[0.2em] text-os-dim">Conductor</div>
          <div className="mt-1 text-base uppercase">Nexarch</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {hierarchy.departments
          .filter((d) => d.department.id !== "conductor")
          .map((d) => (
            <Panel key={d.department.id}>
              <SectionHead>{d.department.name}</SectionHead>
              <p className="mt-2 text-[11px] text-os-dim">{d.department.summary}</p>
              <ul className="mt-3 space-y-1">
                {d.roots.map((node) => (
                  <li key={node.agent.id}>
                    <div className="flex items-center gap-2 text-[12px] uppercase">
                      <Dot status={node.agent.status} />
                      {node.agent.name}
                    </div>
                    <ul className="ml-5 mt-1 space-y-1 text-[11px] text-os-muted">
                      {node.children.map((child) => (
                        <li key={child.agent.id} className="flex items-center gap-2">
                          <Dot status={child.agent.status} />
                          {child.agent.name}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
      </div>

      <Panel className="mt-8">
        <SectionHead>Conductor broadcast</SectionHead>
        <div className="mt-4">
          <BroadcastForm />
        </div>
        {broadcasts.length > 0 ? (
          <ul className="mt-4 space-y-2 text-[12px] text-os-muted">
            {broadcasts.map((b) => (
              <li key={b.id}>
                {b.createdAt}: {b.message} ({db.broadcasts.replies(b.id).length} replies)
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>
    </div>
  );
}
