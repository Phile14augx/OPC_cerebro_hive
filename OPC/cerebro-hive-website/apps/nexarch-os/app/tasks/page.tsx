import { PageHeader } from "@/components/PageHeader";
import { Badge, Panel } from "@/components/terminal";
import { getDb } from "@/lib/data";
import type { Task } from "@/lib/schemas";

export const dynamic = "force-dynamic";

const COLS: Task["status"][] = ["backlog", "doing", "done"];

export default function TasksPage() {
  const db = getDb();
  const tasks = db.tasks.list();
  return (
    <div>
      <PageHeader eyebrow="Workforce" title="Tasks" />
      <p className="mb-6 text-[12px] text-os-muted">Board is fed by seed and by agent runs.</p>
      <div className="grid gap-4 md:grid-cols-3">
        {COLS.map((status) => (
          <Panel key={status}>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.26em] text-os-dim">{status}</div>
            <ul className="space-y-2">
              {tasks
                .filter((t) => t.status === status)
                .map((t) => (
                  <li key={t.id} className="border border-os-border p-2">
                    <div className="text-[12px]">{t.title}</div>
                    <Badge>{t.agentId}</Badge>
                  </li>
                ))}
            </ul>
          </Panel>
        ))}
      </div>
    </div>
  );
}
