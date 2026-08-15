import { PageHeader } from "@/components/PageHeader";
import { WorkflowRunButton } from "@/components/WorkflowRunButton";
import { Panel } from "@/components/terminal";
import { getDb } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function WorkflowsPage() {
  const db = getDb();
  const workflows = db.workflows.list();
  return (
    <div>
      <PageHeader eyebrow="Operate" title="Workflows" />
      <div className="grid gap-4 md:grid-cols-2">
        {workflows.map((wf) => {
          const steps = JSON.parse(wf.stepsJson) as string[];
          return (
            <Panel key={wf.id}>
              <div className="text-[13px] font-bold uppercase">{wf.name}</div>
              <p className="mt-2 text-[12px] text-os-muted">{steps.join(" → ")}</p>
              {wf.lastSummary ? <p className="mt-2 text-[11px] text-os-dim">{wf.lastSummary}</p> : null}
              <div className="mt-3">
                <WorkflowRunButton workflowId={wf.id} />
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
